import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import RoomReview from '@/models/RoomReview';
import Room from "@/models/Room";
import { deleteFileFromCloudinary } from "@/utils/cloudinary";

// POST: Add a new product review
export async function POST(req) {
  await connectDB();
  try {
    const { roomId, rating, title, review, createdBy, image } = await req.json();
    if (!roomId || !rating || !title || !review || !createdBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const reviewDoc = await RoomReview.create({
      room: roomId,
      rating,
      title,
      review,
      createdBy,
      image
    });
    // Push review _id to Product's reviews array
    await Room.findByIdAndUpdate(roomId, { $push: { reviews: reviewDoc._id } });
    return NextResponse.json({ success: true, review: reviewDoc });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await connectDB();
  try {
    const { reviewId, roomId, rating, title, review, image, createdBy } = await req.json();
    if (!reviewId || !roomId) {
      return NextResponse.json({ error: 'Missing reviewId or roomId' }, { status: 400 });
    }

    // Get existing review
    const existingReview = await RoomReview.findById(reviewId);
    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Handle image update if new image is provided and different
    if (image && image.url && image.key) {
      await RoomReview.findByIdAndUpdate(reviewId, {
        image: {
          url: image.url,
          key: image.key
        }
      });
    } else if (image === null && existingReview.image?.key) {
      // Delete image if null is provided and there was an image before
      await deleteFileFromCloudinary(existingReview.image.key);
      await RoomReview.findByIdAndUpdate(reviewId, { image: null });
    }

    // Update other fields
    const updatedReview = await RoomReview.findByIdAndUpdate(
      reviewId,
      {
        rating,
        title,
        review,
        createdBy,
        updatedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await connectDB();
  try {
    const { reviewId, roomId } = await req.json();
    if (!reviewId || !roomId) {
      return NextResponse.json({ error: 'Missing reviewId or roomId' }, { status: 400 });
    }

    // Find the review
    const review = await RoomReview.findById(reviewId);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Delete the image from Cloudinary if it exists
    if (review.image?.key) {
      try {
        await deleteFileFromCloudinary(review.image.key);
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
        // Continue with deletion even if image deletion fails
      }
    }

    // Remove review from Room's reviews array
    await Room.findByIdAndUpdate(roomId, { $pull: { reviews: reviewId } });

    // Delete the review
    await RoomReview.findByIdAndDelete(reviewId);

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET: Get reviews for a product
export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    if (!roomId) {
      return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
    }
    // Only fetch approved reviews
    const reviews = await RoomReview.find({ room: roomId}).sort({ createdAt: -1 });
    return NextResponse.json({ reviews });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
