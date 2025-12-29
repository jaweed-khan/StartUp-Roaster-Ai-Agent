import { useEffect, useRef, useState } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const renderAIContent = (text) => {
  const lines = text.split('\n');

  const elements = [];
  let listBuffer = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={elements.length} className="list-disc list-inside space-y-1 mb-4">
          {listBuffer.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Empty line → paragraph break
    if (!trimmed) {
      flushList();
      return;
    }

    // ALL CAPS heading
    if (/^[A-Z\s]{4,}:$/.test(trimmed)) {
      flushList();
      elements.push(
        <h3
          key={elements.length}
          className="text-sm font-bold uppercase tracking-widest text-emerald-400 mt-4 mb-2"
        >
          {trimmed.replace(':', '')}
        </h3>
      );
      return;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      listBuffer.push(trimmed.slice(2));
      return;
    }

    // Normal paragraph
    flushList();
    elements.push(
      <p key={elements.length} className="mb-3 leading-relaxed">
        {trimmed}
      </p>
    );
  });

  flushList();
  return elements;
};


  // Keep chat scrolled to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black flex items-center justify-center">

      {/* MAIN 2-COLUMN WRAPPER */}
      <div className="w-full max-w-7xl flex gap-6 h-[90vh]">

       {/* LEFT SIDE – EXPLANATION PANEL */}
    <div className="w-[40%] bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-8 overflow-y-auto">
      <div className="space-y-6">
    
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase mb-2">
            The Brutal VC <span className="text-emerald-500">.ai</span>
          </h1>
          <p className="text-zinc-400 text-sm">
            Relentlessly honest feedback on your startup idea — from a VC who’s seen it all.
          </p>
        </div>

        {/* What is this */}
        <div>
          <h2 className="text-lg font-bold text-emerald-500 uppercase">
            💼 What is this?
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed mt-2">
            A no-nonsense AI startup critic that evaluates your pitch the way a
            seasoned Silicon Valley venture capitalist would — with brutal honesty,
            zero optimism, and an allergy to bad ideas.
          </p>
        </div>

        {/* How it works */}
        <div>
          <h2 className="text-lg font-bold text-emerald-500 uppercase">
            ⚡ How it works
          </h2>
          <ul className="mt-2 space-y-2 text-sm text-zinc-300">
            <li>• Pitch your “world-changing” startup idea</li>
            <li>• The AI dissects your market, moat, and execution reality</li>
            <li>• You receive a detailed, unfiltered VC-style teardown</li>
          </ul>
        </div>

        {/* Warning */}
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
          <p className="text-xs text-red-300 font-mono uppercase tracking-wider">
            ⚠️ Warning: Brutal honesty ahead. Ego damage is not only possible — it’s likely.
          </p>
        </div>

        {/* Footer */}
        <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest space-y-1">
          <p>
            Built with a brutally honest 💀 mindset by Jaweed Khan
          </p>
          <p>
            Full source code on GitHub:
            <a
              href="https://github.com/jaweed-khan/StartUp-Roaster-Ai-Agent"
              className="underline ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Repository
            </a>
          </p>
        </div>

      </div>
    </div>


        {/* RIGHT SIDE – YOUR EXISTING CHAT (UNCHANGED) */}
        <div className="flex-1 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl flex flex-col h-full overflow-hidden">

          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/80">
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white uppercase">
                The Brutal VC <span className="text-emerald-500">.ai</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
                Status: Looking to roast
              </p>
            </div>
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
          </div>

          {/* Chat Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <div className="text-6xl">💼</div>
                <p className="font-mono text-sm uppercase tracking-widest">
                  Pitch me your "disruptive" idea. <br /> Don't waste my time.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-900/20'
                      : 'bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-bl-none'
                  }`}>
                    <p className="font-bold text-[10px] uppercase tracking-tighter mb-1 opacity-50">
                      {m.role === 'user' ? 'Founder' : 'The VC'}
                    </p>
                    {m.role === 'assistant'
                      ? renderAIContent(m.content)
                      : m.content}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="text-xs font-mono text-zinc-500 animate-pulse uppercase tracking-widest">
                Calculating burn rate...
              </div>
            )}
          </div>

          {/* Input Area – UNCHANGED */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!input.trim() || isLoading) return;

              const userMessage = { id: Date.now().toString(), role: 'user', content: input };
              setMessages(prev => [...prev, userMessage]);
              setInput('');
              setIsLoading(true);

              try {
                const response = await fetch('/api/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ messages: [...messages, userMessage] })
                });

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let assistantContent = '';
                const assistantId = (Date.now() + 1).toString();

                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  const chunk = decoder.decode(value, { stream: true });
                  assistantContent += chunk;

                  setMessages(prev => {
                    const without = prev.filter(m => m.id !== assistantId);
                    return [...without, { id: assistantId, role: 'assistant', content: assistantContent }];
                  });
                }
              } catch (err) {
                alert('Failed to get response');
              } finally {
                setIsLoading(false);
              }
            }}
            className="p-4 bg-zinc-900/80 border-t border-zinc-800"
          >
            <div className="relative group">
              <input
                type="text"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-5 pr-14 text-sm"
                value={input}
                placeholder="Ex: Uber for pet rocks..."
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={isLoading || !input}
                className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-600 text-white rounded-xl font-bold"
              >
                PITCH
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default App;
