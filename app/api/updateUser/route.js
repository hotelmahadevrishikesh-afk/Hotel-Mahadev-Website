import connectDB from "@/lib/connectDB";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export async function POST(req) {
    try {
        // Get session
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized access!" }, { status: 401 });
        }

        await connectDB();

        // Get the user by email from session
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ message: "User not found!" }, { status: 404 });
        }

        // Parse request body
        const body = await req.json();
        const { 
            firstName, 
            lastName, 
            dateOfBirth, 
            name, 
            email, 
            phone, 
            address, 
            city, 
            state, 
            postalCode, 
            country 
        } = body;

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'country'];
        const missingFields = requiredFields.filter(field => !body[field]);
        
        if (missingFields.length > 0) {
            return NextResponse.json({ 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            }, { status: 400 });
        }

        // Update user fields
        const updateData = {
            name: name || `${firstName} ${lastName}`,
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            state,
            postalCode,
            country,
        };

        // Only update dateOfBirth if provided
        if (dateOfBirth) {
            updateData.dateOfBirth = new Date(dateOfBirth);
        }

        // Update user in database
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            throw new Error('Failed to update user');
        }

        return NextResponse.json({ 
            message: "Profile updated successfully!",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                // Include other fields as needed
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ 
            message: error.message || 'Internal server error' 
        }, { status: error.statusCode || 500 });
    }
}