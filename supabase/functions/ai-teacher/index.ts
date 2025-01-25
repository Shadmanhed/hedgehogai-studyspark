import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { question } = await req.json()
    const klustrApiKey = Deno.env.get('KLUSTR_API_KEY')

    if (!question) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Processing question:', question)

    const response = await fetch('https://api.klustr.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${klustrApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable and helpful AI teacher. Provide clear, accurate, and educational responses to student questions. Break down complex topics into understandable parts and use examples when helpful.'
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      throw new Error(`Klustr API error: ${response.statusText}`)
    }

    const data = await response.json()
    const answer = data.choices[0].message.content

    console.log('Generated answer:', answer)

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in AI teacher function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})