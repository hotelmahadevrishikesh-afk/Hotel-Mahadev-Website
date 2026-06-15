"use client"
import Link from 'next/link';
import { useEffect, useState } from "react";

const categories = [
  { label: "General", icon: "💬" },
  { label: "Packages / Product", icon: "↩️" },
  { label: "Privacy FAQ", icon: "🎁" },
  { label: "Refunds & Cancellation", icon: "💸" },
  { label: "Payments", icon: "💳" },
  { label: "House Rules", icon: "🏡" }
];

const leftImage = './FaqBanner.jpg';

const Faq = () => {
  const [selectedSection, setSelectedSection] = useState(categories[0].label);
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState(null);
  const [faqs, setFaqs] = useState({});
  // console.log(faqs)

  useEffect(() => {
    const fetchFaqs = async () => {
      const res = await fetch("/api/faqs");
      const data = await res.json();
      setFaqs(data);
    };
    fetchFaqs();
  }, []);

  const section = faqs[selectedSection] || [];

  const filteredFaqs = section.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex w-full md:max-w-[90%] flex-col md:flex-row mx-auto min-h-screen relative">
      {/* Left Side */}
      <div className="md:w-[50%] md:min-w-[320px] flex flex-col md:flex-col px-5 md:px-10 pt-8 bg-[#fcf7f2] md:sticky md:top-0 md:h-screen">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Have any questions?</h2>
        <nav className="text-md text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/">
            <span className='hover:underline text-black text-md'>Home</span>
          </Link>
          <span className="mx-1">›</span>
          <span className="font-semibold text-md">Faqs</span>
        </nav>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {categories.map((s) => (
            <button
              key={s.label}
              onClick={() => { setSelectedSection(s.label); setOpenIdx(null); }}
              className={`flex items-center gap-2 border rounded-lg md:px-6 md:py-4 px-4 py-2 font-medium text-left transition-all duration-150 ${selectedSection === s.label ? 'border-[#e6b17a] bg-[#fdf4e7]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
            >
              <span className="md:text-lg mr-2">{s.icon}</span> {s.label}
            </button>
          ))}
        </div>
        <img src={leftImage} alt="FAQ Banner" className="hidden md:flex rounded-xl w-full h-56 object-cover mb-4" />
      </div>
      {/* Right Side */}
      <div className="flex-1 md:px-10 px-5 py-8 md:overflow-y-auto md:h-screen">
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          {/* Search */}
          <div className="relative mb-2">
            <input
              type="text"
              className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e6b17a]"
              placeholder="Search FAQ"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-2-2" /></svg>
          </div>
          {/* FAQ List */}
          <div className="flex flex-col gap-3">
            {filteredFaqs.length === 0 && (
              <div className="text-gray-400 text-center py-8">No FAQs found.</div>
            )}
            {filteredFaqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-300 rounded-xl bg-white overflow-hidden">
                <div
                  className="flex items-center justify-between md:px-8 px-4 py-2 cursor-pointer select-none"
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  aria-label={openIdx === idx ? 'Collapse' : 'Expand'}
                >
                  <span className="md:text-xl text-sm font-bold text-gray-900 text-left">
                    {faq.question}
                  </span>
                  <button
                    tabIndex={-1}
                    className="flex items-center justify-center md:w-10 md:h-10 w-6 h-6 md:rounded-full rounded border border-gray-300 bg-black text-white text-xl focus:outline-none transition-colors duration-200"
                    aria-label={openIdx === idx ? 'Collapse' : 'Expand'}
                  >
                    <span className="text-xl">{openIdx === idx ? '−' : '+'}</span>
                  </button>
                </div>
                <div
                  className={`px-8 pb-4 pt-0 text-gray-900 text-lg border-t border-gray-100 overflow-hidden
    transition-all duration-300 ease-in-out
    transform transition-transform
    ${openIdx === idx ? 'max-h-60 opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-2'}
  `}
                  style={{ pointerEvents: openIdx === idx ? 'auto' : 'none' }}
                >
                  <div
                    className="custom-desc-list text-gray-700 mb-2 md:text-lg py-2"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};  

export default Faq;