import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import MenuBar from "@/models/MenuBar";
import mongoose from "mongoose";
import Packages from "@/models/Packages"
function slugify(str) {
    if (!str) return '';
    return str
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-');
}

export async function POST(req) {
    await connectDB();
    const body = await req.json();
    const slug = slugify(body.title);

    try {
        // Step 1: Check for existing room
        let roomQuery = {
            title: body.title,
            code: body.code,
            slug: slug
        };
        // Optionally, also check for subMenu/category if you want to scope uniqueness
        let existingRoom = await Packages.findOne(roomQuery);
        if (existingRoom) {
            // If already linked to submenu, skip push
            if (!body.isDirect && body.subMenuId) {
                const menuBarDoc = await MenuBar.findOne({ "subMenu._id": body.subMenuId });
                const updateResult = await MenuBar.updateOne(
                    { "subMenu._id": body.subMenuId, "subMenu.packages": { $ne: existingRoom._id } },
                    { $push: { "subMenu.$.packages": existingRoom._id } }
                );
                if (updateResult.matchedCount === 0) {
                    console.error("No submenu matched for existing package linkage!", body.subMenuId);
                }
            }
            return NextResponse.json({ message: "Package already exists!", package: existingRoom }, { status: 200 });
        }
        // Step 2: Create a new Room document
        const newRoom = await Packages.create({
            title: body.title,
            code: body.code,
            slug: slug,
            isDirect: body.isDirect,
            ...(body.subMenuId ? { category: body.subMenuId } : {})
        });

        // Step 3: Link new room to submenu
        if (!body.isDirect && body.subMenuId) {
            const menuBarDoc = await MenuBar.findOne({ "subMenu._id": body.subMenuId });
            const updateResult = await MenuBar.updateOne(
                { "subMenu._id": body.subMenuId, "subMenu.packages": { $ne: newRoom._id } },
                { $push: { "subMenu.$.packages": newRoom._id } }
            );
            if (updateResult.matchedCount === 0) {
                console.error("No submenu matched for new rooms linkage!", body.subMenuId);
            }
        }
        return NextResponse.json({ message: "Package added successfully!", package: newRoom }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
export async function PUT(req) {
    await connectDB();
    try {
        const body = await req.json();
        // Support either code or _id as identifier
        const identifier = body._id ? { _id: body._id } : { code: body.code };
        if (!identifier._id && !identifier.code) {
            return NextResponse.json({ message: 'Packages identifier (code or _id) required' }, { status: 400 });
        }
        // Find the room
        const existingRoom = await Packages.findOne(identifier);
        if (!existingRoom) {
            return NextResponse.json({ message: 'Packages not found' }, { status: 404 });
        }
        // Prepare update fields (do not allow code overwrite)
        const updateFields = { ...body };
        delete updateFields._id;
        delete updateFields.code;
        // Update room
        const updatedRoom = await Packages.findOneAndUpdate(identifier, updateFields, { new: true });
        return NextResponse.json({ message: 'Packages updated successfully!', room: updatedRoom });
    } catch (error) {
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
export async function PATCH(req) {
    await connectDB();
    const body = await req.json();
    const { pkgId, ...updateFields } = body;

    try {
        // Update the room
        const updatedPackages = await Packages.findByIdAndUpdate(pkgId, updateFields, { new: true });
        if (!updatedPackages) {
            return NextResponse.json({ message: "Packages not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Packages updated successfully!", packages: updatedPackages });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
export async function DELETE(req) {
    await connectDB();
    const { id } = await req.json();

    try {
        // Find the room to delete
        const packagesToDelete = await Packages.findById(id);
        if (!packagesToDelete) {
            return NextResponse.json({ message: "Packages not found!" }, { status: 404 });
        }
        // Delete the room from the database
        const deletedPackages = await Packages.findByIdAndDelete(id);

        // Remove room references from MenuBar
        await MenuBar.updateMany(
            { "subMenu.packages": id },
            { $pull: { "subMenu.$[].packages": id } }
        );

        return NextResponse.json({ message: "Packages deleted successfully!" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
