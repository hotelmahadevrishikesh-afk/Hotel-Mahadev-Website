"use client";
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Star, Upload, Trash2, AlignJustify } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRef } from 'react';
import { Label } from "../ui/label";
import Image from 'next/image';
import Underline from '@tiptap/extension-underline';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import { Extension } from '@tiptap/core';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  PilcrowSquare,
} from 'lucide-react'
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addCommands() {
    return {
      setFontSize: (fontSize) => ({ commands }) => {
        return commands.setFontStyle({ fontSize });
      },
      unsetFontSize: () => ({ commands }) => {
        return commands.setFontStyle({ fontSize: undefined });
      },
    };
  },
});

const RoomReview = ({ roomData, roomId }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageObj, setImageObj] = useState({ url: '', key: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Image handlers
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setUploading(true);
      toast.loading('Uploading image to Cloudinary...', { id: 'review-image-upload' });

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'product_reviews');

      try {
        const res = await fetch('/api/cloudinary', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (res.ok && data.url && data.key) {
          setImageObj({ url: data.url, key: data.key });
          toast.success('Image uploaded!', { id: 'review-image-upload' });
        } else {
          toast.error('Cloudinary upload failed: ' + (data.error || 'Unknown error'), { id: 'review-image-upload' });
        }
      } catch (err) {
        toast.error('Cloudinary upload error: ' + err.message, { id: 'review-image-upload' });
      } finally {
        setUploading(false);
      }
    } else {
      setImagePreview(null);
      setImageObj({ url: '', key: '' });
    }
  };

  useEffect(() => {
    if (imageObj.url && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [imageObj.url]);

  // Image delete handler
  const handleRemoveImage = async () => {
    // Remove from UI immediately
    setImageFile(null);
    setImagePreview(null);
    const prevKey = imageObj.key;
    setImageObj({ url: '', key: '' });
    if (prevKey) {
      toast.loading('Deleting image from Cloudinary...', { id: 'review-image-delete' });
      try {
        const res = await fetch('/api/cloudinary', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: prevKey }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('Image deleted from Cloudinary!', { id: 'review-image-delete' });
        } else {
          toast.error('Cloudinary error: ' + (data.error || 'Failed to delete image from Cloudinary'), { id: 'review-image-delete' });
        }
      } catch (err) {
        toast.error('Failed to delete image from Cloudinary (network or server error)', { id: 'review-image-delete' });
      }
    }
  };

  // Existing state and handlers
  const [viewModal, setViewModal] = useState(false);
  const [createdBy, setCreatedBy] = useState("");
  // const [viewModal, setViewModal] = useState(false);
  const [viewedReview, setViewedReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const roomTitle = roomData?.title || "";

  // Tiptap review editor setup
  const reviewEditor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Typography,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Link,
      Color,
      ListItem,
      FontSize,
    ],
    content: review,
    onUpdate: ({ editor }) => {
      setReview(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[120px] focus:outline-none',
      },
    },
  });

  // Clean up editor on unmount
  useEffect(() => {
    return () => {
      if (reviewEditor) reviewEditor.destroy();
    };
  }, [reviewEditor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomId || !rating || !review || !createdBy) {
      toast.error('Please provide a rating, review, createdBy, and valid product.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/roomReviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          rating,
          title,
          review: review,
          createdBy,
          image: imageObj.url ? {
            url: imageObj.url,
            key: imageObj.key
          } : null
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || 'Failed to submit review');
      } else {
        toast.success('Review submitted successfully!');
        setRating(0);
        setHoverRating(0);
        setTitle("");
        setReview("");
        setCreatedBy("");
        if (reviewEditor) {
          reviewEditor.commands.clearContent();
        }
        // Clear image state
        setImageFile(null);
        setImagePreview(null);
        setImageObj({ url: '', key: '' });
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchReviews();
      }
    } catch (err) {
      toast.error('Error submitting review.');
    } finally {
      setLoading(false);
    }
  };

  // State for reviews, modal, and edit mode
  const [reviews, setReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReview, setModalReview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);

  // console.log(reviews)

  // Fetch reviews for this product
  const fetchReviews = async () => {
    if (!roomId) return;
    setTableLoading(true);
    try {
      const res = await fetch(`/api/roomReviews?roomId=${roomId}`);
      const data = await res.json();
      if (res.ok && data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err) {
      toast.error('Error fetching reviews.');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [roomId]);

  // Handle edit: populate form
  const handleEdit = (review) => {
    setEditMode(true);
    setEditId(review._id);
    setTitle(review.title || "");
    setRating(review.rating || 0);
    setCreatedBy(review.createdBy || "");
    setReview(review.review || "");
    // Pre-fill editor content
    if (reviewEditor) {
      setTimeout(() => {
        reviewEditor.commands.setContent(review.review || "", false);
      }, 100);
    }
    if (review.image?.url) {
      setImagePreview(review.image.url);
      setImageObj({ url: review.image.url, key: review.image.key });
    } else {
      setImagePreview(null);
      setImageObj({ url: '', key: '' });
    }
  };

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Open delete modal
  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch('/api/roomReviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: deleteTargetId, roomId })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to delete review');
        return;
      }

      // Update UI immediately
      setReviews(reviews.filter(r => r._id !== deleteTargetId));
      toast.success('Review deleted successfully!');

      // Refresh reviews to ensure consistency
      fetchReviews();
    } catch (err) {
      toast.error('Error deleting review.');
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  // Handle update (edit mode)
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editId || !roomId || !rating || !review || !createdBy) {
      toast.error('Please provide a rating, review, createdBy, and valid product.');
      return;
    }
    setLoading(true);
    try {
      // PATCH to update review
      const res = await fetch(`/api/roomReviews`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: editId,
          roomId,
          title: title.trim(),
          review: review,
          rating,
          createdBy,
          image: imageObj
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || 'Failed to update review');
      } else {
        toast.success('Review updated successfully!');
        setEditMode(false);
        setEditId(null);
        setTitle("");
        setReview("");
        if (reviewEditor) {
          reviewEditor.commands.clearContent();
        }
        setCreatedBy("");
        setRating(0);
        setHoverRating(0);
        setImageFile(null);
        setImagePreview(null);
        setImageObj({ url: '', key: '' });
        fetchReviews();
      }
    } catch (err) {
      toast.error('Error updating review.');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditId(null);
    setRating(0);
    setHoverRating(0);
    setTitle("");
    setReview("");
    if (reviewEditor) {
      reviewEditor.commands.clearContent();
    }
    setCreatedBy("");
    setImageFile(null);
    setImagePreview(null);
    setImageObj({ url: '', key: '' });
  };

  return (
    <>
      {/* View Review Modal */}
      <Dialog open={viewModal} onOpenChange={setViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setViewModal(false)}
              aria-label="Close"
            >
              ×
            </button>
          </DialogHeader>
          {viewedReview && (
            <div className="mb-4">
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                <div className="font-semibold text-gray-800">Title</div>
                <div className="text-gray-600">{viewedReview.title}</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                <div className="font-semibold text-gray-800">Created By</div>
                <div className="text-gray-600">{viewedReview.createdBy}</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                <div className="font-semibold text-gray-800">Rating</div>
                <div className="text-gray-600">{viewedReview.rating} stars</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 h-24 overflow-y-auto">
                <div className="font-semibold text-gray-800">Review</div>
                <div className="text-gray-600">{viewedReview.review}</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 h-24 overflow-y-auto">
                <div className="font-semibold text-gray-800">Image</div>
                <div className="w-12 h-12 rounded-full">
                  <img src={viewedReview.image?.url} alt="" /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Review Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this review?</p>
          <DialogFooter>
            <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <form className="page-content" onSubmit={editMode ? handleUpdate : handleSubmit}>
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-md-12 col-lg-12">
              <h3 className="my-4 text-center">Create Room Review</h3>
              <div className="card my-2">
                <div className="card-body px-4 py-2">
                  <div className="mb-4">
                    <label className="font-semibold">Room Name</label>
                    <Input
                      type="text"
                      className="form-control"
                      value={roomTitle}
                      disabled
                      readOnly
                    />
                  </div>
                  {/* Review Image Upload */}
                  <div className="mb-4">
                    <Label className="block mb-2 font-bold">Review Image</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      className="hidden"
                      id="review-image-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mb-2 flex items-center gap-2 bg-blue-500 text-white"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      <span>Select Review Image</span>
                      <Upload className="w-4 h-4" />
                    </Button>
                    {uploading && <div className="text-blue-600 font-semibold">Uploading...</div>}
                    {imagePreview && (
                      <div className="relative w-48 h-28 border rounded overflow-hidden mb-2">
                        <Image
                          src={imagePreview}
                          alt="Review Image Preview"
                          width={192}
                          height={112}
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-200"
                          title="Remove image"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="createdBy" className="block text-sm font-medium text-gray-700">Created By</label>
                    <Input
                      id="createdBy"
                      value={createdBy}
                      onChange={e => setCreatedBy(e.target.value)}
                      className="w-full border rounded mt-1 px-3 py-2"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="font-semibold">Rating</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={28}
                          className={
                            (hoverRating || rating) >= star ? 'text-yellow-500 cursor-pointer' : 'text-gray-400 cursor-pointer'
                          }
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          fill={(hoverRating || rating) >= star ? '#FBBF24' : 'none'}
                        />
                      ))}
                    </div>
                  </div>


                  <div className="mb-4">
                    <label className="form-label">Review Title</label>
                    <Input type="text" className="form-control" placeholder="Review title" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Review</label>
                    {/* Tiptap Rich Text Editor */}
                    <div className="border rounded mt-1 px-3 py-2 bg-white">
                      {/* Toolbar */}
                      {reviewEditor && (
                        <>
                          <div className="flex gap-2 border-b pb-2 mb-2">
                            <button type="button" onClick={() => reviewEditor.chain().focus().toggleBold().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${reviewEditor.isActive('bold') ? 'bg-gray-200' : ''}`}><Bold className="w-4 h-4" /></button>
                            <button type="button" onClick={() => reviewEditor.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${reviewEditor.isActive('italic') ? 'bg-gray-200' : ''}`}><Italic className="w-4 h-4" /></button>
                            <button type="button" onClick={() => reviewEditor.chain().focus().toggleUnderline().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${reviewEditor.isActive('underline') ? 'bg-gray-200' : ''}`}><UnderlineIcon className="w-4 h-4" /></button>
                            <button type="button" onClick={() => reviewEditor.chain().focus().setParagraph().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${reviewEditor.isActive('paragraph') ? 'bg-gray-200' : ''}`}><PilcrowSquare className="w-4 h-4" /></button>
                            <button type="button" onClick={() => reviewEditor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${reviewEditor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}><Heading1 className="w-4 h-4" /></button>
                            <button type="button" onClick={() => reviewEditor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${reviewEditor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}><Heading2 className="w-4 h-4" /></button>
                            <button type="button" onClick={() => reviewEditor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${reviewEditor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}><Heading3 className="w-4 h-4" /></button>
                            <button type="button" onClick={() => reviewEditor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${reviewEditor.isActive('bulletList') ? 'bg-gray-200' : ''}`}><List className="w-4 h-4" /></button>
                            <button type="button" onClick={() => reviewEditor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${reviewEditor.isActive('orderedList') ? 'bg-gray-200' : ''}`}><ListOrdered className="w-4 h-4" /></button>
                            <button type="button" onClick={() => reviewEditor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${reviewEditor.isActive('blockquote') ? 'bg-gray-200' : ''}`}><Quote className="w-4 h-4" /></button>
                            <button
                              type="button"
                              onClick={() => reviewEditor.chain().focus().setTextAlign('left').run()}
                              className={`p-2 rounded-lg hover:bg-gray-100 ${reviewEditor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
                            >
                              <AlignLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => reviewEditor.chain().focus().setTextAlign('center').run()}
                              className={`p-2 rounded-lg hover:bg-gray-100 ${reviewEditor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
                            >
                              <AlignCenter className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => reviewEditor.chain().focus().setTextAlign('right').run()}
                              className={`p-2 rounded-lg hover:bg-gray-100 ${reviewEditor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
                            >
                              <AlignRight className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => reviewEditor.chain().focus().setTextAlign('justify').run()}
                              className={`p-2 rounded-lg hover:bg-gray-100 ${reviewEditor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}`}
                            >
                              <AlignJustify className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => reviewEditor.chain().focus().undo().run()} className="p-2 rounded-lg hover:bg-gray-100"><Undo className="w-4 h-4" /></button>
                            <button type="button" onClick={() => reviewEditor.chain().focus().redo().run()} className="p-2 rounded-lg hover:bg-gray-100"><Redo className="w-4 h-4" /></button>
                          </div>
                          <EditorContent editor={reviewEditor} />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-center space-x-2">
                    <Button type="submit" className="bg-blue-600 px-5" disabled={loading}>{loading ? (editMode ? 'Updating...' : 'Saving...') : (editMode ? 'Update Review' : 'Submit Review')}</Button>
                    {editMode && <Button type="button" className="bg-gray-400 px-5" onClick={handleCancelEdit}>Cancel</Button>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Reviews Table */}
      <div className="container-fluid mt-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-12 col-lg-12">
            <div className="card">
              <div className="card-body px-4 py-2">
                <h5 className="mb-3">Reviews</h5>
                {tableLoading ? (
                  <div>Loading...</div>
                ) : (
                  <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="px-4 py-3 text-center">S.No</TableHead>
                        <TableHead className="px-4 py-3 text-center">Product Name</TableHead>
                        <TableHead className="px-4 py-3 text-center">Created By</TableHead>
                        <TableHead className="px-4 py-3 text-center">Rating</TableHead>
                        <TableHead className="px-4 py-3 text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">No reviews found.</TableCell>
                        </TableRow>
                      ) : (
                        reviews.map((r, idx) => (
                          <TableRow key={r._id}>
                            <TableCell className="px-4 py-3 text-center font-medium">{idx + 1}</TableCell>
                            <TableCell className="px-4 py-3 text-center whitespace-nowrap ">{roomTitle}</TableCell>
                            <TableCell className="px-4 py-3 text-center whitespace-nowrap ">{r.createdBy}</TableCell>
                            <TableCell className="px-4 py-3 text-center whitespace-nowrap ">{r.rating}</TableCell>
                            <TableCell className="px-4 py-3 flex gap-2 justify-center">
                              <Button size="sm" variant="default" className="bg-blue-500 text-white px-3 py-1 rounded mr-2" onClick={() => {
                                setViewedReview(r);
                                setViewModal(true);
                              }}>
                                View
                              </Button>
                              <Button size="sm" variant="default" className="bg-yellow-500 text-white px-3 py-1 rounded mr-2" onClick={() => handleEdit(r)}>
                                Edit
                              </Button>
                              <Button size="sm" variant="destructive" className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => openDeleteModal(r._id)}>
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {modalOpen && modalReview && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Review Details</h5>
                <button type="button" className="close" aria-label="Close" onClick={() => setModalOpen(false)}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Product Name:</strong> {productTitle}</p>
                <p><strong>Rating:</strong> {modalReview.rating}</p>
                <p><strong>Review Title:</strong> {modalReview.title}</p>
                <p><strong>Description:</strong> {modalReview.review}</p>
              </div>
              <div className="modal-footer">
                <Button className="bg-gray-400" onClick={() => setModalOpen(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomReview;
