"use client"
import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, MessageCircle, X } from "lucide-react";
function isLoggedIn(session) {
  return !!session?.user;
}

const productQnA = [
  {
    q: "General Question",
    subQuestions: [
      { q: "What types of retreat packages do you offer?", a: "We offer yoga and wellness retreat packages including weekend getaways, 3-day, 5-day, and 7-day programs. Each package includes yoga sessions, meditation, satvic meals, and local excursions." },
      { q: "What is included in the retreat package?", a: "All packages typically include:\n- Daily yoga & meditation sessions\n- Satvic meals (breakfast, lunch, dinner)\n- Comfortable accommodation\n- Nature walks, Ganga Aarti visit, or short treks\n- Wi-Fi and essential amenities\n(Some packages may include Ayurvedic treatments or workshops)" },
      { q: "Are meals included in the package price?", a: "Yes, all retreat packages include 3 daily satvic vegetarian meals, herbal teas, and filtered drinking water." },
      { q: "Do you offer single or shared accommodation options?", a: "Yes. We offer both private (single occupancy) and shared (double occupancy) room options depending on your preference and availability." },
      { q: "Is prior yoga experience required?", a: "Not at all! Our retreats are open to all levels, from beginners to advanced practitioners. Instructors adapt the practice to suit your comfort level." },
      { q: "How do I book a retreat package?", a: "You can book directly through our website, chat with our support team, or contact us via WhatsApp/phone for personalized assistance." },
      { q: "What is your cancellation or refund policy?", a: "We offer flexible cancellation terms. Please refer to the cancellation policy section on our booking page or reach out to us for details." },
      { q: "Do you provide airport or railway station pickup?", a: "Yes, pickup and drop services can be arranged at an additional cost. Let us know your arrival details in advance." },
      { q: "Are group discounts or custom packages available?", a: "Yes! We offer custom packages for groups, families, or corporate wellness programs. Discounts apply for groups of 4 or more." },
      { q: "What should I bring for the retreat?", a: "We recommend bringing:\n- Comfortable yoga clothing\n- Personal toiletries\n- Water bottle\n- Light jacket (even in summer evenings)\nYoga mats are provided, but you may bring your own if preferred." },
      { q: "Is there mobile network and Wi-Fi available?", a: "Yes, all rooms and common areas have free high-speed Wi-Fi, and most major mobile networks work well in Tapovan, Rishikesh." },
      { q: "Can I attend the retreat without staying at your property?", a: "Yes, we offer drop-in yoga classes and day participation options for some retreats. Please contact us to check availability." },
      { q: "Do you offer silent retreats or detox programs?", a: "Yes, we occasionally host special retreats like silent meditation, digital detox, and ayurveda-based wellness cleanses. Keep an eye on our schedule or inquire with the team." },
      { q: "Can children or families join the retreat?", a: "Some of our retreats are adult-only, but we also offer family-friendly wellness programs. Please contact us for family-specific options." },
      { q: "Are the retreats open all year round?", a: "Yes, retreats are available year-round. The most popular seasons are October to March and during summer breaks in May-June." }
    ]
  },
  {
    q: "Privacy & Booking Policy",
    subQuestions: [
      {
        q: "What personal ID is required at check-in?",
        a: "Guests must present a valid government-issued photo ID (Aadhar, Passport, or Driver’s License). Foreign nationals need to show a passport and visa."
      },
      {
        q: "Is full payment required on arrival?",
        a: "Yes. We require 100% advance payment at check-in, either by cash or bank transfer. Personal cheques are not accepted."
      },
      {
        q: "Can I cancel or modify my booking?",
        a: "Modifications are allowed up to 72 hours before check-in, subject to availability. Cancellations made within 5 days of arrival incur a 25% room rate cancellation fee."
      },
      {
        q: "What’s your check-in and check-out time?",
        a: "Standard check-in starts at 1 PM. Check-out is by 10 AM (noon late check-out may be available)."
      },
      {
        q: "Is early check-in or late check-out possible?",
        a: "Yes, subject to availability, and pre-registration & payment may be required for guaranteed early arrival before midnight."
      },
      {
        q: "Are there extra charges?",
        a: "Extra beds: ₹ 800 each. GST / taxes: Applicable per government directives."
      },
      {
        q: "What items or activities are prohibited?",
        a: "Strictly no smoking, alcohol, non–vegetarian food, drugs, firearms, outside food, or pets on the premises."
      },
      {
        q: "Can visitors enter my room?",
        a: "Visitors are not allowed in guest rooms after 9 PM. If permitted earlier, photo ID and registration at front desk are required."
      },
      {
        q: "What is your noise policy?",
        a: "Guests must maintain quiet hours between 10 PM and 9 AM and respect local residential harmony."
      },
      {
        q: "Who’s responsible for lost or damaged items?",
        a: "We are not liable for lost or damaged belongings. Guests are responsible for any damage costs to property or furniture."
      },
      {
        q: "How long do you retain found items?",
        a: "Lost items (non-perishables) are held for 14 days (plus 1 month if unclaimed), then donated or disposed."
      },
      {
        q: "Do you offer Wi‑Fi?",
        a: "Yes, free Wi‑Fi is available for guests. Access is subject to data quotas; additional usage may incur a fee."
      }
    ]
  },
  {
    q: "Refund & Cancellation",
    subQuestions: [
      {
        q: "How do I request a refund or return?",
        a: "To request a refund, please email us at hotelmahadev.rishikesh@gmail.com within 24 hours of delivery/booking confirmation. We will guide you through the return process."
      },
      {
        q: "What’s the refund eligibility period?",
        a: "Refund or return requests must be made within 14 days of delivery. Requests after 15 days will not be accepted."
      },
      {
        q: "Do I have to pay for return shipping?",
        a: "Yes, return shipping costs are borne by the customer. We do not cover return shipping fees."
      },
      {
        q: "What are my options after cancellation or return?",
        a: "You can choose any of the following:\n- Replacement (same or different item)\n- Discount code equal to cancellation value\n- Full refund (to original card or via bank transfer if paid by cash)"
      },
      {
        q: "Are custom-made or agent bookings refundable?",
        a: "No, custom-made or third-party/agent bookings do not qualify for standard returns or refunds."
      },
      {
        q: "What happens if a package is mispriced?",
        a: "In case of a pricing error, we honor the lower price and confirm the booking at that rate. If the package is unavailable, we may cancel and process a refund."
      },
      {
        q: "Can you cancel my booking for suspicious activity?",
        a: "Yes. We reserve the right to cancel past, pending, or future bookings if fraudulent or suspicious activity is detected. We may also request additional documents for verification."
      },
      {
        q: "When is a customer considered fraudulent?",
        a: "A customer may be flagged for fraud if they:\n- Don’t respond to payment verification\n- Fail to provide valid ID or details\n- Use fake emails or phones\n- Refuse to pay or misuse vouchers\n- Attempt \"snatch & run\" behavior"
      },
      {
        q: "How is a refund processed?",
        a: "Refunds are issued to the original payment method. For cash payments, bank details must be provided via email for processing."
      },
      {
        q: "Can I cancel or modify my booking anytime?",
        a: "You can request modifications or cancellations within the policy time frame (ideally 14 days). After that, refunds may not be applicable."
      },
      {
        q: "Will I get notified if the policy changes?",
        a: "Yes, we notify users via email of any material changes to our terms & conditions. The latest version is always available on the website."
      },
      {
        q: "Is uninterrupted site access guaranteed?",
        a: "No. While we aim for continuous service, access may be affected by external factors, and we do not guarantee 24/7 uninterrupted access."
      }
    ]
  },
  {
    q: "Accommodation House Rules",
    subQuestions: [
      {
        q: "What are the check-in and check-out times?",
        a: "Check-in: From 1:00 PM\nCheck-out: By 10:00 AM (late check-out till 12:00 PM subject to availability)\nEarly check-in or late check-out is allowed based on availability and may incur extra charges."
      },
      {
        q: "Can I request an extra bed?",
        a: "Yes, extra beds (floor mattress) are available on request at ₹800 per night."
      },
      {
        q: "What ID is required at check-in?",
        a: "Indian Nationals: Valid Government-issued photo ID (Aadhar, Driving Licence, etc.)\nForeign Nationals: Valid passport and visa\nAll visitors must also register with valid ID."
      },
      {
        q: "What is the payment policy?",
        a: "25% advance payment is required to confirm the booking.\nRemaining 75% is payable at check-in.\nNo personal cheques accepted.\nPayment via cash or bank transfer is accepted."
      },
      {
        q: "What is not allowed on the premises?",
        a: "Strictly prohibited:\n- Smoking, alcohol, drugs, gambling\n- Non-vegetarian food\n- Outside food & beverages\n- Firearms, flammable items, or illegal substances\n- Loud parties or disturbances"
      },
      {
        q: "Are children allowed?",
        a: "Yes. Children are welcome.\n0–4 years: Stay free (using existing bedding, no guaranteed breakfast)\nMust be supervised at all times."
      },
      {
        q: "Can visitors enter guest rooms?",
        a: "No visitors allowed after 10:00 PM.\nDay visitors must register at the front desk and may only enter rooms with management approval."
      },
      {
        q: "Is there a quiet time policy?",
        a: "Yes, quiet hours are from 10:00 PM to 9:00 AM.\nGuests are expected to maintain a peaceful environment."
      },
      {
        q: "Is housekeeping available?",
        a: "Yes, daily housekeeping is provided between 9:00 AM and 2:00 PM.\nLinen is changed on rotation or on request."
      },
      {
        q: "Is Wi-Fi available?",
        a: "Yes, free Wi-Fi is available for guests (with limited data).\nExtended usage may be available on request for an additional fee."
      },
      {
        q: "Is parking available?",
        a: "Yes, paid parking is available on-site, subject to availability and registration at check-in."
      },
      {
        q: "What is the cancellation policy?",
        a: "Cancel ≥ 5 days before arrival: No cancellation fee\nCancel < 5 days before arrival: 25% cancellation fee\nNo show: Charged one full night; remaining nights cancelled."
      },
      {
        q: "Can I modify my booking?",
        a: "Yes, booking changes are allowed up to 72 hours (3 days) before arrival, based on availability."
      },
      {
        q: "What happens if I lose my room key?",
        a: "A duplicate will be issued upon valid ID verification.\nGuests under 18 are not issued room keys."
      },
      {
        q: "Is the property secure?",
        a: "Yes. Management reserves the right to inspect rooms if:\n- Emergency\n- Policy violation\n- Safety concerns"
      },
      {
        q: "Are in-room parties allowed?",
        a: "No. Parties, loud music, or gatherings are strictly prohibited. Violators will be evicted without refund."
      },
      {
        q: "Are weapons allowed?",
        a: "No. Firearms or any kind of weapons are strictly banned on the property, even if legally owned."
      },
      {
        q: "Can I store luggage after check-out?",
        a: "Yes, up to 24 hours. Storage is at your own risk, and space is subject to availability."
      },
      {
        q: "What is the linen policy?",
        a: "Linen changed every 2 days or on request.\nTowels are refreshed daily.\nPlease remove personal items for housekeeping to make the bed."
      },
      {
        q: "Can I shoot content (photos/videos) at the retreat?",
        a: "Photography or videography for commercial or public use is not permitted without prior written approval."
      }
    ]
  },
  {
    q: "Payments – FAQ",
    subQuestions: [
      {
        q: "What payment methods are accepted?",
        a: "We accept the following modes of payment:\n- Bank transfer (NEFT/IMPS/UPI)\n- Cash (at check-in)\n- UPI-based apps (Google Pay, PhonePe, etc.)\n\nNote: We do not accept personal cheques."
      },
      {
        q: "Is advance payment required to confirm my booking?",
        a: "Yes, a 25% advance deposit is mandatory to confirm your reservation. The remaining 75% is payable at check-in."
      },
      {
        q: "How will I know my payment is confirmed?",
        a: "Once your payment is received, you’ll receive a booking confirmation email or call with your reservation/order ID."
      },
      {
        q: "Can I pay for someone else's booking?",
        a: "Yes, but full payment must be made in advance, along with a copy of your ID (Aadhar/Passport/Driving License). Please inform us at least 72 hours before check-in for third-party bookings."
      },
      {
        q: "Can I pay at the property?",
        a: "Yes, but only for the balance amount (after 25% advance). Full payment must be made at check-in to receive your room key."
      },
      {
        q: "Do you accept international cards or currency?",
        a: "Currently, we do not accept international debit/credit cards or foreign currency. Payment must be in INR (Indian Rupees)."
      },
      {
        q: "Will I get an invoice or receipt for my payment?",
        a: "Yes. A GST-compliant invoice or booking receipt will be provided at the time of payment or check-in."
      },
      {
        q: "Is GST included in the room tariff?",
        a: "No. Taxes are charged separately as per government directives and will be added to the final bill."
      },
      {
        q: "Can I split my payment between two people?",
        a: "Yes, split payments are accepted. Please notify the front desk during check-in or booking confirmation."
      },
      {
        q: "What if I cancel—how will my refund be processed?",
        a: "If eligible, the refund will be made to the original payment method (bank/UPI). For cash payments, you must provide your bank account details via email."
      }
    ]
  },
  {
    q: "Talk to Support",
    a: `Yes, our customer support is available [Days & Hours]. You can also email us at hotelmahadev.rishikesh@gmail.com or call +91 9927677716`
  }
];

export default function ChatBot() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0); // 0: greet, 1: small talk, 2: contact, 3: product, 4: menu, 5: qna
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [product, setProduct] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);

  // FAQ/product state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [faqClicked, setFaqClicked] = useState(null);
  const [selectedMainTopic, setSelectedMainTopic] = useState(null);
  const [selectedSubQuestion, setSelectedSubQuestion] = useState(null);
  
  const handleSubQuestionClick = (sub) => {
    // Show user's question and a "..." typing bubble from bot
    setMessages(msgs => [
      ...msgs,
      { from: "You", sender: session?.user?.id || "user", text: sub.q, createdAt: new Date().toISOString() },
      { from: "Bot", sender: "bot", text: "...", createdAt: new Date().toISOString(), isTyping: true }
    ]);

    // After a short delay, replace the typing bubble with the real answer
    setTimeout(() => {
      setMessages(msgs => {
        // Remove the last message (typing bubble)
        const msgsWithoutTyping = msgs.slice(0, -1);
        // Add the real answer
        return [
          ...msgsWithoutTyping,
          { from: "Bot", sender: "bot", text: sub.a, createdAt: new Date().toISOString() }
        ];
      });
    }, 900); // 900ms typing effect
  };
  const handleFaqClick = (faq) => {
    // If it's a main topic with subQuestions, show them
    if (faq.subQuestions) {
      setSelectedMainTopic(faq);
      setSelectedSubQuestion(null);
      return;
    }
    // Otherwise, show answer as before
    setFaqClicked(faq.key);
    setMessages(msgs => [
      ...msgs,
      { from: "You", sender: session?.user?.id || "user", text: faq.q, createdAt: new Date().toISOString() },
      { from: "Bot", sender: "bot", text: typeof faq.a === 'function' ? faq.a(selectedProduct) : faq.a, faqKey: faq.key, createdAt: new Date().toISOString() }
    ]);
  };


  // --- End Nested FAQ Support ---

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showSupportOptions, setShowSupportOptions] = useState(false);
  const chatWindowRef = useRef(null);

  // Load chat history from DB (or localStorage fallback)
  useEffect(() => {
    async function loadHistory() {
      const localHistory = localStorage.getItem("chatbot_history");
      if (localHistory) {
        try {
          const parsed = JSON.parse(localHistory);
          if (Array.isArray(parsed)) setMessages(parsed);
        } catch { }
      } else {
        setMessages([
          {
            from: "Bot",
            sender: "bot",
            text: "Namaste & Welcome to Online AI Support!\nWe're glad you're here.Whether you're looking for a peaceful getaway, a yoga retreat, or simply have questions about our stay options. I’m here to help you!\n Let’s begin your journey to relaxation and rejuvenation.",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    }
    loadHistory();
  }, [session?.user?.id]);


  const handleResetChat = () => {
    setMessages([
      {
        from: "Bot",
        sender: "bot",
        text: "Namaste & Welcome to Online AI Support!\nWe're glad you're here.Whether you're looking for a peaceful getaway, a yoga retreat, or simply have questions about our stay options. I’m here to help you!\n Let’s begin your journey to relaxation and rejuvenation.",
        createdAt: new Date().toISOString(),
      },
    ]);
    setStep(0);
    setInput("");
    setContact({ name: "", phone: "", email: "" });
    setProduct("");
    setError("");
    localStorage.removeItem("chatbot_history");
  };

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;

    if (messages.length === 0) {
      const timer = setTimeout(() => {
        setMessages([
          {
            from: "Bot",
            sender: "bot",
            text: "Namaste & Welcome to Online AI Support!\nWe're glad you're here.Whether you're looking for a peaceful getaway, a yoga retreat, or simply have questions about our stay options. I’m here to help you!\n Let’s begin your journey to relaxation and rejuvenation.",
            createdAt: new Date().toISOString()
          }
        ]);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [open]);


  const handleSmallTalk = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(msgs => [
      ...msgs,
      { from: "You", sender: session?.user?.id || "user", text: input, createdAt: new Date().toISOString() },
      {
        from: "Bot",
        sender: "bot",
        text: `May I know your name and contact number?\n\n📧 Your Email Address:\n📞 Your Phone Number (optional):`,
        createdAt: new Date().toISOString()
      }
    ]);
    setInput("");
    setStep(2);
  };


  const handleContact = (e) => {
    e.preventDefault();
    if (!contact.name.trim() || !contact.email.trim()) {
      setError("Please enter your name and email.");
      return;
    }

    setMessages(msgs => [
      ...msgs,
      {
        from: "You",
        sender: session?.user?.id || "user",
        text: `Name: ${contact.name}\nEmail: ${contact.email}${contact.phone ? `\nPhone: ${contact.phone}` : ""}`,
        createdAt: new Date().toISOString()
      },
      {
        from: "Bot",
        sender: "bot",
        text: `Thank you! 😊\n\nHow can I help you today?\n\nPlease choose one of the options below 👇`,
        createdAt: new Date().toISOString()
      }
    ]);
    setContact({ name: "", phone: "", email: "" });
    setError("");
    setStep(3);
  };
  const handleTalkToSupportClick = () => {
    setShowSupportOptions(true);
  };
  // Close chat without resetting messages
  const handleClose = () => {
    setOpen(false);
    setInput("");
    setError("");
  };

  const handleBubbleClick = () => {
    setOpen(true);
    // Only show greeting if there is no chat history
    if (!messages || messages.length === 0) {
      setMessages([
        {
          from: "Bot",
          sender: "bot",
          text: "Namaste & Welcome to Online AI Support!\nWe're glad you're here.Whether you're looking for a peaceful getaway, a yoga retreat, or simply have questions about our stay options. I’m here to help you!\n Let’s begin your journey to relaxation and rejuvenation.",
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  const handleMainMenu = (qna) => {
    if (qna.q === "🧑‍💬 Talk to Support") {
      setShowSupportOptions(true);
      setStep(3);
      setMessages(msgs => [
        ...msgs,
        { from: "You", sender: session?.user?.id || "user", text: qna.q, createdAt: new Date().toISOString() },
        { from: "Bot", sender: "bot", text: qna.a, createdAt: new Date().toISOString() }
      ]);
      return;
    }
    setMessages((msgs) => [
      ...msgs,
      { from: "You", sender: session?.user?.id || "user", text: qna.q, createdAt: new Date().toISOString() },
      { from: "Bot", sender: "bot", text: qna.a + "\n\nFor more help, contact us at support@rishikeshhandmade.com or call +91 9927677716.", createdAt: new Date().toISOString() },
    ]);
  };

  const handleChatWithAdmin = async () => {
    localStorage.setItem("chat_with_admin", "true");
    localStorage.setItem("chatbot_history", JSON.stringify(messages));
    // Persist bot history to backend
    if (session?.user?.id && messages.length > 0) {
      await fetch('/api/mergeBotHistory', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, botMessages: messages }),
      });
    }
    if (!isLoggedIn(session)) {
      setLoginPrompt(true);
      return;
    }
    window.location.href = "/dashboard?section=chatbot";
  };

  const handleInputSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!isLoggedIn(session)) {
      setLoginPrompt(true);
      return;
    }
    setMessages((msgs) => [...msgs, { from: "You", sender: session?.user?.id || "user", text: input, createdAt: new Date().toISOString() }]);
    setLoading(true);
    setInput("");
    try {
      // Send to /api/chat/user-query for admin
      await fetch("/api/chat/user-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          userId: session?.user?.id,
          userName: session?.user?.name || session?.user?.email,
          userEmail: session?.user?.email,
        }),
      });
      setCustomSent(true);
      setShowCustomInput(false);
      setMessages((msgs) => [
        ...msgs,
        { from: "Bot", sender: "bot", text: "Your question has been sent to our team. We'll get back to you soon!", createdAt: new Date().toISOString() },
      ]);
    } catch (e) {
      setMessages((msgs) => [...msgs, { from: "Bot", sender: "bot", text: "Sorry, something went wrong.", createdAt: new Date().toISOString() }]);
    }
    setLoading(false);
    setTimeout(scrollToBottom, 200);
  };
  const handleBackToChat = () => {
    setSelectedProduct(null);
    setFaqClicked(null);
    setStep(3); // This should be the step that shows your main quick-topic buttons
  };
  const isProductNotFound = step === "faq" && messages[messages.length - 1]?.text === "Sorry, product not found."

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, open]);
  return (
    <>
      {/* Floating chat bubble */}
      {!open && (
        <button
          className="fixed bottom-6 right-4 z-100 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center transition-all duration-300"
          aria-label="Open chat"
          onClick={handleBubbleClick}
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}
      {/* Chat window */}
      {open && (
        <div
          className={`fixed bottom-1 md:right-[4%] right-[7%] z-50 w-[330px] max-w-[95vw] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 animate-fadeIn
          ${
            // Shrink to content only for support mode or product not found
            showSupportOptions || isProductNotFound || step === 0 || step === 1 || step === 2 || step === "product-info"
              ? 'max-h-[30rem]'
              : 'h-screen'
            }
        `}
        >

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-blue-600 rounded-t-xl">
            <span className="text-white font-semibold">Chat with us</span>
            <button onClick={handleClose} className="text-white hover:text-gray-200"><X className="w-5 h-5" /></button>
          </div>
          {/* Chat body */}
          <div ref={chatWindowRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-blue-50" style={{ maxHeight: 420 }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"} my-1`}
              >
                <div
                  className={`
        px-4 py-2 rounded-2xl text-sm shadow-sm max-w-[80%] whitespace-pre-wrap
        ${msg.sender === "bot"
                      ? "bg-white text-gray-900 border border-gray-200"
                      : "bg-blue-600 text-white border border-blue-600"
                    }
      `}
                >
                  {msg.isTyping ? (
                    <span className="inline-block italic animate-pulse">...</span>
                  ) : (
                    <>
                      {msg.faqKey === 'url' ? (
                        <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                      ) : (
                        msg.text
                      )}
                      <div className="flex text-xs mt-1 gap-1 justify-end">
                        <span className={msg.sender === "bot" ? "text-gray-400" : "text-white/70"}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-end">
                <div className="px-4 py-2 rounded-2xl text-sm bg-blue-100 text-blue-600 animate-pulse">...
                </div>
              </div>
            )}
          </div>
          {/* Guided chat flow input area */}
          <div className="px-4 py-3 border-t border-gray-100 bg-white rounded-b-xl">
            {/* Step 0: Small talk */}
            {step === 0 && (
              <form onSubmit={handleSmallTalk} className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-500 bg-gray-50"
                  placeholder="Say hi or ask anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 flex items-center justify-center disabled:opacity-60"
                  disabled={!input.trim()}
                  aria-label="Send"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
            {/* Step 2: Contact info */}
            {step === 2 && (
              <form onSubmit={handleContact} className="flex flex-col gap-2">
                <input
                  type="text"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-500 bg-gray-50"
                  placeholder="Your Name (required)"
                  value={contact.name}
                  onChange={e => setContact({ ...contact, name: e.target.value })}
                  autoFocus
                />
                <input
                  type="email"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-500 bg-gray-50"
                  placeholder="Your Email (required)"
                  value={contact.email}
                  onChange={e => setContact({ ...contact, email: e.target.value })}
                />
                <input
                  type="tel"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-500 bg-gray-50"
                  placeholder="Your Phone (optional)"
                  value={contact.phone}
                  onChange={e => setContact({ ...contact, phone: e.target.value })}
                />
                {error && <div className="text-red-500 text-xs">{error}</div>}
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 font-semibold mt-1"
                >
                  Continue
                </button>
              </form>
            )}
            {/* Step 3: Product info */}
            {step === 3 && (
              showSupportOptions ? (
                <div className="flex flex-col gap-2 mt-2">
                  {!session?.user?.id ? (
                    <>
                      <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                        onClick={() => window.location.href = "/sign-in"}
                      >
                        🔐 Login
                      </button>
                      <button
                        className="w-full bg-gray-100 hover:bg-gray-200 text-blue-700 py-2 rounded-lg font-semibold border transition"
                        onClick={() => window.location.href = "/sign-up"}
                      >
                        📝 Signup
                      </button>
                    </>
                  ) : (
                    <button
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                      onClick={handleChatWithAdmin}
                    >
                      🧑‍💬 Chat with Admin
                    </button>
                  )}
                  <button
                    className="w-full text-center px-4 py-2 rounded-lg border transition-colors duration-150 font-medium shadow-sm text-sm transition whitespace-nowrap"
                    onClick={() => setShowSupportOptions(false)}
                  >
                    👈 Back to Chat
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mb-1">
                  {!selectedMainTopic && (
                    <div className="flex flex-col gap-2 mb-1">
                      {productQnA.map((faq, idx) => (
                        <button
                          key={faq.q}
                          className="flex-1 text-left px-4 py-1 rounded-lg border transition-colors duration-150 font-medium transition"
                          onClick={() => {
                            if (faq.q === "Talk to Support") {
                              handleTalkToSupportClick();
                            } else {
                              handleFaqClick(faq);
                            }
                          }}>
                          {faq.q}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedMainTopic && selectedMainTopic.subQuestions && !selectedSubQuestion && (
                    <div className="flex flex-col gap-2 mb-1">
                      <div
                        className="flex flex-col gap-2 overflow-y-auto"
                        style={{ maxHeight: "250px", minHeight: "200px" }} // adjust as needed
                      >
                        {selectedMainTopic.subQuestions.map((sub, idx) => (
                          <button
                            key={sub.q}
                            className="flex-1 text-left px-4 py-1 rounded-lg border transition-colors duration-150 font-medium transition"
                            onClick={() => handleSubQuestionClick(sub)}
                          >
                            {sub.q}
                          </button>
                        ))}
                      </div>
                      <button
                        className="w-full text-center px-4 py-2 rounded-lg border transition-colors duration-150 font-medium shadow-sm text-sm transition whitespace-nowrap"
                        onClick={() => setSelectedMainTopic(null)}
                      >
                        👈 Back
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
            {/* Step 4: Main menu */}
            {step === 4 && !selectedProduct && (
              <>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {productQnA.map((qna) => (
                    <button
                      key={qna.q}
                      className="flex-1 text-left px-4 py-1 rounded-lg border transition-colors duration-150 font-medium transition"
                      onClick={() => handleMainMenu(qna)}
                      disabled={loading}
                    >
                      {qna.q}
                    </button>
                  ))}
                </div>
                {!(step === "faq" && selectedProduct) && (
                  <>
                    <button
                      className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                      onClick={() => setStep(0)}
                      disabled={loading}
                    >
                      New Question
                    </button>
                    <button
                      className="w-full mt-2 text-sm text-red-600 hover:underline"
                      onClick={handleResetChat}
                    >
                      🔄 Reset Chat
                    </button>
                  </>
                )}
              </>
            )}
            {loginPrompt && (
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm text-gray-700 mb-2">Please log in or sign up to ask a custom question.</span>
                <div className="flex gap-2 w-full">
                </div>
              </div>
            )}
            {showCustomInput && !loginPrompt && (
              <form onSubmit={handleInputSend} className="flex gap-2 mt-1">
                <input
                  type="text"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-500 bg-gray-50"
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 flex items-center justify-center disabled:opacity-60"
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
            
          </div>
        </div>
      )}
    </>
  );
}