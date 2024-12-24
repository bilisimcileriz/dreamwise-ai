import { createClient } from '@supabase/supabase-js'
import { Configuration, OpenAIApi } from 'openai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Security-Policy': "frame-ancestors 'self' https://*.lovableproject.com",
  'X-Frame-Options': 'ALLOW-FROM https://*.lovableproject.com'
}

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    const { dreamText } = await req.json()
    console.log('Received dream text:', dreamText)

    if (!dreamText) {
      console.error('No dream text provided')
      return new Response(
        JSON.stringify({ error: 'No dream text provided' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      console.error('OpenAI API key not found')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    const configuration = new Configuration({
      apiKey: openAiKey
    })

    const openai = new OpenAIApi(configuration)

    console.log('Making request to OpenAI API...')
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          "role": "system",
          "content": "You are a skilled dream interpreter. Analyze the dream and provide meaningful psychological insights."
        },
        {
          "role": "user",
          "content": `Please interpret this dream: ${dreamText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    console.log('Received response from OpenAI')
    
    if (!completion.data.choices[0].message?.content) {
      throw new Error('No interpretation received from OpenAI')
    }

    const interpretation = completion.data.choices[0].message.content
    console.log('Interpretation:', interpretation)

    return new Response(
      JSON.stringify({ interpretation }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})