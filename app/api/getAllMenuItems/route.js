import connectDB from "@/lib/connectDB";
import MenuBar from "@/models/MenuBar";
import { NextResponse } from "next/server";
import Packages from "@/models/Packages"
import Gallery from '@/models/Gallery';
import Video from '@/models/Video';
import Description from '@/models/Description';
import Info from '@/models/Info';
import ProductReview from '@/models/ProductReview';
import PackagePrice from '@/models/PackagePrice';
import PackagePdf from '@/models/PackagePdf';
import PackageHightlight from "@/models/PackageHighlight";
export async function GET(req) {
    await connectDB();
    const menu = await MenuBar.find({})
        .populate({
            path: 'subMenu.packages',
            populate: [
                { path: 'gallery' },
                { path: 'video' },
                { path: 'description' },
                { path: 'info' },
                { path: 'reviews' },
                { path: 'packagePrice' },
                { path: 'pdfs' },
                { path: 'packageHighlight' },
            ]
        })
        .sort({ order: 1 });
    return NextResponse.json(menu);
}