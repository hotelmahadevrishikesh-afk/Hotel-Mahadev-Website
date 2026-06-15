import { NextResponse } from 'next/server';
import connectDB from "@/lib/connectDB";
import BookingDetails from '@/models/BookingDetails';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";

// Ensure mongoose connection (adjust as needed for your setup)

export async function GET(req) {
  await connectDB();
  const session = await getServerSession();
  const { searchParams } = new URL(req.url);
  const userIdFromQuery = searchParams.get('userId');
  // console.log('SESSION:', session);
  if (!userIdFromQuery && (!session || !session.user || (!session.user.email && !session.user.id))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Build the base query
    let query = {};
    
    // Add user filter (either by userId or email)
    if (userIdFromQuery) {
      query.userId = userIdFromQuery;
    } else if (session?.user?.id) {
      query.userId = session.user.id;
    } else if (session?.user?.email) {
      query.email = session.user.email;
    }
    
    // If type is specified in query, filter by it, otherwise get all types
    const type = searchParams.get('type');
    if (type) {
      query.type = type;
    }
    
    // Fetch bookings with the constructed query
    const bookings = await BookingDetails.find(query).sort({ createdAt: -1 });
    // console.log('BOOKINGS FOUND:', bookings.length);
    return NextResponse.json({ bookings, success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    // console.log('Received booking data:', JSON.stringify(body, null, 2));
    
    if (body.type === 'room' || body.type === 'packages') {
      const booking = new BookingDetails({ ...body });
      await booking.save();
      
      // Add booking._id to the user's bookings array
      if (booking.userId) {
        await User.findByIdAndUpdate(
          booking.userId,
          { $addToSet: { bookings: booking._id } },
          { new: true, upsert: true }
        );
      }
      return NextResponse.json({ success: true, booking });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Unsupported booking type' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error saving booking:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to save booking' 
    }, { status: 500 });
  }
}
