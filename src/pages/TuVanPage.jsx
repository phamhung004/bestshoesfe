import React, { useState, useCallback } from 'react';
import ChatWidget from '../components/AiChat/ChatWidget';

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
      </svg>
    ),
    title: 'Tìm giày theo phong cách',
    desc: 'Mô tả phong cách bạn thích, AI sẽ gợi ý giày phù hợp nhất.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5" />
      </svg>
    ),
    title: 'Tư vấn size chính xác',
    desc: 'Cho biết chiều dài bàn chân hoặc size cũ, AI sẽ tính size phù hợp.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    title: 'So sánh sản phẩm',
    desc: 'So sánh 2-3 đôi giày để chọn đôi tốt nhất cho bạn.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    title: 'Gợi ý theo ngân sách',
    desc: 'Cho biết ngân sách, AI tìm giày chất lượng tốt nhất trong tầm giá.',
  },
];

const EXAMPLE_QUESTIONS = [
  'Tôi cao 1m75, thích chạy bộ, ngân sách 1.5 triệu',
  'Giày nào phù hợp đi làm văn phòng?',
  'Chân tôi dài 26cm nên mang size bao nhiêu?',
  'So sánh Nike Air Max và Adidas Ultraboost',
  'Giày sneaker trắng phổ biến nhất',
  'Giày đi mưa không bị ướt',
];

export default function TuVanPage() {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleQuestionClick = useCallback((q) => {
    setSelectedQuestion(q);
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
            AI-Powered
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Tư vấn giày thông minh</h1>
          <p className="mt-2 text-gray-500 max-w-lg mx-auto">
            Trợ lý AI của BestShoes giúp bạn chọn giày phù hợp nhất dựa trên phong cách,
            nhu cầu và ngân sách cá nhân.
          </p>
        </div>

        {/* Main 2-panel layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT PANEL — features & suggestions */}
          <div className="lg:w-[40%] space-y-6">
            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Popular questions */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Câu hỏi phổ biến</h3>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuestionClick(q)}
                    className="px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-200
                               rounded-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200
                               transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL — chat */}
          <div className="lg:w-[60%] h-[calc(100vh-260px)] min-h-[480px]">
            <ChatWidget fullPage key={selectedQuestion} initialMessage={selectedQuestion} />
          </div>
        </div>
      </div>
    </div>
  );
}
