import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const STORAGE_KEY = 'bestshoes_chat_messages';
const MAX_MSG_LEN = 500;
const MAX_HISTORY = 10;

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Xin chào! Tôi là AI tư vấn giày của BestShoes 👟\nTôi có thể giúp bạn tìm giày phù hợp, tư vấn size, so sánh sản phẩm.\nBạn đang tìm kiếm loại giày nào?',
  suggestedProducts: null,
  timestamp: Date.now(),
};

const QUICK_CHIPS = [
  'Giày chạy bộ dưới 2 triệu',
  'Size 42 có giày gì?',
  'Giày Nike mới nhất',
  'Tư vấn giày đi làm',
];

/* ── helpers ─────────────────────────────────────── */

function formatPrice(v) {
  if (v == null) return '';
  return Number(v).toLocaleString('vi-VN') + 'đ';
}

/** Simple markdown-ish renderer: **bold** and newlines */
function renderContent(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {p.slice(2, -2)}
        </strong>
      );
    }
    // split newlines
    return p.split('\n').map((line, j, arr) => (
      <React.Fragment key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  });
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

/* ── components ─────────────────────────────────── */

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-2 h-2 rounded-full bg-gray-400"
          style={{
            animation: 'chatDotBounce 1.2s infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function ProductCard({ product, onClick }) {
  const hasPromo =
    product.promotionPrice != null &&
    Number(product.promotionPrice) !== Number(product.price);

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-44 bg-white border border-gray-200 rounded-xl overflow-hidden
                 hover:shadow-md transition-shadow text-left"
    >
      <div className="w-full h-24 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl">👟</span>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-gray-800 truncate">{product.name}</p>
        <div className="mt-1 flex items-center gap-1 flex-wrap">
          {hasPromo ? (
            <>
              <span className="text-xs font-bold text-red-600">
                {formatPrice(product.promotionPrice)}
              </span>
              <span className="text-[10px] text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-xs font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        <span className="mt-1.5 inline-block text-[10px] text-blue-600 font-medium">
          Xem sản phẩm →
        </span>
      </div>
    </button>
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
    if (fullPage) return [WELCOME_MESSAGE]; // full-page always starts fresh
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [WELCOME_MESSAGE];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  const onlyWelcome = messages.length === 1 && messages[0].id === 'welcome';

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
      // small delay so component is mounted
      const timer = setTimeout(() => sendMessage(initialMessage), 150);
      return () => clearTimeout(timer);
    }
  }, [initialMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  /* — auto-scroll --------------------------------------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* — textarea auto-resize ------------------------------------ */
  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    if (val.length <= MAX_MSG_LEN) setInputText(val);
    // auto-resize
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 80) + 'px';
  }, []);

  /* — send message -------------------------------------------- */
  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text ?? inputText).trim();
      if (!trimmed || isLoading) return;

      const userMsg = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: trimmed,
        suggestedProducts: null,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setIsLoading(true);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // build history (last N exchanges, excluding welcome)
      const history = [...messages, userMsg]
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }))
        .slice(-MAX_HISTORY);

      try {
        const res = await axiosClient.post('/ai/chat', {
          message: trimmed,
          history,
          context: ctx,
          currentProductId,
        });

        const data = res.data ?? res; // interceptor already unwraps

        const assistantMsg = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply ?? 'Xin lỗi, tôi không hiểu. Bạn thử hỏi lại nhé!',
          suggestedProducts: data.suggestedProducts ?? null,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: 'Xin lỗi, có lỗi xảy ra. Thử lại nhé!',
            suggestedProducts: null,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [inputText, isLoading, messages, ctx, currentProductId],
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
    },
    [navigate],
  );

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */

  // Checkout block
  if (!fullPage && isCheckout) return null;

  /* — Chat panel inner content -------------------------------- */
  const chatContent = (
    <>
      {/* HEADER */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl shrink-0">
        <span className="text-2xl leading-none">👟</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">Tư vấn giày AI</p>
          <p className="text-[11px] text-blue-100 leading-tight">Trả lời trong vài giây</p>
        </div>
        {!fullPage && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Đóng chat"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth" style={{ overscrollBehavior: 'contain' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-[chatFadeIn_0.25s_ease-out]`}
          >
            <div className="max-w-[85%]">
              <div
                className={
                  msg.role === 'user'
                    ? 'px-3.5 py-2.5 bg-blue-600 text-white text-sm rounded-2xl rounded-br-sm'
                    : 'px-3.5 py-2.5 bg-gray-100 text-gray-800 text-sm rounded-2xl rounded-bl-sm'
                }
              >
                {renderContent(msg.content)}
              </div>

              {/* PRODUCT SUGGESTIONS */}
              {msg.suggestedProducts?.length > 0 && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {msg.suggestedProducts.map((p) => (
                    <ProductCard
                      key={p.productId}
                      product={p}
                      onClick={() => handleProductClick(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* QUICK CHIPS — only when just the welcome message */}
        {onlyWelcome && !isLoading && (
          <div className="flex flex-wrap gap-2 pt-1 animate-[chatFadeIn_0.3s_ease-out]">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50
                           border border-blue-200 rounded-full hover:bg-blue-100
                           transition-colors whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start animate-[chatFadeIn_0.2s_ease-out]">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="shrink-0 border-t border-gray-100 px-3 py-2.5 bg-white rounded-b-2xl">
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
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2
                         text-sm text-gray-800 placeholder-gray-400
                         focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400
                         disabled:opacity-50 transition-colors"
              style={{ maxHeight: 80 }}
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
            className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            aria-label="Gửi tin nhắn"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
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
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}
          bottom-20 right-6 w-96 h-[520px]
          max-sm:bottom-0 max-sm:right-0 max-sm:w-full max-sm:h-full max-sm:rounded-none`}
      >
        {chatContent}
      </div>

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`fixed z-50 bottom-6 right-6 w-14 h-14 rounded-full
          bg-gradient-to-br from-blue-600 to-indigo-600 text-white
          shadow-xl hover:shadow-2xl hover:scale-105
          flex items-center justify-center
          transition-all duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat tư vấn AI'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
