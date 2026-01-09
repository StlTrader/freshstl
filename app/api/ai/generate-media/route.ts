import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: NextRequest) {

    try {
        const { prompt, referenceImage, context } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is missing from process.env");
            return NextResponse.json({ error: 'GEMINI_API_KEY is not set in environment. Please check App Hosting secrets.' }, { status: 500 });
        }

        const isTextOnly = context === 'asset_generation';
        // Use flash model for text tasks, pro-image-preview for image tasks
        const model = isTextOnly ? 'gemini-2.0-flash-exp' : 'gemini-3-pro-image-preview';

        const tools = [
            {
                googleSearch: {}
            },
        ];

        const config = {
            responseModalities: isTextOnly ? ['TEXT'] : ['IMAGE', 'TEXT'] as any,
            imageConfig: isTextOnly ? undefined : {
                imageSize: '1K',
            },
            tools: isTextOnly ? undefined : tools, // Tools might not be needed for simple text gen
        };

        const parts: any[] = [{ text: prompt }];

        if (referenceImage) {
            try {
                // Extract base64 data and mime type
                // Format: data:image/png;base64,iVBORw0KGgo...
                const matches = referenceImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);

                if (matches && matches.length === 3) {
                    const mimeType = matches[1];
                    const data = matches[2];

                    parts.push({
                        inlineData: {
                            mimeType: mimeType,
                            data: data
                        }
                    });

                    // Update prompt to be more specific about using the reference
                    // Update prompt to be more specific about using the reference based on context
                    let contextInstruction = "Generate a new image that keeps the same shape/subject but changes the background or view/angle as described or to be more aesthetic.";

                    if (context === 'background') {
                        contextInstruction = "Strictly keep the main subject/object exactly as is (shape, color, texture). ONLY change the background environment to be more premium, cinematic, or fitting for the object.";
                    } else if (context === 'view') {
                        contextInstruction = "Keep the same subject/object but show it from a different, more dynamic angle (e.g., isometric, top-down, or close-up macro shot) while maintaining its key features.";
                    } else if (context === 'lighting') {
                        contextInstruction = "Keep the subject and composition but dramatically improve the lighting. Use cinematic, studio, or volumetric lighting to make the object pop.";
                    } else if (context === 'material') {
                        contextInstruction = "Keep the shape exactly the same but enhance the material rendering. Make it look more realistic, high-quality, or like a specific material (e.g., matte, glossy, metallic) if specified in the prompt.";
                    }

                    parts[0].text = `${prompt}. The attached image is the "cover image". Use it as a strict reference for the shape and subject. ${contextInstruction}`;
                }
            } catch (e) {
                console.warn("Failed to process reference image:", e);
            }
        }

        const contents = [
            {
                role: 'user',
                parts: parts,
            },
        ];

        const response = await ai.models.generateContent({
            model,
            config,
            contents,
        });

        const generatedImages: string[] = [];
        let generatedText = '';

        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    // Image
                    const mimeType = part.inlineData.mimeType || 'image/png';
                    const data = part.inlineData.data;
                    generatedImages.push(`data:${mimeType};base64,${data}`);
                } else if (part.text) {
                    // Text
                    generatedText += part.text;
                }
            }
        }

        return NextResponse.json({
            text: generatedText,
            images: generatedImages
        });

    } catch (error: any) {
        console.error("Error generating media:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
