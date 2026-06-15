"use client";
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import { Extension } from '@tiptap/core'
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

// Create a FontSize extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addCommands() {
    return {
      setFontSize: (fontSize) => ({ commands }) => {
        return commands.setFontStyle({ fontSize })
      },
      unsetFontSize: () => ({ commands }) => {
        return commands.setFontStyle({ fontSize: undefined })
      },
    }
  },
})

const productInfo = ({ roomData, roomId }) => {
  const [sections, setSections] = useState([]); // Array of {title, description}
  const [tableLoading, setTableLoading] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [viewedSection, setViewedSection] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState(null);
  const [description, setDescription] = useState("");
  const [galleries, setGalleries] = useState([]);
  const [loadingGalleries, setLoadingGalleries] = useState(false);
  const imageInputRef = useRef(null);
  const [selectedMainImage, setSelectedMainImage] = useState(null); // { url, key }
  const [selectedSubImages, setSelectedSubImages] = useState([]); // array of { url, key }
  const [imageUploading, setImageUploading] = useState(false);
  const [subImagesUploading, setSubImagesUploading] = useState(false);
  const subImagesInputRef = useRef(null);

  const [editGallery, setEditGallery] = useState(null);
  const [editMainImage, setEditMainImage] = useState(null); // should be {url, key} or null
  const [editSubImages, setEditSubImages] = useState([]);
  const [heading, setHeading] = useState("");
  const [paragraph, setParagraph] = useState("");
  const editor = useEditor({
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
    content: description,
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[200px] border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00b67a]'
      }
    }
  });

  useEffect(() => {
    if (!roomId) return;
    const fetchRoomInfo = async () => {
      try {
        const res = await fetch(`/api/roomInfo?roomId=${roomId}`);
        const data = await res.json();
        if (res.ok && data.room) {
          setHeading(data.room.heading || "");
          setParagraph(data.room.paragraph || "");
          setSelectedMainImage(data.room.mainPhoto || null);
          setSelectedSubImages(data.room.relatedPhotos || []);
          if (editor && data.room.paragraph) {
            editor.commands.setContent(data.room.paragraph, false);
          }
        }
      } catch (err) {
        // Optionally toast error
      }
    };
    fetchRoomInfo();
  }, [roomId, editor]);



  const [viewGallery, setViewGallery] = useState(null)

  // Remove uploaded main image before save
  const handleRemoveMainImageUpload = async () => {
    if (selectedMainImage && selectedMainImage.key) {
      toast.loading('Deleting main image from Cloudinary...', { id: 'cloud-delete-main' });
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


  // Fetch all sections for the current product
  const fetchSections = async () => {
    setTableLoading(true);
    try {
      const res = await fetch(`/api/roomInfo?roomId=${roomId}`);
      const data = await res.json();
      if (res.ok && data.info && Array.isArray(data.info.info)) {
        setSections(data.info.info);
      } else {
        setSections([]);
        if (data.error) toast.error(data.error);
      }
    } catch (err) {
      setSections([]);
      toast.error('Error fetching product info sections.');
    } finally {
      setTableLoading(false);
    }
  };
  const handleFileUpload = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };
  useEffect(() => {
    if (roomId) fetchSections();
  }, [roomId]);

  const [title, setTitle] = useState("");


  // Function to get current editor content
  const getCurrentContent = () => {
    if (editor) {
      return editor.getHTML();
    }
    return description;
  };

  const productTitle = roomData?.title || "";
  const [loading, setLoading] = useState(false);

  const openDeleteModal = (idx) => {
    setDeleteTargetIndex(idx);
    setShowDeleteModal(true);
  };

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
    if (!roomId || !heading.trim()) {
      toast.error('Please provide both a main image, title and description for this section.');
      return;
    }
    setLoading(true);
    try {
      if (editMode && editIndex !== null) {
        // PATCH to update section
        const res = await fetch('/api/roomInfo', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, heading: heading.trim(), paragraph: description, mainPhoto: selectedMainImage, relatedPhotos: selectedSubImages })
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          toast.error(data.error || 'Failed to update section');
        } else {
          toast.success('Section updated successfully!');
          setTitle("");
          setDescription("");
          setEditMode(false);
          setEditIndex(null);
          fetchSections();
        }
      } else {
        // POST to add section
        const res = await fetch('/api/roomInfo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, heading: heading.trim(), paragraph: description, mainPhoto: selectedMainImage, relatedPhotos: selectedSubImages })
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          toast.error(data.error || 'Failed to add section');
        } else {
          toast.success('Section added successfully!');
          setTitle("");
          setDescription("");
          fetchSections();
        }
      }
    } catch (err) {
      toast.error('Error saving section.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <form className="page-content" onSubmit={handleSubmit}>
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-md-12 col-lg-12">
              <div className="card">
                <div className="card-body px-4 py-2">
                  <div className="mb-3">
                    <div className="mb-4">
                      <label className="font-semibold">Room Name</label>
                      <Input
                        type="text"
                        className="form-control w-1/2"
                        value={productTitle}
                        disabled
                        readOnly
                      />
                    </div>
                    <label className="form-label font-semibold">Room Heading</label>
                    <Input value={heading} onChange={e => setHeading(e.target.value)} className="mb-2" placeholder="Enter Room Name" />
                    <div className="my-4">
                      <label className="form-label font-semibold">Room Description</label>
                      <div className="border rounded mt-1 px-3 py-2 bg-white">
                        {editor && (
                          <>
                            <div className="flex gap-2 pb-2 mb-2">
                              <button type="button"
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
                              >
                                <Bold className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().toggleItalic().run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
                              >
                                <Italic className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('underline') ? 'bg-gray-200' : ''}`}
                              >
                                <UnderlineIcon className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().setParagraph().run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('paragraph') ? 'bg-gray-200' : ''}`}
                              >
                                <PilcrowSquare className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
                              >
                                <Heading1 className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
                              >
                                <Heading2 className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
                              >
                                <Heading3 className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                              >
                                <List className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('orderedList') ? 'bg-gray-200' : ''}`}
                              >
                                <ListOrdered className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('blockquote') ? 'bg-gray-200' : ''}`}
                              >
                                <Quote className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
                              >
                                <Code className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().toggleStrike().run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('strike') ? 'bg-gray-200' : ''}`}
                              >
                                <Strikethrough className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().undo().run()}
                                className="p-2 rounded-lg hover:bg-gray-100"
                              >
                                <Undo className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().redo().run()}
                                className="p-2 rounded-lg hover:bg-gray-100"
                              >
                                <Redo className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('textAlign', 'left') ? 'bg-gray-200' : ''}`}
                              >
                                <AlignLeft className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('textAlign', 'center') ? 'bg-gray-200' : ''}`}
                              >
                                <AlignCenter className="w-4 h-4" />
                              </button>
                              <button type="button"
                                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('textAlign', 'right') ? 'bg-gray-200' : ''}`}
                              >
                                <AlignRight className="w-4 h-4" />
                              </button>
                            </div>
                            <EditorContent editor={editor} />
                            </>
                         
                        )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="font-semibold">Room Main Photo</label>
                    <div className="border rounded p-4 bg-gray-50">
                      <div className="text-center">
                        {(editGallery ? editMainImage?.url : selectedMainImage?.url) ? (
                          <div className="relative mb-3 inline-block">
                            <img
                              src={editGallery ? editMainImage?.url : selectedMainImage.url}
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
                    <label className="font-semibold">Room Sub Images</label>
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
                        <div className="text-xs text-gray-500 mt-1">Images Selected: {(editGallery ? editSubImages : selectedSubImages).length}</div>
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
                  <div className="flex gap-2 mt-2">
                    {editMode && (
                      <Button variant="outline" onClick={() => {
                        setEditMode(false);
                        setEditIndex(null);
                        setTitle("");
                        setDescription("");
                        setSelectedMainImage(null);
                        setSelectedSubImages([]);
                      }}>Cancel</Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
      </form >
    </div >
  );
}

export default productInfo;

