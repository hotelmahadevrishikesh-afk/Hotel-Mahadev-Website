"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Menu, X, ChevronLeft, ChevronRight, ChevronLast } from "lucide-react";

import Profile from "./Profile";
import OrderConfirm from "./OrderConfirm";
import OrderDetail from "./OrderDetail";
import AllOrders from "./AllOrders";
import Chat from "./Chat";

const sections = [
  { key: "orders", label: "Booking" },
  { key: "chatbot", label: "Chat Bot" },
];
const settings = [
  { key: "profile", label: "Profile" },
];

import ChatOrder from "./ChatOrder";
function SectionContent({ section, orderId, onViewOrder, onBackHome, showOrderDetail, selectedOrder, orderChatMode, onChatOrder,onBack }) {
  const { data: session } = useSession()
  const userId = session?.user?.id || session?.user?._id;
  if (section === "profile") return <Profile />;
  if (section === "orders" && selectedOrder && orderChatMode) return <ChatOrder order={selectedOrder} onBack={onBack} onViewOrder={onViewOrder} />;
  if (section === "orders" && selectedOrder) return <OrderDetail order={selectedOrder} onBack={onBack} />;
  if (section === "chatbot") {
    // Pass userId from session to Chat
    // console.log("Rendering Chat with userId:", userId);
    return <Chat userId={userId} />;
  }
  if (section === "orders") return <AllOrders userId={userId} onViewOrder={onViewOrder} onChatOrder={onChatOrder} />;
  if (section === "dashboard" && orderId && !showOrderDetail) {
    return <OrderConfirm orderId={orderId} onViewOrder={onViewOrder} onBackHome={onBackHome} />;
  }
  if (section === "dashboard" && orderId && showOrderDetail) {
    return <OrderDetail orderId={orderId} />;
  }
  if (section === "dashboard") {
    return (
      <div className="p-8 flex items-center justify-center flex-col">
        <h1 className="text-3xl font-bold mb-3">Welcome and Thank You for Choosing Us!</h1>
        <div className="p-6 mb-6 max-w-2xl">
          <p className="text-lg mb-2">Dear <span className="font-semibold text-blue-900">{session?.user?.name || "User"}</span>,</p>
          <p className="mb-4">We’re delighted to welcome you on board!</p>
          <p className="mb-4">Thank you for choosing our platform. We’re thrilled to have you with us and are committed to making your experience smooth, secure, and user-friendly. Your dashboard is now ready and designed to give you quick, easy access to everything you need — all in one place.</p>
          <p className="mb-4">Whether you’re here to explore, manage your services, or simply stay connected, we’ve built this space with your convenience in mind. If you ever need assistance, our team is always here to help.</p>
          <p className="mb-4">We look forward to serving you and being a part of your journey.</p>
          <p className="mt-6 font-semibold">Warm regards,<br/>Hotel Mahadev Rishikesh Team</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold capitalize">{section}</h1>
      <p className="mt-4 text-gray-600">This is the <b>{section}</b> section content.</p>
    </div>
  );
}

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [ordersCache, setOrdersCache] = useState([]); // Cache for orders
  const sidebarRef = useRef(null);

  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const pathParts = pathname.split("/");
  const sectionFromUrl = searchParams.get("section") || "dashboard";

  const [activeSection, setActiveSection] = useState(sectionFromUrl);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderChatMode, setOrderChatMode] = useState(false);

  const user = session?.user || {
    name: "User Name",
    email: "user@example.com",
    image: "/placeholder.jpeg",
  };

  // Sync state when section changes
  useEffect(() => {
    setActiveSection(sectionFromUrl);
  }, [sectionFromUrl]);

  // Sync chat order from URL
  useEffect(() => {
    const chatOrderId = searchParams.get("chatOrderId");
    if (activeSection === "orders" && chatOrderId) {
      // If already set, do nothing
      if (selectedOrder && selectedOrder._id === chatOrderId && orderChatMode) return;
      // Try to find in cache first
      let order = ordersCache.find(o => o._id === chatOrderId);
      if (order) {
        setSelectedOrder(order);
        setOrderChatMode(true);
      } else {
        // Fallback: fetch from API
        fetch(`/api/bookingDetails/${chatOrderId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.order) {
              setSelectedOrder(data.order);
              setOrderChatMode(true);
            }
          });
      }
    }
  }, [activeSection, searchParams, selectedOrder, orderChatMode, ordersCache]);

  // Cache orders from AllOrders
  const handleOrdersFetched = (orders) => {
    setOrdersCache(orders || []);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOrderChatMode(false);
    setShowOrderDetail(false);
    setActiveSection("orders");
    router.push("/dashboard?section=orders");
  };

  const handleChatOrder = (order) => {
    setSelectedOrder(order);
    setOrderChatMode(true);
    setActiveSection("orders");
    // Add chatOrderId to URL for persistence
    router.push(`/dashboard?section=orders&chatOrderId=${order._id}`);
  };
  const handleBackToOrders = () => {
    setOrderChatMode(false); // or whatever logic returns to the orders list
    setSelectedOrder(null);  // optionally clear the selected order
  };
  

  const handleBackHome = () => {
    setShowOrderDetail(false);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete("orderId");
    router.replace(`/dashboard${params.size ? "?" + params.toString() : ""}`);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (status === "loading") return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#fcf7f1] relative">
      {/* Mobile menu button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-[50%] left-1 z-50 p-2 bg-white rounded-lg shadow-md"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <ChevronLast size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`
          fixed md:static z-40 w-72 bg-white rounded-2xl shadow-lg m-2 transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'left-0' : '-left-80'} 
          md:left-0 md:translate-x-0
          ${isSidebarCollapsed ? 'md:w-20' : 'md:w-72'}
        `}
      >
        {/* Collapse/Expand button for desktop */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex items-center justify-center w-8 h-8 absolute -right-4 top-6 bg-white rounded-full shadow-md z-50"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <div className={`flex flex-col items-center py-4 md:py-8 border-b transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : 'px-6'}`}>
          <div className="w-16 h-16 md:w-20 md:h-20 mb-2 rounded-full border-4 border-white shadow-lg overflow-hidden">
            <Image 
              src={user.image||"/placeholder.jpeg"} 
              alt="avatar" 
              width={80} 
              height={80} 
              className="object-cover w-full h-full" 
            />
          </div>
          {!isSidebarCollapsed && (
            <>
              <div className="font-bold text-sm md:text-lg mt-2 text-center truncate w-full px-2">{user.name}</div>
              <div className="text-red-500 text-xs md:text-sm text-center truncate w-full px-2">{user.email}</div>
            </>
          )}
        </div>

        <nav className="mt-2 items-center justify-center overflow-y-auto max-h-[calc(100vh-220px)]">
          <div className={`px-4 py-2 text-sm md:text-base text-gray-500 bg-red-100 font-semibold ${isSidebarCollapsed ? 'text-center' : 'px-6'}`}>
            {isSidebarCollapsed ? '≡' : 'DASHBOARD'}
          </div>
          {sections.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`w-full text-left py-3 md:py-2 hover:bg-gray-50 rounded transition flex items-center ${
                activeSection === key ? "font-bold text-black bg-gray-100" : "text-gray-800"
              } ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6'}`}
              onClick={() => {
                setShowOrderDetail(false);
                setIsMobileMenuOpen(false);
                router.push(`/dashboard?section=${key}`);
              }}
              title={isSidebarCollapsed ? label : ''}
            >
              {isSidebarCollapsed ? (
                <span className="text-lg">{icon || label.charAt(0)}</span>
              ) : (
                <span className="truncate">{label}</span>
              )}
            </button>
          ))}

          <div className={`px-4 py-2 mt-4 text-sm md:text-base text-gray-500 bg-red-100 font-semibold ${isSidebarCollapsed ? 'text-center' : 'px-6'}`}>
            {isSidebarCollapsed ? '⚙️' : 'ACCOUNT SETTINGS'}
          </div>
          {settings.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`w-full text-left py-3 md:py-2 hover:bg-gray-50 rounded transition flex items-center ${
                activeSection === key ? "font-bold text-black bg-gray-100" : "text-gray-800"
              } ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6'}`}
              onClick={() => {
                setShowOrderDetail(false);
                setIsMobileMenuOpen(false);
                router.push(`/dashboard?section=${key}`);
              }}
              title={isSidebarCollapsed ? label : ''}
            >
              {isSidebarCollapsed ? (
                <span className="text-lg">{icon || label.charAt(0)}</span>
              ) : (
                <span className="truncate">{label}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 bg-[#fdf6ee] rounded-2xl shadow-lg md:m-2 p-2 md:p-6 lg:p-8 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:ml-24' : 'md:ml-0'
      } mt-16 md:mt-6`}>
        <SectionContent
          section={activeSection}
          orderId={orderId}
          onViewOrder={handleViewOrder}
          onBackHome={handleBackHome}
          showOrderDetail={showOrderDetail}
          selectedOrder={selectedOrder}
          orderChatMode={orderChatMode}
          onChatOrder={handleChatOrder}
          onOrdersFetched={handleOrdersFetched}
          onBack={handleBackToOrders}
        />
      </main>
    </div>
  );
};

export default Dashboard;
