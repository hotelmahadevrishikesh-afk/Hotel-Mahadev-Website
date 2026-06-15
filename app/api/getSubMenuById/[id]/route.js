import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import MenuBar from "@/models/MenuBar";
import Packages from "@/models/Packages";

export async function GET(req, { params }) {
    await connectDB();
    const { id } = await params;
    // console.log(id)

    try {

        const menu = await MenuBar.findOne({ "subMenu._id": id })
            .populate({ path: "subMenu.packages", strictPopulate: false })
            .lean();

        if (!menu) {
            return NextResponse.json({ message: "SubMenu not found" }, { status: 404 });
        }

        
        const subMenu = menu.subMenu.find((sub) => sub._id.toString() === id);

        if (!subMenu) {
            return NextResponse.json({ message: "SubMenu not found inside menu" }, { status: 404 });
        }

        // Manually populate rooms array
        const mongoose = (await import('mongoose')).default;
        const Packages = mongoose.model('Packages');
        const roomDocs = await Packages.find({ _id: { $in: subMenu.packages || [] } });
        const populatedSubMenu = { ...subMenu, packages: roomDocs };

        return NextResponse.json(populatedSubMenu);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
