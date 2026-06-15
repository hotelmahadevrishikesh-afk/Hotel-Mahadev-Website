
import connectDB from "@/lib/connectDB";
import MenuBar from "@/models/MenuBar";
import mongoose from 'mongoose';
import Packages from '@/models/Packages';
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    await connectDB();
    const { id } = await params;

    try {
        // Use lean() for a mutable plain JS object
        const category = await MenuBar.findOne(
            { "subMenu.url": id },
            { "subMenu.$": 1 }
        ).lean();

        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        const submenu = category.subMenu[0];
        // console.log('Before population:', submenu.packages);

        if (submenu.packages && submenu.packages.length > 0) {
            // Convert all IDs to ObjectId if needed
            const productIds = submenu.packages.map(id =>
                typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
            );
            // Populate the 'gallery' field for each product
            const productDocs = await Packages.find({ _id: { $in: productIds } })
                .populate('gallery')
                .populate('video')
                .populate('description')
                .populate('info')
                .populate('reviews')
                .populate('packagePrice')
                .populate('pdfs')
                .populate('packageHighlight')
                .lean();
            submenu.packages = productDocs;
            // console.log('After population:', submenu.packages);
        }

        // console.log('API returning submenu:', submenu);
        return NextResponse.json(submenu);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};