import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Packages from '@/models/Packages';

export async function GET(req, { params }) {
  await connectDB();
  const { slug } = await params;
  const packages = await Packages.findOne({ slug });
  if (!packages) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(packages);
}