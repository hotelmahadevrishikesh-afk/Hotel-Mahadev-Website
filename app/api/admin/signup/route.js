import connectDB from "@/lib/connectDB";
import Admin from "@/models/Admin";

export async function POST(req) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) {
            return new Response(JSON.stringify({ message: "Email and password are required!" }), { status: 400 });
        }

        await connectDB();

        // Check if any admin exists
        const adminCount = await Admin.countDocuments({ isAdmin: true });
        if (adminCount > 0) {
            return new Response(JSON.stringify({ message: "Admin already exists. Signup is disabled." }), { status: 403 });
        }

        // Create new admin
        const newAdmin = new Admin({ email, password, isAdmin: true });
        await newAdmin.save();

        return new Response(JSON.stringify({ message: "Admin created successfully!" }), { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return new Response(JSON.stringify({ message: "Email already exists!" }), { status: 409 });
        }
        return new Response(JSON.stringify({ message: "Server error!" }), { status: 500 });
    }
}
