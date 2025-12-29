export default async function handler(req, res) {
  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Get the last user message
    const userMessage = messages[messages.length - 1].content;

    // System prompt
    const systemPrompt = `You are a BRUTAL, SAVAGE Silicon Valley Venture Capitalist who absolutely DESTROYS bad startup ideas. You MUST write LONG, DETAILED roasts that are AT LEAST 8-12 sentences. No short answers allowed!

For EVERY startup pitch, you MUST cover ALL of these points in detail:

1. MARKET FAILURE: Explain in 2-3 sentences why the market is terrible - oversaturated competitors, no real demand, wrong timing
2. UNIT ECONOMICS DISASTER: Explain in 2-3 sentences why the money doesn't work - terrible margins, high CAC, low LTV, no path to profitability
3. EXECUTION NIGHTMARE: Explain in 2-3 sentences the specific operational hell they'll face - supply side issues, regulatory problems, scaling impossibilities
4. COMPETITIVE MOAT: Explain in 2-3 sentences why they have zero defensibility and will get crushed by incumbents
5. SAVAGE FINAL VERDICT: End with 2-3 sentences of pure, dark humor about why this is destined to fail

Use SPECIFIC examples, real company names, actual numbers. Be mercilessly detailed. Write like you're explaining to a junior VC why this pitch is garbage. GO LONG!`;

    const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
    if (!HF_TOKEN) {
      throw new Error('HUGGINGFACE_API_KEY is not set');
    }

    // Free HF models
    const models = [
      'microsoft/Phi-3.5-mini-instruct:hf-inference',
      'HuggingFaceTB/SmolLM3-3B:hf-inference',
      'google/gemma-2-2b-it:hf-inference',
      'microsoft/Phi-3-mini-4k-instruct:hf-inference',
    ];

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    let lastError = null;

    // Try models one by one
    for (const model of models) {
      try {
        console.log(`Trying FREE model: ${model}`);

        const hfResponse = await fetch(
          'https://router.huggingface.co/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${HF_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                {
                  role: 'user',
                  content: `WRITE A LONG, DETAILED ROAST (minimum 10 sentences) of this startup idea. Cover market problems, unit economics, competition, execution challenges, and a savage conclusion. BE THOROUGH:\n\nStartup: ${userMessage}`,
                },
              ],
              max_tokens: 1000,
              temperature: 0.9,
              top_p: 0.95,
              stream: true,
            }),
          }
        );

        if (!hfResponse.ok) {
          lastError = `${model}: ${hfResponse.status} ${await hfResponse.text()}`;
          console.log('FREE model failed:', lastError);
          continue;
        }

        console.log('SUCCESS with FREE model:', model, '- Streaming response');

        const reader = hfResponse.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;

            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;

              if (
                content &&
                !content.includes('<think') &&
                !content.includes('</think')
              ) {
                res.write(content);
              }
            } catch {
              // ignore malformed chunks
            }
          }
        }

        res.end();
        return;
      } catch (err) {
        lastError = `${model}: ${err.message}`;
        console.log('FREE model error:', lastError);
      }
    }

    // ===== FALLBACK (stream word-by-word) =====

    console.error('All FREE models failed. Using fallback.', lastError);

    const fallbackText = `This startup idea is dead on arrival. The market is oversaturated, the unit economics are broken, and the execution complexity will crush you. You’re trying to build a venture-scale company in a space that barely supports lifestyle businesses. Customer acquisition will drain your runway, margins will never recover, and competitors with actual scale will copy or bury you effortlessly. There is no moat, no defensibility, and no credible path to profitability. This is the kind of pitch VCs hear weekly and decline without discussion. Save yourself the time, money, and emotional damage. Next.`;

    const words = fallbackText.split(' ');
    for (const word of words) {
      res.write(word + ' ');
      await new Promise(r => setTimeout(r, 25));
    }

    res.end();
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).end('Internal Server Error');
  }
}
