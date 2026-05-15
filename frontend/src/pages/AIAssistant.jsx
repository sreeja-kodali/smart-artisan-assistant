import React, { useState, useRef } from 'react';
import { Sparkles, Camera, Send, Loader2, DollarSign, AlertCircle, Lightbulb, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState('image');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const loadingText = activeTab === 'image' ? 'Analyzing...' : 'Thinking...';

  // Auto scroll chat to bottom
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const parseAnalysisResponse = (text) => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(text);
      return {
        priceRange: parsed.priceRange || 'N/A',
        defects: Array.isArray(parsed.defects) ? parsed.defects : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
      };
    } catch {
      // If not JSON, format as plain text
      return {
        priceRange: 'N/A',
        defects: ['Unable to parse analysis'],
        suggestions: [text || 'Please try again with a clearer image']
      };
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(',')[1];
        const { data } = await api.post('/ai/analyze', { image: base64, mimeType: file.type, filename: file.name });
        
        // Parse the response
        const parsed = parseAnalysisResponse(typeof data === 'string' ? data : JSON.stringify(data));
        setAnalysis(parsed);
      } catch (err) {
        console.error('Analyze error', err);
        const errorMsg = err?.response?.data?.message || 
                        err?.message || 
                        'Failed to analyze image. Please try again.';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', content: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/ai/chat', { question: chatInput });
      const response = data.response || data || 'No response received';
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error('Chat error', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'AI service temporarily unavailable. Please try again later.';
      setChatHistory(prev => [...prev, { role: 'assistant', content: errorMessage, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Sparkles className="text-artisan-clay" />
          Smart Assistant
        </h2>
        <p className="text-artisan-ink/60 text-sm mt-1">AI-powered insights for your craftsmanship.</p>
      </div>

      <div className="bg-white rounded-3xl border border-artisan-olive/10 overflow-hidden shadow-sm flex flex-col min-h-[500px]">
        <div className="flex border-b border-artisan-olive/10">
          <button onClick={() => { setActiveTab('image'); setError(null); }} className={`flex-1 py-4 font-bold text-xs uppercase tracking-widest ${activeTab === 'image' ? 'bg-artisan-cream/30 text-artisan-clay border-b-2 border-artisan-clay' : 'text-artisan-ink/40'}`}>Image Analysis</button>
          <button onClick={() => { setActiveTab('chat'); setError(null); }} className={`flex-1 py-4 font-bold text-xs uppercase tracking-widest ${activeTab === 'chat' ? 'bg-artisan-cream/30 text-artisan-clay border-b-2 border-artisan-clay' : 'text-artisan-ink/40'}`}>Advisor Chat</button>
        </div>

        <div className="p-8 flex-1 flex flex-col">
          {activeTab === 'image' ? (
            <div className="space-y-6 flex-1">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-800 text-sm">Analysis Error</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              {!analysis && !loading && !error && (
                <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-artisan-olive/10 rounded-3xl p-12 text-center cursor-pointer hover:bg-artisan-cream/30 transition-colors flex-1 flex flex-col items-center justify-center">
                  <Camera size={40} className="mx-auto mb-4 text-artisan-ink/10" />
                  <p className="font-bold text-lg">Analyze Product Image</p>
                  <p className="text-xs text-artisan-ink/40">Upload a photo to get valuation and quality feedback</p>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-20 flex-1">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 className="text-artisan-clay mb-2" size={32} />
                  </motion.div>
                  <p className="text-sm font-medium text-artisan-ink/60">{loadingText}</p>
                </div>
              )}

              {analysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 flex-1"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <h4 className="font-bold text-green-800 text-sm mb-2 flex items-center gap-2"><DollarSign size={16} />Estimated Price</h4>
                      <p className="text-xl font-bold text-green-900">{analysis.priceRange}</p>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                      <h4 className="font-bold text-amber-800 text-sm mb-3 flex items-center gap-2"><AlertCircle size={16} />Quality Hints</h4>
                      <ul className="text-xs space-y-1">
                        {analysis.defects.length > 0 ? (
                          analysis.defects.map((d, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-600 mt-1">•</span>
                              <span className="text-amber-700">{d}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-amber-700">No defects detected</li>
                        )}
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-blue-800 text-sm mb-3 flex items-center gap-2"><Lightbulb size={16} />Pro Tips</h4>
                      <ul className="text-xs space-y-1">
                        {analysis.suggestions.length > 0 ? (
                          analysis.suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              <span className="text-blue-700">{s}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-blue-700">Great work! Keep it up.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setAnalysis(null); setError(null); }}
                    className="text-xs font-bold text-artisan-clay hover:underline transition-colors"
                  >
                    ← Analyze another image
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-[400px]">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}

              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {chatHistory.length === 0 && !loading && (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <Info size={32} className="mx-auto mb-3 text-artisan-ink/20" />
                      <p className="text-artisan-ink/60 text-sm">Start a conversation about materials, pricing, quality, or production tips.</p>
                    </div>
                  </div>
                )}

                {chatHistory.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`p-4 rounded-2xl text-sm max-w-[85%] ${
                      msg.role === 'user' 
                        ? 'bg-artisan-clay text-white rounded-br-none' 
                        : msg.isError
                        ? 'bg-red-50 border border-red-200 text-red-700 rounded-bl-none'
                        : 'bg-artisan-cream border border-artisan-olive/10 rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="p-4 rounded-2xl text-sm max-w-[85%] bg-artisan-cream border border-artisan-olive/10 rounded-bl-none flex items-center gap-2">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                        <div className="w-2 h-2 rounded-full bg-artisan-clay" />
                      </motion.div>
                      <span className="text-artisan-ink/60">{loadingText}</span>
                    </div>
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  className="flex-1 bg-artisan-cream border border-artisan-olive/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-artisan-clay" 
                  placeholder="Ask about materials, pricing, quality..." 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)}
                  disabled={loading}
                />
                <button 
                  disabled={loading || !chatInput.trim()} 
                  className="bg-artisan-ink text-white p-3 rounded-xl disabled:opacity-50 transition-transform active:scale-95"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
