export const dynamic = "force-dynamic";

import { SidebarInset } from "@/components/ui/sidebar";
import ResponsiveFeaturedCarousel from "@/components/ResponsiveFeaturedCarousel";

import { CategoryCarousel } from "@/components/Category/category-card";
import connectDB from "@/lib/connectDB";
import Packages from "@/models/Packages";
import ProductDetailView from "@/components/ProductDetailView";
import ProductVideo from "@/components/ProductVideo";
import ProductInfoTabs from "@/components/ProductInfoTabs";
import Gallery from '@/models/Gallery';
import Video from '@/models/Video';
import Description from '@/models/Description';
import Info from '@/models/Info';
import ProductReview from '@/models/ProductReview';
import PackagePrice from "@/models/PackagePrice"
import FeaturedRoomsSection from "@/components/FeaturedRoomsSection";
import ReviewListModal from "@/components/ReviewListModal";
import BookingDetails from "@/components/BookingDetails";
import FeaturedRoomsClient from "@/components/FeaturedRoomsClient";
import PackagePdf from '@/models/PackagePdf';
import PackageHighlight from '@/models/PackageHighlight';
const PackagePage = async ({ params }) => {
    await connectDB();

    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const rawProduct = await Packages.findOne({ slug: decodedSlug })
        .populate('gallery video description info reviews packagePrice pdfs packageHighlight')
        .lean();

    // ✅ Convert to plain JSON
    const product = JSON.parse(JSON.stringify(rawProduct));

    if (!product || !product.active) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold mb-2">Package Not Available</h1>
                <p>This package may be disabled or removed by admin.</p>
            </div>
        );
    }

    // ✅ Fetch Categories
    let allCategories = [];
    try {
        if (product.category) {
            const allCategoriesRes = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/getAllMenuItems`,
                { cache: 'no-store' }
            );
            if (!allCategoriesRes.ok) throw new Error("Categories fetch failed");
            allCategories = await allCategoriesRes.json();
        }
    } catch (error) {
        console.error("Error fetching categories:", error.message);
    }
    
    // ✅ Frequently Bought Together
    let rooms = [];
    try {
        const roomRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/room`,
            { cache: 'no-store' }
        );
        if (roomRes.ok) {
            const data = await roomRes.json();
            rooms = Array.isArray(data)
                ? data
                : (Array.isArray(data.rooms) ? data.rooms : []);
        }
        // console.log(rooms)
    } catch (error) {
        console.error("Error fetching rooms:", error.message);
    }

    // ✅ Render Product Detail Page
    return (
        <SidebarInset>
            <div className="w-full md:py-8 py-4 flex flex-col">
                <div className="space-y-4 px-4">
                    {/* ✅ Force rerender when navigating between products */}
                    <ProductDetailView key={product._id} product={product} />
                </div>
                <div className="space-y-4">
                    <ProductVideo product={product} />
                </div>
                <div className="space-y-4">
                    <ProductInfoTabs product={product} />
                </div>
                <div className="space-y-4 px-2">
                    <FeaturedRoomsClient rooms={rooms} />
                </div>
            </div>
        </SidebarInset>
    );
};

export default PackagePage;
