"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast from "react-hot-toast";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
const FAQ = () => {
  const [groupedFaqs, setGroupedFaqs] = useState({});
  const categories = ["General", "Packages / Product", "Privacy FAQ", "Refunds & Cancellation", "Payments", "House Rules"];
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [overview, setOverview] = useState("");
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
  });
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Typography,
      TextAlign,
      Underline,
      Link,
      Color,
      ListItem,
      FontSize,
    ],
    content: "", // Always start empty
    editorProps: {
      attributes: {
        class: 'min-h-[200px] border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00b67a]'
      }
    },
    onUpdate: ({ editor }) => {
      setOverview(editor.getHTML());
    }
  });
  // useEffect(() => {
  //   if (editor && typeof fetchedOverview === "string") {
  //     editor.commands.setContent(fetchedOverview || "");
  //   }
  // }, [editor, fetchedOverview]);
  // console.log(groupedFaqs)

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch("/api/faqs");
        const data = await response.json();
        if (data && typeof data === "object" && !Array.isArray(data)) {
          setGroupedFaqs(data);
        } else {
          // fallback, shouldn't happen
          const emptyGrouped = {};
          categories.forEach(cat => { emptyGrouped[cat] = [] });
          setGroupedFaqs(emptyGrouped);
        }
      } catch (error) {
        toast.error("Failed to fetch FAQs");
      }
    };
    fetchFaqs();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = faqToDelete ? "PATCH" : "POST";
      // Set answer to current editor HTML before sending
      const payload = {
        ...formData,
        answer: overview,
        id: faqToDelete,
      };
      const response = await fetch("/api/faqs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`FAQ ${faqToDelete ? "updated" : "added"} successfully`);
        setFaqToDelete(null);

        // Refresh faqs list
        const updatedFaqs = await fetch("/api/faqs").then((res) => res.json());
        setGroupedFaqs(updatedFaqs);

        // Reset form
        setFormData({
          question: "",
          answer: "",
          category: "General",
        });
        setOverview("");
        if (editor) editor.commands.clearContent();

      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };


  const handleDelete = async (idOrCategory) => {
    try {
      let response;
      if (categories.includes(idOrCategory)) {
        // Delete all in category
        response = await fetch(`/api/faqs?category=${encodeURIComponent(idOrCategory)}`, {
          method: "DELETE",
        });
      } else {
        // Delete single FAQ
        response = await fetch("/api/faqs", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: idOrCategory }),
        });
      }
      const data = await response.json();

      if (response.ok) {
        toast.success("FAQ deleted successfully");

        // No need to filter locally, just refetch grouped data

        // Update grouped faqs
        const updated = await fetch("/api/faqs").then((res) => res.json());
        setGroupedFaqs(updated);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const confirmDelete = async () => {
    if (faqToDelete) {
      await handleDelete(faqToDelete);
      setFaqToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setFaqToDelete(null);
  };
  return (
    <div className="max-w-5xl mx-auto py-10 w-full">
      <h2 className="text-2xl font-bold mb-6">{faqToDelete ? "Edit FAQ" : "Add New FAQ"}</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4">
        <div>
          <div>
            <Label>Category</Label>
            <Select
              value={formData.category || 'General'}
              onValueChange={val => setFormData(prev => ({ ...prev, category: val }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {["General", "Packages /Product", "Privacy FAQ", "Refunds & Cancellation", "Payments", "House Rules"].map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Label>Question</Label>
          <Input name="question" placeholder="Enter question" value={formData.question || ''} onChange={handleInputChange} />
        </div>
        <div className="mb-4">
          <Label>Answer</Label>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
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
          </div>
          <EditorContent editor={editor} />
        </div>
        <div className="flex gap-3">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
            {faqToDelete ? "Update FAQ" : "Add FAQ"}
          </Button>
          {faqToDelete && (
            <Button
              type="button"
              variant="outline"
              className="bg-gray-300 hover:bg-gray-200 text-black"
              onClick={() => {
                setFaqToDelete(null);
                setFormData({
                  question: "",
                  answer: "",
                  category: "General",
                });
                setOverview("");
                if (editor) editor.commands.clearContent();
              }}
            >
              Cancel Edit
            </Button>
          )}
        </div>
      </form>

      <h2 className="text-2xl font-bold mt-10 mb-4">Existing FAQ</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>View</TableHead>
            <TableHead>Delete</TableHead>

          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat}>
              <TableCell>{cat}</TableCell>
              <TableCell>
                <Button onClick={() => { setSelectedCategory(cat); setModalOpen(true); }}>
                  View
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setFaqToDelete(cat); // store category name
                    setShowDeleteModal(true);
                  }}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal for showing Q&A of selected category */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory} FAQs</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {(groupedFaqs[selectedCategory] && groupedFaqs[selectedCategory].length > 0) ? (
              groupedFaqs[selectedCategory].map(faq => (
                <div key={faq._id} className="mb-4 p-2 border-b">
                  <div className="font-semibold text-lg">Q: {faq.question}</div>
                  <div
                    className="custom-desc-list text-gray-700 mb-2 text-lg max-h-24 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          question: faq.question,
                          answer: faq.answer,
                          category: faq.category,
                        });
                        setFaqToDelete(faq._id); // for edit, reuse state
                        if (editor) editor.commands.setContent(faq.answer || "");
                        setOverview(faq.answer || "");
                        setModalOpen(false);
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setFaqToDelete(faq._id);
                        setShowDeleteModal(true);
                        setModalOpen(false);
                      }}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div>No FAQs in this category.</div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this FAQ?</p>
          <DialogFooter>
            <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQ