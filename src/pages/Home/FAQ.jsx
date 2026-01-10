import { useState } from 'react'
import { faqs } from './data'
import './FAQ.css'

function FAQ() {
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <section className="faq-section">
      <div className="container mx-auto px-6 py-12">
        <div className="faq-container">
          <div className="faq-header">
            <h2 className="faq-title">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="faq-content">
            {/* Search FAQ */}
            <div className="faq-search">
              <span className="faq-search-text">
                Search Faq
              </span>
            </div>

            {/* FAQ Items */}
            <div className="faq-items">
              {faqs.map((faq, index) => (
                <div 
                  key={faq.id} 
                  className="faq-item"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="faq-question-button"
                  >
                    <div className="faq-question-content">
                      <h3 className="faq-question">
                        {faq.question}
                      </h3>
                    </div>
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 20 20" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className={`faq-arrow ${openFaq === index ? 'faq-arrow-open' : ''}`}
                    >
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="#2C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {openFaq === index && (
                    <div className="faq-answer">
                      <p className="faq-answer-text">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ

