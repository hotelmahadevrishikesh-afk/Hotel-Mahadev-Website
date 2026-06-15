// API Route for fetching, updating, and deleting a product by ID
import connectDB from "@/lib/connectDB";
import Packages from '@/models/Packages';
import Gallery from '@/models/Gallery';
import Video from '@/models/Video';
import Description from '@/models/Description';
import Info from '@/models/Info';
import ProductReview from '@/models/ProductReview';
import PackagePrice from '@/models/PackagePrice';

import PackagePdf from '@/models/PackagePdf';
import PackageHighlight from '@/models/PackageHighlight';
// import Tax from '@/models/ProductTax';

import { deleteFileFromCloudinary } from '@/utils/cloudinary';
export async function GET(req, context) {
  const { params } = await context;
  // console.log(params.id)
  try {
    await connectDB();
    // let { id } = params;
    // try { id = decodeURIComponent(id); } catch (e) { }
    // console.log("Product API called with id:", id);
    // if (!id || id.length !== 24) {
    //   console.error("Invalid product id:", id);
    //   return new Response(JSON.stringify({ error: 'Invalid product id' }), { status: 400 });
    // }
    const id = decodeURIComponent(params.id);

    // Strictly fetch by MongoDB _id
    let packages = await Packages.findById(id)
    .populate('gallery')
    .populate('video')
    .populate('description')
    .populate('info')
    .populate('reviews')
    .populate('packagePrice')
    .populate('pdfs')
    .populate('packageHighlight')
    if (!packages || !packages.active) {
      return new Response(JSON.stringify({ error: 'packages not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(packages), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    // Find the product to get the artisan reference before deleting
    const packages = await Packages.findById(id)
    if (!packages || !packages.active) {
      return new Response(JSON.stringify({ error: 'Package not found' }), { status: 404 });
    }  
      // Delete gallery and its images
    if (packages.gallery) {
      const galleryDoc = await Gallery.findById(packages.gallery);
      if (galleryDoc) {
        if (galleryDoc.mainImage?.key) {
          try { await deleteFileFromCloudinary(galleryDoc.mainImage.key); } catch (e) { console.error('Cloudinary deletion failed:', e.message); }
        }
        if (Array.isArray(galleryDoc.subImages)) {
          for (const subImg of galleryDoc.subImages) {
            if (subImg?.key) {
              try { await deleteFileFromCloudinary(subImg.key); } catch (e) { console.error('Cloudinary deletion failed:', e.message); }
            }
          }
        }
        await Gallery.findByIdAndDelete(packages.gallery);
      }
    }
    // Delete video
    if (packages.video) {
      await Video.findByIdAndDelete(packages.video);
    }
    // Delete description
    if (packages.description) {
      await Description.findByIdAndDelete(packages.description);
    }
    // Delete info
    if (packages.info) {
      await Info.findByIdAndDelete(packages.info);
    }
    // Delete reviews
    if (Array.isArray(packages.reviews)) {
      for (const reviewId of packages.reviews) {
        await ProductReview.findByIdAndDelete(reviewId);
      }
    }
    // Delete quantity
    if (packages.packagePrice) {
      await PackagePrice.findByIdAndDelete(packages.packagePrice);
    }
    // Delete pdfs
    if (packages.pdfs) {
      for (const pdfId of packages.pdfs) {
        await PackagePdf.findByIdAndDelete(pdfId);
      }
    }
    // Delete packageHighlight
    if (packages.packageHighlight) {
      await PackageHighlight.findByIdAndDelete(packages.packageHighlight);
    }  
    // Now delete the product
    await Packages.findByIdAndDelete(id);
    return new Response(JSON.stringify({ message: 'packages and all related data deleted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// PATCH: Update any part of the product (sizes, colors, gallery, etc.)
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    // PATCH can update url, title, artisan, etc.
    const updated = await Packages.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return new Response(JSON.stringify({ error: 'packages not found' }), { status: 404 });
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}