export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    try {
        const { messages } = await req.json();
        
        // Get the last user message
        const userMessage = messages[messages.length - 1].content;
        
        // SUPER detailed system prompt to coax longer responses even from smaller models
        const systemPrompt = `You are a BRUTAL, SAVAGE Silicon Valley Venture Capitalist who absolutely DESTROYS bad startup ideas. You MUST write LONG, DETAILED roasts that are AT LEAST 8-12 sentences. No short answers allowed!

For EVERY startup pitch, you MUST cover ALL of these points in detail:

1. MARKET FAILURE: Explain in 2-3 sentences why the market is terrible - oversaturated competitors, no real demand, wrong timing
2. UNIT ECONOMICS DISASTER: Explain in 2-3 sentences why the money doesn't work - terrible margins, high CAC, low LTV, no path to profitability  
3. EXECUTION NIGHTMARE: Explain in 2-3 sentences the specific operational hell they'll face - supply side issues, regulatory problems, scaling impossibilities
4. COMPETITIVE MOAT: Explain in 2-3 sentences why they have zero defensibility and will get crushed by incumbents
5. SAVAGE FINAL VERDICT: End with 2-3 sentences of pure, dark humor about why this is destined to fail

Use SPECIFIC examples, real company names, actual numbers. Be mercilessly detailed. Write like you're explaining to a junior VC why this pitch is garbage. GO LONG!`;
        
        const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || '';
        
        if (!HF_TOKEN) {
            throw new Error('HUGGINGFACE_API_KEY is not set');
        }
        
        // FREE models on hf-inference provider
        // These are 100% FREE - no billing required!
        const models = [
            'microsoft/Phi-3.5-mini-instruct:hf-inference',
            'HuggingFaceTB/SmolLM3-3B:hf-inference',
            'google/gemma-2-2b-it:hf-inference',
            'microsoft/Phi-3-mini-4k-instruct:hf-inference',
        ];
        
        let lastError = null;
        
        // Try each model until one works
        for (const model of models) {
            try {
                console.log(`Trying FREE model: ${model}`);
                
                const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${HF_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { 
                                role: 'user', 
                                content: `WRITE A LONG, DETAILED ROAST (minimum 10 sentences) of this startup idea. Cover market problems, unit economics, competition, execution challenges, and a savage conclusion. BE THOROUGH:\n\nStartup: ${userMessage}` 
                            }
                        ],
                        max_tokens: 1000,  // Max out the tokens
                        temperature: 0.9,  // High creativity
                        top_p: 0.95,
                        stream: true,
                    }),
                });

                if (response.ok) {
                    console.log('SUCCESS with FREE model:', model, '- Streaming response');
                    
                    // Create a transform stream to process and clean the SSE data
                    const transformStream = new TransformStream({
                        async transform(chunk, controller) {
                            const text = new TextDecoder().decode(chunk);
                            const lines = text.split('\n');
                            
                            for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    const data = line.slice(6);
                                    
                                    if (data === '[DONE]') {
                                        continue;
                                    }
                                    
                                    try {
                                        const json = JSON.parse(data);
                                        const content = json.choices?.[0]?.delta?.content || '';
                                        
                                        if (content) {
                                            // Remove thinking tags in real-time
                                            let cleaned = content;
                                            
                                            // Don't send thinking tag content
                                            if (!cleaned.includes('<think') && 
                                                !cleaned.includes('</think') &&
                                                !cleaned.includes('<thinking') && 
                                                !cleaned.includes('</thinking')) {
                                                controller.enqueue(new TextEncoder().encode(cleaned));
                                            }
                                        }
                                    } catch (e) {
                                        // Skip malformed JSON
                                    }
                                }
                            }
                        }
                    });

                    // Pipe the response through our transform stream
                    const stream = response.body.pipeThrough(transformStream);

                    return new Response(stream, {
                        headers: {
                            'Content-Type': 'text/plain; charset=utf-8',
                            'Cache-Control': 'no-cache',
                            'X-Content-Type-Options': 'nosniff',
                        },
                    });
                } else {
                    const errorText = await response.text();
                    lastError = `${model}: ${response.status} ${errorText}`;
                    console.log('FREE model failed:', lastError);
                }
            } catch (error) {
                lastError = `${model}: ${error.message}`;
                console.log('FREE model error:', lastError);
            }
        }
        
        // If all FREE models failed, use comprehensive fallback responses
        console.error('All FREE models failed. Using fallback. Last error:', lastError);
        
        const epicFallbackResponses = [
            `Oh, fantastic! Another "Uber for X" idea. Let me count the ways this is destined for the startup graveyard. First, the market analysis: you're entering a space already dominated by Rover and Wag, who collectively raised over $300M and STILL struggle with unit economics. They've spent years building supply-side trust and have massive network effects you'll never overcome. Your "fresh approach"? It's been tried seventeen times. Second, let's talk about your catastrophic unit economics. You're planning to take 20-25% of $20-30 walks? After payment processing (3%), insurance (5-7%), customer acquisition ($50-100 per user in this competitive hellscape), and the operational nightmare of background checks, you're grossing maybe $4 per transaction. To hit even $1M in revenue, you need 250,000 walks. In year one. Good luck. Third, the execution disaster you're walking into: this is a HIGH-TOUCH, LOW-MARGIN business that doesn't scale. You can't 10x dog walkers the way you can cloud infrastructure. Your supply side will churn at 60%+ annually because walking dogs in the rain for $15/hour isn't a career. Meanwhile, your demand is seasonal, hyper-local, and dominated by repeat-customer dynamics that commoditize your platform. Fourth, your competitive moat is non-existent. Your "tech" is basic CRUD operations anyone can replicate in a weekend. Rover has 50 engineers and a $1B valuation. What's your advantage? "Better UX"? They'll copy it in a sprint. "Lower fees"? You'll bleed out in six months. The moment customers find a walker they like, they go direct and cut you out entirely. Finally, the brutal truth: this isn't a venture-scale business, it's a lifestyle business masquerading as tech. VCs see this pitch monthly. They pass every time. Your best-case scenario is burning through $2M over two years, hitting $500K GMV, and getting acqui-hired by Rover for pennies. Realistic scenario? You shut down in 18 months after realizing pet owners are psychotically demanding, insurance claims are bankrupting you, and your take-rate doesn't cover Stripe fees. This is DOA.`,
            
            `Let me guess - you used Rover once, thought "I could build this," and now you're here with a pitch deck. Adorable. Let's systematically dismantle why this is a terrible idea. Market reality check: the pet services market is a $100B industry, but on-demand dog walking is maybe $2B, and it's already consolidated. Rover and Wag own this space. They've raised $300M+ combined and STILL can't figure out profitable unit economics. You think you've found an "untapped opportunity"? No. You've found a graveyard of failed competitors: DogVacay (dead), Wag (struggling), local apps (all dead). This market is mature, saturated, and the survivors are barely alive. Now let's talk about why the economics are pure fantasy. Your CAC is $75-150 per user in this competitive market because Google ads for "dog walker near me" cost $15-30 per click with <5% conversion. Your average customer books maybe 8 walks per year at $25 each. That's $200 annual revenue. You're taking 20%? That's $40. Minus CAC, you're underwater on every customer for 2+ years. Your LTV:CAC ratio is abysmal. Meanwhile, your operational costs are insane: background checks ($50/walker), insurance ($15% of revenue), customer support (you'll need 24/7 because dogs don't care about business hours), and constant fraud/quality issues. The execution nightmare gets worse: you need density to work. A walker needs 3-4 jobs per day to make $60-80. But customers book randomly across huge geographic areas. Your routing optimization is a nightmare, your supply-side economics don't work until you have impossible density, and you're caught in a chicken-egg problem that kills 90% of marketplace startups. And when something goes wrong - and it will, dogs bite, get injured, run away - you're legally liable for everything. One major incident and you're bankrupt. Your competitive position is laughable. Rover has brand recognition, millions of reviews, massive two-sided network effects, and venture capital war chest. You have... what? "Community focus"? Every startup says that until they realize community doesn't pay AWS bills. "Personalized matching"? That's table stakes. "Lower fees"? You'll be dead before you achieve the scale to sustain lower fees. Here's what actually happens: you launch, spend $100K on customer acquisition getting your first 1,000 users. Conversion rate is 2% because nobody trusts a new platform with their pets. The 20 customers you get all want the same walker they found on walk #1, so they exchange numbers and ghost your platform. Your walkers realize they make more going direct, so they poach your customers. Six months in, you've spent $200K, have 50 active users, $2K monthly GMV, and you're paying $5K/month in fixed costs. You're burning $8K monthly with no path to profitability. Investors pass. You're done. This is not a tech company, it's a customer service nightmare wrapped in a marketplace that doesn't want to exist. Hard pass. Next!`,
            
            `Wow. You've managed to pick literally one of the worst possible "opportunities" in the entire on-demand economy. Let me explain exactly why this dies. The market analysis is brutal: yes, there are 90 million dogs in America, but that doesn't mean there's a venture-scale business here. Only 2-3% of dog owners will EVER use an on-demand walking app. Most use neighbor kids, friends, or professional walkers they found through referrals. Your TAM isn't "$10B pet industry" - it's maybe $500M of actual addressable on-demand walking revenue, and Rover already owns 80% of it. You're fighting for scraps in a commoditized, low-growth market where the unit economics are fundamentally broken. Speaking of unit economics: this business model is designed to fail. Average walk: $25. Platform take: 20% = $5. Minus payment processing ($0.75), insurance ($1.25), and customer acquisition cost ($75), you're at -$71.25 on the first transaction. "But retention!" you say. Okay, if they book 10 walks, you're at... -$21.25. Congratulations, you lose money on every customer. The only way this works is if you achieve Uber-like scale, but here's the problem: dog walking doesn't have the order frequency of ride-sharing. Uber users book 15-20 rides per month. Your users book 2-3 walks. The math never works. The operational reality will crush you: this is an EMOTIONAL, HIGH-TRUST service. People don't want an "Uber" for dog walking - they want the same person every time who knows Fluffy's anxiety triggers. The entire value prop of your platform (on-demand matching) works against what customers actually want (consistent relationships). So what happens? Customer finds a walker they like on walk #1, exchanges numbers, cuts you out. Your platform becomes a lead generation service where you pay $75 to acquire a customer who does one $25 transaction. You're subsidizing direct relationships between walkers and owners. This is a structural flaw that kills the business model. And we haven't even talked about the nightmare scenarios: dog gets injured (lawsuit), dog bites someone (lawsuit), walker gets hurt (worker's comp nightmare), dogs fight each other (chaos), walker steals from home (insurance claim), fake reviews (fraud), walker no-shows (angry customers), dog runs away (PR disaster). Every single one of these will happen in your first 6 months. Your insurance premiums will skyrocket. Your customer support costs will be insane. You'll spend more time dealing with crisis management than building product. Your competitive moat is so non-existent it's actually embarrassing. Rover has: 1) 10+ years of trust signals and reviews, 2) millions of completed walks proving safety, 3) massive supply-side network effects, 4) top Google rankings for every relevant keyword, 5) $200M in funding to outspend you 100:1 on marketing. What do you have? A Figma mockup and enthusiasm? The moment you launch, they'll crush you with ads, copy any good features in a sprint, and leverage their existing base to cross-promote into your tiny beachhead market. You have zero chance. Here's how this actually plays out: you launch with $500K in funding. Spend $200K on development. Have $300K for customer acquisition. At $75 CAC, you get 4,000 users. 2% actually book (80 customers). They do 3 walks each (240 walks). At $5 gross margin, that's $1,200 in gross profit. You're at -$299K. Investors pass on Series A. You pivot to "premium concierge pet services" (fails), then to "B2B corporate pet benefits" (also fails), then shut down. Total time: 18 months. This is not an opportunity, it's a very expensive lesson in why unit economics matter. Pass.`
        ];
        
        // Pick the fallback most relevant to the user message
        let fallbackText;
        if (userMessage.toLowerCase().includes('dog')) {
            fallbackText = epicFallbackResponses[Math.floor(Math.random() * 3)];
        } else {
            // Customize for their specific idea
            fallbackText = epicFallbackResponses[Math.floor(Math.random() * 3)]
                .replace(/dog walking/g, 'this idea')
                .replace(/dogs/g, 'users')
                .replace(/Rover/g, 'existing competitors');
        }
        
        // Stream the fallback response word by word
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const words = fallbackText.split(' ');
                for (let i = 0; i < words.length; i++) {
                    controller.enqueue(encoder.encode(words[i] + ' '));
                    await new Promise(resolve => setTimeout(resolve, 25));
                }
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
        
        const fallbackText = `Your startup pitch crashed harder than your app probably will. But let me be comprehensive about why this is terrible: The market you're targeting is either oversaturated or doesn't exist. Your unit economics are fundamentally broken - you can't acquire customers cheaply enough to ever be profitable. The operational complexity will consume you - this isn't a tech business, it's a customer service nightmare. Your competitive position is non-existent - larger players will crush you or the switching costs are too low. The capital requirements to reach scale are prohibitive, and even at scale, the margins don't support a venture-backable outcome. This is everything wrong with "startup culture" in one pitch deck - solving a problem that doesn't need solving, with a business model that doesn't work, in a market that doesn't care. If this were a stock, I'd short it. Since it's not, I'll just pass and save us both the time. Next!`;
        
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
}