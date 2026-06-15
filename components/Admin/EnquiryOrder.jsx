"use client";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  Bell,
  UserCircle,
  Edit,
  Trash2,
  Eye,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Settings,
  Store,
  X
} from "lucide-react";



function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}


const orderStatusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const paymentStatusColors = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Failed: "bg-red-100 text-red-700"
};
const orderStatusColors = {
  Pending: "bg-gray-200 text-gray-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700"
};

const sidebarLinks = [
  { name: "Dashboard", icon: <LayoutDashboard size={20} />, url: "#" },
  { name: "Products", icon: <Store size={20} />, url: "#" },
  { name: "Orders", icon: <ShoppingCart size={20} />, url: "#" },
  { name: "Customers", icon: <Users size={20} />, url: "#" },
  { name: "Settings", icon: <Settings size={20} />, url: "#" },
];

// function classNames(...classes) {
//   return classes.filter(Boolean).join(" ");
// }

const EnquiryOrder = () => {

  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState(null); // For modal
  const rowsPerPage = 8;
  // console.log(orders)
  // Filtering logic
  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = search ? (
      (order.bookingId && order.bookingId.toLowerCase().includes(search.toLowerCase())) ||
      (order.firstName && order.firstName.toLowerCase().includes(search.toLowerCase()))
    ) : true;
    // Date filter
    const matchesDate = dateFilter ? (() => {
      if (!order.departure) return false;
      const orderDate = new Date(order.departure);
      // Format to yyyy-mm-dd
      const orderDateStr = orderDate.toISOString().slice(0, 10);
      return orderDateStr === dateFilter;
    })() : true;
    return matchesSearch && matchesDate;
  });
  const paginatedOrders = filteredOrders.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  useEffect(() => {
    async function fetchOrders() {
      try {
        let res = await fetch("/api/bookingDetails/admin?type=room");
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          setOrders(data.bookings);
        } else {
          setOrders([]);
        }
      } catch (err) {
        setOrders([]);
      }
    }
    fetchOrders();
  }, []);
  // Helper for date formatting
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB');
  };
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search orders, customers, products..."
                className="w-full pl-10 pr-4 py-2 rounded bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
          </div>
            <div className="flex gap-2 items-center">
              <label className="font-medium text-gray-600">Date:</label>
              <input
                type="date"
                className="px-3 py-2 border rounded bg-gray-100 focus:outline-none"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              />
            </div>
        </header>

        {/* Table */}
        <div className="flex-1 overflow-x-auto p-4">
          <table className="min-w-full bg-white rounded-lg shadow overflow-hidden text-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">S.No</th>
                <th className="p-3 text-left">Order No</th>
                <th className="p-3 text-left">Customer Name</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-center">View</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-400">No orders found.</td>
                </tr>
              )}
              {paginatedOrders.map((order, idx) => (
                <tr key={order._id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-3 font-mono text-blue-700">{idx + 1}</td>
                  <td className="p-3 ">{order.bookingId}</td>
                  <td className="p-3">{`${order.firstName || ''} ${order.lastName || ''}`.trim() || order.email || order.phone}</td>
                  <td className="p-3">{formatDate(order.arrival)}</td>
                  <td className="p-3 text-center">
                    <button className="p-2 rounded hover:bg-blue-100" title="View" onClick={() => setViewOrder(order)}><Eye className="text-blue-600" size={20} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center px-4 pb-4">
          <span className="text-md text-gray-600">
            Showing {(page - 1) * rowsPerPage + 1} - {Math.min(page * rowsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
          </span>
          <div className="flex gap-1">
            <button
              className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >Prev</button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={classNames(
                  "px-3 py-1 rounded border",
                  page === i + 1 ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-white"
                )}
                onClick={() => setPage(i + 1)}
              >{i + 1}</button>
            ))}
            <button
              className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >Next</button>
          </div>
        </div>
      </div>

      {/* Modal for viewing order details */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative overflow-y-auto max-h-[90vh] animate-fade-in">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setViewOrder(null)}
              title="Close"
            >
              <X className="text-blue-600" size={18} />
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold mb-1 text-[#7a5b2b] text-center">Room Booking Details</h2>
            <p className="text-sm text-center text-gray-600 mb-5">Booking overview and invoice breakdown</p>

            {/* Booking Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-md mb-4">
              <div><span className="font-bold text-black">Booking ID:</span> <span className="font-mono">{viewOrder.bookingId}</span></div>
              <div><span className="font-bold text-black">Status:</span> <span className={`capitalize font-semibold ${viewOrder.status === 'confirmed' ? 'text-green-600' : 'text-blue-700'}`}>{viewOrder.status}</span></div>
              <div><span className="font-bold text-black">Name:</span> {viewOrder.firstName} {viewOrder.lastName}</div>
              <div><span className="font-bold text-black">Email:</span> {viewOrder.email}</div>
              <div><span className="font-bold text-black">Phone:</span> {viewOrder.callNo}</div>
              <div><span className="font-bold text-black">Alt Call No:</span> {viewOrder.altCallNo}</div>
              <div><span className="font-bold text-black">Address:</span> <span className="text-gray-700">{viewOrder.address}</span></div>
            </div>

            {/* Room Info */}
            <div className="border-t border-b py-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-md">
                <div><span className="font-bold text-black">Room Name:</span> {viewOrder.roomName}</div>
                <div><span className="font-bold text-black">Arrival:</span> {formatDate(viewOrder.arrival)}</div>
                <div><span className="font-bold text-black">No of Rooms:</span> {formatDate(viewOrder.roomNo)}</div>
                <div><span className="font-bold text-black">Days:</span> {viewOrder.days}</div>
                <div><span className="font-bold text-black">Persons:</span> {viewOrder.adult} Adult{viewOrder.child ? `, ${viewOrder.child} Child` : ''}{viewOrder.infant ? `, ${viewOrder.infant} Infant` : ''}</div>
              </div>
            </div>

            {/* Payment Info */}
            {viewOrder.payment && (
              <div className="border-t border-b py-4 mb-4">
                <h3 className="font-bold text-lg text-black mb-3">Payment Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-md">
                  <div><span className="font-bold text-black">Amount:</span> ₹{viewOrder.payment.amount?.toLocaleString('en-IN')}</div>
                  <div><span className="font-bold text-black">Currency:</span> {viewOrder.payment.originalCurrency || 'INR'}</div>
                  <div><span className="font-bold text-black">Payment ID:</span> {viewOrder.payment.razorpayPaymentId || 'N/A'}</div>
                  <div><span className="font-bold text-black">Order ID:</span> {viewOrder.payment.razorpayOrderId || 'N/A'}</div>
                  <div><span className="font-bold text-black">Paid At:</span> {new Date(viewOrder.payment.paidAt).toLocaleString()}</div>
                  <div><span className="font-bold text-black">Method:</span> {viewOrder.payment.method || 'Razorpay'}</div>
                </div>
              </div>
            )}

            {/* Extra Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="font-bold text-lg text-black mb-3">Additional Information</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="font-semibold text-gray-700 min-w-[120px]">Offers:</span>
                  <div className="flex-1">
                    {Array.isArray(viewOrder.offers) && viewOrder.offers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {viewOrder.offers.map((offer, index) => (
                          <span key={index} className="bg-amber-50 text-amber-800 text-sm px-3 py-1 rounded-full border border-amber-100">
                            {offer}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-gray-700 min-w-[120px]">Special Requests:</span>
                  <div className="flex-1 bg-gray-50 p-3 rounded-md border border-gray-100">
                    {viewOrder.specialReq ? (
                      <p className="text-gray-700">{viewOrder.specialReq}</p>
                    ) : (
                      <span className="text-gray-500">No special requests</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-md p-4 text-md">
              <div className="text-base font-semibold mb-2 text-black">Price Breakdown</div>
              <div className="flex justify-between py-1 font-bold text-black"><span>Room Price</span> <span>₹{viewOrder.priceBreakdown?.main?.amount || 0}</span></div>
              {viewOrder.priceBreakdown?.extraBed?.amount > 0 && (
                <div className="flex justify-between py-1 font-bold text-black"><span>Extra Bed</span> <span>₹{viewOrder.priceBreakdown.extraBed.amount}</span></div>
              )}
              <div className="flex justify-between py-1 border-t mt-2 pt-2 font-bold text-black"><span>Total</span> <span>₹{viewOrder.subtotal || 0}</span></div>
             
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EnquiryOrder;