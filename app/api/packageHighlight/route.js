import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import PackageHighlight from '@/models/PackageHighlight';
import Packages from '@/models/Packages';

// GET: Get highlights for a package by packageId (query param)
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const packageId = searchParams.get('packageId');
  if (!packageId) {
    return NextResponse.json({ error: 'Missing packageId' }, { status: 400 });
  }
  const highlight = await PackageHighlight.findOne({ packageId });
  if (!highlight) {
    return NextResponse.json({ highlights: [] }, { status: 200 });
  }
  return NextResponse.json({ highlights: highlight.highlights, _id: highlight._id }, { status: 200 });
}

// POST: Create highlights for a package
export async function POST(req) {
  await connectDB();
  const { packageId, highlights } = await req.json();
  if (!packageId || !Array.isArray(highlights)) {
    return NextResponse.json({ error: 'Missing packageId or highlights' }, { status: 400 });
  }
  // Prevent duplicate
  const exists = await PackageHighlight.findOne({ packageId });
  if (exists) {
    return NextResponse.json({ error: 'Highlights already exist for this package' }, { status: 409 });
  }
  const highlight = await PackageHighlight.create({ packageId, highlights });
  // Update the package with the new highlight reference
  await Packages.findByIdAndUpdate(packageId, { packageHighlight: highlight._id });
  return NextResponse.json({ highlights: highlight.highlights, _id: highlight._id }, { status: 201 });
}

// PATCH: Edit highlights for a package (by highlight doc _id)
export async function PATCH(req) {
  await connectDB();
  const { _id, highlights } = await req.json();
  if (!_id || !Array.isArray(highlights)) {
    return NextResponse.json({ error: 'Missing _id or highlights' }, { status: 400 });
  }
  const updated = await PackageHighlight.findByIdAndUpdate(_id, { highlights }, { new: true });
  if (!updated) {
    return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
  }
  return NextResponse.json({ highlights: updated.highlights, _id: updated._id }, { status: 200 });
}

// DELETE: Delete highlight and remove reference from the package
export async function DELETE(req) {
  await connectDB();
  const { _id } = await req.json();
  if (!_id) {
    return NextResponse.json({ error: 'Missing _id' }, { status: 400 });
  }
  const highlight = await PackageHighlight.findById(_id);
  if (!highlight) {
    return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
  }
  // Remove reference from package
  await Packages.findByIdAndUpdate(highlight.packageId, { $unset: { packageHighlight: "" } });
  await PackageHighlight.findByIdAndDelete(_id);
  return NextResponse.json({ success: true }, { status: 200 });
}
