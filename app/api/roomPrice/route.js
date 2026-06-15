import connectDB from "@/lib/connectDB";
import RoomPrice from '@/models/RoomPrice';
import Room from "@/models/Room";
// GET: List all product quantity records or by productId
export async function GET(req) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    // Accept both 'product' and 'productId' for compatibility
    const productId = searchParams.get('product') || searchParams.get('productId');
    let result;
    if (productId) {
        result = await RoomPrice.findOne({ room: productId });
        return Response.json(result || {});
    } else {
        const quantities = await RoomPrice.find({});
        return Response.json(quantities);
    }
}

// POST: Upsert (create or update) room prices for 01 Pax, 02 Pax, Extra Bed
export async function POST(req) {
    await connectDB();
    const body = await req.json();
    const { room, prices } = body;
    if (!room || !Array.isArray(prices)) {
        return Response.json({ error: 'Missing room or prices' }, { status: 400 });
    }
    // Upsert RoomPrice records for each type
    const updated = await RoomPrice.findOneAndUpdate(
        { room },
        { $set: { prices } },
        { new: true, upsert: true }
    );
    await Room.findByIdAndUpdate(room, { $addToSet: { prices: updated._id } });
    return Response.json({ success: true, roomPrice: updated }, { status: 201 });
}

// PUT: Update a product quality record by id
export async function PUT(req) {
    await connectDB();
    const { _id, ...rest } = await req.json();
    const updated = await RoomPrice.findByIdAndUpdate(_id, rest, { new: true });
    if (!updated) return Response.json({ error: 'Not found' }, { status: 404 });
    // Also update Product document: only set the quantity field to the Quantity _id
    if (rest.room) {
        const room = await Room.findOneAndUpdate(
            { _id: rest.room },
            { price: updated._id },
            { new: true }
        );
        return Response.json({ room });
    }
}

// DELETE: Remove a product quality record by id (expects ?id=...)
export async function DELETE(req) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const productId = searchParams.get('productId');
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
    await RoomPrice.findByIdAndDelete(id);
    await Room.findByIdAndUpdate(productId, { price: null });
    return Response.json({ success: true });
}
