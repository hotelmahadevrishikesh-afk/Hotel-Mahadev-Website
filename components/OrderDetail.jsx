"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, Calendar, Users, MapPin, Phone, Mail, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Home, Bed, User, Hash, CalendarDays, CalendarCheck, Users as UsersIcon, MapPin as MapPinIcon, PhoneCall, Mail as MailIcon, FileText, IndianRupee } from "lucide-react";

const statusStyles = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
  confirmed: { bg: "bg-green-100", text: "text-green-800", label: "Confirmed" },
  cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
  completed: { bg: "bg-blue-100", text: "text-blue-800", label: "Completed" },
  delayed: { bg: "bg-orange-100", text: "text-orange-800", label: "Delayed" },
};

const tabs = [
  { key: "details", label: "Booking Details", icon: Calendar },
  { key: "guest", label: "Guest Information", icon: Users },
  { key: "payment", label: "Payment", icon: CreditCard },
];

function formatDateTime(dt) {
  if (!dt) return 'N/A';
  const d = new Date(dt);
  return d.toLocaleDateString("en-GB", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric"
  });
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

const OrderDetail = ({ order, onBack }) => {
  const router = useRouter();
  // console.log(order)
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">The requested booking could not be found or you don't have permission to view it.</p>
          <Button 
            onClick={() => router.push('/dashboard/bookings')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("details");
  const [showCancelRequest, setShowCancelRequest] = useState(false);
  
  // Process booking data
  const isPackage = order.type === 'packages';
  const bookingData = {
    ...order,
    checkIn: order.arrival ? new Date(order.arrival) : null,
    checkOut: order.arrival,
    totalGuests: (order.adult || 0) + (order.child || 0) + (order.infant || 0),
    status: order.status?.toLowerCase() || 'pending',
    isPackage,
    // For packages, use packageName; for rooms, use roomName
    displayName: isPackage ? order.packageName : order.roomName,
    // For packages, use packagesPrices; for rooms, use price
    priceData: isPackage ? order.packagesPrices : order.price,
    // Calculate package price based on number of people
    calculatedPrice: isPackage ? 
      (order.packagesPrices?.onePerson?.[0]?.inr || 0) * (order.adult || 1) :
      (order.price?.finalAmount || 0)
  };

  const status = statusStyles[bookingData.status] || statusStyles.pending;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header with back button */}
      <div className="mb-6">
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-md font-medium"
        >
          ← Back to Order Details
        </button>
      )}
      </div>

      {/* Booking header */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Booking #{bookingData.bookingId || 'N/A'}
                </h1>
                <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Booked on {formatDateTime(bookingData.createdAt)}
                {bookingData.invoiceNumber && ` • Invoice #${bookingData.invoiceNumber}`}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* Booking Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Bed className="h-5 w-5 text-gray-500 mr-2" />
                  {bookingData.isPackage ? 'Package Information' : 'Room Information'}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900">{bookingData.displayName || (bookingData.isPackage ? 'Package' : 'Deluxe Room')}</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {bookingData.isPackage 
                          ? 'All-inclusive package with selected activities' 
                          : bookingData.roomId?.description || 'Comfortable room with modern amenities'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Check-in</p>
                        <p className="mt-1 text-sm font-medium">
                          {bookingData.checkIn ? formatDateTime(bookingData.checkIn) : 'N/A'}
                        </p>
                      </div>
                      {/* Only show checkout for non-package bookings */}
                      {!bookingData.isPackage && bookingData.checkOut && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Check-out</p>
                          <p className="mt-1 text-sm font-medium">
                            {formatDateTime(bookingData.checkOut)}
                          </p>
                        </div>
                      )}
                      {/* Show package ID image for package bookings */}
                      {bookingData.isPackage && bookingData.packageIdImage && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Package ID</p>
                          <div className="mt-1">
                            <img 
                              src={bookingData.packageIdImage?.url} 
                              alt="Package ID" 
                              className="h-20 w-auto object-contain rounded border border-gray-200"
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {bookingData.isPackage ? 'Duration' : 'Nights'}
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {bookingData.days || 1} {bookingData.isPackage ? 'Days' : (bookingData.days === 1 ? 'Night' : 'Nights')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Guests</p>
                        <p className="mt-1 text-sm font-medium">
                          {bookingData.totalGuests || 1} {bookingData.totalGuests === 1 ? 'Guest' : 'Guests'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {bookingData.adult || 1} Adult{bookingData.adult !== 1 ? 's' : ''}
                          {bookingData.child ? `, ${bookingData.child} Child${bookingData.child !== 1 ? 'ren' : ''}` : ''} {bookingData.infant ? `, ${bookingData.infant} Infant${bookingData.infant !== 1 ? '' : ''}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {bookingData.specialReq && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Special Requests</h3>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">{bookingData.specialReq}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Offers */}
              {bookingData.offers && bookingData.offers.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selected Offers</h3>
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <ul className="list-disc pl-5 space-y-1">
                      {bookingData.offers.map((offer, index) => (
                        <li key={index} className="text-sm text-green-700">
                          {typeof offer === 'object' ? offer.name || 'Special Offer' : offer}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guest Information Tab */}
          {activeTab === 'guest' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-2" />
                  Primary Guest
                </h3>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {bookingData.firstName} {bookingData.lastName}
                        </p>
                      </div>
                      <div className="sm:col-span-3">
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="mt-1 text-sm text-gray-900 flex items-center">
                          <MailIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {bookingData.email}
                        </p>
                      </div>
                      <div className="sm:col-span-3">
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="mt-1 text-sm text-gray-900 flex items-center">
                          <PhoneCall className="h-4 w-4 mr-2 text-gray-400" />
                          {bookingData.callNo}
                        </p>
                      </div>
                      <div className="sm:col-span-3">
                        <p className="text-sm font-medium text-gray-500">Alternate Phone</p>
                        <p className="mt-1 text-sm text-gray-900 flex items-center">
                          <PhoneCall className="h-4 w-4 mr-2 text-gray-400" />
                          {bookingData.altCallNo || 'N/A'}
                        </p>
                      </div>
                      <div className="sm:col-span-6">
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="mt-1 text-sm text-gray-900 flex items-start">
                          <MapPinIcon className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-gray-400" />
                          {bookingData.address ? (
                            <span>{bookingData.address}, {bookingData.city}, {bookingData.state}, {bookingData.postalCode}, {bookingData.country}</span>
                          ) : (
                            <span>N/A</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                  Payment Details
                </h3>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Booking ID</p>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{bookingData.bookingId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Invoice Number</p>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{bookingData.invoiceNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Booking Date</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {bookingData.createdAt ? formatDateTime(bookingData.createdAt) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Payment Status</p>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bookingData.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {bookingData.status === 'confirmed' ? 'Paid' : 'Pending'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Payment Information Section */}
                    {bookingData.payment && (
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="text-md font-medium text-gray-900 mb-4">Payment Information</h4>
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Amount</p>
                            <p className="mt-1 text-sm text-gray-900">
                              ₹{bookingData.payment.amount?.toLocaleString('en-IN')} {bookingData.payment.originalCurrency}
                            </p>
                          </div>
                          {bookingData.payment.amountInINR && bookingData.payment.originalCurrency !== 'INR' && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Amount in INR</p>
                              <p className="mt-1 text-sm text-gray-900">
                                ₹{bookingData.payment.amountInINR?.toLocaleString('en-IN')}
                              </p>
                            </div>
                          )}
                          {bookingData.payment.exchangeRate && bookingData.payment.exchangeRate !== 1 && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Exchange Rate</p>
                              <p className="mt-1 text-sm text-gray-900">
                                1 {bookingData.payment.originalCurrency} = {bookingData.payment.exchangeRate} INR
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-500">Payment Method</p>
                            <p className="mt-1 text-sm text-gray-900 capitalize">
                              {bookingData.payment.method || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Paid On</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {bookingData.payment.paidAt ? new Date(bookingData.payment.paidAt).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-sm font-medium text-gray-500">Razorpay Order ID</p>
                            <p className="mt-1 text-sm text-gray-900 font-mono">
                              {bookingData.payment.razorpayOrderId || 'N/A'}
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-sm font-medium text-gray-500">Razorpay Payment ID</p>
                            <p className="mt-1 text-sm text-gray-900 font-mono">
                              {bookingData.payment.razorpayPaymentId || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile action buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 flex justify-between sm:hidden">
        <Button variant="outline" size="sm" className="flex-1 mr-2">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        {bookingData.status === 'pending' ? (
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex-1 ml-2"
            onClick={() => setShowCancelRequest(true)}
          >
            Cancel Booking
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="flex-1 ml-2">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;