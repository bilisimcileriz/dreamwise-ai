import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { dreamText } = await req.json()
    
    if (!dreamText) {
      throw new Error('Dream text is required')
    }

    console.log('Received dream text:', dreamText)
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    console.log('Making request to OpenAI API...')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a skilled dream interpreter with deep knowledge of psychology, symbolism, and dream analysis. 
                     Your task is to provide thoughtful, insightful interpretations of dreams while being mindful of the 
                     following guidelines:
                     
                     1. Consider both universal symbols and personal context
                     2. Offer multiple possible interpretations when appropriate
                     3. Be sensitive and professional in your analysis
                     4. Focus on constructive insights
                     5. Acknowledge the subjective nature of dream interpretation
                     
                     Format your response in clear paragraphs with proper spacing for readability.`
          },
          {
            role: "user",
            content: dreamText
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text())
      throw new Error('Failed to get response from OpenAI')
    }

    const data = await response.json()
    console.log('Received response from OpenAI:', data)

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI')
    }

    const interpretation = data.choices[0].message.content
    console.log('Extracted interpretation:', interpretation)

    return new Response(
      JSON.stringify({ interpretation }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error interpreting dream:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to interpret dream', details: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})