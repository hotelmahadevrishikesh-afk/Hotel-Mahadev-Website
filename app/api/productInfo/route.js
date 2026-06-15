import connectDB from "@/lib/connectDB";
import Info from '@/models/Info';
import Packages from '@/models/Packages';

// POST: Add a section to a product's info
export async function POST(req) {
  await connectDB();
  try {
    const { packageId, title, description } = await req.json();
    if (!packageId || !title || !description) {
      return Response.json({ error: 'Missing packageId, title, or description' }, { status: 400 });
    }
    let infoDoc = await Info.findOne({ packageId });
    if (!infoDoc) {
      infoDoc = await Info.create({ packageId, info: [{ title, description }] });
      // Link Info to Product
      await Packages.findByIdAndUpdate(packageId, { info: infoDoc._id });
    } else {
      // Defensive: never overwrite the array, always append
      if (!Array.isArray(infoDoc.info)) {
        infoDoc.info = [];
      }
      // Debug: log before and after
      // console.log('Before push:', infoDoc.info);
      infoDoc.info = [...infoDoc.info, { title, description }];
      // console.log('After push:', infoDoc.info);
      await infoDoc.save();
    }
    return Response.json({ success: true, info: infoDoc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// GET: Get all info sections for a product
export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get('packageId');
    if (!packageId) {
      return Response.json({ error: 'Missing packageId' }, { status: 400 });
    }
    const infoDoc = await Info.findOne({ packageId });
    return Response.json({ info: infoDoc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update a section by index
export async function PATCH(req) {
  await connectDB();
  try {
    const { packageId, sectionIndex, title, description } = await req.json();
    if (!packageId || sectionIndex === undefined || !title || !description) {
      return Response.json({ error: 'Missing packageId, sectionIndex, title, or description' }, { status: 400 });
    }
    const infoDoc = await Info.findOne({ packageId });
    if (!infoDoc || !infoDoc.info[sectionIndex]) {
      return Response.json({ error: 'Section not found' }, { status: 404 });
    }
    infoDoc.info[sectionIndex].title = title;
    infoDoc.info[sectionIndex].description = description;
    await infoDoc.markModified('info');
    await infoDoc.save();
    return Response.json({ success: true, info: infoDoc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove a section by index
export async function DELETE(req) {
  await connectDB();
  try {
    const { packageId, sectionIndex } = await req.json();
    const index = Number(sectionIndex);
    if (!packageId || isNaN(index)) {
      return Response.json({ error: 'Missing packageId or sectionIndex' }, { status: 400 });
    }
    const infoDoc = await Info.findOne({ packageId });
    if (!infoDoc || !Array.isArray(infoDoc.info) || index < 0 || index >= infoDoc.info.length) {
      return Response.json({ error: 'Section not found' }, { status: 404 });
    }
    infoDoc.info.splice(index, 1);
    await infoDoc.markModified('info');
    await infoDoc.save();

    // If no sections left, delete Info doc and unset from Product
    if (infoDoc.info.length === 0) {
      await Info.deleteOne({ _id: infoDoc._id });
      await Packages.findByIdAndUpdate(packageId, { $unset: { info: "" } });
      return Response.json({ success: true, info: null });
    }
    // console.log('After delete/save:', infoDoc.info);
    return Response.json({ success: true, info: infoDoc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
