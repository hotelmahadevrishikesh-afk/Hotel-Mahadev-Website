import CategoryTag from '@/models/CategoryTag';
import connectDB from "@/lib/connectDB";
import Packages from '@/models/Packages';

// GET: Return all unique tags if allTags=1, else normal behavior
export async function GET(req) {
  await connectDB();
  const url = new URL(req.url, 'http://localhost');
  if (url.searchParams.get('allTags') === '1') {
    // Return all unique tags
    const allTagsDocs = await CategoryTag.find({}, 'tags');
    const tagsSet = new Set();
    allTagsDocs.forEach(doc => {
      if (Array.isArray(doc.tags)) {
        doc.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Response.json({ tags: Array.from(tagsSet) });
  }
  const packageId = url.searchParams.get('packageId');
  if (packageId) {
    try {
      const entry = await CategoryTag.findOne({ packageId });
      return Response.json({ success: true, data: entry });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
  return Response.json({ error: 'Missing required query parameter: allTags=1 or packageId=ID' }, { status: 400 });
}

// POST: Create or update tags for a packageId
export async function POST(req) {
  await connectDB();
  try {
    const { packageId, tags } = await req.json();
    if (!packageId || !Array.isArray(tags)) {
      return Response.json({ error: 'packageId and tags are required.' }, { status: 400 });
    }
    // Check if a CategoryTag already exists for this packageId
    const exists = await CategoryTag.findOne({ packageId });
    if (exists) {
      return Response.json({ error: 'Category already exists for this packageId.' }, { status: 409 });
    }
    // Create new category tag
    const created = await CategoryTag.create({ packageId, tags });
    // Push the CategoryTag _id to the product's categoryTag field
    if (created && created._id) {
      await Packages.findByIdAndUpdate(packageId, { $set: { categoryTag: created._id } });
    }
    return Response.json({ success: true, data: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update tags for a product (only if exists)
export async function PATCH(req) {
  await connectDB();
  try {
    const { packageId, tags } = await req.json();
    if (!packageId || !Array.isArray(tags)) {
      return Response.json({ error: 'packageId and tags are required.' }, { status: 400 });
    }
    const updated = await CategoryTag.findOneAndUpdate(
      { packageId },
      { $set: { tags } },
      { new: true }
    );
    if (!updated) {
      return Response.json({ error: 'CategoryTag entry not found for this product.' }, { status: 404 });
    }
    return Response.json({ success: true, data: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}



// DELETE: Remove a tag from a product
// DELETE: Delete a category tag by product or _id
export async function DELETE(req) {
  await connectDB();
  try {
    const url = new URL(req.url, 'http://localhost');
    const packageId = url.searchParams.get('packageId');
    const id = url.searchParams.get('id');
    const tag = url.searchParams.get('tag'); 
    let result;
    if (packageId) {
      result = await CategoryTag.deleteOne({ packageId });
      await Packages.findByIdAndUpdate(packageId, { $unset: { categoryTag: "" } });
    } else if (id) {
      result = await CategoryTag.deleteOne({ _id: id });
    } else {
      // Remove a single tag from the tags array
      const updated = await CategoryTag.findOneAndUpdate(
        { packageId },
        { $pull: { tags: tag } },
        { new: true }
      );
    }
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}