import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { dreamText } = await request.json();

    if (!dreamText) {
      return new Response(JSON.stringify({ error: 'Dream text is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const completion = await openai.chat.completions.create({
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
    });

    const interpretation = completion.choices[0].message.content;

    return new Response(JSON.stringify({ interpretation }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error interpreting dream:', error);
    return new Response(JSON.stringify({ error: 'Failed to interpret dream' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Add OpenAI package
<lov-add-dependency>openai@latest</lov-add-dependency>