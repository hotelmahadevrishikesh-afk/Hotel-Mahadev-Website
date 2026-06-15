"use client"
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const PopUpBanner = () => {
  const [banner, setBanner] = useState(null);
  const [open, setOpen] = useState(false); // Initially closed
  const [showAnim, setShowAnim] = useState(false);

  useEffect(() => {
    fetch('/api/popupBanner')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBanner(data[0]);
        }
      });
  }, []);

  useEffect(() => {
    if (banner) {
      // Delay popup open by 2 seconds
      const timer = setTimeout(() => {
        setOpen(true);
        // Animate in after open
        setTimeout(() => setShowAnim(true), 10);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [banner]);

  const handleClose = () => {
    setShowAnim(false);
    setTimeout(() => setOpen(false), 200); // Wait for animation out
  };

  if (!banner || !open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 ` transition-opacity duration-300">
      <div
        className={`relative bg-white max-w-3xl sm:h-[100vh] md:h-[50vh] w-[85vw] px-5 flex flex-col md:flex-row overflow-hidden transform transition-all duration-500
        ${showAnim ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
        style={{ transitionProperty: 'transform, opacity' }}
      >
        {/* Close button top right */}  
        <button
          onClick={handleClose}
          className="absolute top-6 right-2 md:top-4 md:right-4 z-10 bg-black/80 hover:bg-black text-white rounded-full p-1 flex items-center justify-center text-2xl font-bold focus:outline-none transition"
          aria-label="Close popup"
        >
          <X size={28} />
        </button>
        {/* Left: Banner image */}
        <div className="md:w-1/2 w-full flex items-center justify-center md:h-[350px]">
          <img
            src={banner.image?.url || '/placeholder.jpeg'}
            alt="Popup Banner"
            className="w-full h-full object-cover "
            style={{ maxHeight: 380, minHeight: 220, objectFit: 'cover' }}
          />
        </div>
        {/* Right: Text content */}
        <div className="md:w-1/2 w-full px-8 py-5 flex flex-col justify-center items-center">
          <div className="mb-4">
            <div className="md:text-base text-sm font-semibold text-center text-gray-500 mb-2">Crafted with Heart</div>
            <div className="md:text-xl text-md font-bold mb-4 text-center text-black leading-tight">
            {banner.heading}
            </div>
            <div className="md:text-gray-700 text-sm mb-8 max-w-md">
             {banner.paragraph}
            </div>
            <a
              href={banner.buttonLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <button
                className="w-full bg-black text-white font-semibold md:py-2 py-1 rounded-none text-lg hover:bg-gray-900 transition"
                style={{letterSpacing: '0.5px'}}
              >
                Explore
              </button>
            </a>
            <div className="md:text-center text-sm text-center w-full text-gray-700 text-base font-semibold mt-2 opacity-80">
              Don’t miss this chance
            </div>
          </div>
        </div>         
        </div>
    </div>
  );
};

export default PopUpBanner;