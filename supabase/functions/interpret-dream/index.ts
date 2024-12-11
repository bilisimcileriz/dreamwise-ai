import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dreamText } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!dreamText) {
      return new Response(
        JSON.stringify({ error: 'Dream text is required' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a dream interpreter. Analyze the dream and provide meaningful psychological insights."
          },
          {
            role: "user",
            content: dreamText
          }
        ],
      }),
    });

    const data = await response.json();
    const interpretation = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ interpretation }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error interpreting dream:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to interpret dream' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});