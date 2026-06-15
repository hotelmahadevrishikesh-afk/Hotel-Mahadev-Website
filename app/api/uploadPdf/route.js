import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// In app/api/uploadPdf/route.js
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file size (e.g., 20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    if (buffer.length > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 20MB limit' }, { status: 400 });
    }

    // Simple backend validation for .pdf extension
    if (!file.name || !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed!' }, { status: 400 });
    }

    const title = formData.get('title');
    const filename = title ? `${title}.pdf` : (file.name || `file-${Date.now()}.pdf`);

    // Use upload_large for files over 100MB
    const options = {
      resource_type: 'raw',
      type: 'upload',
      public_id: `pdfs/${filename}`,
      chunk_size: 6000000, // 6MB chunks for large files
      timeout: 120000 // 2 minute timeout
    };

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (err, result) => {
          if (err) {
            console.error('Cloudinary upload error:', err);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ 
      url: result.secure_url, 
      key: result.public_id 
    }, { status: 200 });

  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ 
      error: err.message || 'Upload failed',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}

// DELETE: Remove PDF from Cloudinary
export async function DELETE(req) {
  try {
    const { publicId } = await req.json();
    if (!publicId) {
      return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw', 
      type: 'upload',
    });

    if (result.result !== 'ok') {
      return NextResponse.json(
        { error: 'Failed to delete PDF from Cloudinary', cloudinaryResult: result },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
