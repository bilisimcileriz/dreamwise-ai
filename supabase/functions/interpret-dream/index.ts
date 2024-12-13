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
            content: `You are an expert dream interpreter specializing in psychological dream analysis, particularly focusing on the theories of Sigmund Freud and Carl Jung. 

When interpreting dreams:
- Answer with the language used in dream text as the answer language.
- Apply both Freudian psychoanalytic theory and Jungian analytical psychology
- Consider symbolic meanings from both personal and collective unconscious perspectives
- Analyze archetypal symbols and their universal meanings
- Examine potential repressed desires and unconscious motivations
- Look for connections to the dreamer's psychological development
- Maintain a professional and insightful tone

Focus exclusively on dream interpretation. Do not engage with any content that isn't a dream description.

Structure your response in this format:
1. Initial Impression
2. Key Symbols Analysis
3. Freudian Perspective
4. Jungian Analysis
5. Psychological Insight`
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