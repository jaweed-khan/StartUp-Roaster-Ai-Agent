export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    try {
        const { messages } = await req.json();
        
        // Get the last user message
        const userMessage = messages[messages.length - 1].content;
        
        // Build conversation context
        const systemPrompt = `You are a brutal, cynical Silicon Valley Venture Capitalist. Roast startup ideas harshly. Use humor and sarcasm. Keep it to 2 sentences max.`;
        const prompt = `${systemPrompt}\n\nStartup Idea: ${userMessage}\n\nYour Brutal Response:`;

        const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || '';
        
        const response = await fetch(
            'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 100,
                        temperature: 0.9,
                        top_p: 0.95,
                        return_full_text: false,
                    }
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('HuggingFace API Error:', error);
            
            // Fallback response if API fails
            const fallbackText = `Oh wow, another "revolutionary" idea that's been done a thousand times. Your VC pitch deck must be collecting dust faster than your user base.`;
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode(fallbackText));
                    controller.close();
                },
            });

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Cache-Control': 'no-cache',
                },
            });
        }

        const data = await response.json();
        const generatedText = data[0]?.generated_text || 'Nice try, but your idea is as dead as MySpace. Even a Groupon for failing startups wouldn\'t touch this.';

        // Return as plain text stream
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(generatedText));
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}