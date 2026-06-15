'use client'

import { useForm } from "react-hook-form"
import { Input } from "../ui/input"
import { NumericFormat } from "react-number-format"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Loader2, Pencil, Trash2, QrCode, Copy } from "lucide-react"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import ProductQrModal from "./ProductQrModal";
import { useRef } from "react";

const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

const AddProduct = ({ id }) => {
    // ...existing state and hooks...

    // Editing state
    const [isEditing, setIsEditing] = useState(false);

    // Scroll ref for form
    const formRef = useRef(null);

    // Handler to fill form for editing
    const handleEditProduct = (prod) => {
        // Use react-hook-form's reset to fill all fields
        reset({
            title: prod.title || '',

            order: prod.order || 1,
            active: typeof prod.active === 'boolean' ? prod.active : true,
            // Add other fields as needed
        });
        setProductCode(prod.code || '');
        setActive(typeof prod.active === 'boolean' ? prod.active : true);
        setOrder(prod.order || 1);

        setTitle(prod.title || '');
        setIsEditing(true);
        // Optionally scroll to form
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Cancel edit handler
    const handleCancelEdit = () => {
        reset({
            title: '',
            order: 1,
            active: true,
            // Add other fields as needed
        });
        setProductCode(generateCode());
        setActive(true);
        setOrder(1);

        setTitle('');
        setIsEditing(false);
    };
    // Slugify utility (copied from ProductProfile)
    function slugify(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-+/g, '-');
    }

    // Copy to clipboard helper
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        toast.success('URL copied!');
    }

    // Toggle product active status
    const toggleSwitch = async (productId, currentActive, isDirect) => {
        if (isDirect) {
            toast.error('Only non-direct products can be toggled.');
            return;
        }
        try {
            const response = await fetch('/api/admin/website-manage/addPackage', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pkgId: productId, active: !currentActive }),
            });
            const result = await response.json();
            if (response.ok) {
                setProducts(prev => prev.map(prod => prod._id === productId ? { ...prod, active: !currentActive } : prod));
                toast.success(`Product is now ${!currentActive ? 'active' : 'inactive'}`);
            } else {
                toast.error(result.message || 'Failed to update product status.');
            }
        } catch (error) {
            toast.error('Failed to update product status.');
        }
    }

    const { handleSubmit, register, setValue, reset } = useForm();
    const subMenuId = id;
    const [productCode, setProductCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [title, setTitle] = useState("");
    const [order, setOrder] = useState(1);
    const [active, setActive] = useState(true);


    // console.log(products)
    useEffect(() => {
        setProductCode(generateCode());
    }, []);

    useEffect(() => {
        // Fetch products for this submenu/category or all direct products
        const fetchProducts = async () => {
            try {
                let url = '';
                if (subMenuId) {
                    url = `/api/getSubMenuById/${subMenuId}`;
                }
                const response = await fetch(url);
                const data = await response.json();
                // console.log(data)
                if (subMenuId && Array.isArray(data.packages)) {
                    setProducts(data.packages);
                } else if (!subMenuId && Array.isArray(data)) {
                    setProducts(data);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                setProducts([]);
            }
        };
        fetchProducts();
    }, [subMenuId]);
    const deletePackage = async (id) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/website-manage/addPackage', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const result = await response.json();
            if (response.ok) {
                setProducts((prev) => prev.filter((prod) => prod._id !== id));
                toast.success('packages deleted successfully!');
            } else {
                toast.error(result.message || 'Failed to delete packages.');
            }
        } catch (error) {
            toast.error('Failed to delete packages.');
        } finally {
            setIsLoading(false);
        }
    };
    const onSubmit = async () => {
        setIsLoading(true);
        try {
            const payload = {
                title,
                slug: slugify(title),
                code: productCode,
                order,
                active: typeof active === 'boolean' ? active : true, // always true by default
                isDirect: !subMenuId,
                ...(subMenuId ? { subMenuId, category: subMenuId } : {})
            };
            let response, result;
            if (isEditing) {
                response = await fetch('/api/admin/website-manage/addPackage', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: productCode, ...payload })
                });
                result = await response.json();
                if (response.ok) {
                    toast.success('Package updated successfully!');
                    reset();
                    setProductCode(generateCode());
                    setIsEditing(false);
                    // Refetch products
                    if (subMenuId) {
                        const res = await fetch(`/api/getSubMenuById/${subMenuId}`);
                        const data = await res.json();
                        if (Array.isArray(data.packages)) {
                            setProducts(data.packages);
                        }
                    } 
                } else {
                    toast.error(result.message || 'Failed to update Package');
                }
            } else {
                response = await fetch('/api/admin/website-manage/addPackage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                result = await response.json();
                if (response.ok) {
                    toast.success('Package added successfully!');
                    reset();
                    setProductCode(generateCode());
                    // Refetch products
                    if (subMenuId) {
                        const res = await fetch(`/api/getSubMenuById/${subMenuId}`);
                        const data = await res.json();
                        if (Array.isArray(data.packages)) {
                            setProducts(data.packages);
                        }
                    }
                } else {
                    toast.error(result.message || 'Failed to add Package');
                }
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <>
            <form className="flex flex-col items-center justify-center gap-8 my-20 bg-blue-100 w-[30%] max-w-xl md:max-w-7xl mx-auto p-4 rounded-lg" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex md:flex-row flex-col items-center md:items-end gap-6 w-full mx-auto">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="productCode" className="font-semibold">Package Code</label>
                        <Input name="productCode" className="w-32 border-2 border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0 font-bold" readOnly value={productCode} />
                    </div>
                    <div className="flex flex-col gap-2 ">
                        <label htmlFor="productTitle" className="font-semibold">Package Title</label>
                        <Input name="productTitle" placeholder="Enter Package Name.." className="w-full border-2 font-bold border-blue-600 " value={title} onChange={e => setTitle(e.target.value)} />
                    </div>

                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-500">Add Package</Button>
            </form>

            <div className="bg-blue-100 p-4 rounded-lg shadow max-w-5xl mx-auto w-full overflow-x-auto lg:overflow-visible text-center">
                <Table className="w-full min-w-max lg:min-w-0">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center !text-black w-1/6">Order</TableHead>
                            <TableHead className="text-center !text-black w-1/4">Package Name</TableHead>
                            <TableHead className="text-center !text-black w-1/6">URL</TableHead>
                            <TableHead className="w-1/6 !text-black text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products && products.length > 0 ? (
                            products.map((prod, index) => {
                                const url = typeof window !== 'undefined' ? `${window.location.origin}/package/${slugify(prod.title)}` : '';
                                return (
                                    <TableRow key={prod._id}>
                                        <TableCell className="border font-semibold border-blue-600">{index + 1}</TableCell>
                                        <TableCell className="border font-semibold border-blue-600">{prod.title}</TableCell>
                                        <TableCell className="border font-semibold border-blue-600">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Copy URL Button */}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => copyToClipboard(url)}
                                                    disabled={!url}
                                                    title="Copy Product URL"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="border font-semibold border-blue-600">
                                            <div className="flex items-center justify-center gap-6">
                                                <Button size="icon" variant="outline" asChild>
                                                    <Link href={`/admin/add_direct_packages/${prod._id}`}>
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    onClick={() => handleEditProduct(prod)}
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" disabled={isLoading} onClick={() => deletePackage(prod._id)} variant="destructive">
                                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        id={`switch-${prod._id}`}
                                                        checked={prod.active}
                                                        onCheckedChange={() => toggleSwitch(prod._id, prod.active, prod.isDirect)}
                                                        className={`rounded-full transition-colors ${prod.active ? "!bg-green-500" : "!bg-red-500"}`}
                                                        disabled={prod.isDirect}
                                                    />
                                                    <Label htmlFor={`switch-${prod._id}`} className="text-black">
                                                        {prod.active ? "ON" : "OFF"}
                                                    </Label>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan="6" className="text-center border font-semibold border-blue-600">
                                    No packages available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

        </>
    )

}
export default AddProduct
