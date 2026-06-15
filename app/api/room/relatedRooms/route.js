import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Room from '@/models/Room';
import RoomReview from '@/models/RoomReview';
import RoomAmenities from '@/models/RoomAmenities';
import RoomPrice from '@/models/RoomPrice';

export async function GET(req) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) {
        return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const currentRoom = await Room.findOne({ slug });
       
    if (!currentRoom) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Example: related rooms by category, not including current room
    const relatedRooms = await Room.find({
        _id: { $ne: currentRoom._id },
        category: currentRoom.category,
    })
    .populate('reviews')
    .populate('amenities')
    .populate('prices')
    .limit(4);

    return NextResponse.json({ relatedRooms });
}