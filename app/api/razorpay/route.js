// app/api/razorpay/route.js
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import connectDB from '@/lib/connectDB';
import User from "@/models/User";
import BookingDetails from "@/models/BookingDetails"; // Add this import
import { convertToINR } from '@/utils/exchangeRate';
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
export async function POST(request) {
    await connectDB();

    try {
        const {
            amount,
            currency = 'INR',
            receipt,
            customer,
            bookingDetails
        } = await request.json();
        // console.log('Creating order with:', { amount, currency, receipt });
        // Convert amount to smallest currency unit (paise for INR, cents for USD)
        let amountInSmallestUnit;
        let finalCurrency = currency;
        
        if (currency === 'USD') {
            // For USD, convert to cents (no currency conversion, use USD amount directly)
            amountInSmallestUnit = Math.round(amount * 100);
            finalCurrency = 'USD';
        } else {
            // For INR, convert to paise
            amountInSmallestUnit = Math.round(amount * 100);
            finalCurrency = 'INR';
        }
        const options = {
            amount: amountInSmallestUnit,
            currency: finalCurrency,
            receipt: receipt,
            payment_capture: 1
        };



        // Basic validation
        if (!amount || isNaN(amount)) {
            return NextResponse.json(
                { error: 'Invalid amount provided' },
                { status: 400 }
            );
        }

        // Create Razorpay order (always in INR)
        const order = await razorpay.orders.create(options);
        return NextResponse.json({
            id: order.id,
            currency: finalCurrency,
            amount: order.amount,
            amount_due: order.amount_due,
            amount_paid: order.amount_paid,
            receipt: order.receipt,
            status: order.status,
            attempts: order.attempts,
            notes: order.notes,
            created_at: order.created_at
        });

    } catch (error) {
        console.error('Razorpay order creation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to create order',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// app/api/razorpay/route.js (PUT handler)
export async function PUT(request) {
    await connectDB();
    try {
        const { order_id, payment_id, signature, amount, currency, bookingDetails } = await request.json();
        // console.log('Verifying payment:', { order_id, payment_id, bookingDetails });

        // Verify payment signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${order_id}|${payment_id}`)
            .digest('hex');

        if (generatedSignature !== signature) {
            console.error('Invalid signature:', { generatedSignature, signature });
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Generate booking ID and invoice number
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
        const bookingId = bookingDetails.bookingId || `HWR-${dateStr}`;
        const invoiceNumber = `INV${dateStr}`;

        // Prepare payment details
        const finalAmount = parseFloat(bookingDetails.finalAmount || amount || 0);
        const basePrice = parseFloat(bookingDetails.price); // 

        // Format payment details
        const paymentCurrency = bookingDetails.currency || currency || 'INR';
        const paymentDetails = {
            status: 'paid',
            amount: parseFloat(finalAmount.toFixed(2)),
            currency: paymentCurrency, // Store the actual payment currency
            originalCurrency: paymentCurrency,
            razorpayOrderId: order_id,
            razorpayPaymentId: payment_id,
            razorpaySignature: signature,
            paidAt: new Date(),
            method: 'razorpay',
            exchangeRate: 1, // No conversion happening, so rate is 1
            // Store amount in original currency (no conversion)
            amountInOriginalCurrency: parseFloat(finalAmount.toFixed(2)),
            // For USD payments, don't convert to INR
            amountInINR: paymentCurrency === 'USD' ? null : parseFloat(finalAmount.toFixed(2)),
            details: {       
                finalAmount: parseFloat(finalAmount.toFixed(2))
            },
            __v: 0
        };

        // Prepare booking data
        const bookingData = {
            ...bookingDetails,
            bookingId,
            invoiceNumber,
            price: parseFloat(basePrice.toFixed(2)),
            finalAmount: parseFloat(finalAmount.toFixed(2)),
            amountPaid: parseFloat(finalAmount.toFixed(2)),
            currency: paymentCurrency, // Store the payment currency
            payment: paymentDetails,
            status: 'confirmed',
            paymentStatus: 'paid',
            confirmedAt: new Date(),
            // Ensure accommodation type and numPersons are included
            accommodationType: bookingDetails.accommodationType || '',
            numPersons: parseInt(bookingDetails.numPersons) || '',
            __v: 0
        };

        // Clean up undefined values and convert numbers
        const cleanData = (obj) => {
            Object.keys(obj).forEach(key => {
                if (obj[key] === undefined) delete obj[key];
                if (typeof obj[key] === 'object' && obj[key] !== null) cleanData(obj[key]);
            });
            return obj;
        };

        const cleanedData = cleanData(bookingData);

        // Create booking with error handling
        let booking;
        try {
            booking = await BookingDetails.create(cleanedData);
            // console.log('Booking created:', booking._id);
            // console.log('Payment details saved:', booking.payment);
        } catch (error) {
            console.error('Error creating booking:', error);
            if (error.name === 'ValidationError') {
                console.error('Validation errors:', Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message,
                    value: error.errors[key].value
                })));
            }
            throw error;
        }

        // Update user's bookings if user is logged in
        if (bookingDetails.userId) {
            await User.findByIdAndUpdate(
                bookingDetails.userId,
                { $push: { bookings: booking._id } },
                { new: true }
            );
        }

        // Refresh the booking to get the latest data from DB
        const savedBooking = await BookingDetails.findById(booking._id).lean();
        
        return NextResponse.json({
            success: true,
            booking: savedBooking
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process booking',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                ...(error.name === 'ValidationError' && {
                    validationErrors: Object.keys(error.errors).reduce((acc, key) => {
                        acc[key] = error.errors[key].message;
                        return acc;
                    }, {})
                })
            },
            { status: 500 }
        );
    }
}