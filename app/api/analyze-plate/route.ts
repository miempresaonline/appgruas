import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { image } = await request.json();

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "OpenAI API Key not configured" }, { status: 500 });
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Extract the vehicle license plate number from this image. Return ONLY the alphanumeric digits of the plate. If there are multiple, return the most prominent one. Do not include spaces, hyphens, or country codes unless they are part of the main sequence. If no plate is found, return 'NOT_FOUND'." },
                            { type: "image_url", image_url: { url: image } }
                        ]
                    }
                ],
                max_tokens: 20
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("OpenAI API Error:", data.error);
            return NextResponse.json({ error: data.error.message }, { status: 500 });
        }

        const content = data.choices?.[0]?.message?.content || "";
        const plate = content.replace(/[^A-Z0-9]/gi, "").toUpperCase();

        return NextResponse.json({ plate });

    } catch (error) {
        console.error("Analyze Plate Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
