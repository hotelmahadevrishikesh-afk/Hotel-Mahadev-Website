"use client"
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
const ReviewModal = ({ open, onClose, reviews }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={onClose}>
      <div
        className="max-w-xl w-full p-4 relative bg-white rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
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

                  {/* Stars and Verified */}
                  <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
                    <div className="flex">

                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={20} color="#12b76a" fill="#12b76a" />
                    ))}
                    </div>
                    <span className="text-green-600 font-medium flex items-center gap-1 text-sm ml-2">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path fill="#12b76a" d="M9.5 17.5l-5-5 1.4-1.4 3.6 3.6 7.6-7.6 1.4 1.4-9 9z" />
                      </svg>
                      Verified
                    </span>
                  </div>

                </div>

                {/* Title */}
                <div className="text-[16px] font-bold text-gray-800 mb-1">
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
const PackageCard = ({
  pkg = {},
}) => {
  // console.log(pkg)
  // Images array logic (adapt to your data)
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const imageUrls = [
    ...(pkg.gallery?.mainImage?.url ? [pkg.gallery?.mainImage.url] : []),
    ...(Array.isArray(pkg.gallery?.subImages) && pkg.gallery?.subImages.length > 0
      ? pkg.gallery?.subImages.map(photo => photo.url)
      : [])
  ];

  return (
    <div key={pkg._id} className="relative flex flex-col md:flex-row w-full md:w-[90%] mx-auto bg-[#f8f5ef] rounded-2xl md:p-2 p-5 md:items-center gap-6 mx-auto border border-gray-200">
      {/* Image Carousel */}
      <div className="relative w-full md:w-[420px] md:h-[280px] h-[250px] flex-shrink-0 flex items-center justify-center overflow-hidden">
        <Carousel className="w-full h-full" opts={{ loop: true }}>
          <CarouselContent>
            {imageUrls.map((img, i) => (
              <CarouselItem key={i} className="w-full h-full flex items-center justify-center">
                <Image
                  src={img}
                  alt={pkg.title || 'Package'}
                  width={420}
                  height={420}
                  className="object-contain object-top w-[420px] h-[420px]"
                  priority={i === 0}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2" />
        </Carousel>
      </div>
      {/* Details */}
      <div className="flex-1 md:p-5 p-2 flex flex-col gap-2 justify-between min-h-[260px] relative">
        <div className="flex items-start justify-between mb-2">
          <h3 className="md:text-2xl text-md font-bold text-gray-900">{pkg.title || "Package Name"}</h3>

          <button
            className="flex flex-col items-center justify-between cursor-pointer group bg-transparent border-0 p-0"
            onClick={() => {
              setSelectedReviews(pkg.reviews || []);
              setReviewModalOpen(true);
            }}
            style={{ outline: 'none' }}
            aria-label="Show reviews"
          >
            <div className="flex items-center gap-1">

              {[...Array(Math.round((pkg.reviews?.[0]?.rating || 5)))].map((_, i) => (
                <Star key={i} size={16} color="#12b76a" fill="#12b76a" className="inline" />
              ))}
            </div>

            <span className="text-xs text-gray-700 ml-1 group-hover:underline">
              Based On {pkg.reviews?.length || 0} Review{(pkg.reviews?.length || 0) !== 1 ? 's' : ''}
            </span>
          </button>
        </div>
        <hr className="h-[2px] w-full bg-black" />
        <div className="text-gray-800 text-sm mb-2 overflow-y-auto h-16" dangerouslySetInnerHTML={{ __html: pkg?.description?.overview }} />
        {/* Package Highlight Section */}
        {pkg.packageHighlight && Array.isArray(pkg.packageHighlight.highlights) && pkg.packageHighlight.highlights.length > 0 && (
          <div className="">
            <div className="font-bold text-sm md:text-base text-black mb-1">Package Highlight</div>
            <ul className="ml-2 flex flex-col gap-1 h-16 overflow-y-auto">
              {pkg.packageHighlight.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-green-700 md:text-[12px] text-[10px]">
                  <span className="mt-1">{/* Green check icon */}
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="10" fill="#22c55e" />
                      <path d="M6.5 10.5L9 13L14 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-between items-center gap-4 mt-4">
          {/* PDF Modal Trigger */}
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 md:w-48 w-1/2 rounded-md"
            onClick={() => setShowPdfModal(true)}
          >
            Get Package PDF
          </button>
          {/* PDF Modal */}
          <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
            <DialogContent className="max-w-lg">
              <DialogTitle>Package PDFs</DialogTitle>
              {Array.isArray(pkg.pdfs) && pkg.pdfs.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {pkg.pdfs.map((pdf, idx) => (
                    <div key={pdf._id || pdf.key || idx} className="flex items-center justify-between py-2 gap-2">
                      <span className="font-medium text-gray-800">{pdf.name}</span>
                      <div className="flex gap-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm font-semibold"
                          onClick={() => setPdfPreviewUrl(pdf.url)}
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* PDF Preview Modal */}
                  <Dialog open={!!pdfPreviewUrl} onOpenChange={() => setPdfPreviewUrl(null)}>
                    <DialogContent className="md:max-w-2xl">
                      <DialogTitle>PDF Preview</DialogTitle>
                      {pdfPreviewUrl && (
                        <iframe
                        className="h-[500px]"
                          src={pdfPreviewUrl}
                          width="100%"
                          height="600px"
                          style={{ border: '1px solid #ccc', borderRadius: 8 }}
                          title="Package PDF Preview"
                        />
                      )}
                      <DialogFooter>
                        <DialogClose asChild>
                          <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">Close</button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="text-gray-500 py-4">No PDFs available for this package.</div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded">Close</button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
            <Link href={`/package/${pkg.slug}`} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 text-center md:w-36 w-1/2 rounded-md">
              View More
            </Link>
        </div>
        <ReviewModal
          open={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          reviews={selectedReviews}
        />
      </div>
    </div>
  );
}

export default PackageCard
