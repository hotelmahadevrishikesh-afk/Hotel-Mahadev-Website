import connectDB from '@/lib/connectDB';
import PackagePrice from '@/models/PackagePrice';
import Packages from '@/models/Packages';

export async function GET(req) {
  await connectDB();
  try {
    const url = new URL(req.url, `http://${req.headers.get('host') || 'localhost'}`);
    const packageId = url.searchParams.get('packageId');
    if (packageId) {
      const price = await PackagePrice.findOne({ packageId });
      if (!price) {
        return new Response(JSON.stringify({ error: 'No price found for this packageId' }), { status: 404 });
      }
      return new Response(JSON.stringify(price), { status: 200 });
    }
    const prices = await PackagePrice.find();
    return new Response(JSON.stringify(prices), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
export async function PUT(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { packageId, ...priceData } = body;
    if (!packageId) {
      return new Response(JSON.stringify({ error: 'packageId is required' }), { status: 400 });
    }
    // Find and update existing price
    const updatedPrice = await PackagePrice.findOneAndUpdate(
      { packageId },
      { ...priceData, packageId },
      { new: true, upsert: false }
    );
    if (!updatedPrice) {
      return new Response(JSON.stringify({ error: 'No price found for this packageId' }), { status: 404 });
    }
    // Optionally update the package reference
    await Packages.findByIdAndUpdate(
      packageId,
      { packagePrice: updatedPrice._id },
      { new: true }
    );
    return new Response(JSON.stringify({ packagePrice: updatedPrice }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { packageId, ...priceData } = body;
    if (!packageId) {
      return new Response(JSON.stringify({ error: 'packageId is required' }), { status: 400 });
    }
    // Save the price
    const newPrice = new PackagePrice({ ...priceData, packageId });
    await newPrice.save();
    // Update the package to reference this price
    const updatedPackage = await Packages.findByIdAndUpdate(
      packageId,
      { packagePrice: newPrice._id },
      { new: true }
    );
    return new Response(JSON.stringify({ packagePrice: newPrice, updatedPackage }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}