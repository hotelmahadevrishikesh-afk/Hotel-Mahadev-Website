// API Route for fetching, updating, and deleting a product by ID
import connectDB from "@/lib/connectDB";
import Room from '@/models/Room';
import RoomAmenities from '@/models/RoomAmenities';
import RoomPrice from '@/models/RoomPrice';
import RoomReview from '@/models/RoomReview';

export async function GET(req, { params }) {
    const { id } = await params;
    if (!id) {
        return new Response(JSON.stringify({ error: "Room ID is required" }), { status: 400 });
    }
    try {
        const room = await Room.findById(id).populate('amenities');
        if (!room) {
            return new Response(JSON.stringify({ error: "Room not found" }), { status: 404 });
        }
        return new Response(JSON.stringify(room), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
export async function PUT(req, { params }) {
    const { id } = params;
    if (!id) {
        return new Response(JSON.stringify({ error: "Room ID is required" }), { status: 400 });
    }
    try {
        const body = await req.json();
        const updated = await Room.findByIdAndUpdate(id, body, { new: true });
        if (!updated) {
            return new Response(JSON.stringify({ error: "Room not found" }), { status: 404 });
        }
        return new Response(JSON.stringify(updated), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { id } = params;
    if (!id) {
        return new Response(JSON.stringify({ error: "Room ID is required" }), { status: 400 });
    }
    try {
        const deleted = await Room.findByIdAndDelete(id);
        if (!deleted) {
            return new Response(JSON.stringify({ error: "Room not found" }), { status: 404 });
        }
        return new Response(JSON.stringify({ message: "Room deleted successfully" }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}