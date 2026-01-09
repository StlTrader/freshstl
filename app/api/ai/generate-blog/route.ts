import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: NextRequest) {

    try {
        const { products, context = 'Showcase' } = await req.json();

        if (!products || !Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: 'Products array is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
        }

        const model = 'gemini-2.0-flash-exp';

        const productDetails = products.map(p => `
            Product Name: ${p.name}
            Description: ${p.description}
            Category: ${p.category}
            Tags: ${p.tags?.join(', ')}
            Image URL: ${p.imageUrl}
            Product Link: /3d-print/${p.slug}
        `).join('\n\n');

        const prompt = `
            You are an expert content writer for a 3D printing e-commerce store called "FreshSTL".
            Write an engaging, SEO-optimized blog post featuring the following products.
            
            **Context/Tone**: ${context} (Adjust the writing style to match this context. e.g., "Tutorial" should be instructional, "Showcase" should be promotional, "Comparison" should be analytical).

            **Products**:
            ${productDetails}

            The blog post should:
            1. Have a catchy Title.
            2. Have a URL-friendly Slug.
            3. Have a short Excerpt (meta description).
            4. Have engaging Content in Markdown format.
               - Introduce the topic.
               - Highlight the key features and benefits of each product naturally.
               - **CRITICAL**: You MUST include the provided "Image URL" for each product within the content using standard Markdown image syntax: ![Product Name](Image URL). Place the image near the product description.
               - **CRITICAL**: You MUST link to the product using the provided "Product Link" whenever the product name is mentioned for the first time or in a "Call to Action". Format: [Product Name](Product Link).
               - Suggest use cases (e.g., cosplay, home decor, gaming).
               - Include a conclusion.
            5. Have a list of relevant Tags.

            Return the response strictly as a JSON object with the keys: "title", "slug", "excerpt", "content", "tags".
            Do not include any markdown formatting (like \`\`\`json) around the JSON output itself.
        `;

        const response = await ai.models.generateContent({
            model,
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }],
                },
            ],
            config: {
                responseMimeType: 'application/json',
            }
        });

        const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error('No content generated');
        }

        try {
            const jsonResponse = JSON.parse(generatedText);

            // Ensure tags is an array
            let tags = jsonResponse.tags;
            if (typeof tags === 'string') {
                tags = tags.split(',').map((t: string) => t.trim());
            }

            return NextResponse.json({
                title: jsonResponse.title,
                slug: jsonResponse.slug,
                excerpt: jsonResponse.excerpt,
                content: jsonResponse.content,
                tags: tags
            });
        } catch (e) {
            console.error("Failed to parse Gemini response:", generatedText);
            // Fallback parsing
            const cleanText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonResponse = JSON.parse(cleanText);
            return NextResponse.json(jsonResponse);
        }

    } catch (error: any) {
        console.error("Error generating blog post:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
