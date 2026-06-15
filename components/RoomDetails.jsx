"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, Share2, Ruler, Mail, Star, MapPin, InfoIcon, X } from "lucide-react"
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "./ui/dialog";
import VisuallyHidden from '@/components/VisuallyHidden';
import Autoplay from "embla-carousel-autoplay";
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import {
    Bed,
    Phone,
    ParkingCircle,
    ShowerHead,
    Wifi,
    Tv,
    Bath,
    Luggage,
    Coffee,
    Snowflake,
    Utensils,
} from "lucide-react";
import BookingDetails from "./BookingDetails";
import FeaturedRoomsClient from "./FeaturedRoomsClient";
// Amenity icons mapping (copied from ArtisanList)
const amenityIcons = {
    Restaurant: <Utensils size={20} />,
    Bed: <Bed size={20} />,
    "Room Phone": <Phone size={20} />,
    Parking: <ParkingCircle size={20} />,
    Shower: <ShowerHead size={20} />,
    "Towel In Room": (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10M4 20h16M4 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2M4 20h16"
            />
        </svg>
    ),
    "Wi-Fi": <Wifi size={20} />,
    Television: <Tv size={20} />,
    "Bath Tub": <Bath size={20} />,
    Elevator: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="6" y="3" width="12" height="18" rx="2" strokeWidth="2" />
            <path d="M9 9h6M9 13h6M12 16v2" strokeWidth="2" />
            <path d="M10.5 6l1.5-2 1.5 2" strokeWidth="2" />
        </svg>
    ),
    Laggage: <Luggage size={20} />,
    "Tea Maker": <Coffee size={20} />,
    "Room AC": <Snowflake size={20} />,
};
export default function RoomDetailView({ data }) {
    // ...other state
    const [showPdfModal, setShowPdfModal] = useState(false);
    const { data: session, status } = useSession();
    const pathname = usePathname();
    // console.log(data);
    // --- Ask An Expert Modal State ---
    const [showExpertModal, setShowExpertModal] = useState(false);
    const [expertForm, setExpertForm] = useState({
        name: '',
        email: '',
        phone: '',
        need: 'Appointment',
        question: '',
        contactMethod: 'Phone',
    });
    const handleExpertInputChange = (e) => {
        const { name, value, type } = e.target;
        setExpertForm((prev) => ({
            ...prev,
            [name]: type === 'radio' ? value : value,
        }));
    };
    const handleExpertSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...expertForm,
                type: 'room',
                room: data._id,
                queryName: data.title || ''
            };
            const res = await fetch('/api/askExpertsEnquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const error = await res.json();
                toast.error(error.message || 'Failed to submit your question.');
                return;
            }
            setShowExpertModal(false);
            setExpertForm({
                name: '',
                email: '',
                phone: '',
                need: 'Appointment',
                question: '',
                contactMethod: 'Phone',
            });
            toast.success('Your question has been submitted!');
        } catch (err) {
            toast.error('Failed to submit your question.');
        }
    };
    const router = useRouter();
    const [showShareBox, setShowShareBox] = React.useState(false);
    const [productUrl, setProductUrl] = React.useState("");

    React.useEffect(() => {
        if (typeof window !== "undefined" && data && data._id) {
            setProductUrl(window.location.origin + "/room/" + data.title);
        } else if (data && data._id) {
            setProductUrl("/room/" + data.title);
        }
    }, [data]);

    const [rooms, setRooms] = useState([]);
    // console.log(rooms)

    useEffect(() => {
        if (!data?.slug) return;
        fetch(`/api/room/relatedRooms?slug=${encodeURIComponent(data.slug)}`)
            .then(res => res.json())
            .then(res => setRooms(res.relatedRooms || []));
    }, [data?.slug]);



    // Close share box when clicking outside
    React.useEffect(() => {
        if (!showShareBox) return;
        function handleClick(e) {
            const pop = document.getElementById("share-popover");
            if (pop && !pop.contains(e.target)) {
                setShowShareBox(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [showShareBox]);

    const [showFullDesc, setShowFullDesc] = React.useState(false);
    const desc = data.paragraph || "No Description";
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const words = desc.split(' ');
    // Gather all images (main + sub) at the top-level
    // Gather all images, filter out empty/undefined/null, and fallback to placeholder if empty
    const allImagesRaw = [data.mainPhotot?.url, ...(data.relatedPhotos?.map(img => img.url) || [])];
    const allImages = allImagesRaw.filter(img => typeof img === 'string' && img.trim().length > 0);
    if (allImages.length === 0) allImages.push('/placeholder.jpeg');
    // Debug main image array and index
    // Embla carousel API and active image index for main image gallery
    const [carouselApi, setCarouselApi] = React.useState(null);
    const [activeImageIdx, setActiveImageIdx] = React.useState(0);
    React.useEffect(() => {
        if (!carouselApi) return;
        const onSelect = () => {
            const idx = carouselApi.selectedScrollSnap();
            setActiveImageIdx(idx);
        };
        carouselApi.on('select', onSelect);
        setActiveImageIdx(carouselApi.selectedScrollSnap());
        return () => carouselApi.off('select', onSelect);
    }, [carouselApi]);
    return (
        <div className="w-full flex flex-col items-center justify-center md:py-10">
            <div className="w-full md:max-w-[80%] flex flex-col md:flex-row gap-4" >
                {/* LEFT: Product Images */}
                <div className="w-full md:w-2/3 flex flex-col items-center md:px-10 px-2">
                    {/* Main Image Carousel (QuickView style, embla-controlled) */}
                    <div className="w-full flex justify-center md:mb-4">
                        <div className="relative w-full md:max-w-[800px] h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden md:p-4 rounded-lg">
                            <Carousel
                                className="w-full h-full"
                                opts={{ loop: true }}
                                plugins={[Autoplay({ delay: 4000 })]}
                                setApi={setCarouselApi}
                            >
                                <CarouselContent className="h-[300px] md:h-[400px]">
                                    {allImages.map((img, idx) => (
                                        <CarouselItem key={idx} className="flex items-center justify-center h-full">
                                          <div className="relative w-full h-[270px] md:h-[400px] flex items-center justify-center">
                                                <Image
                                                    src={img}
                                                    alt={`Room image ${idx}`}
                                                    layout="fill"
                                                    className="w-full h-full object-contain"
                                                    draggable={false}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        transition: 'transform 0.3s',
                                                    }}
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselNext className="!right-2 !top-1/2 !-translate-y-1/2 z-10 " />
                                <CarouselPrevious className="!left-1 !top-1/2 !-translate-y-1/2 z-10" />
                            </Carousel>
                        </div>
                    </div>
                    {/* Sub-Images Carousel (5 per row) */}
                    {allImages.length > 1 && (
                        <div className="w-full md:px-10 px-2">
                            <Carousel opts={{ align: 'start', loop: allImages.length > 5 }} className="w-full">
                                <CarouselContent>
                                    {allImages.map((img, idx) => (
                                        <CarouselItem key={idx} className="flex justify-center md:basis-1/8 basis-1/4 md:max-w-[15%] min-w-0">
                                            <button
                                                className={`rounded-lg border-2 ${activeImageIdx === idx ? 'border-black' : 'border-gray-200'} focus:outline-none `}
                                                onClick={() => carouselApi && carouselApi.scrollTo(idx)}
                                                style={{ minWidth: 64, minHeight: 64 }}
                                            >
                                                <Image
                                                    src={img}
                                                    alt={`${data.title} thumb ${idx + 1}`}
                                                    width={64}
                                                    height={64}
                                                    className="rounded-lg object-cover w-16 h-16"
                                                />
                                            </button>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                {allImages.length > 5 && (
                                    <>
                                        <CarouselNext className="!right-1 !top-1/2 !-translate-y-1/2 z-10 " />
                                        <CarouselPrevious className="!left-1 !top-1/2 !-translate-y-1/2 z-10" />
                                    </>
                                )}
                            </Carousel>
                        </div>
                    )}
                </div>
                <div className="w-full lg:w-1/3 flex flex-col px-5 md:px-2">
                    <div className="">
                        <div className="w-full flex flex-col">
                            <div className="flex items-center gap-4 mb-1 justify-between">
                                <h1 className="md:text-2xl text-md font-bold">{data.title}</h1>
                                {data.code && (
                                    <span className="text-sm text-black my-2 md:my-0 w-fit font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">Code: {data.code}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 md:mb-3">
                                <span className="font-semibold flex items-center text-sm md:text-md">
                                    {(() => {
                                        if (Array.isArray(data?.reviews) && data.reviews.length > 0) {
                                            const avg = data.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / data.reviews.length;
                                            return avg.toFixed(1);
                                        }
                                        return "0";
                                    })()} Rating</span>
                                <span className="text-gray-700 text-sm">({data.reviews?.length || 0} customer reviews)</span>
                            </div>
                            {(() => {

                                if (desc === "No Description") {
                                    return <p className="text-gray-700 mb-4 max-w-lg">No Description</p>;
                                }
                                if (showFullDesc || words.length <= 20) {
                                    return (
                                        <div className="text-gray-700 my-6 text-md max-w-lg">
                                            <div dangerouslySetInnerHTML={{ __html: desc }} />
                                            {words.length > 20 && (
                                                <>
                                                    {' '}<button className="text-blue-600 underline ml-2" onClick={() => setShowFullDesc(false)}>Close</button>
                                                </>
                                            )}
                                        </div>
                                    );
                                }
                                return (
                                    <div className="text-gray-700 my-4 text-md max-w-lg">
                                        <div dangerouslySetInnerHTML={{ __html: words.slice(0, 20).join(' ') + '...' }} />
                                        <button className="text-blue-600 underline" onClick={() => setShowFullDesc(true)}>Read more</button>
                                    </div>
                                );
                            })()}
                        </div>
                        <button
                            className="text-black hover:underline w-fit text-base flex items-center gap-2 py-2"
                            onClick={() => setShowExpertModal(true)}
                        >
                            <Mail />
                            Ask An Expert
                        </button>

                        {showExpertModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                <div className="bg-white rounded-lg shadow-lg p-6 h-[80%] overflow-y-auto md:max-w-md relative animate-fade-in">
                                    <button
                                        className="absolute top-2 right-2 text-gray-500 hover:text-black text-4xl font-bold"
                                        onClick={() => setShowExpertModal(false)}
                                        aria-label="Close"
                                    >
                                        ×
                                    </button>
                                    <h2 className="text-xl font-bold mb-2 text-center">Ask An Expert</h2>
                                    <form onSubmit={handleExpertSubmit} className="flex flex-col gap-4">
                                        <div className="text-center text-gray-500 text-sm mb-2">We will follow up with you via email within 24–36 hours</div>
                                        <hr className="" />
                                        <div className="text-center text-base mb-2">Please answer the following questionnaire</div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={expertForm.name}
                                            onChange={handleExpertInputChange}
                                            placeholder="Your Name"
                                            className="border rounded px-3 py-2"
                                            required
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            value={expertForm.email}
                                            onChange={handleExpertInputChange}
                                            placeholder="Email Address"
                                            className="border rounded px-3 py-2"
                                            required
                                        />
                                        <input
                                            type="number"
                                            min={10}
                                            name="phone"
                                            value={expertForm.phone}
                                            onChange={handleExpertInputChange}
                                            placeholder="Phone Number"
                                            className="border rounded px-3 py-2"
                                            required
                                        />
                                        <div className="flex flex-row gap-6 items-center mt-2">
                                            <span className="text-sm">Do You Need</span>
                                            <label className="flex items-center gap-1 text-sm">
                                                <input
                                                    type="radio"
                                                    name="need"
                                                    value="Appointment"
                                                    checked={expertForm.need === 'Appointment'}
                                                    onChange={handleExpertInputChange}
                                                    required
                                                /> Appointment
                                            </label>
                                            <label className="flex items-center gap-1 text-sm">
                                                <input
                                                    type="radio"
                                                    name="need"
                                                    value="Business"
                                                    checked={expertForm.need === 'Business'}
                                                    onChange={handleExpertInputChange}
                                                    required
                                                /> Business
                                            </label>
                                            <label className="flex items-center gap-1 text-sm">
                                                <input
                                                    type="radio"
                                                    name="need"
                                                    value="Personal"
                                                    checked={expertForm.need === 'Personal'}
                                                    onChange={handleExpertInputChange}
                                                /> Personal
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1">What Can I Help You With Today?</label>
                                            <textarea
                                                name="question"
                                                value={expertForm.question}
                                                onChange={handleExpertInputChange}
                                                placeholder="Describe your question or issue"
                                                className="border rounded px-3 py-2 w-full h-24 "
                                                rows={4}
                                                required
                                            />
                                        </div>
                                        <div className="mt-2">
                                            <span className="block text-sm mb-1">How Would You Like Me To Contact You?</span>
                                            <div className="flex flex-row gap-6">
                                                <label className="flex items-center gap-1 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="contactMethod"
                                                        value="Phone"
                                                        checked={expertForm.contactMethod === 'Phone'}
                                                        onChange={handleExpertInputChange}
                                                    /> Phone
                                                </label>
                                                <label className="flex items-center gap-1 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="contactMethod"
                                                        value="Email"
                                                        checked={expertForm.contactMethod === 'Email'}
                                                        onChange={handleExpertInputChange}
                                                    /> Email
                                                </label>
                                                <label className="flex items-center gap-1 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="contactMethod"
                                                        value="Both"
                                                        checked={expertForm.contactMethod === 'Both'}
                                                        onChange={handleExpertInputChange}
                                                    /> Both
                                                </label>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-black text-white rounded px-6 py-2 font-bold hover:bg-gray-900 transition mt-2"
                                        >
                                            SEND QUESTION
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}


                        <div className="mb-4">
                            <div className="text-green-800 font-bold md:text-lg mb-1 text-center">
                                {(() => {
                                    const prices = data?.prices?.[0]?.prices || [];
                                    const paxOption = prices.find(p => p.type === "01 Pax") || prices.find(p => p.type === "02 Pax");
                                    return paxOption
                                        ? `Room Base Rate for ${paxOption.type} ${paxOption.amount}`
                                        : "Room Base Rate: N/A";
                                })()}
                            </div>

                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr className="bg-orange-100">
                                        <th className="text-green-800 md:text-lg font-semibold px-3 py-2 text-left rounded-tl-lg">Person</th>
                                        <th className="text-green-800 md:text-lg font-semibold px-3 py-2 text-left rounded-tr-lg">Price For Night</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {["01 Pax", "02 Pax", "Extra Bed"].map((type) => {
                                        const row = data?.prices?.[0]?.prices?.find(p => p.type === type);
                                        if (!row) return null;
                                        return (
                                            <tr key={type} className="bg-blue-100">
                                                <td className="font-bold px-3 py-2">{type}</td>
                                                <td className="px-3 py-2">{row.amount}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="font-semibold text-gray-800 md:text-md my-2">Room Amenities</div>
                        <div className="flex gap-2 my-2 text-lg flex-wrap">
                            <TooltipProvider>
                                {(data.amenities || []).map((am, i) => (
                                    <Tooltip key={am._id || i}>
                                        <TooltipTrigger asChild>
                                            <span className="bg-gray-100 p-2 rounded flex items-center justify-center cursor-pointer">
                                                {amenityIcons[am.label] || am.label}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">{am.label}</TooltipContent>
                                    </Tooltip>
                                ))}
                            </TooltipProvider>
                        </div>
                        <div className="flex gap-8 md:text-md text-sm my-4">
                            <span>
                                Max occupancy: {
                                    data?.prices?.[0]?.prices?.some(p => p.type === '02 Pax')
                                        ? '02 Pax'
                                        : data?.prices?.[0]?.prices?.some(p => p.type === '01 Pax')
                                            ? '01 Pax'
                                            : 'N/A'
                                }
                            </span>
                            <span>
                                Extra bed available: {
                                    data?.prices?.[0]?.prices?.some(p => p.type === 'Extra Bed') ? 'Yes' : 'No'
                                }
                            </span>
                        </div>
                        <h2 className="font-bold md:text-md py-3 text-center">"Shop with Confidence - 100% Money-Back Guarantee!"</h2>
                    </div>

                    <div className="flex gap-4 items-center">
                        <button
                            className="border border-black py-3 font-semibold hover:bg-gray-100 w-full"
                            onClick={async () => {
                                if (status === 'loading') return;
                                if (!session || !session.user) {
                                    router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
                                    return;
                                }

                                setSelectedRoom({ ...data, type: 'room' });
                                setBookingModalOpen(true);
                            }}
                        >
                            Book Now
                        </button>
                        <div className="relative">
                            <button
                                className="p-2 rounded-full border hover:bg-gray-50"
                                onClick={() => setShowShareBox((prev) => !prev)}
                                aria-label="Share Product"
                                type="button"
                            >
                                <Share2 />
                            </button>
                            {showShareBox && (
                                <div id="share-popover" className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-5 flex flex-col gap-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-base">Share Product</span>
                                        <button className="text-gray-400 hover:text-black text-xl" onClick={() => setShowShareBox(false)} aria-label="Close share box">&times;</button>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-sm font-semibold text-gray-700">Share via...</span>
                                        <div className="flex gap-4 mt-2">
                                            <a
                                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-[#3b5998] hover:bg-[#334f88] rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                                                title="Share on Facebook"
                                            >
                                                <svg width="26" height="26" fill="white" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.691V11.01h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.31h3.587l-.467 3.696h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0" /></svg>
                                            </a>
                                            <a
                                                href={`https://wa.me/?text=${encodeURIComponent(productUrl)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-[#25D366] hover:bg-[#1da851] rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                                                title="Share on WhatsApp"
                                            >
                                                <svg width="26" height="26" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.151-.174.2-.298.3-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.207-.242-.58-.487-.501-.669-.51-.173-.007-.372-.009-.571-.009-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.2 5.077 4.366.709.306 1.262.489 1.694.626.712.227 1.36.195 1.87.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.617h-.001a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.646-.235-.374a9.86 9.86 0 0 1-1.51-5.204c.001-5.455 4.436-9.89 9.892-9.89 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.896 6.991c-.003 5.456-4.437 9.891-9.892 9.891m8.413-18.304A11.815 11.815 0 0 0 12.05.001C5.495.001.06 5.436.058 11.992c0 2.115.553 4.178 1.602 5.993L.057 24l6.184-1.646a11.94 11.94 0 0 0 5.809 1.479h.005c6.555 0 11.892-5.437 11.893-11.994a11.86 11.86 0 0 0-3.487-8.413" /></svg>
                                            </a>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 mt-2">Or copy link</span>
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            id="share-url"
                                            type="text"
                                            className="border rounded px-2 py-1 flex-1 text-sm bg-[#f5f6fa]"
                                            value={productUrl}
                                            readOnly
                                        />
                                        <button
                                            className="bg-[#6c47ff] text-white px-4 py-1.5 rounded font-semibold text-sm hover:bg-[#4f2eb8]"
                                            onClick={() => {
                                                navigator.clipboard.writeText(productUrl);
                                                toast.success('Copied to clipboard!');
                                            }}
                                            type="button"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {bookingModalOpen && (
                        <BookingDetails
                            room={selectedRoom}
                            onClose={() => setBookingModalOpen(false)}
                        />
                    )}
                </div>
            </div>

            <div className="container mx-auto md:w-[80%] px-5 my-8 flex flex-col md:flex-row gap-8">
                {/* Left column */}
                <div className="flex-1 border rounded-lg p-6 bg-white">
                    <div className="mb-4">
                        <h3 className="font-bold text-lg">Special check-in instructions</h3>
                        <p className="text-sm text-gray-700">
                            Guests will receive an email 5 days before arrival with check-in instructions; front desk staff will greet guests on arrival. For more details, please contact the property using the information on the booking confirmation.
                        </p>
                    </div>
                    <hr className="my-3" />
                    <div className="mb-4">
                        <h3 className="font-bold text-lg">Pets</h3>
                        <p className="text-sm text-gray-700">Pets not allowed</p>
                    </div>
                    <hr className="my-3" />
                    <div>
                        <h3 className="font-bold text-lg">Children and extra beds</h3>
                        <p className="text-sm text-gray-700">
                            Children are welcome. Kids stay free! Children stay free when using existing bedding; children may not be eligible for complimentary breakfast. Rollaway/extra beds are available for $10 per day.
                        </p>
                    </div>
                </div>
                {/* Right column */}
                <div className="flex-1 max-w-md border rounded-lg p-6 bg-white self-start">
                    <div className="mb-4">
                        <h3 className="font-bold text-lg">Check-in instructions</h3>
                        <ul className="list-disc pl-5 text-sm text-gray-700">
                            <li>Check-in from 12 PM – anytime</li>
                            <li>Early check-in subject to availability</li>
                        </ul>
                    </div>
                    <hr className="my-3" />
                    <div>
                        <h3 className="font-bold text-lg">Check-out instructions</h3>
                        <ul className="list-disc pl-5 text-sm text-gray-700">
                            <li>Check-out before noon. Last 11:00 AM – anytime</li>
                            <li>Early check-out subject to availability</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="bg-[#ededed] flex flex-col items-center justify-center w-full rounded-lg md:mb-8 mb-4 px-2">
                <h2 className="text-xl md:text-2xl font-bold text-center md:my-5 my-2 w-full">Our Accommodation</h2>
                <FeaturedRoomsClient rooms={rooms} />
            </div>
        </div >
    );
}