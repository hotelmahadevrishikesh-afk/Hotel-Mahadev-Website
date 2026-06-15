"use client"
import React, { useEffect } from 'react'
import { useState } from 'react'
import FeaturedRoomsSection from './FeaturedRoomsSection'
import Link from 'next/link'
import ReviewListModal from './ReviewListModal'
const RoomSection = () => {
    const [rooms, setRooms] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const handleShowReviews = (room) => {
        setSelectedRoom(room);
        setShowReviewModal(true);
    };
    const handleCloseReviewModal = () => {
        setShowReviewModal(false);
        setSelectedRoom(null);
    };
    const fetchRoom = async () => {
        try {
            const res = await fetch("/api/room");
            const data = await res.json();
            if (Array.isArray(data)) {
                setRooms(data);
            } else if (Array.isArray(data.rooms)) {
                setRooms(data.rooms);
            } else {
                setRooms([]);
            }
        } catch (error) {
            setRooms([]);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchRoom();
    }, []);
    return (
        <div>
            {rooms.length > 0 && (
                <>
                    <div className="bg-[#ededed] flex flex-col md:items-center md:justify-between p-6 rounded-lg">
                        <div className="">
                            <div className="flex flex-col md:flex-row justify-between gap-2">

                                <h2 className="pacifico-h2 uppercase text-green-800 text-xl md:text-3xl text-center my-5 px-2">Comfort Meets Calm – Your Ideal Stay Awaits</h2>
                                <div className="md:my-auto md:px-10 p-2 flex justify-end">
                                    <Link href={"/accommodation"} className="p-3 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 text-md shadow-lg transition-all duration-200">
                                        View All Room
                                    </Link>
                                </div>
                            </div>
                            <p className="text-base md:text-md leading-snug mt-2">
                                Our accommodation offers the perfect blend of comfort, serenity, and functionality—making it an ideal stay for all kinds of travelers, whether solo, with family, or in a group. Each room is thoughtfully designed with elegant interiors, cozy bedding, and large windows that open to serene natural views. We provide all modern amenities including high-speed Wi-Fi, air conditioning, 24/7 hot water, in-room tea/coffee makers, spacious bathrooms, and secure locker facilities. Daily housekeeping ensures a clean and welcoming environment throughout your stay. With easy access to yoga halls, meditation spaces, and common lounges, our stay is more than just a room—it’s a peaceful retreat that truly feels like home.
                            </p>
                        </div>
                        <FeaturedRoomsSection
                            rooms={rooms}
                            onShowReviews={handleShowReviews}
                        />

                    </div>
                </>
            )}
            {/* Render ReviewModal and BookingDetails for selected room */}
            {showReviewModal && selectedRoom && (
                <ReviewListModal
                    open={showReviewModal}
                    onClose={handleCloseReviewModal}
                    reviews={selectedRoom.reviews || []}
                />
            )}
        </div>
    )
}

export default RoomSection