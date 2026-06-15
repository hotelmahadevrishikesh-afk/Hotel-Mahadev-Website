"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, X } from 'lucide-react';
import InvoiceModal from './InvoiceModal';
const stateList = [
    "Uttarakhand", "Uttar Pradesh", "Delhi", "Haryana", "Punjab", "Himachal Pradesh", "Rajasthan", "Maharashtra", "Karnataka", "Tamil Nadu", "Kerala", "West Bengal", "Gujarat", "Madhya Pradesh", "Bihar", "Jharkhand", "Goa", "Assam", "Odisha", "Chhattisgarh", "Telangana", "Andhra Pradesh", "Sikkim", "Tripura", "Nagaland", "Manipur", "Mizoram", "Meghalaya", "Arunachal Pradesh", "Jammu & Kashmir", "Ladakh"
];
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Bed, Phone, ParkingCircle, ShowerHead, Wifi, Tv, Bath, Elevator, Luggage, Coffee, Snowflake, Utensils } from 'lucide-react';
const amenityIcons = {
    'Restaurant': <Utensils size={16} />,
    'Bed': <Bed size={16} />,
    'Room Phone': <Phone size={16} />,
    'Parking': <ParkingCircle size={16} />,
    'Shower': <ShowerHead size={16} />,
    'Towel In Room': (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 16V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10M4 20h16M4 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2M4 20h16" /></svg>
    ),
    'Wi-Fi': <Wifi size={16} />,
    'Television': <Tv size={16} />,
    'Bath Tub': <Bath size={16} />,
    'Elevator': (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="6" y="3" width="12" height="18" rx="2" strokeWidth="2" />
            <path d="M9 9h6M9 13h6M12 16v2" strokeWidth="2" />
            <path d="M10.5 6l1.5-2 1.5 2" strokeWidth="2" />
        </svg>
    ),
    'Laggage': <Luggage size={16} />,
    'Tea Maker': <Coffee size={16} />,
    'Room AC': <Snowflake size={16} />,
};
import axios from 'axios';
import { toast } from 'react-hot-toast';
// For SSR rendering of invoice
// Will be dynamically imported when needed

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
// Add this function before your component
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (document.getElementById('razorpay-sdk')) {
            return resolve(true);
        }
        const script = document.createElement('script');
        script.id = 'razorpay-sdk';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};
const BookingDetails = ({ room, onClose, type }) => {
    const router = useRouter();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);
    const [bookingId, setBookingId] = useState('');
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [openAccordion, setOpenAccordion] = React.useState(null);
    // Step state
    const [step, setStep] = useState(1);
    // Form data state
    const [form, setForm] = useState({
        arrival: '',
        roomNo: '',
        days: 1,
        firstName: '',
        lastName: '',
        email: '',
        callNo: '',
        altCallNo: '',
        address: '',
        city: '',
        district: '',
        state: '',
        adult: '',
        infant: '',
        child: '',
        specialReq: '',
        offers: [],
    });
    const [invoiceData, setInvoiceData] = useState(null);
    // console.log(room)
    const roomName = room?.title || 'Room Name';
    const roomImg = room?.mainPhoto?.url || '/placeholder.jpeg';
    // Offer list
    const offerList = [
        'Rafting',
        'Local Sightseeing',
        'Pickup Require',
        'Dropp Off Require',
        'Bike On Rent',
        'Yoga Classes',
        'Spa & Massage',
    ];

    // Handlers
    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
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
            if (!form.roomNo) stepErrors.roomNo = 'Number of room is required';
            if (!form.days || form.days < 1) stepErrors.days = 'Number of days must be at least 1';
        } else if (step === 2) {
            if (!form.firstName) stepErrors.firstName = 'First name is required';
            if (!form.lastName) stepErrors.lastName = 'Last name is required';
            if (!form.email) stepErrors.email = 'Email is required';
            if (!form.callNo) stepErrors.callNo = 'Phone number is required';
            if (!form.address) stepErrors.address = 'Address is required';
            if (!form.city) stepErrors.city = 'City is required';
            if (!form.district) stepErrors.district = 'District is required';
            if (!form.state) stepErrors.state = 'State is required';
            if (!form.adult) stepErrors.adult = 'Number of adults is required';
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

    let stepContent;
    if (step === 1) {
        stepContent = (
            <>
                <div className="md:mb-6">
                    <div className="text-sm md:font-semibold italic text-md mb-2">Dear Guest, To proceed with your booking order and ensure smooth booking experience, we kindly request you to provide the following basic information.</div>
                    <hr className="mb-4 border-gray-300" />
                </div>
                <div className="md:mb-8">
                    <div className="text-sm md:text-xl font-bold text-md text-[#8a6a2f] my-2 md:mb-4">Arrival Date</div>
                    <div className="flex flex-col items-center md:mb-8">
                        <input
                            type="date"
                            className="w-full bg-gray-200 rounded-full px-5 py-2 text-md focus:outline-none appearance-none"
                            value={form.arrival}
                            onChange={e => handleChange('arrival', e.target.value)}
                        />
                        {errors.arrival && <div className="text-red-600 text-xs mt-1">{errors.arrival}</div>}
                    </div>
                    <div className="text-sm md:text-xl font-bold text-md text-[#8a6a2f] my-2 md:mb-4">Total Number Of Room</div>
                    <div className="flex flex-col items-center md:mb-8">
                        <input
                            id="roomNo"
                            type="text"
                            inputMode="numeric"
                            pattern="\d*"
                            maxLength={10}
                            placeholder="Enter Number Of Room"
                            className="w-full bg-gray-200 rounded-full px-5 py-2 text-md"
                            value={form.roomNo}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val) && val.length <= 10) {
                                    handleChange('roomNo', val);
                                }
                            }}
                        />
                        {errors.roomNo && <div className="text-red-600 text-xs mt-1">{errors.roomNo}</div>}
                    </div>

                    <div className="text-sm md:text-xl font-bold text-md text-[#8a6a2f] md:mb-3 my-1">Total Days For Stay</div>
                    <div className="flex items-center bg-gray-200 rounded-full px-2 py-2 w-full md:mb-8">
                        <button className="text-2xl px-4" onClick={() => handleChange('days', Math.max(1, (form.days || 1) - 1))}>-</button>
                        <span className="flex-1 text-center text-xl md:text-2xl font-semibold">{form.days || 1}</span>
                        {errors.days && <div className="text-red-600 text-xs mt-1">{errors.days}</div>}
                        <button className="text-2xl px-4" onClick={() => handleChange('days', (form.days || 1) + 1)}>+</button>
                    </div>
                </div>
                <div className="flex gap-2 md:mt-10 mt-5">
                    {step > 1 && (
                        <button className="px-4 py-2 bg-gray-200 rounded text-black text-sm" onClick={handlePrevStep}>
                            Back
                        </button>
                    )}
                    <button className="flex-1 bg-black text-white font-semibold text-lg py-1 md:py-4 rounded-md" onClick={handleNextStep}>
                        Looks Good, Keep Going
                    </button>
                </div>
            </>
        );
    } else if (step === 2) {
        stepContent = (
            <>
                <div className="md:overflow-y-auto md:max-h-[90vh] md:pr-2">
                    <div className="mb-2">
                        <div className="font-semibold italic mb-2">Dear Guest, To proceed with your booking order and ensure smooth booking experience, we kindly request you to provide the following basic information.</div>
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
                    <div className="font-bold text-md text-[#8a6a2f] mb-2">Total Number Of Person</div>
                    <div className="flex gap-4 mb-1">
                        <div className="w-[30%]">
                            <label htmlFor="adult" className="block text-xs font-medium text-gray-700 mb-1">Adult</label>
                            <input id="adult" type='number' placeholder="Adult" className="w-full bg-gray-200 rounded-full px-5 py-1 text-md" value={form.adult} onChange={e => handleChange('adult', e.target.value)} />
                            {errors.adult && <div className="text-red-600 text-xs mt-1">{errors.adult}</div>}
                        </div>
                        <div className="w-[30%]">
                            <label htmlFor="infant" className="block text-xs font-medium text-gray-700 mb-1">Infant</label>
                            <input id="infant" type='number' placeholder="Infant" className="w-full bg-gray-200 rounded-full px-5 py-1 text-md" value={form.infant} onChange={e => handleChange('infant', e.target.value)} />
                            {/* No validation for infant, but keep structure for consistency */}
                        </div>
                        <div className="w-[30%]">
                            <label htmlFor="child" className="block text-xs font-medium text-gray-700 mb-1">Child</label>
                            <input id="child" type='number' placeholder="Child" className="w-full bg-gray-200 rounded-full px-5 py-1 text-md" value={form.child} onChange={e => handleChange('child', e.target.value)} />
                        </div>
                    </div>
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
                <div className="font-bold text-md text-[#8a6a2f] mb-2">Any Special Additional Requirement (Optional) </div>
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
        const accordionSections = [
            {
                key: 'arrival',
                label: 'Date of Arrival',
                value: form.arrival || 'Not set',
            },
            {
                key: 'roomNo',
                label: 'Number of Room',
                value: form.roomNo || 'Not set',
            },
            {
                key: 'days',
                label: 'Number of Days',
                value: form.days || 'Not set',
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
                value: form.adult + ' Adult ' + (form.child ? form.child + ' Child ' : '') + (form.infant ? form.infant + ' Infant' : '') || 'Not set',
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
        const totalAmount = (room?.prices?.[0]?.prices?.[0]?.amount || 0) * form.days * form.roomNo;
        stepContent = (
            <>
                <div className="mb-6">
                    <div className="font-semibold italic text-[18px] mb-2">
                        You're almost done!
                    </div>
                    <div className="text-sm italic text-gray-700 mb-4">
                        Review your booking details before final confirmation.
                    </div>
                    <hr className="mb-4 border-gray-300" />
                </div>

                <div className="space-y-6">
                    {/* Booking Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-3">Booking Summary</h3>

                        <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between">
                                <span>Room Rate (per night):</span>
                                <span>₹{room?.prices?.[0]?.prices?.[0]?.amount?.toLocaleString('en-IN') || '0'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Number of Rooms:</span>
                                <span>{form.roomNo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Number of Nights:</span>
                                <span>{form.days}</span>
                            </div>
                            <div className="border-t border-gray-200 my-2"></div>
                            <div className="flex justify-between font-semibold">
                                <span>Total Amount:</span>
                                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                    {/* <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Currency
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <select
                                    className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#8a6a2f] focus:border-transparent"
                                    value={form.currency || 'Select'}
                                    onChange={(e) => {
                                        const selectedCurrency = e.target.value;
                                        const amount = selectedCurrency === 'INR'
                                            ? totalAmount
                                            : (totalAmount / 75).toFixed(2); // Convert to USD using a fixed rate of 75
                                        handleChange('currency', selectedCurrency);
                                        handleChange('amount', amount);
                                    }}
                                >
                                    <option value="Select">Select Currency</option>
                                    <option value="INR">INR (Indian Rupee)</option>
                                    <option value="USD">USD (US Dollar)</option>
                                </select>
                            </div>
                            <div className="flex-1 relative">
                                {form.currency && form.currency !== 'Select' && (
                                    <span className="absolute left-3 top-2 text-gray-500">
                                        {form.currency === 'INR' ? '₹' : '$'}
                                    </span>
                                )}
                                <input
                                    type="number"
                                    className={`w-full bg-gray-100 rounded-lg ${form.currency && form.currency !== 'Select' ? 'pl-8' : 'pl-4'} pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#8a6a2f] focus:border-transparent cursor-not-allowed`}
                                    value={form.amount || ''}
                                    disabled
                                    onChange={(e) => handleChange('amount', e.target.value)}
                                />
                            </div>
                        </div>
                    </div> */}

                    {/* Add to Cart Button */}
                    <div className="mt-8 flex items-center gap-2">
                        {step > 1 && <button className="px-4 py-3 bg-gray-200 rounded text-black text-sm" onClick={() => setStep(step - 1)}>Back</button>}
                        <button
                            className="flex-1 bg-black text-white font-semibold text-lg py-3 rounded-md"
                            onClick={async () => {
                                if (status === 'loading') return;
                                if (!session || !session.user) {
                                    router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
                                    return;
                                }
                                
                                try {
                                    if ((room?.type || type) === 'room') {
                                        // Generate booking ID
                                        function generateBookingId() {
                                            const now = new Date();
                                            const pad = n => n.toString().padStart(2, '0');
                                            const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
                                            return `HWR-${dateStr}`;
                                        }
                                        
                                        const bookingIdVal = generateBookingId();
                                        const priceList = (room.prices && room.prices[0] && room.prices[0].prices) || [];
                                        const mainPrice = priceList.find(p => p.type === '02 Pax') || 
                                                        priceList.find(p => p.type === '01 Pax') || 
                                                        priceList[0] || {};
                                        const baseAmount = mainPrice?.amount || 0;
                                        const extrabed = priceList.find(p => p.type === 'Extra Bed') || {};
                                        const extrabedAmount = extrabed?.amount || 0;
                                        const hasExtraBed = extrabedAmount > 0;

                                        // Calculate the total amount based on room rate, number of rooms, and number of days
                                        const roomRate = baseAmount;
                                        const numberOfRooms = parseInt(form.roomNo) || 1;
                                        const numberOfNights = parseInt(form.days) || 1;
                                        const subtotal = (roomRate * numberOfRooms * numberOfNights) + (hasExtraBed ? extrabedAmount : 0);
                                        const finalAmount = subtotal;
                                        const invoiceNumber = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}`;

                                        // Create the booking payload
                                        const bookingPayload = {
                                            ...form,
                                            specialReq: form.specialReq || '',
                                            offers: form.offers || [],
                                            bookingId: bookingIdVal,
                                            invoiceNumber,
                                            userId: session.user.id || session.user._id,
                                            roomId: room?._id,
                                            type: 'room',
                                            roomName: room?.title || '',
                                            priceBreakdown: {
                                                main: {
                                                    type: mainPrice?.type || '',
                                                    amount: baseAmount,
                                                },
                                                extraBed: hasExtraBed ? {
                                                    type: extrabed?.type || 'Extra Bed',
                                                    amount: extrabedAmount,
                                                } : null,
                                            },
                                            subtotal,
                                            finalAmount,
                                            paymentStatus: 'pending',
                                            status: 'pending',
                                        };

                                        // First, create the Razorpay order
                                        const response = await fetch('/api/razorpay', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                amount: finalAmount,
                                                currency: 'INR',
                                                receipt: `order_${Date.now()}`,
                                                customer: {
                                                    name: `${form.firstName || ''} ${form.lastName || ''}`.trim() || 'Guest User',
                                                    email: form.email || '',
                                                    contact: form.callNo || '0000000000'
                                                },
                                                bookingDetails: bookingPayload
                                            })
                                        });

                                        if (!response.ok) {
                                            const errorData = await response.json();
                                            throw new Error(errorData.error || 'Failed to create payment order');
                                        }

                                        const orderData = await response.json();

                                        // Initialize Razorpay options
                                        const options = {
                                            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                                            amount: orderData.amount,
                                            currency: orderData.currency,
                                            name: 'Hotel Mahadev Rishikesh',
                                            description: `Booking for ${room?.title || 'Room'}`,
                                            order_id: orderData.id,
                                            handler: async function (response) {
                                                try {
                                                    // Verify payment on server
                                                    const verificationResponse = await fetch('/api/razorpay', {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            order_id: orderData.id,
                                                            payment_id: response.razorpay_payment_id,
                                                            signature: response.razorpay_signature,
                                                            amount: finalAmount,
                                                            currency: 'INR',
                                                            bookingDetails: {
                                                                ...bookingPayload,
                                                                paymentStatus: 'paid',
                                                                status: 'confirmed',
                                                                payment: {
                                                                    status: 'paid',
                                                                    amount: finalAmount,
                                                                    currency: 'INR',
                                                                    originalCurrency: 'INR',
                                                                    exchangeRate: 1,
                                                                    amountInINR: finalAmount,
                                                                    razorpayOrderId: orderData.id,
                                                                    razorpayPaymentId: response.razorpay_payment_id,
                                                                    razorpaySignature: response.razorpay_signature,
                                                                    paidAt: new Date().toISOString(),
                                                                    method: 'razorpay',
                                                                    details: {
                                                                        basePrice: baseAmount,
                                                                        extraBed: hasExtraBed ? extrabedAmount : 0,
                                                                        cgst: 0,
                                                                        sgst: 0,
                                                                        totalGst: 0,
                                                                        finalAmount: finalAmount
                                                                    }
                                                                }
                                                            }
                                                        })
                                                    });

                                                    const verificationData = await verificationResponse.json();

                                                    if (!verificationResponse.ok) {
                                                        console.error('Verification failed:', verificationData);
                                                        throw new Error(verificationData.error || 'Payment verification failed');
                                                    }

                                                    // Update UI for successful payment
                                                    toast.success('Payment successful! Your booking is confirmed.');
                                                    setBookingId(bookingIdVal);
                                                    setShowConfirmation(true);
                                                    setInvoiceData(verificationData.booking);

                                                    // Send confirmation email if email exists
                                                    if (form.email) {
                                                        try {
                                                            const [{ default: ReactDOMServer }, { default: BeautifulInvoice }] = await Promise.all([
                                                                import('react-dom/server'),
                                                                import('./BeautifulInvoice'),
                                                            ]);
                                                            
                                                            const invoiceHtml = ReactDOMServer.renderToStaticMarkup(
                                                                <BeautifulInvoice
                                                                    booking={bookingPayload}
                                                                    bookingId={bookingIdVal}
                                                                    bookingDate={new Date()}
                                                                />
                                                            );

                                                            const emailRes = await fetch('/api/brevo', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    to: form.email,
                                                                    subject: `Your Booking Confirmation - ${room?.title || 'HOtel Mahadev'}`,
                                                                    invoiceNumber: invoiceNumber,
                                                                    htmlContent: invoiceHtml,
                                                                })
                                                            });

                                                            const emailData = await emailRes.json();
                                                            if (emailRes.ok) {
                                                                toast.success('Booking confirmation sent to your email!');
                                                            } else {
                                                                console.error('Email sending failed:', emailData);
                                                                toast.error('Failed to send booking confirmation email.');
                                                            }
                                                        } catch (emailError) {
                                                            console.error('Error sending email:', emailError);
                                                            toast.error('Error sending booking confirmation email');
                                                        }
                                                    }

                                                } catch (error) {
                                                    console.error('Payment verification error:', error);
                                                    toast.error(error.message || 'Payment verification failed. Please contact support.');
                                                }
                                            },
                                            prefill: {
                                                name: `${form.firstName || ''} ${form.lastName || ''}`.trim() || 'Guest User',
                                                email: form.email || '',
                                                contact: form.callNo || '0000000000'
                                            },
                                            theme: {
                                                color: '#8a6a2f'
                                            },
                                            modal: {
                                                ondismiss: function() {
                                                    toast.info('Payment was cancelled');
                                                }
                                            }
                                        };

                                        // Load Razorpay script if not already loaded
                                        if (!window.Razorpay) {
                                            const script = document.createElement('script');
                                            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                                            script.async = true;
                                            script.onload = () => {
                                                const rzp = new window.Razorpay(options);
                                                rzp.open();
                                            };
                                            script.onerror = () => {
                                                toast.error('Failed to load payment processor. Please try again.');
                                            };
                                            document.body.appendChild(script);
                                        } else {
                                            const rzp = new window.Razorpay(options);
                                            rzp.open();
                                        }

                                    } else {
                                        toast.error('Unsupported booking type');
                                    }
                                } catch (err) {
                                    console.error('Booking error:', err);
                                    toast.error(err.message || 'Booking failed. Please try again.');
                                }
                            }}
                        >
                            Make Confirm Order
                        </button>
                    </div>
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
            />
        );
    }
    if (showConfirmation) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={onClose}>
                <div className="bg-white rounded-2xl shadow-lg max-w-xl w-full p-8 relative flex flex-col items-start text-start" onClick={e => e.stopPropagation()}>
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
                    <div className="text-xl md:text-2xl italic font-bold mb-4 text-[#7a5b2b]">
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
                    <button className="w-full bg-black text-white rounded-md py-3 font-semibold text-lg hover:bg-gray-900" onClick={() => setShowInvoice(true)}>
                        Invoice Booking Voucher
                    </button>
                    <h2 className="text-center text-md font-semibold w-full my-2">OR</h2>

                    {/* Dashboard Link */}
                    <button className="w-full bg-red-400 text-white rounded-md py-3 font-semibold text-lg mb-3 text-red-600 font-semibold text-base italic cursor-pointer"
                        onClick={() => router.push(`/dashboard?orderId=${bookingId}`)}
                    >
                        Go To Dashboard &gt;&gt;
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-[#fcf9f4] rounded-2xl shadow-lg h-full overflow-y-auto md:h-fit max-w-4xl w-full flex flex-col md:flex-row p-5 gap-4 relative"onClick={e => e.stopPropagation()}>
                {/* Close button */}
                <button className="absolute top-1 right-1 bg-gray-500 rounded-full text-white p-1 hover:text-gray-700 text-xl font-bold" onClick={onClose}><X /></button>
                {/* Left: Step Content */}
                <div className="flex-1 max-w-[500px]">
                    {stepContent}
                </div>
                {/* Right: Room Summary */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-2 max-w-[350px] w-full flex flex-col">
                    <div className="w-full md:h-60 h-44 relative mb-3 rounded-lg overflow-hidden">
                        <Image src={roomImg} alt={roomName} fill className="object-contain" />
                    </div>
                    <div className="p-2">
                        <div className="flex items-center justify-between">
                            <div className="font-bold text-sm md:text-md mb-2">{roomName}</div>
                            <button
                                className="flex flex-col items-center justify-center bg-transparent border-0 p-0"
                                style={{ outline: 'none' }}
                                aria-label="Show reviews"
                            >
                                <div className="flex items-center">
                                    {[...Array(Math.round((room.reviews?.[0]?.rating || 5)))].map((_, i) => (
                                        <Star key={i} size={13} color="#12b76a" fill="#12b76a" className="inline" />
                                    ))}
                                </div>
                                <span className="text-xs md:text-sm text-gray-700 ml-1">
                                    Based On {room.reviews?.length || 0} Review{(room.reviews?.length || 0) !== 1 ? 's' : ''}
                                </span>
                            </button>
                        </div>
                        <div className="text-gray-800 text-xs md:text-sm">
                            {(() => {
                                const text = (room.paragraph || '').replace(/<[^>]+>/g, '');
                                const words = text.split(' ');
                                if (words.length > 15) {
                                    return words.slice(0, 15).join(' ') + '...';
                                }
                                return text;
                            })()}
                        </div>
                        <div className="font-semibold text-gray-800 text-sm mt-2">Room Amenities</div>
                        <div className="flex gap-2 mb-1 text-lg">
                            <TooltipProvider>
                                <div className="flex gap-2 mb-1 text-md flex-wrap">
                                    {(room.amenities || []).map((am, i) => (
                                        <Tooltip key={am._id || i}>
                                            <TooltipTrigger asChild>
                                                <span className="bg-gray-100 p-1 my-2 rounded flex items-center justify-center cursor-pointer">
                                                    {amenityIcons[am.label]}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                {am.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            </TooltipProvider>
                        </div>
                        {/* Occupancy & Extra Bed */}
                        {(() => {
                            const priceList = (room.prices && room.prices[0] && room.prices[0].prices) || [];
                            return (
                                <div className="flex gap-8 text-xs md:text-sm">
                                    <span>
                                        Max occupancy: {
                                            priceList.some(p => p.type === '02 Pax')
                                                ? '02 Pax'
                                                : priceList.some(p => p.type === '01 Pax')
                                                    ? '01 Pax'
                                                    : 'N/A'
                                        }
                                    </span>
                                    <span>
                                        Extra bed available: {
                                            priceList.some(p => p.type === 'Extra Bed') ? 'Yes' : 'No'
                                        }
                                    </span>
                                </div>
                            );
                        })()}
                        <hr className="my-1 border-gray-300" />
                        {(() => {
                            if (!room?.prices || !Array.isArray(room.prices) || room.prices.length === 0) {
                                return (
                                    <div className="text-red-600 font-semibold">No price data found for this room.<br />Check room.prices structure.</div>
                                );
                            }
                            const priceList = (room.prices && room.prices[0] && room.prices[0].prices) || [];
                            const mainPrice = priceList.find(p => p.type === '02 Pax') || priceList.find(p => p.type === '01 Pax') || priceList[0];

                            const baseAmount = mainPrice?.amount || 0;
                            const oldPrice = mainPrice?.oldPrice || 0;
                            const extrabed = priceList.find(p => p.type === 'Extra Bed');
                            const extrabedAmount = extrabed?.amount || 0;
                            const hasExtraBed = extrabedAmount > 0;
                            return (
                                <>
                                    <div className="font-bold text-md md:text-lg my-2">
                                        Room Price
                                        <span className="text-md text-gray-600">
                                            <span className="float-right text-black flex items-center gap-2">
                                                Rs&nbsp;{baseAmount.toLocaleString()}
                                                {oldPrice > 0 && (
                                                    <div className="text-xs md:text-sm text-gray-800 font-bold line-through">
                                                        Rs&nbsp;{oldPrice.toLocaleString()}
                                                    </div>
                                                )}
                                                / Night
                                            </span>
                                        </span>
                                    </div>
                                    {hasExtraBed && (
                                        <div className="flex justify-between mt-1">
                                            <span className='text-md md:text-lg font-bold'>Extra Bed Price</span>
                                            <div className="flex items-center gap-2">
                                                <span className='text-md md:text-lg text-black font-bold'>Rs&nbsp;{extrabedAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            );

                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
