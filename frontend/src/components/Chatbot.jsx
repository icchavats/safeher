import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Shield, Bot, User, PhoneCall, AlertTriangle, Sparkles } from 'lucide-react';

export const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am your SafeVoice Emergency Assistant. How can I protect and assist you today? You can ask me about legal rights, safety protocols, helpline contacts, or how to react during immediate danger.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'I feel like I am being followed / stalked',
    'What is Zero FIR and how does it protect me?',
    'Domestic harassment or violence helpline',
    'Tips for late night cab / transit safety',
    'How do I cancel a false SOS alert?',
  ];

  const safetyKnowledgeBase = {
    stalked: `⚠️ IMMEDIATE STALKING PROTOCOL:
1. Do NOT head straight home or to an isolated area.
2. Turn into a crowded, well-lit public space (metro station, 24/7 store, hotel lobby, pharmacy).
3. Call 112 immediately or trigger the SafeVoice SOS button.
4. Call a trusted contact and state your exact location out loud.
5. Do not engage with or confront the stalker.`,
    
    zerofir: `⚖️ ZERO FIR EXPLAINED:
Under Indian Criminal Law (Sec 154 CrPC), you can register an FIR at ANY police station, regardless of whether the crime occurred under their territorial jurisdiction.
• The police officer CANNOT refuse to lodge a Zero FIR for cognizable offenses against women.
• It is given serial number "0" and subsequently transferred to the competent jurisdiction police station.`,

    domestic: `🛡️ DOMESTIC HARASSMENT & VIOLENCE SUPPORT:
• National Commission for Women (NCW) 24/7 Helpline: Call 181
• Women in Distress Emergency: Call 1091
• Police Emergency: 112
• Under the Protection of Women from Domestic Violence Act (PWDVA) 2005, you have immediate rights to protection orders, safe residence orders, and free legal aid.`,

    cab: `🚕 CAB & TRANSIT SAFETY PROTOCOLS:
1. Always verify the driver's name, photo, and car registration plate against your booking app.
2. Share live tracking ride with your emergency contacts.
3. Check child lock on rear doors before entering.
4. Keep the SafeVoice Voice Distress Sentinel ON so saying "Help" or "Bachao" triggers alert automatically.
5. If the driver takes an unauthorized detour, firmly demand to stop at the nearest crowded spot.`,

    cancel: `🔐 CANCELLING AN SOS ALERT:
If an alert was triggered accidentally:
1. On the Dashboard active banner, click "I Am Safe (Cancel SOS)".
2. Enter your 4-digit Emergency PIN (Default: 1234).
3. SafeVoice will immediately notify your contacts that you are safe and that the incident is cleared.`,

    general: `🛡️ I am here to help. If you are in immediate physical danger, please immediately tap the SOS button on your screen or dial 112 directly. For women's helplines, dial 1091 or 181. Stay in lit, public areas.`,
  };

  const getBotResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('follow') || q.includes('stalk') || q.includes('chasing') || q.includes('behind me')) {
      return safetyKnowledgeBase.stalked;
    }
    if (q.includes('zero fir') || q.includes('fir') || q.includes('police report') || q.includes('jurisdiction')) {
      return safetyKnowledgeBase.zerofir;
    }
    if (q.includes('domestic') || q.includes('violence') || q.includes('abuse') || q.includes('harass') || q.includes('in-laws')) {
      return safetyKnowledgeBase.domestic;
    }
    if (q.includes('cab') || q.includes('taxi') || q.includes('uber') || q.includes('auto') || q.includes('transit') || q.includes('travel')) {
      return safetyKnowledgeBase.cab;
    }
    if (q.includes('cancel') || q.includes('pin') || q.includes('false') || q.includes('stop alert')) {
      return safetyKnowledgeBase.cancel;
    }
    return safetyKnowledgeBase.general;
  };

  const handleSend = (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = getBotResponse(query);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: replyText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 600);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col h-[540px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-950/50">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <span>SafeVoice Emergency AI Assistant</span>
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            </h3>
            <p className="text-[11px] text-slate-400">
              Instant guidance on legal rights, safety protocols & helplines
            </p>
          </div>
        </div>

        <a
          href="tel:112"
          className="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-red-600/30 transition"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 112</span>
        </a>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'bot' && (
              <div className="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-3.5 text-xs whitespace-pre-line leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-rose-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none shadow'
              }`}
            >
              {msg.text}
              <div
                className={`text-[10px] mt-1 text-right ${
                  msg.sender === 'user' ? 'text-rose-200' : 'text-slate-500'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <Bot className="w-4 h-4 text-rose-400 animate-spin" />
            <span>Assistant is reviewing safety protocols...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Pills */}
      <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="flex-shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-[11px] border border-slate-700 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-2 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for advice, legal protection, emergency steps..."
          className="flex-1 py-2.5 px-4 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        <button
          type="submit"
          className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition shadow-md shadow-rose-950/40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
