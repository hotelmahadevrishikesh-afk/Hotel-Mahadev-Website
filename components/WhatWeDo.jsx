"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import React from 'react'
import './fonts/fonts.css';
const accordionData = [
  {
    title: "What Sets Us Apart:",
    content: "What sets us apart is the way we blend heartfelt hospitality with soulful experiences. At Hotel Mahadev Rishikesh, every stay goes beyond comfort—inviting you to reconnect with yourself in the serene embrace of the Himalayas. From peaceful accommodations and nourishing meals to guided walks, temple visits, and the sacred Ganga Aarti, we create moments that are authentic, mindful, and memorable. With a balance of modern comforts and local traditions, we ensure your stay is not just enjoyable, but truly enriching."
  },
  {
    title: "Luxury Accommodation",
    content: "Experience comfort redefined in our elegantly designed rooms, where modern luxury meets timeless charm. Spacious interiors, rich details, and serene views of the Himalayas create a perfect balance of relaxation and sophistication. Every corner is crafted with care, ensuring your stay is as peaceful as it is indulgent."
  },
];


const WhatWeDo = () => {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Banner */}
      <div className="relative w-full md:h-[320px] h-[100px] flex items-center justify-center">
        <Image src="/bg7.jpg" alt="Banner" layout="fill" className="z-0 md:object-cover object-contain" priority />
        <div className="hidden md:flex absolute left-[10%] top-10 z-10 container w-fit mx-auto px-4 flex-col justify-center h-full bg-[#fcf7f1] rounded-xl">
          <div className="max-w-2xl flex flex-col items-center justify-center px-10 py-2">
            <h1 className="text-3xl font-semibold text-black mb-2 drop-shadow-lg">The Impact of What We Do How <br /> We Make a Difference</h1>
            <div className="w-[350px] rounded-lg overflow-hidden">
              <Image src="/whatWe.jpg" alt="Intro" width={350} height={250} className="object-cover w-full h-full" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="md:hidden flex container w-full mx-auto p-5 flex-col justify-center h-full bg-[#fcf7f1] rounded-xl">
          <div className="w-full flex flex-col items-center justify-center">
            <h1 className="text-xl font-semibold text-black text-center mb-2 drop-shadow-lg">The Impact of What We Do How <br /> We Make a Difference</h1>
            <div className="w-full rounded-lg overflow-hidden">
              <Image src="/whatWe.jpg" alt="Intro" width={350} height={250} className="object-cover w-full h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="md:p-10">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row md:gap-10">
            {/* Left Side */}
            <div className="lg:w-7/12 w-full">
              <div className=" p-8 md:mb-8">
                <h4 className="pacifico-h2 text-green-800 text-xl md:text-2xl md:text-3xl mb-4">“Turning Stays into Experiences.”</h4>
                <p className="md:text-base text-gray-700 mb-4">
                At our hotel, we do more than provide a place to rest—we create meaningful experiences. From warm welcomes and comfortable stays to guided explorations, soulful dining, and personalized services, every detail is crafted to make your journey memorable. We blend global standards with local traditions to ensure every guest feels valued, connected, and truly at home.<br /><br />
                </p>
                <div className="max-w-xl mx-auto px-6 py-4 border border-gray-300 rounded-2xl relative">
                  <blockquote className="relative">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Why Choose Us?</h2>
                    <ul className="space-y-3 text-gray-800 font-medium list-none">
                      <li>• Prime Location – Nestled in the serene beauty of the Himalayas and close to the sacred Ganga</li>
                      <li>• Heartfelt Hospitality – More than service, we welcome you with warmth and care.</li>
                      <li>• Comfort & Luxury – Spacious rooms, modern amenities, and peaceful surroundings.
                      </li>
                      <li>• Authentic Experiences – Guided walks, temple visits, cultural immersion, and soulful dining</li>
                      <li>• Wellness & Rejuvenation – A stay designed to refresh your mind, body, and spirit.
                      </li>
                      <li>• Wellness & Rejuvenation – A stay designed to refresh your mind, body, and spirit.
                      Clean, serene, and eco-conscious accommodation</li>
                    </ul>

                    <div className="flex justify-between items-center mt-6">
                      <div className="flex gap-2">
                        <hr className="my-6 border-t border-black w-10" />
                        <img src="/logo.png" alt="Logo Image" className="h-16 w-auto" />
                      </div>

                      <span className="md:text-7xl text-5xl text-black font-serif">”</span>
                    </div>
                  </blockquote>
                </div>
                {/* Accordion */}
                <div className="w-full max-w-2xl mx-auto mb-8 mt-10">
                  {accordionData.map((item, idx) => {
                    // Create a ref for each accordion item
                    const contentRef = React.useRef(null);
                    // Calculate maxHeight for transition
                    const isOpen = openIndex === idx;
                    const [height, setHeight] = React.useState(0);

                    React.useEffect(() => {
                      if (isOpen && contentRef.current) {
                        setHeight(contentRef.current.scrollHeight);
                      } else {
                        setHeight(0);
                      }
                    }, [isOpen]);

                    return (
                      <div key={idx} className="mb-2 border border-gray-200 rounded-lg bg-white">
                        <button
                          className={`w-full flex justify-between items-center px-4 py-3 text-left font-semibold text-lg transition focus:outline-none ${isOpen ? 'text-amber-700' : 'text-gray-800'}`}
                          onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                          aria-expanded={isOpen}
                        >
                          <span>{item.title}</span>
                          <span className="text-3xl">{isOpen ? '-' : '+'}</span>
                        </button>
                        <div
                          ref={contentRef}
                          style={{
                            maxHeight: isOpen ? height : 0,
                            opacity: isOpen ? 1 : 0,
                            overflow: 'hidden',
                            transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
                          }}
                          className="px-6 py-2"
                        >
                          <p className="text-gray-700 text-base whitespace-pre-line">{item.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
            {/* Right Side - keep width fixed and separated */}
            <div className="lg:w-5/12 w-full flex items-center justify-center sticky top-20 p-10 self-start md:p-0">
              <div className="w-full max-w-md rounded-xl overflow-hidden">
                <Image
                  src="/what.jpg"
                  alt="Rishikesh"
                  width={600}
                  height={800}
                  className="object-contain w-full"
                  style={{ aspectRatio: '3/4' }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Get in Touch Section */}
      <div className="">
        <section className="w-full bg-black py-5 text-white flex flex-col md:flex-row items-center justify-between md:px-24 md:gap-6 gap-2">
          <div className="md:mb-6 mb-2 md:mb-0">
            <h3 className="text-xl text-center md:text-start md:text-2xl md:text-3xl font-bold gap-2">Questions?
              <br className="md:hidden"/>
              <span className="md:text-lg text-base font-normal px-2">Our experts will help find the gear that’s right for you</span>
            </h3>
        </div>
        <Link href="/contact" className="btn bg-white text-black font-bold px-8 py-3 rounded-lg shadow transition">Get In Touch</Link>
      </section>
      </div>
    </div>
  );
};

export default WhatWeDo;