import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: NextRequest) {

    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
        }

        // Remove data URL prefix if present to get raw base64
        const base64Image = image.replace(/^data:image\/(png|jpeg|webp);base64,/, '');

        const model = 'gemini-3-flash-preview';

        const tools = [
            {
                googleSearch: {}
            },
        ];

        const config = {
            thinkingConfig: {
                thinkingLevel: 'HIGH',
            },
            tools,
        };

        const prompt = `
            Analyze this product image and generate the following details for an e-commerce listing:
            1. A catchy, SEO-friendly Title.
            2. A detailed, persuasive Description (highlighting features, materials, and use cases).
            3. A list of 5-10 relevant Tags (comma-separated).

            IMPORTANT: Return the response strictly as a JSON object wrapped in a code block like this:
            \`\`\`json
            {
                "title": "...",
                "description": "...",
                "tags": ["...", "..."]
            }
            \`\`\`
        `;

        const response = await ai.models.generateContent({
            model,
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: base64Image
                            }
                        }
                    ],
                },
            ],
            config: config as any // Cast to any to avoid type issues with thinkingConfig if definitions aren't updated
        });

        // With thinking models, we need to find the text part that contains the JSON.
        // The response might contain "thoughts" and then the "response".
        // We iterate through parts to find the one with the JSON block.

        let generatedText = '';
        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    generatedText += part.text;
                }
            }
        }

        if (!generatedText) {
            throw new Error('No content generated');
        }

        // Extract JSON from the text (it might be surrounded by thinking text or markdown)
        const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || generatedText.match(/```([\s\S]*?)```/) || [null, generatedText];
        let jsonString = jsonMatch[1] || jsonMatch[0];

        // Clean up any potential leading/trailing non-JSON characters if regex failed perfectly
        if (jsonString) {
            jsonString = jsonString.trim();
        }

        try {
            const jsonResponse = JSON.parse(jsonString || '{}');

            // Ensure tags is an array of strings
            let tags = jsonResponse.tags;
            if (typeof tags === 'string') {
                tags = tags.split(',').map((t: string) => t.trim());
            }

            return NextResponse.json({
                title: jsonResponse.title,
                description: jsonResponse.description,
                tags: tags || []
            });
        } catch (e) {
            console.error("Failed to parse Gemini response:", generatedText);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Error generating product details:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
