import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { image, text } = await request.json();

    let queryText = text;

    // If an image was provided, ask GPT-4o-Mini to describe it
    if (image) {
      // Ensure the image has the proper data URI prefix if missing
      const imageUrl = image.startsWith('data:image') 
        ? image 
        : `data:image/jpeg;base64,${image}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe this clothing item in exactly 1-2 sentences focusing purely on color, pattern, style, and cut. Be extremely precise and concise. Do not mention backgrounds or mannequins." },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "low" // 'low' is fine for extracting color/pattern and uses fewer tokens
                },
              },
            ],
          },
        ],
        max_tokens: 100,
      });

      queryText = response.choices[0].message.content;
      console.log("Vision interpreted image as:", queryText);
    }

    if (!queryText) {
      return NextResponse.json({ error: 'No text or image provided' }, { status: 400 });
    }

    // Generate the vector embedding using the new embedding model
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: queryText,
      encoding_format: "float",
    });

    const vector = embeddingResponse.data[0].embedding;

    return NextResponse.json({ 
      vector, 
      description: queryText // Return the description for logging/feedback
    });

  } catch (error) {
    console.error('Error generating embedding:', error);
    return NextResponse.json({ error: 'Failed to generate embedding' }, { status: 500 });
  }
}
