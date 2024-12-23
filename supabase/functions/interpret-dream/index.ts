import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting dream interpretation process...");
    const { dreamText } = await req.json();
    
    if (!dreamText) {
      console.error("Dream text is missing");
      return new Response(
        JSON.stringify({ error: 'Dream text is required' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error("OpenAI API key not found");
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log("Making request to OpenAI API...");
    console.log("Dream text length:", dreamText.length);

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
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get response from OpenAI', details: errorText }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log("Received response from OpenAI");

    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid response format from OpenAI:", data);
      return new Response(
        JSON.stringify({ error: 'Invalid response format from OpenAI' }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const interpretation = data.choices[0].message.content;
    console.log("Successfully extracted interpretation, length:", interpretation.length);

    return new Response(
      JSON.stringify({ interpretation }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in interpret-dream function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to interpret dream', 
        details: error.message,
        stack: error.stack
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});