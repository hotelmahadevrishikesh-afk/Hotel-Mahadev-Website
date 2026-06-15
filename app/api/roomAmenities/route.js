import connectDB from "@/lib/connectDB";
import RoomAmenities from '@/models/RoomAmenities';
import Room from '@/models/Room';

// GET: List all available amenities
export async function GET(req) {
  await connectDB();
  const amenities = await RoomAmenities.find({});
  return Response.json(amenities);
}

// POST: Save checked amenities for a room (expects: { roomId, checkedLabels: [label, ...] })
export async function POST(req) {
  await connectDB();
  const { roomId, checkedLabels } = await req.json();
  if (!roomId || !Array.isArray(checkedLabels)) {
    return Response.json({ error: 'Missing roomId or checkedLabels' }, { status: 400 });
  }
  // Find amenities by label
  const amenities = await RoomAmenities.find({ label: { $in: checkedLabels } });
  if (!amenities.length) {
    return Response.json({ error: 'No matching amenities found' }, { status: 404 });
  }
  const amenityIds = amenities.map(a => a._id);
  // Update the room's amenities array
  const updatedRoom = await Room.findByIdAndUpdate(roomId, { amenities: amenityIds }, { new: true }).populate('amenities');
  if (!updatedRoom) {
    return Response.json({ error: 'Room not found or not updated' }, { status: 404 });
  }
  return Response.json({ success: true, amenities: updatedRoom.amenities });
}


// PUT: Add a new amenity (expects: { label, iconKey })
export async function PUT(req) {
  await connectDB();
  const { label, iconKey } = await req.json();
  if (!label) return Response.json({ error: 'Missing label' }, { status: 400 });
  const amenity = await RoomAmenities.create({ label, iconKey });
  return Response.json({ success: true, amenity });
}
