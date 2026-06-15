import connectDB from "@/lib/connectDB";
import Video from '@/models/Video';
import Packages from '@/models/Packages';
// POST: Add a video to a product
export async function POST(req) {
  await connectDB();
  try {
    const { packageId, videoUrl, videoDescription } = await req.json();
    if (!packageId || !videoUrl) {
      return Response.json({ error: 'Missing packageId or videoUrl' }, { status: 400 });
    }
    let videoDoc = await Video.findOne({ packageId });
    if (videoDoc) {
      // Add to existing
      if (videoDoc.videos.length >= 10) {
        return Response.json({ error: 'Max 10 videos allowed.' }, { status: 400 });
      }
      videoDoc.videos.push({ url: videoUrl, description: videoDescription || '' });
      await videoDoc.save();
    } else {
      videoDoc = await Video.create({  packageId, videos: [{ url: videoUrl, description: videoDescription || '' }] });
    }
    // Always link videoDoc to Product
    await Packages.findByIdAndUpdate(packageId, { video: videoDoc._id });
    return Response.json({ success: true, video: videoDoc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// GET: Get all videos for a product
export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get('packageId');
    if (!packageId) {
      return Response.json({ error: 'Missing packageId' }, { status: 400 });
    }
    const videoDoc = await Video.findOne({ packageId });
    return Response.json({ video: videoDoc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update videos (replace all)
export async function PATCH(req) {
  await connectDB();
  try {
    const { packageId, videos } = await req.json();
    if (!packageId || !Array.isArray(videos)) {
      return Response.json({ error: 'Missing packageId or videos' }, { status: 400 });
    }
    const videoDoc = await Video.findOneAndUpdate(
      { packageId },
      { videos },
      { new: true }
    );
    return Response.json({ video: videoDoc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove a video by packageId and videoUrl
export async function DELETE(req) {
  await connectDB();
  try {
    const { packageId, videoUrl, videoDescription } = await req.json();
    if (!packageId || !videoUrl) {
      return Response.json({ error: 'Missing packageId or videoUrl' }, { status: 400 });
    }
    const videoDoc = await Video.findOne({ packageId });
    if (!videoDoc) {
      return Response.json({ error: 'Video document not found' }, { status: 404 });
    }
    videoDoc.videos = videoDoc.videos.filter(v => v.url !== videoUrl);
    await videoDoc.save();
    // If no videos left, remove video ref from Product and delete Video doc
    if (videoDoc.videos.length === 0) {
      await Packages.findByIdAndUpdate(packageId, { $unset: { video: "" } });
      await Video.deleteOne({ _id: videoDoc._id });
      return Response.json({ success: true, video: null });
    }
    return Response.json({ success: true, video: videoDoc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
