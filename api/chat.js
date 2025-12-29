import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const config = {
    runtime : 'edge',
};

export default async function handler(req){
    const { messages } = await req.json();

    const result = await streamText({
        model: google('gemini-1.5-flash'),
        system: `You are a brutal, cynical Silicon Valley Venture Capitalist. 
             Roast startup ideas harshly. Use humor and sarcasm. 
             Keep it to 2 sentences max.`,
        messages,     
    });

    return result.toDataStreamResponse();
}