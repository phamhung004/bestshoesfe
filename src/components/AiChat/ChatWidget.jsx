import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const STORAGE_KEY = 'bestshoes_chat_messages';
const MAX_MSG_LEN = 500;
const MAX_HISTORY = 10;

const QUICK_CHIPS = [
  '🏃 Giày chạy bộ dưới 2 triệu',
  '📏 Tư vấn size giày',
  '⭐ Giày bán chạy nhất',
  '💼 Giày đi làm lịch sự',
  '🔥 Khuyến mãi đang có',
];

/* ── helpers ─────────────────────────────────────── */

function formatPrice(v) {
  if (v == null) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v));
}

function formatAiText(text) {
  if (!text) return '';
  return text
    .trim()
    .replace(/([.!?,:;])([^\s\d])/g, '$1 $2')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
    .replace(/^- (.+)/gm, '• $1');
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

/* extract productId from pathname like /products/123 */
function extractProductId(pathname) {
  const m = pathname.match(/^\/products\/(\d+)/);
  return m ? Number(m[1]) : null;
}

function detectContext(pathname) {
  if (/^\/products\/\d+/.test(pathname)) return 'product_detail';
  if (/^\/catalog/.test(pathname)) return 'catalog';
  if (/^\/checkout/.test(pathname)) return 'checkout';
  return null;
}

/* ── sub-components ─────────────────────────────── */

function TypingDots() {
  return (
    <div className="flex items-start gap-2 animate-[chatFadeIn_0.2s_ease-out]">
      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs flex-shrink-0">
        👟
      </div>
      <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm border border-gray-100">
        <div className="flex gap-1 px-4 py-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block w-2 h-2 rounded-full bg-gray-400"
              style={{
                animation: 'chatDotBounce 1.2s infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onClick }) {
  const hasPromo =
    product.promotionPrice != null &&
    Number(product.promotionPrice) !== Number(product.price);
  const discount = hasPromo
    ? Math.round((1 - Number(product.promotionPrice) / Number(product.price)) * 100)
    : 0;

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-[140px] bg-white rounded-xl border border-gray-100
                 shadow-sm hover:shadow-md hover:-translate-y-0.5
                 cursor-pointer transition-all duration-200 text-left overflow-hidden"
    >
      <div className="w-full h-[100px] bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-xl">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">👟</span>
        )}
      </div>
      <div className="px-2.5 pt-2 pb-2.5">
        <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight">{product.name}</p>
        <div className="mt-1.5">
          {hasPromo ? (
            <>
              <span className="text-[10px] text-gray-400 line-through block">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {formatPrice(product.promotionPrice)}
                {discount > 10 && ' 🔥'}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-blue-600">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        <span className="mt-1 inline-block text-[10px] text-blue-500 font-medium">
          Xem ngay →
        </span>
      </div>
    </button>
  );
}

function WelcomeScreen({ onChipClick }) {
  return (
    <div className="flex flex-col items-center text-center py-6 px-4 animate-[chatFadeIn_0.3s_ease-out]">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl mb-3 shadow-lg">
        👟
      </div>
      <h3 className="font-semibold text-gray-800 text-base mb-1">
        BestShoes AI Assistant
      </h3>
      <p className="text-gray-500 text-xs leading-relaxed mb-4">
        Tôi có thể giúp bạn tìm giày phù hợp,<br />
        tư vấn size và so sánh sản phẩm.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => onChipClick(chip)}
            className="px-3 py-1.5 text-xs rounded-full border border-blue-200
                       text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN: ChatWidget
   ═══════════════════════════════════════════════════ */

export default function ChatWidget({ fullPage = false, initialMessage = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(fullPage);
  const [messages, setMessages] = useState(() => {
    if (fullPage) return [];
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const initialSentRef = useRef(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatPanelRef = useRef(null);

  /* — derived ------------------------------------------------- */
  const ctx = useMemo(() => detectContext(location.pathname), [location.pathname]);
  const currentProductId = useMemo(
    () => extractProductId(location.pathname),
    [location.pathname],
  );
  const isCheckout = ctx === 'checkout';
  const isEmpty = messages.length === 0;

  /* — persistence --------------------------------------------- */
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { /* quota */ }
  }, [messages]);

  // clear chat on logout
  useEffect(() => {
    if (!isAuthenticated) {
      // only clear if there was actual conversation beyond welcome
      // We keep welcome so it's ready for next session
    }
  }, [isAuthenticated]);

  // auto-send initialMessage (from TuVanPage question chips)
  useEffect(() => {
    if (initialMessage && !initialSentRef.current) {
      initialSentRef.current = true;
      const timer = setTimeout(() => sendMessage(initialMessage), 150);
      return () => clearTimeout(timer);
    }
  }, [initialMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  // clear unread when opening
  useEffect(() => {
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  /* — auto-scroll --------------------------------------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* — textarea auto-resize ------------------------------------ */
  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    if (val.length <= MAX_MSG_LEN) setInputText(val);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 128) + 'px';
  }, []);

  /* — send message -------------------------------------------- */
  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text ?? inputText).trim();
      if (!trimmed || isLoading) return;

      // Remove trailing error messages before adding new user message
      setMessages((prev) => {
        const cleaned = [...prev];
        while (cleaned.length > 0 && cleaned[cleaned.length - 1].isError) {
          cleaned.pop();
        }
        return cleaned;
      });

      const userMsg = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: trimmed,
        suggestedProducts: null,
        timestamp: Date.now(),
        isError: false,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setIsLoading(true);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // build history from clean (non-error) messages only
      const history = [...messages, userMsg]
        .filter((m) => !m.isError)
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }))
        .slice(-MAX_HISTORY);

      try {
        const res = await axiosClient.post('/ai/chat', {
          message: trimmed,
          history,
          context: ctx,
          currentProductId,
        });

        const data = res.data ?? res;

        const assistantMsg = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply ?? 'Xin lỗi, tôi không hiểu. Bạn thử hỏi lại nhé!',
          suggestedProducts: data.suggestedProducts ?? null,
          timestamp: Date.now(),
          isError: false,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (!isOpen) setHasUnread(true);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau nhé! 🙏',
            suggestedProducts: null,
            timestamp: Date.now(),
            isError: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [inputText, isLoading, messages, ctx, currentProductId, isOpen],
  );

  /* — keyboard ------------------------------------------------ */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  /* — chip click ---------------------------------------------- */
  const handleChipClick = useCallback(
    (chip) => {
      setInputText(chip);
      sendMessage(chip);
    },
    [sendMessage],
  );

  /* — product card click -------------------------------------- */
  const handleProductClick = useCallback(
    (product) => {
      navigate(`/products/${product.productId}`);
      setIsOpen(false);
    },
    [navigate],
  );

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */

  if (!fullPage && isCheckout) return null;

  /* — Chat panel inner content -------------------------------- */
  const chatContent = (
    <>
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
          👟
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">Tư vấn giày AI</p>
          <p className="text-blue-100 text-xs">Trả lời trong vài giây</p>
        </div>
        {!fullPage && (
          <button
            onClick={() => setIsOpen(false)}
            className="ml-auto w-7 h-7 rounded-full bg-white/10 hover:bg-white/20
                       flex items-center justify-center text-white text-base transition-colors"
            aria-label="Đóng chat"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 scroll-smooth
                       scrollbar-thin scrollbar-thumb-gray-200"
           style={{ overscrollBehavior: 'contain' }}>

        {/* Welcome screen when no messages */}
        {isEmpty && !isLoading && (
          <WelcomeScreen onChipClick={handleChipClick} />
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`animate-[chatFadeIn_0.25s_ease-out] ${
              msg.role === 'user' ? 'flex justify-end' : ''
            }`}
          >
            {msg.isError ? (
              /* ── Error message (not sent to AI) ── */
              <div className="flex items-center gap-2 ml-8">
                <span className="text-xs text-red-400 italic flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {msg.content}
                </span>
              </div>
            ) : msg.role === 'user' ? (
              /* ── User bubble ── */
              <div className="ml-auto max-w-[80%]">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm leading-relaxed
                                px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm">
                  {msg.content}
                </div>
                <p className="text-[10px] text-gray-400 mt-1 text-right">{formatTime(msg.timestamp)}</p>
              </div>
            ) : (
              /* ── AI bubble ── */
              <div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    👟
                  </div>
                  <div className="max-w-[85%]">
                    <div className="bg-white text-gray-800 text-sm leading-relaxed
                                    px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100">
                      <p dangerouslySetInnerHTML={{ __html: formatAiText(msg.content) }}
                         className="text-sm leading-relaxed text-gray-800" />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">{formatTime(msg.timestamp)}</p>
                  </div>
                </div>

                {/* PRODUCT SUGGESTIONS */}
                {msg.role === 'assistant' && msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="ml-8 mt-2">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                      {msg.suggestedProducts.map((p) => (
                        <ProductCard
                          key={p.productId}
                          product={p}
                          onClick={() => handleProductClick(p)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && <TypingDots />}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="shrink-0 border-t border-gray-100 bg-white px-3 py-3">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Nhập câu hỏi..."
              className="w-full resize-none text-sm text-gray-800 bg-gray-100 rounded-xl px-3 py-2.5
                         border border-transparent placeholder-gray-400
                         focus:outline-none focus:border-blue-300 focus:bg-white
                         transition-all disabled:opacity-50"
              style={{ maxHeight: 128, minHeight: 40 }}
            />
            {inputText.length > MAX_MSG_LEN - 50 && (
              <span
                className={`absolute bottom-1 right-2 text-[10px] ${
                  inputText.length >= MAX_MSG_LEN ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                {inputText.length}/{MAX_MSG_LEN}
              </span>
            )}
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="w-9 h-9 rounded-xl flex-shrink-0 bg-blue-600 hover:bg-indigo-600
                       disabled:bg-gray-300 disabled:cursor-not-allowed
                       flex items-center justify-center transition-colors"
            aria-label="Gửi tin nhắn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  /* ── full-page mode ──────────────────────────────── */
  if (fullPage) {
    return (
      <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {chatContent}
      </div>
    );
  }

  /* ── floating widget mode ────────────────────────── */
  return (
    <>
      {/* CSS-in-JS keyframes (injected once) */}
      <style>{`
        @keyframes chatDotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* CHAT PANEL */}
      <div
        ref={chatPanelRef}
        className={`fixed z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden
          transition-all duration-300 ease-in-out origin-bottom-right
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}
          bottom-24 right-5 w-[380px] h-[580px]
          max-sm:bottom-0 max-sm:right-0 max-sm:w-full max-sm:h-full max-sm:rounded-none`}
      >
        {chatContent}
      </div>

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed z-50 bottom-5 right-5 w-14 h-14 rounded-2xl
          bg-gradient-to-br from-blue-600 to-indigo-600 text-white
          shadow-lg hover:shadow-xl hover:scale-105
          flex items-center justify-center
          transition-all duration-200"
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat tư vấn AI'}
      >
        {/* Unread badge */}
        {!isOpen && hasUnread && (
          <span className="w-3 h-3 rounded-full bg-red-500 absolute top-0.5 right-0.5 animate-pulse" />
        )}
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
            />
          </svg>
        )}
      </button>
    </>
  );
}
