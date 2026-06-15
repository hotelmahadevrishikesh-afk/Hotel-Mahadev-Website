// app/api/room/[slug]/route.js
import Room from "@/models/Room"; // adjust as needed
import RoomReview from '@/models/RoomReview';
import RoomAmenities from '@/models/RoomAmenities';
import RoomPrice from '@/models/RoomPrice';
export async function GET(req, { params }) {
    const { slug } = await params;
    const room = await Room.findOne({ slug })
    .populate('reviews')
    .populate('amenities')
    .populate('prices')
    if (!room) {
        return new Response(JSON.stringify({ error: "Room not found" }), { status: 404 });
    }
    return new Response(JSON.stringify(room), { status: 200 });
}