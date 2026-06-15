import connectDB from "@/lib/connectDB";
import BookingDetails from "@/models/BookingDetails";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find booking by ID and populate related data
    const booking = await BookingDetails.findById(id)
      .populate('roomId', 'name description images')
      .lean();

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // Format the response
    const response = {
      _id: booking._id,
      bookingId: booking.bookingId,
      roomName: booking.roomName,
      roomId: booking.roomId,
      checkIn: booking.arrival,
      checkOut: new Date(new Date(booking.arrival).getTime() + (booking.days || 1) * 24 * 60 * 60 * 1000).toISOString(),
      days: booking.days,
      guests: {
        adults: booking.adult || 1,
        children: booking.child || 0,
        infants: booking.infant || 0,
      },
      guestInfo: {
        name: `${booking.firstName} ${booking.lastName}`,
        email: booking.email,
        phone: booking.callNo,
        altPhone: booking.altCallNo,
        address: booking.address,
        city: booking.city,
        state: booking.state,
        specialRequests: booking.specialReq
      },
      price: {
        roomRate: booking.priceBreakdown?.main?.amount || 0,
        extraBed: booking.priceBreakdown?.extraBed?.amount || 0,
        subtotal: booking.subtotal || 0,
        finalAmount: booking.finalAmount || 0
      },
      status: booking.status || 'pending',
      offers: booking.offers || [],
      invoiceNumber: booking.invoiceNumber,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };

    return NextResponse.json({ order: response });
    
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
