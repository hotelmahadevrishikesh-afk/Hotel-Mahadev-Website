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
import PackageBookingModel from "./PackageBookingModel";
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
export default function ProductDetailView({ product }) {
  // ...other state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  // console.log(product);
  // --- Ask An Expert Modal State ---
  const [showExpertModal, setShowExpertModal] = useState(false);
  // Artisan Modal State
  const [showArtisanModal, setShowArtisanModal] = useState(false);
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
        type: 'packages',
        room: product._id,
        queryName: product.title || ''
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
    if (typeof window !== "undefined" && product && product.slug) {
      setProductUrl(window.location.origin + "/package/" + product.slug);
    } else if (product && product.slug) {
      setProductUrl("/package/" + product.slug);
    }
  }, [product]);

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
  const [showFullDesc2, setShowFullDesc2] = React.useState(false);
  const desc = product.description?.overview || "No Description";
  const desc2 = product.description?.description || "No Description";
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const words = desc.split(' ');
  const words2 = desc2.split(' ');
  // Gather all images (main + sub) at the top-level
  // Gather all images, filter out empty/undefined/null, and fallback to placeholder if empty
  const allImagesRaw = [product.gallery?.mainImage?.url, ...(product.gallery?.subImages?.map(img => img.url) || [])];
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
  const packagePrice = product?.packagePrice || {};
  return (
    <div className="w-full flex justify-center">
      <div className="w-full md:max-w-[80%] flex flex-col md:flex-row gap-4">
        {/* LEFT: Product Images */}
        <div className="w-full md:w-2/3 flex flex-col items-start md:px-10">
          {/* Main Image Carousel (QuickView style, embla-controlled) */}
          <div className="w-full flex justify-center md:mb-4">
            <div className="relative w-full md:max-w-[800px] h-[300px] md:h-[400px] flex items-center justify-center md:p-4">
              <Carousel
                className="w-full h-full"
                opts={{ loop: true }}
                plugins={[Autoplay({ delay: 4000 })]}
                setApi={setCarouselApi}
              >
                <CarouselContent className="h-[300px] md:h-[400px]">
                  {allImages.map((img, idx) => (
                    <CarouselItem key={idx} className="flex items-center justify-center h-full">
                      <div className="relative w-full h-[260px] md:h-[450px] flex items-center justify-center rounded-2xl overflow-hidden">
                        <Image
                          src={img}
                          alt={`Product image ${idx}`}
                          layout="fill"
                          objectFit="contain"
                          className="w-full h-full object-contain rounded-xl"
                          draggable={false}
                          style={{
                            objectFit: 'contain',
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
            <div className="w-full md:px-5 py-2">
              <Carousel opts={{ align: 'center', loop: allImages.length > 5 }} className="w-full">
                <CarouselContent>
                  {allImages.map((img, idx) => (
                    <CarouselItem key={idx} className="flex justify-center md:basis-1/5 basis-1/4 md:max-w-24 min-w-0">
                      <button
                        className={`rounded-lg border-2 ${activeImageIdx === idx ? 'border-black' : 'border-gray-200'} focus:outline-none `}
                        onClick={() => carouselApi && carouselApi.scrollTo(idx)}
                        style={{ minWidth: 64, minHeight: 64 }}
                      >
                        <Image
                          src={img}
                          alt={`${product.title} thumb ${idx + 1}`}
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
                    <CarouselNext className="!right-2 !top-1/2 !-translate-y-1/2 z-10 " />
                    <CarouselPrevious className="!left-1 !top-1/2 !-translate-y-1/2 z-10" />
                  </>
                )}
              </Carousel>
            </div>
          )}

          <div className="w-full flex flex-col p-5 ">
            <div className="flex items-center gap-4 mb-1 justify-between">
              <h1 className="md:text-2xl text-md font-bold">{product.description?.heading}</h1>
            </div>
            {(() => {

              if (desc2 === "No Description") {
                return <p className="text-gray-700 mb-4">No Description</p>;
              }
              if (showFullDesc2 || words2.length <= 500) {
                return (
                  <div className="text-gray-700 my-6 text-md">
                    <div dangerouslySetInnerHTML={{ __html: desc2 }} />
                    {words2.length > 500 && (
                      <>
                        <button className="text-blue-600 underline ml-2" onClick={() => setShowFullDesc2(false)}>Close</button>
                      </>
                    )}
                  </div>
                );
              }
              return (
                <div className="text-gray-700 my-2 text-md max-w-lg">
                  <div dangerouslySetInnerHTML={{ __html: words2.slice(0, 20).join(' ') + '...' }} />
                  <button className="text-blue-600 underline" onClick={() => setShowFullDesc2(true)}>Read more</button>
                </div>
              );
            })()}
          </div>
        </div>
        <div className="w-full lg:w-1/3 flex flex-col">
          <div className="">
            <div className="w-full flex flex-col">
              <div className="flex items-center gap-4 mb-1 justify-between">
                <h1 className="md:text-2xl text-md font-bold">{product.title}</h1>
                {product.code && (
                  <span className="text-sm text-black my-2 md:my-0 w-fit font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">Code: {product.code}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-3 md:mb-0">
                <span className="font-semibold flex items-center text-sm md:text-md">
                  {(() => {
                    if (Array.isArray(product?.reviews) && product.reviews.length > 0) {
                      const avg = product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / product.reviews.length;
                      return avg.toFixed(1);
                    }
                    return "0";
                  })()} Rating</span>
                <span className="text-gray-700 text-sm">({product.reviews?.length || 0} customer reviews)</span>
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
                  <div className="text-gray-700 my-2 text-md max-w-lg">
                    <div dangerouslySetInnerHTML={{ __html: words.slice(0, 20).join(' ') + '...' }} />
                    <button className="text-blue-600 underline" onClick={() => setShowFullDesc(true)}>Read more</button>
                  </div>
                );
              })()}
            </div>
            <button
              className="text-black hover:underline w-fit text-base flex items-center gap-2"
              onClick={() => setShowExpertModal(true)}
            >
              <Mail />
              Ask An Expert
            </button>

            {showExpertModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 h-[80%] h-[90%] overflow-y-auto md:max-w-md relative animate-fade-in">
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
                      type="text"
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
            <div className="my-4">
              {/* Package Price Table */}
              <div className="text-green-800 font-bold md:text-md mb-1 text-center">Package Price: Base Rate</div>
              <table className="w-full border-separate border border-black p-2">
                <thead>
                  <tr className="bg-orange-100">
                    <th className="text-green-800 md:text-md font-semibold px-2 py-2 text-left rounded-tl-lg border border-black">Accommodation Type</th>
                    <th className="text-green-800 md:text-md font-semibold px-2 py-2 text-left border border-black">In INR</th>
                    <th className="text-green-800 md:text-md font-semibold px-1 py-2 text-left rounded-tr-lg border border-black">US Dollar</th>
                  </tr>
                </thead>
                <tbody>
                  {/* One Person */}
                  {Array.isArray(packagePrice?.onePerson) && packagePrice.onePerson.length > 0 && (
                    <>
                      <tr>
                        <td colSpan={3} className="font-semibold text-black text-start px-2 py-1 text-sm md:text-md border border-black">
                          Base Price : 01 Person
                        </td>
                      </tr>
                      {packagePrice.onePerson.map((item, idx) => (
                        <tr key={`onePerson-${idx}`} className="bg-blue-200">
                          <td className="px-3 py-2 font-bold border border-black">{item.type || "1 Person"}</td>
                          <td className="px-3 py-2 border border-black">{item.inr}</td>
                          <td className="px-3 py-2 border border-black">{item.usd}</td>
                        </tr>
                      ))}
                    </>
                  )}
                  <tr>
                    <td colSpan={3} className="border border-black">
                      <p className="text-sm text-red-500 font-bold w-full">
                        "Prices below are per person (AC sharing), applicable for a minimum group of 8."
                      </p>
                    </td>
                  </tr>
                  {/* Eight Person */}
                  {Array.isArray(packagePrice?.eightPerson) && packagePrice.eightPerson.length > 0 && (
                    <>
                      <tr><td colSpan={3} className="font-semibold text-black text-start px-2 py-1 text-sm md:text-md border border-black">
                        Base Price applicable for per person basis  : 08 Person
                      </td>
                      </tr>
                      {packagePrice.eightPerson.map((item, idx) => (
                        <tr key={`eightPerson-${idx}`} className="bg-blue-200">
                          <td className="px-3 py-2 font-bold border border-black">{item.type || "8 Person"}</td>
                          <td className="px-3 py-2 border border-black">{item.inr}</td>
                          <td className="px-3 py-2 border border-black">{item.usd}</td>
                        </tr>
                      ))}
                    </>
                  )}
                  <tr>
                    <td colSpan={3} className="border border-black">
                      <p className="text-sm text-red-500 font-bold w-full">
                        "Prices below are per person, based on non-AC sharing, applicable for groups of 10 persons and above."
                      </p>
                    </td>
                  </tr>
                  {/* Ten Person */}
                  {Array.isArray(packagePrice?.tenPerson) && packagePrice.tenPerson.length > 0 && (
                    <>
                      <tr><td colSpan={3} className="font-semibold text-black text-start px-2 py-1 text-sm md:text-md border border-black">
                        Base Price applicable for per person basis  : 10 Person
                      </td>
                      </tr>
                      {packagePrice.tenPerson.map((item, idx) => (
                        <tr key={`tenPerson-${idx}`} className="bg-blue-200">
                          <td className="px-3 py-2 font-bold border border-black">{item.type || "8 Person"}</td>
                          <td className="px-3 py-2 border border-black">{item.inr}</td>
                          <td className="px-3 py-2 border border-black">{item.usd}</td>
                        </tr>
                      ))}
                    </>
                  )}
                  {/* Eleven To Fourteen Person */}
                  {Array.isArray(packagePrice?.elevenToFourteenPerson) && packagePrice.elevenToFourteenPerson.length > 0 && (
                    <>
                      <tr><td colSpan={3} className="font-semibold text-black text-start px-2 py-1 text-sm md:text-md border border-black">
                        Base Price : 11 to 14 Person Minimum
                      </td>
                      </tr>
                      {packagePrice.elevenToFourteenPerson.map((item, idx) => (
                        <tr key={`elevenToFourteenPerson-${idx}`} className="bg-blue-200">
                          <td className="px-3 py-2 font-bold border border-black">{item.type || "11 to 14 Person"}</td>
                          <td className="px-3 py-2 border border-black">{item.inr}</td>
                          <td className="px-3 py-2 border border-black">{item.usd}</td>
                        </tr>
                      ))}
                    </>
                  )}
                  {/* Fifteen To Eighteen Person */}
                  {Array.isArray(packagePrice?.fifteenToTwentyEightPerson) && packagePrice.fifteenToTwentyEightPerson.length > 0 && (
                    <>
                      <tr><td colSpan={3} className="font-semibold  text-black text-start px-2 py-1 text-sm md:text-md border border-black">
                        Base Price : 15 to 28 Person Minimum
                      </td>
                      </tr>
                      {packagePrice.fifteenToTwentyEightPerson.map((item, idx) => (
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
            <h2 className="font-bold md:text-md py-3 text-center">"Shop with Confidence - 100% Money-Back Guarantee!"</h2>
          </div>

          <div className="flex gap-4 mb-6 items-center">
            {/* PDF Modal Trigger */}
            <button
              className="bg-black text-white py-3 px-8 font-semibold hover:bg-gray-800 w-full"
              onClick={() => setShowPdfModal(true)}
            >
              Get Package PDF
            </button>
            {/* PDF Modal */}
            <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
              <DialogContent className="max-w-lg">
                <DialogTitle>Package PDFs</DialogTitle>
                {Array.isArray(product.pdfs) && product.pdfs.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {product.pdfs.map((pdf, idx) => (
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
          <button
            className="border border-black py-3 mb-4 font-semibold hover:bg-gray-100 w-full"
            onClick={async () => {
              if (status === 'loading') return;
              if (!session || !session.user) {
                router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
                return;
              }
              setSelectedPackages({ ...product, type: 'packages' });
              setBookingModalOpen(true);
            }}
          >
            Book Now
          </button>
          {bookingModalOpen && (
            <PackageBookingModel
              packages={selectedPackages}
              onClose={() => setBookingModalOpen(false)} />
          )}
        </div>
      </div>
    </div>
  );
}