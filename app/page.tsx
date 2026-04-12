"use client";
import { useState, useRef, useEffect } from "react";
import { Nunito } from "next/font/google";

// Inject a friendly, ed-tech approved font
const nunito = Nunito({ 
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export default function Home() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognition = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleUserMessage = async (text: string) => {
    const newHistory = [...messages, { role: "user", content: text }];
    setMessages(newHistory);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });
      
      if (!res.ok) throw new Error("Server is busy");
      
      const data = await res.json();
      setMessages([...newHistory, { role: "ai", content: data.reply }]);
      speakText(data.reply);
      
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage = "I'm sorry, my brain is a little overloaded right now. Could you repeat that in a few seconds?";
      setMessages([...newHistory, { role: "ai", content: errorMessage }]);
      speakText(errorMessage);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleUserMessage(transcript);
      };

      recognition.current.onend = () => setIsRecording(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const toggleRecording = () => {
    if (isRecording) {
      recognition.current?.stop();
    } else {
      recognition.current?.start();
      setIsRecording(true);
    }
  };

  const endInterview = async () => {
    setIsEvaluating(true);
    try {
      const transcriptText = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      const res = await fetch("/api/eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcriptText }),
      });
      const data = await res.json();
      setEvaluation(data.evaluation);
    } catch (error) {
      console.error("Evaluation failed:", error);
      alert("Something went wrong with the evaluation. Check the terminal!");
    }
    setIsEvaluating(false);
  };

  return (
    <main className={`min-h-screen bg-[#FFFBF5] text-slate-900 ${nunito.className} p-4 sm:p-8 flex flex-col items-center selection:bg-red-200`}>
      
      {/* Header Section */}
      <div className="w-full max-w-3xl text-center mb-6 sm:mb-8 mt-4 sm:mt-6">
        <div className="inline-block bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100 mb-4">
          <span className="text-red-600 font-black text-xl tracking-tight">CUEMATH</span>
          <span className="text-slate-800 font-bold text-xl tracking-tight ml-2">Screener</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-3 tracking-tight">
          AI Tutor Interview
        </h1>
        <p className="text-slate-500 font-semibold text-sm sm:text-base max-w-lg mx-auto">
          Tap the microphone, speak naturally, and let&apos;s see how you explain math to kids!
        </p>
      </div>
      
      {/* Chat Interface */}
      <div className="w-full max-w-3xl bg-white shadow-xl shadow-slate-200/50 border-2 border-slate-100 rounded-[2rem] p-4 sm:p-8 mb-6 h-[50vh] min-h-[400px] overflow-y-auto flex flex-col gap-5">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4 fade-in">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-red-100">
              👋
            </div>
            <p className="text-xl font-bold text-slate-700 mb-2">Ready when you are!</p>
            <p className="text-sm font-medium max-w-xs">
              Press and hold the button below. I might ask you to explain fractions!
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`
              px-6 py-4 max-w-[85%] sm:max-w-[75%] text-sm sm:text-base font-bold
              ${m.role === 'user' 
                ? 'bg-red-600 text-white rounded-3xl rounded-br-sm shadow-md shadow-red-600/20' 
                : 'bg-slate-50 text-slate-800 rounded-3xl rounded-bl-sm border-2 border-slate-100'
              }
            `}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Control Buttons */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-4 mb-10">
        <button 
          onClick={toggleRecording} 
          className={`flex-1 py-4 px-6 rounded-2xl font-black text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3 border-b-4 active:border-b-0 active:translate-y-1
            ${isRecording 
              ? 'bg-white text-red-600 border-red-200 hover:bg-red-50' 
              : 'bg-red-600 border-red-800 hover:bg-red-500 text-white shadow-red-600/30'
            }`}
        >
          {isRecording ? (
            <><span className="h-4 w-4 bg-red-600 rounded-full animate-pulse"></span> Listening...</>
          ) : (
            "🎤 Hold to Speak"
          )}
        </button>
        
        {messages.length > 0 && (
          <button 
            onClick={endInterview} 
            disabled={isEvaluating}
            className={`py-4 px-8 rounded-2xl font-black text-lg transition-all duration-300 shadow-lg border-b-4 active:border-b-0 active:translate-y-1
              ${isEvaluating 
                ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-slate-900 border-black hover:bg-slate-800 text-white shadow-slate-900/30'
              }`}
          >
            {isEvaluating ? "Analyzing Transcript..." : "End & Evaluate"}
          </button>
        )}
      </div>

      {/* Evaluation Rubric Modal */}
      {evaluation && (
        <div className="w-full max-w-3xl bg-white shadow-2xl border-4 border-slate-900 rounded-[2rem] p-6 sm:p-10 mt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 relative overflow-hidden">
          
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-bl-full -z-0 opacity-20"></div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b-2 border-slate-100">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Screener Results</h2>
              <span className="mt-3 sm:mt-0 inline-block bg-green-100 text-green-800 text-sm font-black px-4 py-2 rounded-full border-2 border-green-200">
                Evaluation Complete
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-3xl">
                <p className="text-sm text-blue-600 font-extrabold mb-1 uppercase tracking-widest">Clarity Score</p>
                <p className="text-5xl font-black text-slate-900">{evaluation.clarityScore}<span className="text-2xl text-blue-300">/10</span></p>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-100 p-6 rounded-3xl">
                <p className="text-sm text-yellow-600 font-extrabold mb-1 uppercase tracking-widest">Warmth Score</p>
                <p className="text-5xl font-black text-slate-900">{evaluation.warmthScore}<span className="text-2xl text-yellow-300">/10</span></p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
                <span>📝</span> Overall Feedback
              </h3>
              <p className="text-slate-700 font-semibold leading-relaxed bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                {evaluation.overallFeedback}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span>💬</span> Evidence Quotes
              </h3>
              <ul className="space-y-3">
                {evaluation.evidenceQuotes && evaluation.evidenceQuotes.map((quote: string, i: number) => (
                  <li key={i} className="flex gap-4 text-slate-700 items-start bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm">
                    <span className="text-red-500 font-black text-2xl leading-none pt-1">&ldquo;</span>
                    <span className="font-bold pt-1">{quote}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}