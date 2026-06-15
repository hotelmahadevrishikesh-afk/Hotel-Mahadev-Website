// API Route for ProductProfile (Create Product)
import connectDB from "@/lib/connectDB";
import Room from "@/models/Room"
import RoomAmenities from '@/models/RoomAmenities';
import RoomPrice from '@/models/RoomPrice';
import RoomReview from '@/models/RoomReview';
import { deleteFileFromCloudinary } from '@/utils/cloudinary';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    // Accept all relevant fields
    const { title, code, slug, ...rest } = body;
    if (!title || !code || !slug) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    // Accept slug from slugname or slug, or generate from title
    let roomData = {
      title,
      code,
      slug,
      ...rest
    };
    // Create room with proper linkage
    const room = await Room.create(roomData);
    return new Response(JSON.stringify(room), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    // Always return all rooms as { rooms: [...] }
    const rooms = await Room.find({}).populate('amenities').populate('reviews').populate('prices');
    return new Response(JSON.stringify({ rooms }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

