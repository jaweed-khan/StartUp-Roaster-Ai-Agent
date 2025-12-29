import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';

function App() {
  // useChat connects to your /api/chat.js automatically
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  const scrollRef = useRef(null);

  // Keep chat scrolled to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black">
      
      <div className="w-full max-w-xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">
        
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
                  {m.content}
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

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 bg-zinc-900/80 border-t border-zinc-800">
          <div className="relative group">
            <input
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-zinc-200 placeholder:text-zinc-600"
              value={input}
              placeholder="Ex: Uber for pet rocks..."
              onChange={handleInputChange}
            />
            <button
              type="submit"
              disabled={isLoading || !input}
              className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              PITCH
            </button>
          </div>
          <p className="text-center text-[9px] text-zinc-600 mt-3 font-mono uppercase tracking-tighter">
            Warning: Your ego may be damaged during this interaction.
          </p>
        </form>
      </div>

    </div>
  );
}

export default App;