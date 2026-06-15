import OrderDetail from '@/components/OrderDetail';
import { Suspense } from 'react';
import Loading from '@/components/Loading';

export default async function OrderDetailPage({ params }) {
  const { orderId } = params;
  
  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2">Booking ID is missing</p>
        </div>
      </div>
    );
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/bookingDetails/${orderId}`, {
      cache: 'no-store',
      next: { tags: [`booking-${orderId}`] },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch booking details');
    }

    const data = await res.json();
    const order = data?.order;

    if (!order) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Booking Not Found</h2>
            <p className="mt-2">The requested booking could not be found.</p>
          </div>
        </div>
      );
    }

    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
      }>
        <OrderDetail order={order} />
      </Suspense>
    );
  } catch (error) {
    // console.error('Error fetching booking:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2">
            {error.message || 'An error occurred while fetching booking details'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}