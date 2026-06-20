import { useState } from 'react';
import { ArrowLeft, MessageSquare, FileText, Users, Calendar, TrendingUp, Send, Download, Share2, BookOpen, Sparkles } from 'lucide-react';
import { mockArticles, mockChatHistory, ChatMessage, Article } from '../../data/mockData';
import { loadUploadedArticles } from '../../../utils/articleStore';
import SinglePDFViewer from './SinglePDFViewer';

interface ArticleDetailProps {
  articleId: string;
  onNavigate: (page: string) => void;
}

export default function ArticleDetail({ articleId, onNavigate }: ArticleDetailProps) {
  const allArticles = (() => {
    try { const stored = loadUploadedArticles(); return [...stored, ...mockArticles.filter(m => !stored.find(s => s.id === m.id))]; } catch { return mockArticles; }
  })();
  const article = allArticles.find(a => a.id === articleId);
  const [messages, setMessages] = useState<ChatMessage[]>(
    mockChatHistory.filter(m => m.articleId === articleId)
  );
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPDF, setShowPDF] = useState(false);

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">Article Not Found</h2>
          <button
            onClick={() => onNavigate('library')}
            className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: `c${Date.now()}`,
      articleId: article.id,
      question: inputMessage,
      answer: '',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        ...newMessage,
        answer: 'This is a sample AI-based response. In a full system, the bot would analyze the article content and provide an accurate answer based on the complete text of the research. The response would include references to specific sources in the article and present relevant citations.',
        sources: ['Section 3.2', 'Table 1', 'Figure 4']
      };

      setMessages(prev => prev.map(m => m.id === newMessage.id ? aiResponse : m));
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => onNavigate('library')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Library
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{article.title}</h1>

              <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{article.authors.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{article.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>{article.citations} citations</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {article.topics.map(topic => (
                  <span key={topic} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Article Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Abstract */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Abstract
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">{article.abstract}</p>
            </div>

            {/* Methodology */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Methodology</h3>
              <p className="text-sm text-slate-700">{article.methodology}</p>
            </div>

            {/* Key Findings */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Key Findings
              </h3>
              <ul className="space-y-2">
                {article.keyFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-emerald-50 to-violet-50 rounded-lg border border-emerald-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowPDF(true)}
                  className="w-full px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm border border-slate-200"
                >
                  View Full PDF
                </button>
                <button className="w-full px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm border border-slate-200">
                  Generate Detailed Summary
                </button>
                <button className="w-full px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm border border-slate-200">
                  Find Similar Articles
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 h-[calc(100vh-280px)] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Ask Questions About the Research</h3>
                    <p className="text-sm text-slate-600">The bot analyzes the article and responds based on the content</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="font-semibold text-slate-900 mb-2">Start a Conversation</h4>
                    <p className="text-sm text-slate-600 mb-6">Ask questions about the research and the bot will answer based on the content</p>
                    <div className="max-w-md mx-auto space-y-2">
                      <button
                        onClick={() => setInputMessage('What are the main conclusions of this research?')}
                        className="w-full px-4 py-3 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm text-left"
                      >
                        What are the main conclusions of this research?
                      </button>
                      <button
                        onClick={() => setInputMessage('What methodology was used in this study?')}
                        className="w-full px-4 py-3 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm text-left"
                      >
                        What methodology was used in this study?
                      </button>
                      <button
                        onClick={() => setInputMessage('What are the limitations of this research?')}
                        className="w-full px-4 py-3 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm text-left"
                      >
                        What are the limitations of this research?
                      </button>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} className="space-y-4">
                      {/* User Question */}
                      <div className="flex justify-end">
                        <div className="max-w-[80%] bg-emerald-600 text-white rounded-lg px-4 py-3">
                          <p className="text-sm">{msg.question}</p>
                        </div>
                      </div>

                      {/* AI Answer */}
                      {msg.answer && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%]">
                            <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
                              <p className="text-sm text-slate-800 leading-relaxed mb-3">{msg.answer}</p>
                              {msg.sources && msg.sources.length > 0 && (
                                <div className="pt-3 border-t border-slate-200">
                                  <p className="text-xs font-semibold text-slate-700 mb-2">Sources:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {msg.sources.map((source, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-white text-slate-600 rounded text-xs border border-slate-200">
                                        {source}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-200">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a question about the research..."
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showPDF && (
        <SinglePDFViewer article={article} onClose={() => setShowPDF(false)} />
      )}
    </div>
  );
}
