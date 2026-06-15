import React from "react";
import Image from "next/image";
import { X } from "lucide-react";

const ReviewListModal = ({ open, onClose, reviews = [] }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={onClose}>
            <div
                className="max-w-xl w-full p-4 relative bg-white rounded-lg shadow-lg overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <button
                    className="absolute z-50 bg-gray-200 rounded-full p-2 top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                    onClick={onClose}
                >
                    <X />
                </button>

                {reviews && reviews.length > 0 ? (
                    <div className="h-[400px] overflow-y-auto px-2 py-5">
                        {reviews.map((review, idx) => (
                            <div
                                key={idx}
                                className="bg-[#f9fafb] border border-gray-200 rounded-xl p-6 mb-6 shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    {/* Avatar and Name */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <Image
                                            src={review.image?.url || "/placeholder.jpeg"}
                                            alt={review.createdBy}
                                            width={48}
                                            height={48}
                                            className="rounded-full object-cover border border-gray-300"
                                            style={{ minWidth: 48, minHeight: 48 }}
                                        />
                                        <span className="font-semibold text-base text-gray-900">
                                            {review.createdBy}
                                        </span>
                                    </div>
                                    {/* Star Rating */}
                                    <div className="flex gap-1 items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={`text-xl ${review.rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {/* Review Title */}
                                <div className="font-bold text-lg text-black mt-1 mb-1">
                                    {review.title}
                                </div>
                                {/* Review Text */}
                                <div
                                    className="text-gray-500 text-[15px] font-normal leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: review.review }}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500">No reviews yet.</div>
                )}
            </div>
        </div>
    );
};

export default ReviewListModal;
