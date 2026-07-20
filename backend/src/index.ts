export interface Env {
  AI: Ai
  CORS_ORIGIN: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(request.url)

    if (url.pathname === '/api/health') {
      return Response.json({ ok: true, model: '@cf/meta/llama-3.1-8b-instruct' }, { headers: corsHeaders })
    }

    if (url.pathname === '/api/models') {
      return Response.json({
        models: [
          { id: '@cf/meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B (Fast)', free: true },
          { id: '@cf/meta/llama-3.3-70b-instruct-fp8', name: 'Llama 3.3 70B (Smart)', free: true },
          { id: '@cf/mistralai/mistral-7b-instruct-v0.2', name: 'Mistral 7B', free: true },
          { id: '@cf/google/gemma-2-9b-it', name: 'Gemma 2 9B', free: true },
          { id: '@cf/qwen/qwen1.5-14b-chat-awq', name: 'Qwen 1.5 14B', free: true },
        ]
      }, { headers: corsHeaders })
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { messages, model, systemPrompt, temperature = 0.7, maxTokens = 2048 } = await request.json()

        if (!messages || !Array.isArray(messages)) {
          return Response.json({ error: 'messages array required' }, { status: 400, headers: corsHeaders })
        }

        const selectedModel = model || '@cf/meta/llama-3.1-8b-instruct'

        const systemMessage = systemPrompt
          ? [{ role: 'system' as const, content: systemPrompt }]
          : [{ role: 'system' as const, content: 'You are a helpful, friendly AI assistant. You respond in the same language the user writes in. Be concise, accurate, and helpful.' }]

        const allMessages = [...systemMessage, ...messages]

        const response = await env.AI.run(selectedModel, {
          messages: allMessages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        })

        return Response.json({
          response: response.response,
          model: selectedModel,
          usage: response.usage || null,
        }, { headers: corsHeaders })
      } catch (err: any) {
        return Response.json({ error: err.message || 'LLM inference failed' }, { status: 500, headers: corsHeaders })
      }
    }

    if (url.pathname === '/api/chat/stream' && request.method === 'POST') {
      try {
        const { messages, model, systemPrompt, temperature = 0.7, maxTokens = 2048 } = await request.json()

        if (!messages || !Array.isArray(messages)) {
          return Response.json({ error: 'messages array required' }, { status: 400, headers: corsHeaders })
        }

        const selectedModel = model || '@cf/meta/llama-3.1-8b-instruct'

        const systemMessage = systemPrompt
          ? [{ role: 'system' as const, content: systemPrompt }]
          : [{ role: 'system' as const, content: 'You are a helpful, friendly AI assistant. You respond in the same language the user writes in. Be concise, accurate, and helpful.' }]

        const allMessages = [...systemMessage, ...messages]

        const stream = await env.AI.run(selectedModel, {
          messages: allMessages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        })

        return new Response(stream, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        })
      } catch (err: any) {
        return Response.json({ error: err.message || 'LLM stream failed' }, { status: 500, headers: corsHeaders })
      }
    }

    return Response.json({ error: 'Not found', routes: ['/api/health', '/api/models', '/api/chat', '/api/chat/stream'] }, { status: 404, headers: corsHeaders })
  },
}