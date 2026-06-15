import { NextResponse } from 'next/server';
import connectDB from "@/lib/connectDB";
import Description from '@/models/Description';
import Packages from '@/models/Packages';

// POST: Add or update overview for a product
export async function POST(req) {
  await connectDB();
  try {
    const { packageId, overview = '', heading = '', description = '' } = await req.json();
    if (!packageId) {
      return NextResponse.json({ error: 'Missing packageId' }, { status: 400 });
    }
    let descDoc = await Description.findOne({ packageId });
    if (descDoc) {
      descDoc.overview = overview;
      descDoc.heading = heading;
      descDoc.description = description;
      await descDoc.save();
    } else {
      descDoc = await Description.create({ packageId, overview,heading,description });
    }
    // Link Description to Product
    await Packages.findByIdAndUpdate(packageId, { description: descDoc._id });
    return NextResponse.json({ success: true, description: descDoc });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET: Get description for a product or all products
export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get('product') || searchParams.get('packageId');
    if (packageId) {
      const descDoc = await Description.findOne({ packageId }).populate('packageId', 'title');
      return NextResponse.json({ description: descDoc });
    } else {
      // Return all product descriptions with product name
      const descDocs = await Description.find({}).populate('packageId', 'title');
      return NextResponse.json({ descriptions: descDocs });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update overview
export async function PATCH(req) {
  await connectDB();
  try {
    const { packageId, overview, heading, description } = await req.json();
    if (!packageId) {
      return NextResponse.json({ error: 'Missing packageId' }, { status: 400 });
    }
    
    // First, get the existing document
    const existingDoc = await Description.findOne({ packageId });
    if (!existingDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Update only the fields that were provided in the request
    if (overview !== undefined) existingDoc.overview = overview;
    if (heading !== undefined) existingDoc.heading = heading;
    if (description !== undefined) existingDoc.description = description;
    
    // Save the updated document
    const updatedDoc = await existingDoc.save();
    
    // Ensure Product.description is set
    await Packages.findByIdAndUpdate(packageId, { description: updatedDoc._id });
    
    return NextResponse.json({ description: updatedDoc });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove description by packageId
export async function DELETE(req) {
  await connectDB();
  try {
    const { packageId } = await req.json();
    if (!packageId) {
      return NextResponse.json({ error: 'Missing packageId' }, { status: 400 });
    }
    await Description.findOneAndDelete({ packageId });
    await Packages.findByIdAndUpdate(packageId, { $unset: { description: "" } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
