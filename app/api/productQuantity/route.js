import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Quantity from '@/models/Quantity';
import Packages from '@/models/Packages';
import PackagePrice from '@/models/PackagePrice';

// POST: Create or update quantity for a package
export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { packages, prices } = body;
    if (typeof prices === 'string') {
      try {
        const parsed = JSON.parse(prices);
      } catch (err) {
        console.error("Failed to parse prices:", prices);
      }
    }
    
    if (!packages) {
      return NextResponse.json({ error: 'Missing packages' }, { status: 400 });
    }
    if (!Array.isArray(prices)) {
      return NextResponse.json({ error: 'Prices should be an array', receivedType: typeof prices, prices }, { status: 400 });
    }

    // Check if PackagePrice already exists for this package
    let packagePrice = await PackagePrice.findOne({ package: packages });
    if (packagePrice) {
      packagePrice.prices = prices;
      await packagePrice.save();
    } else {
      packagePrice = await PackagePrice.create({ package: packages, prices });
    }
    // Optionally, link to Quantity model (if you want to keep Quantity for other reasons)
    // let quantity = await Quantity.findOne({ packages });
    // if (quantity) {
    //   quantity.packagePrice = packagePrice._id;
    //   await quantity.save();
    // }
    // Or just link to Packages if needed
    // await Packages.findByIdAndUpdate(packages, { packagePrice: packagePrice._id });

    return NextResponse.json(packagePrice, { status: 200 });
  } catch (err) {
    console.error('Error saving package price:', err);
    return NextResponse.json({ error: err.message || 'Failed to save package price', stack: err.stack, full: err }, { status: 500 });
  }
}

// GET: Fetch package price by package id (query param: packages)
export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const packages = searchParams.get('packages');
    if (!packages) {
      return NextResponse.json({ error: 'Missing packages param' }, { status: 400 });
    }
    const packagePrice = await PackagePrice.findOne({ package: packages });
    if (!packagePrice) {
      return NextResponse.json({ error: 'No package price found for this package' }, { status: 404 });
    }
    return NextResponse.json(packagePrice, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to fetch quantity' }, { status: 500 });
  }
}
