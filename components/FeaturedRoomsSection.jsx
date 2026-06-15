import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import './fonts/fonts.css';
import { Star, Bed, Phone, ParkingCircle, ShowerHead, Wifi, Tv, Bath, Luggage, Coffee, Snowflake, Utensils } from 'lucide-react';
const amenityIcons = {
    'Restaurant': <Utensils size={24} />,
    'Bed': <Bed size={24} />,
    'Room Phone': <Phone size={24} />,
    'Parking': <ParkingCircle size={24} />,
    'Shower': <ShowerHead size={24} />,
    'Towel In Room': (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 16V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10M4 20h16M4 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2M4 20h16" /></svg>
    ),
    'Wi-Fi': <Wifi size={24} />,
    'Television': <Tv size={24} />,
    'Bath Tub': <Bath size={24} />,
    'Elevator': (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="6" y="3" width="12" height="18" rx="2" strokeWidth="2" />
            <path d="M9 9h6M9 13h6M12 16v2" strokeWidth="2" />
            <path d="M10.5 6l1.5-2 1.5 2" strokeWidth="2" />
        </svg>
    ),
    'Laggage': <Luggage size={24} />,
    'Tea Maker': <Coffee size={24} />,
    'Room AC': <Snowflake size={24} />,
};

export default function FeaturedRoomsSection({ rooms = [], onShowReviews }) {
    // console.log(rooms)
    if (!rooms.length) return null;

    return (
        <div className="w-full">
            <Carousel className="w-full gap-2">
                <CarouselContent>
                    {rooms.map((item, idx) => {
                        const imageUrls = [
                            ...(item.mainPhoto?.url ? [item.mainPhoto.url] : [])
                        ];
                        if (imageUrls.length === 0) imageUrls.push('/placeholder.jpeg');
                        return (
                            <CarouselItem key={item._id || idx} className="md:basis-1/3">
                                <div className="flex flex-col bg-[#f8f5ef] h-full my-5 w-full md:w-[450px] relative group overflow-hidden">
                                    {/* Room Image (Banner style) */}
                                    <div className="block w-full h-[250px] relative ">
                                        <Image
                                            src={imageUrls[0]}
                                            alt={item.title || 'Room'}
                                            fill
                                            className="object-cover object-bottom p-2 w-full h-full"
                                            priority
                                        />
                                    </div>
                                    {/* Card Details */}
                                    <div className="flex-1 p-5 flex flex-col gap-2 justify-between min-h-[210px] relative">
                                        <div className="flex items-center justify-between">
                                                <h3 className="text-md md:text-lg font-bold text-gray-900 ">{item.title || "Room Name"}</h3>
                                            <button
                                                className="flex flex-col items-center justify-between cursor-pointer group bg-transparent border-0 p-0"
                                                onClick={() => onShowReviews?.(item)}
                                                style={{ outline: 'none' }}
                                                aria-label="Show reviews"
                                            >
                                                <div className="flex items-center gap-1">
                                                    {[...Array(Math.round((item.reviews?.[0]?.rating || 5)))].map((_, i) => (
                                                        <Star key={i} size={14} color="#12b76a" fill="#12b76a" className="inline" />
                                                    ))}
                                                </div>
                                                <span className="text-xs md:text-md text-gray-700 ml-1 group-hover:underline">
                                                    Based On {item.reviews?.length || 0} Review{(item.reviews?.length || 0) !== 1 ? 's' : ''}
                                                </span>
                                            </button>
                                        </div>
                                        {/* <div className="text-gray-800 text-sm mb-1" dangerouslySetInnerHTML={{ __html: item.paragraph }} /> */}
                                        {/* Limited words for description */}
                                        <div className="text-gray-800 text-sm">
                                            {(() => {
                                                const text = (item.paragraph || '').replace(/<[^>]+>/g, '');
                                                const words = text.split(' ');
                                                if (words.length > 18) {
                                                    return words.slice(0, 18).join(' ') + '...';
                                                }
                                                return text;
                                            })()}
                                        </div>
                                        <div className="font-semibold text-gray-800 text-sm md:text-md mt-1 ">Room Amenities</div>
                                        <div className="flex gap-2 mb-1">
                                            <TooltipProvider>
                                                <div className="flex gap-2 mb-1 text-md flex-wrap">
                                                    {(item.amenities || []).map((am, i) => (
                                                        <Tooltip key={am._id || i}>
                                                            <TooltipTrigger asChild>
                                                                <span className="bg-gray-100 px-1 rounded flex items-center justify-center cursor-pointer">
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
                                            const priceList = (item.prices && item.prices[0] && item.prices[0].prices) || [];
                                            return (
                                                <div className="flex md:gap-8 gap-2 text-xs md:text-md">
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
                                        {/* Price & Book Now */}
                                        {(() => {
                                            const priceList = (item.prices && item.prices[0] && item.prices[0].prices) || [];
                                            const mainPrice = priceList.find(p => p.type === '02 Pax') || priceList.find(p => p.type === '01 Pax');
                                            return (
                                                <div className="flex items-center md:gap-4 gap-2 my-4">
                                                    <span className="text-md md:text-2xl font-bold text-black">Rs. {mainPrice ? mainPrice.amount : 'N/A'}</span>
                                                    <span className="text-sm md:text-md font-semibold text-gray-800 line-through">{mainPrice && mainPrice.oldPrice ? mainPrice.oldPrice : 'N/A'}</span>
                                                    <span className="text-sm md:text-md text-gray-700">/ Per Night</span>
                                                    
                                                        <Link href={`/room/${item.slug}`} className="ml-auto bg-green-700 hover:bg-green-800 text-white font-semibold md:px-8 px-3 md:py-2 py-1 rounded-md">
                                                        View More
                                                        </Link>
                                                        
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
                <CarouselNext className="!right-2 !top-1/2 !-translate-y-1/2 z-10 " />
                <CarouselPrevious className="!left-1 !top-1/2 !-translate-y-1/2 z-10" />
            </Carousel>
        </div>
    );
}
