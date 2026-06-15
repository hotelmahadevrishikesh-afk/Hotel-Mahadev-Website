"use client";
import { useEffect, useState } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import './fonts/fonts.css';
import FeaturedRoomsSection from "./FeaturedRoomsSection";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ReviewModal from "./ReviewModal";
import ReviewListModal from "./ReviewListModal";
import BookingDetails from "./BookingDetails";
const Banner = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [promotinalBanner, setPromotinalBanner] = useState([])
    const [featuredOffer, setFeaturedOffer] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    const fetchPromotinalBanner = async () => {
        try {
            const res = await fetch("/api/addPromotinalBanner");
            const data = await res.json();
            if (data && data.length > 0) {
                setPromotinalBanner(data);
            } else {
                setPromotinalBanner([]);
            }
        } catch (error) {
            setPromotinalBanner([]);
        } finally {
            setIsLoading(false);
        }
    };
    const fetchFeaturedOffer = async () => {
        try {
            const res = await fetch("/api/addFeaturedOffer");
            const data = await res.json();
            if (data && data.length > 0) {
                setFeaturedOffer(data);
            } else {
                setFeaturedOffer([]);
            }
        } catch (error) {
            setFeaturedOffer([]);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchPromotinalBanner();
        fetchFeaturedOffer();
    }, [])
    return (
        <div className="bg-[#fcf7f1] w-full overflow-hidden max-w-screen overflow-x-hidden">

            {/* Promotional Banner Section */}
            {promotinalBanner.length > 0 && (
                <div className="w-full  py-10 md:py-20 bg-[#ededed]">
                    <h2 className="pacifico-h2 px-10 text-green-800 text-xl md:text-2xl text-center mb-5 uppercase">
                        <span className="">Our Best Retreats – Reconnect. Realign. Rejuvenate Yourself.
                        </span>
                    </h2>
                    <p className="font-barlow text-gray-600 mb-5 w-[80%] md:w-[50%] mx-auto text-center">Step away from the noise of daily life and immerse yourself in a retreat designed to nourish your body, mind, and spirit. Whether through guided meditation, yoga by the Ganga, or mindful healing practices, our carefully curated retreats help you reconnect with your inner self, realign your energies, and emerge fully rejuvenated—rested, inspired, and renewed.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 px-2">
                        {promotinalBanner.map((item, idx) => (
                            <div key={idx} className="flex flex-col h-[220px] md:h-[450px] p-0 overflow-hidden relative group">
                                <Link href={item?.buttonLink || '#'} target="_blank" rel="noopener noreferrer" ><img src={item.image?.url} alt={item.title} className="absolute inset-0 w-full h-full md:object-cover object-contain object-center transition-transform duration-300 group-hover:scale-105" /></Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Featured Offer For You Section */}
            {featuredOffer.length > 0 && (
                <div className="w-full md:my-20 py-10 px-2">
                    <h2 className="pacifico-h2 text-green-800 px-10 text-xl md:text-3xl text-center mb-5 uppercase">Balance is the New Luxury – Embrace It Today
                    </h2>
                    <p className="font-barlow text-gray-600 mb-5 w-[80%] md:w-[50%] mx-auto text-center">Leave the chaos behind and embrace mindful simplicity. Nestled in the calm of Tapovan, our retreats offer expert-led sessions, soulful food, and Himalayan stillness for the ultimate reset.</p>
                    <Carousel className="w-full">
                        <CarouselContent>
                            {featuredOffer.map((item, idx) => (
                                <CarouselItem key={idx} className="md:basis-1/3 lg:basis-1/4">
                                    <div className="flex flex-col h-[350px] p-0 overflow-hidden relative group">
                                        <Link href={item?.buttonLink || '#'} target="_blank" rel="noopener noreferrer"><img src={item.image?.url} alt={item.title} className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105" /></Link>

                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselNext className="!right-2 !top-1/2 !-translate-y-1/2 z-10 " />
                        <CarouselPrevious className="!left-1 !top-1/2 !-translate-y-1/2 z-10" />
                    </Carousel>
                </div>
            )}
        </div>
    )
}

export default Banner