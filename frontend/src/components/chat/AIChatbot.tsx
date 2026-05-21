import { useEffect, useRef, useState, type FormEvent } from "react";
import { Building2, MessageSquare, Send, X } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useLanguage, type Language } from "@/context/LanguageContext";
import { useGlobalError } from "@/context/ErrorContext";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AIChatbotProps = {
  language: Language;
};

export default function AIChatbot({ language }: AIChatbotProps) {
  const { t } = useLanguage();
  const { handleError } = useGlobalError();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages([{ role: "assistant", content: t.chatbot.welcome }]);
  }, [language, t.chatbot.welcome]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await apiClient.post("/chat", {
        message: userMessage,
        session_id: sessionId,
        language,
      });

      setSessionId(response.data.session_id);
      setMessages((prev) => [...prev, { role: "assistant", content: response.data.response }]);
    } catch (error) {
      handleError(error, "chatbot.sendMessage", { sessionId });
      setMessages((prev) => [...prev, { role: "assistant", content: t.chatbot.error }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden z-50 border border-slate-200">
          <div className="bg-slate-900 text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">{t.chatbot.title}</h3>
              <p className="text-xs text-slate-400">{t.chatbot.subtitle}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === "user" ? "bg-teal-500 text-white" : "bg-white text-slate-800 border border-slate-200"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-xs text-slate-500">{t.contact.form.submitting}</div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.chatbot.placeholder}
                className="flex-1 h-10 px-4 border border-slate-300 rounded-full text-sm"
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !input.trim()} className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
