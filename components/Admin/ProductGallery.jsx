"use client";
import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
const ProductGallery = ({ productData, productId }) => {
  const imageInputRef = useRef(null);
  const [selectedMainImage, setSelectedMainImage] = useState(null); // { url, key }
  const [selectedSubImages, setSelectedSubImages] = useState([]); // array of { url, key }
  const [imageUploading, setImageUploading] = useState(false);
  const [subImagesUploading, setSubImagesUploading] = useState(false);
  const subImagesInputRef = useRef(null);

  // Remove uploaded main image before save
  const handleRemoveMainImageUpload = async () => {
    if (selectedMainImage && selectedMainImage.key) {
      toast.loading('Deleting main image ...', { id: 'cloud-delete-main' });
      try {
        const res = await fetch('/api/cloudinary', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: selectedMainImage.key }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('Main image deleted from Cloudinary!', { id: 'cloud-delete-main' });
        } else {
          toast.error('Cloudinary error: ' + (data.error || 'Failed to delete main image'), { id: 'cloud-delete-main' });
        }
      } catch (err) {
        toast.error('Failed to delete main image from Cloudinary (network or server error)', { id: 'cloud-delete-main' });
      }
    }
    setSelectedMainImage(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Remove uploaded sub image before save
  const handleRemoveSubImageUpload = async (idx) => {
    const img = selectedSubImages[idx];
    if (img && img.key) {
      toast.loading('Deleting sub image from Cloudinary...', { id: 'cloud-delete-sub' });
      try {
        const res = await fetch('/api/cloudinary', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: img.key }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('Sub image deleted from Cloudinary!', { id: 'cloud-delete-sub' });
        } else {
          toast.error('Cloudinary error: ' + (data.error || 'Failed to delete sub image'), { id: 'cloud-delete-sub' });
        }
      } catch (err) {
        toast.error('Failed to delete sub image from Cloudinary (network or server error)', { id: 'cloud-delete-sub' });
      }
    }
    setSelectedSubImages(prev => prev.filter((_, i) => i !== idx));
  };
  const [editGallery,setEditGallery] = useState(null);

  // Add missing handleFileUpload functions
  const handleFileUpload = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const productTitle = productData?.title || "";

  // Single gallery state for this package
  const [galleryId, setGalleryId] = useState(null);
  const [loadingGallery, setLoadingGallery] = useState(false);

  // On mount or when productId changes, fetch gallery for this package
  useEffect(() => {
    if (!productId) return;
    setLoadingGallery(true);
    fetch(`/api/productGallery?packageId=${productId}`)
      .then(async res => {
        if (!res.ok) {
          setGalleryId(null);
          setSelectedMainImage(null);
          setSelectedSubImages([]);
          return;
        }
        const data = await res.json();
        let gallery = null;
        if (Array.isArray(data)) {
          gallery = data.find(g => g.packageId && g.packageId._id === productId);
        }
        if (gallery) {
          setGalleryId(gallery._id);
          setSelectedMainImage(gallery.mainImage || null);
          setSelectedSubImages(gallery.subImages || []);
        } else {
          setGalleryId(null);
          setSelectedMainImage(null);
          setSelectedSubImages([]);
        }
      })
      .finally(() => setLoadingGallery(false));
  }, [productId]);

  const handleMainImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/cloudinary', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Image upload failed');
      const result = await res.json();
      if (editGallery) {
        setEditMainImage({ url: result.url, key: result.key });
      } else {
        setSelectedMainImage({ url: result.url, key: result.key });
      }
      toast.success('Main image uploaded successfully');
    } catch (err) {
      toast.error('Main image upload failed');
    } finally {
      setImageUploading(false);
      if (file && imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleSubImagesUploadClick = () => {
    if (subImagesInputRef.current) {
      subImagesInputRef.current.value = '';
      subImagesInputRef.current.click();
    }
  };

  const handleSubImagesUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    // Determine current sub images state based on edit mode
    const currentSubImages = editGallery ? editSubImages : selectedSubImages;
    setSubImagesUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/cloudinary', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) throw new Error('Sub image upload failed');
        const result = await res.json();
        uploaded.push({ url: result.url, key: result.key });
      }
      if (editGallery) {
        setEditSubImages(prev => [...prev, ...uploaded]);
      } else {
        setSelectedSubImages(prev => [...prev, ...uploaded]);
      }
      toast.success('Sub image(s) uploaded successfully');
    } catch (err) {
      toast.error('Sub image upload failed');
    } finally {
      setSubImagesUploading(false);
      if (files.length && subImagesInputRef.current) subImagesInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) {
      toast.error('No Package selected');
      return;
    }
    if (!selectedMainImage || !selectedMainImage.url || !selectedMainImage.key) {
      toast.error('Please upload a main image');
      return;
    }
    const mainImage = {
      url: selectedMainImage.url,
      key: selectedMainImage.key
    };
    const subImages = selectedSubImages
      .filter(img => img.url && img.key)
      .map(img => ({ url: img.url, key: img.key }));
    try {
      let apiRes;
      if (galleryId) {
        // Update existing gallery
        apiRes = await fetch('/api/productGallery', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ galleryId, mainImage, subImages })
        });
      } else {
        // Create new gallery
        apiRes = await fetch('/api/productGallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId: productId, mainImage, subImages })
        });
      }
      if (!apiRes.ok) throw new Error('Failed to save gallery');
      toast.success('Product gallery saved successfully');
      // Refetch gallery to update form
      setLoadingGallery(true);
      fetch(`/api/productGallery?packageId=${productId}`)
        .then(async res => {
          if (!res.ok) {
            setGalleryId(null);
            setSelectedMainImage(null);
            setSelectedSubImages([]);
            return;
          }
          const data = await res.json();
          let gallery = null;
          if (Array.isArray(data)) {
            gallery = data.find(g => g.packageId && g.packageId._id === productId);
          }
          if (gallery) {
            setGalleryId(gallery._id);
            setSelectedMainImage(gallery.mainImage || null);
            setSelectedSubImages(gallery.subImages || []);
          } else {
            setGalleryId(null);
            setSelectedMainImage(null);
            setSelectedSubImages([]);
          }
        })
        .finally(() => setLoadingGallery(false));
    } catch (err) {
      toast.error('Failed to save gallery');
    }
  };


  // Utility to refresh galleries table
  const refreshGalleries = () => {
    fetch(`/api/productGallery?packageId=${productId}`)
      .then(async res => {
        if (!res.ok) return setGalleries([]);
        const data = await res.json();
        if (Array.isArray(data)) {
          setGalleries(data.filter(g => g.packageId && g.packageId._id === productId));
        } else {
          setGalleries([]);
        }
      })
      .catch(() => setGalleries([]));
  };

  // Edit handler for updating an existing gallery
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editGallery || !editGallery._id) {
      toast.error('No gallery selected for editing');
      return;
    }
    if (!editGallery.mainImage) {
      toast.error('Please provide a main image URL');
      return;
    }
    const mainImage = editGallery.mainImage;
    const subImages = editGallery.subImages;
    try {
      const apiRes = await fetch('/api/productGallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryId: editGallery._id, mainImage, subImages })
      });
      if (!apiRes.ok) throw new Error('Failed to update gallery');
      toast.success('Product gallery updated successfully');
      setEditGallery(null);
      refreshGalleries();
    } catch (err) {
      toast.error('Failed to update gallery');
    }
  };


  return (
    <div className="flex justify-center items-center py-5 w-full">
      <div className="w-full max-w-2xl">
        <h4 className="font-bold mb-4 text-center">Package Image Gallery</h4>
        <form onSubmit={editGallery ? handleEditSubmit : handleSubmit}>
          <div className="mb-4">
            <label className="font-semibold">Package Name</label>
            <Input
              type="text"
              className="form-control"
              placeholder="Package Name"
              value={productTitle}
              disabled
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="font-semibold">Package Main Photo</label>
            <div className="border rounded p-4 bg-gray-50">
              <div className="text-center">
                {(editGallery ? editGallery.mainImage?.url : selectedMainImage?.url) ? (
                  <div className="relative mb-3 inline-block">
                    <img
                      src={editGallery ? editGallery.mainImage?.url : selectedMainImage.url}
                      alt="Preview"
                      className="rounded object-contain mx-auto"
                      style={{ maxHeight: '150px', display: 'block' }}
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2"
                      onClick={() => {
                        if (editGallery) setEditMainImage("");
                        else {
                          handleRemoveMainImageUpload();
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    className="upload-placeholder border border-dashed border-gray-400 rounded-lg p-6 bg-white cursor-pointer"
                    onClick={handleFileUpload}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-4xl">📷</span>
                      <h5 className="mb-2">Browse Image</h5>
                      <p className="text-md mb-0">From Drive</p>
                    </div>
                  </div>
                )}
              </div>
              <input
                type="file"
                id="imageUpload"
                className="hidden"
                accept="image/*"
                ref={imageInputRef}
                onChange={handleMainImageUpload}
              />
              <div className="text-center mt-3">
                <Button
                  type="button"
                  className="bg-gray-800 text-white px-4 py-2"
                  onClick={handleFileUpload}
                >
                  {imageUploading ? 'Uploading...' : ((editGallery ? editMainImage : selectedMainImage) ? 'Change Image' : 'Choose Image')}
                </Button>
              </div>
            </div>
          </div>
          {/* Sub Images */}
          <div className="mb-4">
            <label className="font-semibold">Package Sub Images</label>
            <div className="border rounded p-4 bg-gray-50">
              <div className="flex flex-wrap gap-2 mb-3">
                {(editGallery ? editSubImages : selectedSubImages).length > 0 ? (
                  (editGallery ? editSubImages : selectedSubImages).map((img, idx) => (
                    <div key={img.key || idx} className="relative inline-block group">
                      <img
                        src={img.url}
                        alt={`Sub ${idx + 1}`}
                        className="rounded object-contain"
                        style={{ maxHeight: '100px', maxWidth: '100px', display: 'block' }}
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 text-md opacity-80 hover:opacity-100 group-hover:opacity-100"
                        style={{ transform: 'translate(40%,-40%)' }}
                        onClick={() => {
                          if (editGallery) {
                            setEditSubImages(editSubImages.filter((s, i) => i !== idx));
                          } else {
                            handleRemoveSubImageUpload(idx);
                          }
                        }}
                        aria-label={`Remove sub image ${idx + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400">No sub images selected.</span>
                )}
              </div>
              <input
                type="file"
                id="subImagesUpload"
                className="hidden"
                accept="image/*"
                multiple
                ref={subImagesInputRef}
                onChange={handleSubImagesUpload}
              />
              <div className="text-center mt-3">
                <Button
                  type="button"
                  className="bg-gray-800 text-white px-4 py-2"
                  onClick={handleSubImagesUploadClick}
                >
                  {subImagesUploading ? 'Uploading...' : ((editGallery ? editSubImages : selectedSubImages).length > 0 ? 'Add More Images' : 'Choose Images')}
                </Button>
                <div className="text-xs text-gray-500 mt-1">Selected Images : {(editGallery ? editSubImages : selectedSubImages).length}</div>
              </div>
            </div>
            {/* Submit Button */}
            <div className="text-center">
              {editGallery ? (
                <>
                  <Button type="submit" className="bg-green-600 px-5 font-semibold mt-3 mr-2">Update</Button>
                  <Button type="button" className="bg-gray-400 px-5 font-semibold mt-3" onClick={() => setEditGallery(null)}>Cancel</Button>
                </>
              ) : (
                <Button type="submit" className="bg-red-500 px-5 font-semibold mt-3">
                  Save Data
                </Button>
              )}
            </div>
          </div>
        </form>
      </div >
    </div>
  );
};

export default ProductGallery;
