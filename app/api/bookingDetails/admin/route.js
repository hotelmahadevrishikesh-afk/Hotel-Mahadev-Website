import { NextResponse } from 'next/server';
import connectDB from "@/lib/connectDB";
import BookingDetails from '@/models/BookingDetails';

export async function GET(req) {
    await connectDB();
    try {
      let type = 'room';
      if (req?.url) {
        const { searchParams } = new URL(req.url);
        if (searchParams.get('type')) type = searchParams.get('type');
      }
      const bookings = await BookingDetails.find({ type }).sort({ createdAt: -1 });
      return NextResponse.json({ bookings, success: true }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }