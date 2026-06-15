"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MoveRight, Star, X } from 'lucide-react';
import InvoiceModal from './InvoiceModal';
const stateList = [
    "Uttarakhand", "Uttar Pradesh", "Delhi", "Haryana", "Punjab", "Himachal Pradesh", "Rajasthan", "Maharashtra", "Karnataka", "Tamil Nadu", "Kerala", "West Bengal", "Gujarat", "Madhya Pradesh", "Bihar", "Jharkhand", "Goa", "Assam", "Odisha", "Chhattisgarh", "Telangana", "Andhra Pradesh", "Sikkim", "Tripura", "Nagaland", "Manipur", "Mizoram", "Meghalaya", "Arunachal Pradesh", "Jammu & Kashmir", "Ladakh"
];
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
const PackageBookingModel = ({ packages, onClose, type }) => {
    // console.log(packages)

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);
    const [bookingId, setBookingId] = useState('');
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [openAccordion, setOpenAccordion] = useState(null);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const desc = packages.description?.overview || "No Description";
    const words = desc.split(' ');
    const [uploadedID, setUploadedID] = useState(null); // { url, key }
    const [selectedID, setSelectedID] = useState(null); // url
    const [uploadingID, setUploadingID] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [uploadProgressID, setUploadProgressID] = useState(0);

    useEffect(() => {
        // Check if Razorpay is already loaded
        if (window.Razorpay) {
            setRazorpayLoaded(true);
            return;
        }

        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            // console.log('Razorpay script loaded successfully');
            setRazorpayLoaded(true);
        };
        script.onerror = () => {
            console.error('Failed to load Razorpay script');
            toast.error('Failed to load payment processor. Please try again.');
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);
    // Step state
    const [step, setStep] = useState(1);
    // Form state
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        callNo: '',
        altCallNo: '',
        address: '',
        city: '',
        district: '',
        state: '',
        arrival: '',
        departure: '',
        specialReq: '',
        offers: [],
        type: type || 'packages',
        accommodationType: '',
        numPersons: 1
    });
    // Handle number of persons change
    const handleNumPersonsChange = (newValue) => {
        setForm(prev => ({
            ...prev,
            numPersons: newValue
        }));
    };

    // Handle accommodation type change
    const handleAccommodationChange = (e) => {
        setForm(prev => ({
            ...prev,
            accommodationType: e.target.value
        }));
    };

    // 1. Add this at the top with other state declarations
    const [selectedCurrency, setSelectedCurrency] = useState('INR');
    const [convertedPrice, setConvertedPrice] = useState(null);

    // 2. Add this effect to handle price display (no conversion needed - use API prices directly)
    useEffect(() => {
        const updatePrice = () => {
            const price = parseFloat(getSelectedPrice());
            if (isNaN(price)) {
                setConvertedPrice('0.00');
                return;
            }
            let finalPrice = price;
            if (form.numPersons === 8 || form.numPersons === 10) {
                finalPrice = price * form.numPersons;
            }
            setConvertedPrice(finalPrice.toFixed(2));
        };

        updatePrice();
    }, [selectedCurrency, form.accommodationType, form.numPersons]); // Add any other dependencies that affect price

    // 
    const [packagePrices, setPackagePrices] = useState({
        onePerson: [],
        twoPerson: [],
        threeToSeven: [],
        eightToTen: [],
        elevenToFourteen: [],
        fifteenToTwentyEight: []
    });


    // Get accommodations based on number of persons
    const getAvailableAccommodations = (num = form.numPersons) => {
        let accommodations = [];
        if (num >= 1 && num <= 7) accommodations = packagePrices.onePerson || [];
        else if (num >= 8 && num <= 9) accommodations = packagePrices.eightPerson || [];
        else if (num === 10) accommodations = packagePrices.tenPerson || [];
        else if (num >= 11 && num <= 14) accommodations = packagePrices.elevenToFourteenPerson || [];
        else if (num >= 15 && num <= 28) accommodations = packagePrices.fifteenToTwentyEightPerson || [];
        // If no accommodation is selected but we have options, select the first one
        if (accommodations.length > 0 && !form.accommodationType) {
            setForm(prev => ({
                ...prev,
                accommodationType: accommodations[0].type
            }));
        }
        return accommodations;
    };

    // Get selected accommodation price
    const getSelectedPrice = () => {
        const accommodations = getAvailableAccommodations();
        const selected = accommodations.find(acc => acc.type === form.accommodationType);
        if (!selected) return '0.00';
        return selectedCurrency === 'INR' ? selected.inr : selected.usd;
    };

    // Update package prices when component mounts or packages prop changes
    useEffect(() => {
        if (packages?.packagePrice) {
            setPackagePrices({
                onePerson: packages.packagePrice.onePerson || [],
                eightPerson: packages.packagePrice.eightPerson || [],
                tenPerson: packages.packagePrice.tenPerson || [],
                elevenToFourteenPerson: packages.packagePrice.elevenToFourteenPerson || [],
                fifteenToTwentyEightPerson: packages.packagePrice.fifteenToTwentyEightPerson || [],
            });
        }
    }, [packages]);
    const [invoiceData, setInvoiceData] = useState(null);
    const packageName = packages?.title || 'Room Name';
    const packageImg = packages?.gallery?.mainImage?.url || '/placeholder.jpeg';
    // Offer list
    const offerList = [
        'Rafting',
        'Local sightseeing',
        'Pickup Require',
        'Dropp Off Require',
        'Bike On Rent',
        'Yoga Classes',
        'Spa & Massage',
    ];

    // Handlers
    const handleChange = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    }
    const handleOfferToggle = offer => setForm(prev => ({ ...prev, offers: prev.offers.includes(offer) ? prev.offers.filter(o => o !== offer) : [...prev.offers, offer] }));

    // Step content
    // Error state for validation
    const [errors, setErrors] = useState({});

    // Validation function for each step
    const validateStep = () => {
        let stepErrors = {};
        if (step === 1) {
            if (!form.arrival) stepErrors.arrival = 'Arrival date is required';
            if (!form.id) stepErrors.id = 'Government ID upload is required';
        } else if (step === 2) {
            if (!form.firstName) stepErrors.firstName = 'First name is required';
            if (!form.lastName) stepErrors.lastName = 'Last name is required';
            if (!form.email) stepErrors.email = 'Email is required';
            if (!form.callNo) stepErrors.callNo = 'Phone number is required';
            if (!form.address) stepErrors.address = 'Address is required';
            if (!form.city) stepErrors.city = 'City is required';
            if (!form.district) stepErrors.district = 'District is required';
            if (!form.state) stepErrors.state = 'State is required';
        } else if (step === 3) {
            // No required fields in step 3, but you can add if needed
        }
        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    // Handler for next step with validation
    const handleNextStep = () => {
        if (validateStep()) {
            setErrors({});
            setStep(step + 1);
        }
    };

    // Handler for previous step
    const handlePrevStep = () => {
        setErrors({});
        setStep(step - 1);
    };
    const handleIDChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingID(true);
        setUploadProgressID(0);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/cloudinary", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("ID upload failed");
            const result = await res.json();
            setUploadedID(result); // { url, key }
            setSelectedID(result.url);
            setForm(prev => ({
                ...prev,
                id: result.url // or { url: result.url, key: result.key } if you want more info
            }));
            toast.success("Document uploaded successfully");
        } catch (err) {
            toast.error("Document upload failed");
        } finally {
            setUploadingID(false);
            setUploadProgressID(0);
        }
    };
    const handleRemoveID = async () => {
        setUploadedID(null);
        setSelectedID(null);
        if (uploadedID && uploadedID.key) {
            try {
                const res = await fetch('/api/cloudinary', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ publicId: uploadedID.key }),
                });
                const data = await res.json();
                if (!res.ok) {
                    toast.error('Cloudinary error: ' + (data.error || 'Failed to delete document'));
                }
            } catch (err) {
                toast.error('Failed to delete document');
            }
        }
    };
    const handleSuccessfulPayment = async (bookingData) => {
        // console.log('Processing successful payment:', bookingData);
        try {
            const invoiceNumber = `INV${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            const paymentDetails = {
                status: 'paid',
                amount: bookingData.amountPaid || bookingData.finalAmount,
                originalCurrency: bookingData.currency || 'INR',
                razorpayOrderId: bookingData.payment?.razorpayOrderId || bookingData.razorpayOrderId,
                razorpayPaymentId: bookingData.payment?.razorpayPaymentId || bookingData.paymentId,
                razorpaySignature: bookingData.payment?.razorpaySignature,
                paidAt: new Date().toISOString(),
                method: 'razorpay',
                exchangeRate: 1,
                amountInINR: bookingData.amountPaid || bookingData.finalAmount,
                details: {
                    basePrice: bookingData.price,
                    cgst: bookingData.cgst || 0,
                    sgst: bookingData.sgst || 0,
                    totalGst: (bookingData.cgst || 0) + (bookingData.sgst || 0),
                    finalAmount: bookingData.finalAmount
                }
            };

            const payload = {
                ...form,
                specialReq: form.specialReq,
                accommodationType: form.accommodationType,
                numPersons: form.numPersons,
                offers: form.offers,
                bookingId: bookingData.bookingId || `HWR-${Date.now()}`,
                invoiceNumber,
                userId: session.user.id || session.user._id,
                packagesId: packages?._id,
                type: 'packages',
                packageName: packages?.title || '',
                packagesPrices: {
                    onePerson: Array.isArray(packages?.packagePrice?.onePerson) ? packages.packagePrice.onePerson : [],
                    twoPerson: Array.isArray(packages?.packagePrice?.twoPerson) ? packages.packagePrice.twoPerson : [],
                    eightPerson: Array.isArray(packages?.packagePrice?.eightPerson) ? packages.packagePrice.eightPerson : [],
                    tenPerson: Array.isArray(packages?.packagePrice?.tenPerson) ? packages.packagePrice.tenPerson : [],
                    elevenToFourteenPerson: Array.isArray(packages?.packagePrice?.elevenToFourteenPerson) ? packages.packagePrice.elevenToFourteenPerson : [],
                    fifteenToTwentyEightPerson: Array.isArray(packages?.packagePrice?.fifteenToTwentyEightPerson) ? packages.packagePrice.fifteenToTwentyEightPerson : [],
                },
                packageIdImage: uploadedID || null,
                paymentStatus: 'paid',
                status: 'confirmed',
                confirmedAt: new Date().toISOString(),
                price: bookingData.price,
                finalAmount: bookingData.finalAmount,
                cgst: bookingData.cgst || 0,
                sgst: bookingData.sgst || 0,
                currency: bookingData.currency || 'INR',
                payment: paymentDetails
            };

            const res = await fetch('/api/bookingDetails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Booking submitted successfully!');
                setBookingId(payload.bookingId);
                setShowConfirmation(true);
                setInvoiceData(payload);

                // Send email with invoice if email exists
                if (form.email) {
                    try {
                        const [{ default: ReactDOMServer }, { default: BeautifulInvoice }] = await Promise.all([
                            import('react-dom/server'),
                            import('./BeautifulInvoice'),
                        ]);

                        const invoiceHtml = ReactDOMServer.renderToStaticMarkup(
                            <BeautifulInvoice
                                booking={payload}
                                bookingId={payload.bookingId}
                                bookingDate={new Date()}
                                invoiceNumber={invoiceNumber}
                            />
                        );

                        const emailRes = await fetch('/api/brevo', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                to: form.email,
                                subject: `Your Booking Confirmation - ${packages?.title || 'Hotel Mahadev'}`,
                                htmlContent: invoiceHtml,
                            })
                        });

                        const emailData = await emailRes.json();
                        if (emailRes.ok) {
                            toast.success('Booking confirmation sent to your email!');
                        } else {
                            toast.error('Failed to send booking confirmation email.');
                        }
                    } catch (err) {
                        console.error('Error sending email:', err);
                        toast.error('Error sending booking confirmation email');
                    }
                }
            } else {
                throw new Error(data.error || 'Failed to save booking');
            }
        } catch (error) {
            console.error('Error processing booking:', error);
            toast.error(error.message || 'Error processing your booking');
        }
    };

    let stepContent;
    if (step === 1) {
        stepContent = (
            <>
                <div className="md:mb-6 my-2">
                    <div className="font-semibold italic text-md mb-2">Dear Guest, To proceed with your booking order and ensure smooth booking experience, we kindly request you to provide the following basic information.</div>
                    <hr className="mb-4 border-gray-300" />
                </div>
                <div className="my-2 md:mb-8">
                    <div className="font-bold text-md text-[#8a6a2f] mb-4">Arrival Date</div>
                    <div className="flex flex-col items-center mb-8">
                        <input
                            type="date"
                            className="w-full bg-gray-200 rounded-full px-5 py-2 text-md focus:outline-none appearance-none"
                            value={form.arrival}
                            onChange={e => handleChange('arrival', e.target.value)}
                        />
                        {errors.arrival && <div className="text-red-600 text-xs mt-1">{errors.arrival}</div>}
                    </div>

                    <div className='p-2 rounded-lg bg-[#fff8ee]'>
                        <div className="font-semibold text-md mb-2">Kindly Provide Government-Approved ID for Office Use</div>
                        {selectedID ? (
                            <div className="my-2">
                                <img src={selectedID} alt="Uploaded ID" className="max-w-48 rounded" />
                                <div>
                                    <button onClick={handleRemoveID} className="text-white bg-red-500 px-4 py-2 my-2 rounded">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : uploadingID ? (
                            <div className='px-4 py-2 rounded bg-[#ff4d1c] text-white font-semibold text-lg cursor-pointer text-center' style={{
                                background: "#ff4d1c",
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: 22,
                                padding: "10px 0",
                                borderRadius: 28,
                                textAlign: "center",
                                marginBottom: 10
                            }}>
                                Uploading...
                            </div>
                        ) : (
                            <label style={{ display: "block", marginBottom: 10 }}>
                                <input type="file" accept="image/*" onChange={handleIDChange} style={{ display: "none" }} disabled={uploadingID} />
                                <div className='px-4 py-2 rounded-lg bg-[#ff4d1c] text-white font-semibold text-lg cursor-pointer text-center'>
                                    Upload From Here
                                </div>
                            </label>
                        )}
                        {errors.id && <div className="text-red-600 text-xs mt-2">{errors.id}</div>}
                        <div style={{ fontSize: 15, marginTop: 8 }}>
                            We request you to submit any one of the following valid government-issued identification documents for official records:
                            <br />
                            <span style={{ fontWeight: 600 }}>Aadhar Card, Passport, Driving Licence, Voter ID</span>
                            <br />
                            Your cooperation is appreciated.
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 mt-10">
                    {step > 1 && (
                        <button className="px-4 py-2 bg-gray-200 rounded text-black text-sm" onClick={handlePrevStep}>
                            Back
                        </button>
                    )}
                    <button className="flex-1 bg-black text-white font-semibold text-lg py-4 rounded-md" onClick={handleNextStep}>
                        Looks Good, Keep Going
                    </button>
                </div>
            </>
        );
    } else if (step === 2) {
        stepContent = (
            <>
                <div className="md:overflow-y-auto md:max-h-[85vh] md:pr-2">
                    <div className="mb-2">
                        <div className="font-semibold italic text-md mb-2">Dear Guest, To proceed with your booking order and ensure smooth booking experience, we kindly request you to provide the following basic information.</div>
                        <hr className="mb-2 border-gray-300" />
                    </div>
                    <div className="font-bold text-md text-[#8a6a2f] mb-2">Basic Profile</div>
                    <div className="flex gap-4 mb-1">
                        <div className="flex-1">
                            <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                            <input id="firstName" placeholder="First Name" className="w-full bg-gray-200 rounded-full px-5 py-1 text-md" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} />
                            {errors.firstName && <div className="text-red-600 text-xs mt-1">{errors.firstName}</div>}
                        </div>
                        <div className="flex-1">
                            <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                            <input id="lastName" placeholder="Last Name" className="w-full bg-gray-200 rounded-full px-5 py-1 text-md" value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} />
                            {errors.lastName && <div className="text-red-600 text-xs mt-1">{errors.lastName}</div>}
                        </div>
                    </div>
                    <div className="flex gap-4 mb-1">
                        <div className="flex-1">
                            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                            <input id="email" placeholder="@domain.com" className="w-full bg-gray-200 rounded-full px-5 py-1 text-md" value={form.email} onChange={e => handleChange('email', e.target.value)} />
                            {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email}</div>}
                        </div>
                    </div>
                    <div className="flex gap-4 mb-1">
                        <div className="flex-1">
                            <label htmlFor="callNo" className="block text-xs font-medium text-gray-700 mb-1">Call No.</label>
                            <input
                                id="callNo"
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={10}
                                placeholder="Call Number"
                                className="w-full bg-gray-200 rounded-full px-5 py-1 text-md"
                                value={form.callNo}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^\d*$/.test(val) && val.length <= 10) {
                                        handleChange('callNo', val);
                                    }
                                }}
                            />


                            {errors.callNo && <div className="text-red-600 text-xs mt-1">{errors.callNo}</div>}
                        </div>
                        <div className="flex-1">
                            <label htmlFor="altCallNo" className="block text-xs font-medium text-gray-700 mb-1">Alt. Call No.</label>
                            <input
                                id="altCallNo"
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={10}
                                placeholder="Alt Call Number"
                                className="w-full bg-gray-200 rounded-full px-5 py-1 text-md"
                                value={form.altCallNo}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^\d*$/.test(val) && val.length <= 10) {
                                        handleChange('altCallNo', val);
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <hr className="my-2 border-gray-300" />
                    <div className="font-bold text-md text-[#8a6a2f] mb-2">Your Address</div>
                    <div className="mb-1">
                        <div className="mb-2">
                            <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                            <input id="address" placeholder="Address" className="w-full bg-gray-200 rounded-full px-5 py-1 text-md" value={form.address} onChange={e => handleChange('address', e.target.value)} />
                            {errors.address && <div className="text-red-600 text-xs mt-1">{errors.address}</div>}
                        </div>
                        <div className="flex gap-2">
                            <div className="w-[30%]">
                                <label htmlFor="city" className="block text-xs font-medium text-gray-700 mb-1">City</label>
                                <input id="city" placeholder="City" className="w-full bg-gray-200 rounded-full px-5 py-1 text-md" value={form.city} onChange={e => handleChange('city', e.target.value)} />
                                {errors.city && <div className="text-red-600 text-xs mt-1">{errors.city}</div>}
                            </div>
                            <div className="w-[30%]">
                                <label htmlFor="district" className="block text-xs font-medium text-gray-700 mb-1">Dist.</label>
                                <input id="district" placeholder="Dist." className="w-full bg-gray-200 rounded-full px-5 py-1 text-md" value={form.district} onChange={e => handleChange('district', e.target.value)} />
                                {errors.district && <div className="text-red-600 text-xs mt-1">{errors.district}</div>}
                            </div>
                            <div className="w-[40%]">
                                <label htmlFor="state" className="block text-xs font-medium text-gray-700 mb-1">State</label>
                                <select
                                    id="state"
                                    className="w-full bg-gray-200 rounded-full px-5 py-2 text-md"
                                    value={form.state}
                                    onChange={e => handleChange('state', e.target.value)}
                                >
                                    {errors.state && <div className="text-red-600 text-xs mt-1">{errors.state}</div>}
                                    <option value="">State</option>
                                    {stateList.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <hr className="my-2 border-gray-300" />
                    <div className="text-xs text-gray-700 my-2">Disclaimer: All rooms are based on a minimum double occupancy (2 persons). Extra beds are subject to availability and may incur additional charges depending on occupancy. Room configuration and amenities may vary.</div>
                    <div className="text-xs text-gray-700 my-2">Child Policy: Children up to 6 years stay complimentary when sharing bed with parents. Children above 6 years will be considered as adults and charged accordingly.</div>
                    <div className="flex gap-2 mt-6">
                        {step > 1 && <button className="px-4 py-2 bg-gray-200 rounded text-black text-sm" onClick={() => setStep(step - 1)}>Back</button>}
                        <button className="flex-1 bg-black text-white font-semibold text-lg py-3 rounded-md" onClick={() => handleNextStep()}>Looks Good, Keep Going</button>
                    </div>
                </div>
            </>
        );
    } else if (step === 3) {
        stepContent = (
            <>
                <div className="mb-6">
                    <div className="font-semibold italic text-md mb-2">Dear Guest, To proceed with your booking order and ensure smooth booking experience, we kindly request you to provide the following basic information.</div>
                    <hr className="mb-4 border-gray-300" />
                </div>
                <div className="font-bold text-md text-[#8a6a2f] mb-2">Any Special Additional Requirement (Optional)</div>
                <textarea className="w-full bg-gray-200 rounded-xl px-5 py-4 text-lg mb-6 min-h-[80px]" placeholder="Type here..." value={form.specialReq} onChange={e => handleChange('specialReq', e.target.value)} />
                <div className="font-bold text-md text-[#8a6a2f] mb-2">Additional Offer <span className="text-xs font-normal text-black">Please Click On Check List</span></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    {offerList.map(offer => (
                        <label key={offer} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.offers.includes(offer)} onChange={() => handleOfferToggle(offer)} />
                            <span className="font-semibold text-[15px] text-[#8a6a2f]">{offer}</span>
                        </label>
                    ))}
                </div>
                <div className="text-xs text-gray-700 my-2">Disclaimer: All rooms are based on a minimum double occupancy (2 persons). Extra beds are subject to availability and may incur additional charges depending on occupancy. Room configuration and amenities may vary.</div>
                <div className="text-xs text-gray-700 my-2">Child Policy: Children up to 6 years stay complimentary when sharing bed with parents. Children above 6 years will be considered as adults and charged accordingly.</div>
                <div className="flex gap-2 mt-6">
                    {step > 1 && <button className="px-4 py-2 bg-gray-200 rounded text-black text-sm" onClick={() => setStep(step - 1)}>Back</button>}
                    <button className="flex-1 bg-black text-white font-semibold text-lg py-3 rounded-md" onClick={() => setStep(step + 1)}>Looks Good, Keep Going</button>
                </div>
            </>
        );
    } else if (step === 4) {
        // Accordion state for expanded section
        const accordionSections = [
            {
                key: 'arrival',
                label: 'Date of Arrival',
                value: form.arrival || 'Not set',
            },
            {
                key: 'Document Image',
                label: 'Document Image',
                value: form.id ? (
                    <img
                        src={form.id}
                        alt="Document"
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                ) : (
                    'Not Uploaded'
                ),
            },
            {
                key: 'basic',
                label: 'Basic Info',
                value: (
                    <div>
                        Name: {form.firstName} {form.lastName} <br />
                        Email: {form.email} <br />
                        Phone: {form.callNo}
                    </div>
                ),
            },
            {
                key: 'address',
                label: 'Your Address For Billing',
                value: form.address || 'Not set',
            },
            {
                key: 'persons',
                label: 'Total Number Of Person',
                value: form.numPersons || 'Not set',
            },
            {
                key: 'specialReq',
                label: 'Any specific requirements',
                value: form.specialReq || 'Not set',
            },
            {
                key: 'offers',
                label: 'Additional Offer',
                value: (
                    <div className='flex items-center gap-2'>
                        {form.offers.join(', ')}
                    </div>
                ) || 'Not set',
            },
        ];
        stepContent = (
            <>
                <div className="mb-6">
                    <div className="font-semibold italic text-[18px] mb-2">Final Booking Overview – Please Read Carefully Before Confirmation</div>
                    <div className="text-xs text-gray-700 mb-2">All rooms are based on double occupancy (minimum 2 persons). Extra beds are subject to availability. Please ensure all guest details, travel dates, and preferences are accurate. Changes after confirmation may be subject to availability and additional charges.</div>
                    <hr className="mb-4 border-gray-300" />
                </div>
                <div className="divide-y divide-gray-300 mb-6 max-h-[60vh] overflow-y-auto">
                    {accordionSections.map(section => (
                        <div key={section.key} className="py-2">
                            <div
                                className="flex justify-between items-center cursor-pointer select-none"
                                onClick={() => setOpenAccordion(openAccordion === section.key ? null : section.key)}
                            >
                                <span className="font-bold text-[#8a6a2f]">{section.label}</span>
                                <span className="text-xs text-gray-700">{openAccordion === section.key ? '▲' : '▼'}</span>
                            </div>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === section.key ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="text-sm text-gray-700 px-1 py-1">
                                    {section.value}
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
                <div className="flex gap-2 mt-6">
                    <button className="px-4 py-2 bg-gray-200 rounded text-black text-sm" onClick={() => setStep(step - 1)}>Back</button>
                    <button className="flex-1 bg-black text-white font-semibold text-lg py-3 rounded-md" onClick={() => setStep(step + 1)}>Looks Good, Keep Going</button>
                </div>
            </>
        );
    }
    else if (step === 5) {
        stepContent = (
            <>
                <div className="mb-6">
                    <div className="font-semibold italic text-[18px] mb-2">
                        You’re almost done!
                    </div>
                    <div className="text-sm italic text-gray-700 mb-4">
                        Select any optional details before finalizing your confirmation.
                    </div>
                    <hr className="mb-4 border-gray-300" />
                </div>

                <div className="space-y-6">
                    {/* Select Number Of Person */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Number Of Person
                        </label>
                        <select
                            className="w-full max-w-xs bg-gray-100 rounded-md px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#8a6a2f] focus:border-transparent"
                            value={form.numPersons || ''}
                            onChange={e => {
                                const val = Number(e.target.value);
                                handleNumPersonsChange(val);
                                // Reset accommodation type to first available for this group
                                let accs = [];
                                if (val >= 1 && val <= 7) accs = packagePrices.onePerson || [];
                                else if (val === 8) accs = packagePrices.eightPerson || [];
                                else if (val === 10) accs = packagePrices.tenPerson || [];
                                else if (val >= 11 && val <= 14) accs = packagePrices.elevenToFourteenPerson || [];
                                else if (val >= 15 && val <= 28) accs = packagePrices.fifteenToTwentyEightPerson || [];
                                setForm(prev => ({ ...prev, accommodationType: accs[0]?.type || '' }));
                            }}
                        >
                            <option value="">Select Number of Person</option>
                            {[...Array.from({ length: 8 }, (_, i) => i + 1), ...Array.from({ length: 19 }, (_, i) => i + 10)].map(num => (
                                <option key={num} value={num}>{num} Person{num > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                    </div>

                    {/* Select Accommodation Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Accommodation Type
                        </label>
                        <select
                            className="w-full max-w-sm bg-gray-100 rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#8a6a2f] focus:border-transparent"
                            value={form.accommodationType || ''}
                            onChange={handleAccommodationChange}
                        >
                            <option value="">Select Accommodation</option>
                            {getAvailableAccommodations().map((acc, index) => (
                                <option key={index} value={acc.type}>
                                    {acc.type}  ({selectedCurrency === 'INR' ? acc.inr : acc.usd} {selectedCurrency})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Package Price
                        </label>
                        <div className="text-xl font-bold text-gold-900">
                            {selectedCurrency === 'INR' ? '₹' : '$'}
                            {(() => {
                                const perPerson = parseFloat(getSelectedPrice()) || 0;
                                const numPersons = Number(form.numPersons) || 1;
                                return `${perPerson.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} × ${numPersons} = ${(perPerson * numPersons).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
                            })()}
                            <span className="text-sm font-normal text-gray-500 ml-2">({selectedCurrency})</span>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Currency
                        </label>
                        <select
                            value={selectedCurrency}
                            onChange={(e) => setSelectedCurrency(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        >
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="USD">US Dollar ($)</option>
                        </select>

                    </div>
                </div>
                {/* Continue Button */}
                <div className="flex gap-2 mt-6">
                    {step > 1 && <button className="px-4 py-2 bg-gray-200 rounded text-black text-sm" onClick={() => setStep(step - 1)}>Back</button>}
                    <button
                        className="flex-1 bg-black text-white font-semibold text-lg py-3 rounded-md"
                        onClick={async () => {
                            if (status === 'loading') return;
                            if (!session || !session.user) {
                                router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
                                return;
                            }

                            if (!razorpayLoaded) {
                                toast.error('Payment processor is still loading. Please wait...');
                                return;
                            }

                            const selectedPrice = parseFloat(getSelectedPrice());
                            if (!selectedPrice || isNaN(selectedPrice)) {
                                toast.error('Please select a valid accommodation type');
                                return;
                            }

                            try {
                                const selectedPrice = parseFloat(getSelectedPrice());
                                if (!selectedPrice || isNaN(selectedPrice)) {
                                    toast.error('Please select a valid price');
                                    return;
                                }
                                // Create Razorpay order
                                const totalAmount = selectedPrice * (Number(form.numPersons) || 1); // always total price

                                const response = await fetch('/api/razorpay', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        amount: totalAmount, // Send total for 8/10 persons
                                        currency: selectedCurrency,
                                        receipt: `order_${Date.now()}`,
                                        customer: {
                                            name: `${form.firstName} ${form.lastName}`.trim(),
                                            email: form.email,
                                            contact: form.callNo || '0000000000' // Provide a default contact number
                                        }
                                    })
                                });

                                if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.error || 'Failed to create order');
                                }

                                const orderData = await response.json();

                                if (!response.ok) {
                                    throw new Error(orderData.error || 'Failed to create payment order');
                                }

                                const options = {
                                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                                    amount: orderData.amount,
                                    currency: orderData.currency,
                                    name: 'Hotel Mahadev',
                                    description: `Booking for ${packages?.title}`,
                                    order_id: orderData.id,
                                    handler: async function (response) {
                                        try {
                                            // Format dates properly
                                            const formatDate = (date) => {
                                                if (!date) return new Date();
                                                return typeof date === 'string' ? new Date(date) : date;
                                            };


                                            const totalAmount = selectedPrice * (Number(form.numPersons) || 1);

                                            const bookingData = {
                                                ...form,
                                                packagesId: packages?._id,
                                                packageName: packages?.title,
                                                numPersons: Number(form.numPersons) || 1,
                                                accommodationType: form.accommodationType || 'Standard',
                                                price: selectedPrice, // Base price per person
                                                finalAmount: totalAmount, // Total amount for payment
                                                amountPaid: totalAmount,
                                                currency: selectedCurrency || 'INR',
                                                paymentStatus: 'paid',
                                                payment: {
                                                    status: 'paid',
                                                    amount: totalAmount,
                                                    currency: selectedCurrency || 'INR',
                                                    originalCurrency: selectedCurrency || 'INR',
                                                    exchangeRate: 1,
                                                    // Only set amountInINR for INR payments, null for USD
                                                    amountInINR: selectedCurrency === 'USD' ? null : totalAmount,
                                                    amountInOriginalCurrency: totalAmount,
                                                    razorpayOrderId: orderData.id,
                                                    razorpayPaymentId: response.razorpay_payment_id,
                                                    razorpaySignature: response.razorpay_signature,
                                                    paidAt: new Date().toISOString(),
                                                    method: 'razorpay',
                                                    details: {
                                                        basePrice: selectedPrice,
                                                        cgst: 0,
                                                        sgst: 0,
                                                        totalGst: 0,
                                                        finalAmount: totalAmount
                                                    }
                                                },
                                                userId: session?.user?.id || null,
                                                arrival: formatDate(form.arrival),
                                                departure: formatDate(form.departure) || null,
                                                firstName: form.firstName || 'Guest',
                                                lastName: form.lastName || 'User',
                                                email: form.email || '',
                                                callNo: form.callNo || '',
                                                altCallNo: form.altCallNo || '',
                                                address: form.address || '',
                                                city: form.city || '',
                                                district: form.district || '',
                                                state: form.state || '',
                                                specialReq: form.specialReq || '',
                                                offers: form.offers || [],
                                                type: 'packages',
                                                // Add package prices to the booking data
                                                packagesPrices: packages?.packagePrice || {}
                                            };

                                            // Remove any undefined values
                                            Object.keys(bookingData).forEach(key => {
                                                if (bookingData[key] === undefined) {
                                                    delete bookingData[key];
                                                }
                                            });

                                            const verificationResponse = await fetch('/api/razorpay', {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    order_id: orderData.id,
                                                    payment_id: response.razorpay_payment_id,
                                                    signature: response.razorpay_signature,
                                                    amount: selectedPrice,
                                                    currency: selectedCurrency,
                                                    bookingDetails: bookingData
                                                })
                                            });

                                            const verificationData = await verificationResponse.json();

                                            if (!verificationResponse.ok) {
                                                console.error('Verification failed:', verificationData);
                                                throw new Error(verificationData.error || 'Payment verification failed');
                                            }

                                            // Handle successful payment
                                            await handleSuccessfulPayment(verificationData.booking);

                                        } catch (error) {
                                            console.error('Payment verification error:', error);
                                            toast.error(error.message || 'Payment verification failed. Please contact support.');
                                        }
                                    },
                                    prefill: {
                                        name: `${form.firstName} ${form.lastName}`.trim(),
                                        email: form.email,
                                        contact: form.callNo
                                    },
                                    theme: {
                                        color: '#8a6a2f'
                                    },
                                    modal: {
                                        ondismiss: function () {
                                            toast.info('Payment was cancelled');
                                        }
                                    }
                                };

                                const rzp = new window.Razorpay(options);
                                rzp.open();
                            } catch (error) {
                                console.error('Payment error:', error);
                                toast.error(error.message || 'Payment processing failed');
                            }
                        }}
                    >
                        Pay Now
                    </button>
                </div>
            </>
        );
    }


    useEffect(() => {
        document.body.style.overflow = (showConfirmation || step > 0) ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showConfirmation, step]);
    if (showInvoice) {
        return (
            <InvoiceModal
                open={showInvoice}
                onClose={() => setShowInvoice(false)}
                booking={invoiceData}
                bookingId={bookingId}
                bookingDate={new Date()}
                invoiceNumber={invoiceData.invoiceNumber}
            />
        );
    }
    if (showConfirmation) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-2xl shadow-lg max-w-xl w-full p-8 relative flex flex-col items-start text-start">
                    <button
                        className="absolute top-3 right-3 bg-gray-400 rounded-full text-white p-2 hover:text-gray-700 text-xl font-bold"
                        onClick={onClose}
                    >
                        <span style={{ fontSize: '1.2em' }}><X /></span>
                    </button>

                    {/* Booking Order Number */}
                    <div className="text-md font-bold mb-2 tracking-wider flex">
                        Booking Order No.: <span className="ml-2 text-blue-800">{bookingId}</span>
                    </div>

                    {/* Confirmation Title */}
                    <div className="text-xl md:text-2xl italic font-bold md:mb-4 mb-2 text-[#7a5b2b]">
                        Booking Order Under Review
                    </div>

                    {/* Confirmation Message */}
                    <div className="text-sm md:text-base text-black mb-6 leading-relaxed">
                        Dear Guest, Thank you for choosing to stay with us. We are pleased to confirm that we have received your booking request.

                        Our team is now reviewing the details and will ensure all necessary arrangements are in place for your comfortable stay. You will receive a confirmation via email or phone call shortly.

                        If you have any special requests or need assistance, please feel free to contact us.
                        <br /><br />
                        <span className="font-semibold">We look forward to welcoming you!</span>
                    </div>

                    {/* Invoice Button */}
                    <button className="w-full bg-black text-white rounded-md py-3 font-semibold text-lg md:mb-3 hover:bg-gray-900" onClick={() => setShowInvoice(true)}>
                        Invoice Booking Voucher
                    </button>
                    <h2 className="text-center text-md font-semibold w-full my-2">OR</h2>


                    {/* Dashboard Link */}
                    <button className="w-full bg-red-400 text-white rounded-md py-3 font-semibold text-lg mb-3 text-red-600 font-semibold text-base italic cursor-pointer"
                        onClick={() => router.push(`/dashboard?orderId=${bookingId}`)}
                    >
                        Go To Dashboard
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-[#fcf9f4] rounded-2xl shadow-lg h-fit overflow-y-auto md:h-fit max-w-4xl w-full flex flex-col md:flex-row p-5 gap-4 relative">
                {/* Close button */}
                <button className="absolute top-1 right-1 bg-gray-500 rounded-full text-white p-1 hover:text-gray-700 text-xl font-bold" onClick={onClose}><X /></button>
                {/* Left: Step Content */}
                <div className="flex-1 max-w-[500px]">
                    {stepContent}
                </div>

                {/* Right: Room Summary */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-2 max-w-[350px] w-full flex flex-col h-[80vh] overflow-y-auto">
                    <div className="w-full h-60 relative mb-3 rounded-lg">
                        {packageImg ? (
                            <Image
                                src={packageImg}
                                alt={packageName}
                                fill
                                className="object-contain"
                                priority
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-gray-500">No image available</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        <div className="flex items-center justify-between">
                            <div className="font-bold text-md mb-2">{packageName}</div>
                            {packages?.code && (
                                <span className="text-sm text-black my-2 md:my-0 w-fit font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">Code: {packages?.code}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mb-3 md:mb-0">
                            <span className="font-semibold flex items-center">
                                {(() => {
                                    if (Array.isArray(packages?.reviews) && packages.reviews.length > 0) {
                                        const avg = packages.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / packages.reviews.length;
                                        return avg.toFixed(1);
                                    }
                                    return "0";
                                })()} Rating</span>
                            <span className="text-gray-700 text-sm">({packages.reviews?.length || 0} customer reviews)</span>
                        </div>
                        {(() => {

                            if (desc === "No Description") {
                                return <p className="text-gray-700 mb-4 max-w-lg">No Description</p>;
                            }
                            if (showFullDesc || words.length <= 10) {
                                return (
                                    <div className="text-gray-700 my-6 text-md max-w-lg">
                                        <div dangerouslySetInnerHTML={{ __html: desc }} />
                                        {words.length > 10 && (
                                            <>
                                                {' '}<button className="text-blue-600 underline ml-2" onClick={() => setShowFullDesc(false)}>Close</button>
                                            </>
                                        )}
                                    </div>
                                );
                            }
                            return (
                                <div className="text-gray-700 my-4 text-md">
                                    <div dangerouslySetInnerHTML={{ __html: words.slice(0, 15).join(' ') + '...' }} />
                                    <button className="text-blue-600 underline" onClick={() => setShowFullDesc(true)}>Read more</button>
                                </div>
                            );
                        })()}
                        <div className="mb-6">
                            {/* Package Price Table */}
                            <div className="text-green-800 font-bold text-sm mb-1 text-right">Package Price: Base Rate</div>
                            <table className="w-full border-separate border p-2 border-black">
                                <thead>
                                    <tr className="bg-orange-100">
                                        <th className="text-green-800 text-sm font-semibold px-2 py-2 text-left rounded-tl-sm border border-black">Accommodation Type</th>
                                        <th className="text-green-800 text-sm font-semibold px-2 py-2 text-left border border-black">In INR</th>
                                        <th className="text-green-800 text-sm font-semibold px-1 py-2 text-left rounded-tr-lg border border-black">US Dollar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* One Person */}
                                    {Array.isArray(packages?.packagePrice?.onePerson) && packages?.packagePrice.onePerson.length > 0 && (
                                        <>
                                            <tr>
                                                <td colSpan={3} className="font-semibold text-sm text-black text-start px-2 border border-black">
                                                    Base Price : 01 Person
                                                </td>
                                            </tr>
                                            {packages?.packagePrice.onePerson.map((item, idx) => (
                                                <tr key={`onePerson-${idx}`} className="bg-blue-200">
                                                    <td className="px-3 py-1 border border-black">{item.type || "1 Person"}</td>
                                                    <td className="px-3 py-1 border border-black">{item.inr}</td>
                                                    <td className="px-3 py-1 border border-black">{item.usd}</td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                    {/* Eight Person */}
                                    {Array.isArray(packages?.packagePrice?.eightPerson) && packages?.packagePrice.eightPerson.length > 0 && (
                                        <>
                                            <tr><td colSpan={3} className="font-semibold text-black text-start px-2 py-1 text-sm border border-black">
                                                Base Price : 08 Person
                                            </td>
                                            </tr>
                                            {packages?.packagePrice.eightPerson.map((item, idx) => (
                                                <tr key={`eightPerson-${idx}`} className="bg-blue-200">
                                                    <td className="px-3 py-1 border border-black">{item.type || "8 Person"}</td>
                                                    <td className="px-3 py-1 border border-black">{item.inr}</td>
                                                    <td className="px-3 py-1 border border-black">{item.usd}</td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                    {/* Ten Person */}
                                    {Array.isArray(packages?.packagePrice?.tenPerson) && packages?.packagePrice.tenPerson.length > 0 && (
                                        <>
                                            <tr><td colSpan={3} className="font-semibold text-black text-start px-2 py-1 text-sm md:text-md border border-black">
                                                Base Price : 10 Person Minimum
                                            </td>
                                            </tr>
                                            {packages?.packagePrice?.tenPerson.map((item, idx) => (
                                                <tr key={`tenPerson-${idx}`} className="bg-blue-200">
                                                    <td className="px-3 py-2 font-bold border border-black">{item.type || "8 Person"}</td>
                                                    <td className="px-3 py-2 border border-black">{item.inr}</td>
                                                    <td className="px-3 py-2 border border-black">{item.usd}</td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                    {/* Eleven To Fourteen Person */}
                                    {Array.isArray(packages?.packagePrice?.elevenToFourteenPerson) && packages?.packagePrice.elevenToFourteenPerson.length > 0 && (
                                        <>
                                            <tr><td colSpan={3} className="font-semibold text-black text-start px-2 py-1 text-sm md:text-md border border-black">
                                                Base Price : 11 to 14 Person Minimum
                                            </td>
                                            </tr>
                                            {packages?.packagePrice?.elevenToFourteenPerson.map((item, idx) => (
                                                <tr key={`elevenToFourteenPerson-${idx}`} className="bg-blue-200">
                                                    <td className="px-3 py-2 font-bold border border-black">{item.type || "11 to 14 Person"}</td>
                                                    <td className="px-3 py-2 border border-black">{item.inr}</td>
                                                    <td className="px-3 py-2 border border-black">{item.usd}</td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                    {/* Fifteen To Eighteen Person */}
                                    {Array.isArray(packages?.packagePrice?.fifteenToTwentyEightPerson) && packages?.packagePrice.fifteenToTwentyEightPerson.length > 0 && (
                                        <>
                                            <tr><td colSpan={3} className="font-semibold  text-black text-start px-2 py-1 text-sm md:text-md border border-black">
                                                Base Price : 15 to 28 Person Minimum
                                            </td>
                                            </tr>
                                            {packages?.packagePrice?.fifteenToTwentyEightPerson.map((item, idx) => (
                                                <tr key={`fifteenToTwentyEightPerson-${idx}`} className="bg-blue-200">
                                                    <td className="px-3 py-2 font-bold border border-black">{item.type || "15 to 28 Person"}</td>
                                                    <td className="px-3 py-2 border border-black">{item.inr}</td>
                                                    <td className="px-3 py-2 border border-black">{item.usd}</td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageBookingModel;
