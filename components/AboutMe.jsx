"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import './fonts/fonts.css';
const accordionData = [
  {
    title: "What Makes Us Unique?",
    content: `1:   What Makes Us Unique?  

What sets us apart is the perfect blend of soulful surroundings, heartfelt hospitality, and enriching experiences. Nestled in the serene Himalayas by the sacred Ganga, we offer more than just comfortable stays—our guided walks, temple visits, soulful meals, and eco-conscious practices create a journey of peace and connection. Every detail is designed to rejuvenate your mind, body, and spirit, making your stay truly unforgettable.

⦁	Comfortable & spacious rooms with modern amenities
⦁	Multi-cuisine dining with fresh, flavorful meals
⦁	Guided nature walks & local sightseeing tours
⦁	Sacred experiences like Ganga Aarti & temple visits
⦁	Wellness activities for relaxation & rejuvenation
⦁	Warm hospitality with personalized care`
  },
  {
    title: "Global Accessibility with Local Roots",
    content: `We bring the world to Rishikesh while staying deeply connected to its soul. With modern comforts, seamless connectivity, and world-class hospitality, our hotel welcomes guests from across the globe—yet every experience is rooted in the warmth, spirituality, and traditions of Rishikesh.

⦁	Seamless Connectivity – Easily accessible with modern travel links, welcoming guests from across the world.
⦁	World-Class Hospitality – International service standards blended with warm Indian traditions.
⦁	Cultural Immersion – Experiences rooted in Rishikesh’s spirituality, yoga, and heritage.
⦁	Authentic Local Flavors – Fresh, regional cuisine prepared with a homely touch.
⦁	Modern Comforts, Traditional Values – Luxurious stays with a soulful essence of the Himalayas.
⦁	Personalized Experiences – Tailored services that combine global expectations with local care.`
  },
//   {
//     title: "Empowering Local Artisans",
//     content: `At Hotel Mahadev, we believe that wellness is a journey for everyone — whether you're just beginning or have years of experience. Our programs are thoughtfully designed to meet you where you are. Beginners are gently guided with patience and clarity, while seasoned practitioners are offered deeper insights and advanced practices. Through expert instruction, mindful support, and an inclusive atmosphere, we empower every individual to grow, heal, and reconnect with their inner self at their own pace — all in the nurturing embrace of the Himalayas.`
//   },
//   {
//     title: "Cultural Preservation",
//     content: `At Hotel Mahadev, cultural preservation is at the heart of our mission. We are deeply rooted in the traditions of the Himalayas, and we strive to keep this rich heritage alive through every experience we offer. From ancient yoga and meditation practices to Ayurvedic healing, Vedic rituals, and local art forms, we embrace and share the timeless wisdom of our ancestors. By collaborating with local communities, healers, and artisans, we not only protect these traditions but also empower the people who carry them forward — ensuring they thrive for generations to come.`
//   },
//   {
//     title: "Global Accessibility with Local Roots",
//     content: `Hotel Mahadev bridges the gap between ancient traditions and modern lifestyles, offering globally accessible wellness experiences deeply rooted in local Himalayan culture. Whether you’re joining us from across the world or nearby, our retreats are designed to be inclusive, welcoming, and easy to access. While we open our doors to international seekers of peace and balance, we remain firmly connected to our local roots — celebrating regional wisdom, supporting indigenous communities, and preserving the authenticity that makes our retreats truly unique.

// We sincerely thank you for being part of our journey to preserve Himalayan heritage and empower both seasoned practitioners and those just beginning their wellness path. Your support helps us sustain ancient traditions, uplift local communities, and create an inclusive space where everyone can heal, grow, and thrive — rooted in authenticity, guided by purpose.`
//   }
];
const AboutMe = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="w-full min-h-screen bg-[#fcf7f1]">
      {/* Banner */}
      <div className="relative w-full md:h-[450px] h-[100px] flex items-center justify-center bg-secondary">
        <Image
          src="/bg1.jpg"
          alt="About Banner"
          width={1920}
          height={1080}
          className="z-0 md:object-cover object-contain"
          priority
        />
      </div>
      {/* Main Content */}
      <section className="content-inner md:p-10 p-4 overflow-hidden">
        <div className="container mx-auto md:px-20 px-5">
          <div className="flex flex-col md:flex-row gap-5 md:gap-10 items-stretch">
            {/* Left: Text and Accordion */}
            <div className="lg:w-1/2 w-full flex flex-col justify-center overflow-y-auto">
              <div className="mb-8">
                <h2 className="pacifico-h2 text-green-800 text-xl md:text-3xl md:mb-6 mb-4">"Stay Blessed in the Heart of Rishikesh."</h2>
                <p className="md:text-lg text-md text-gray-700 leading-relaxed mb-6">
                  A hotel is more than a place to stay—it’s an experience that welcomes you with comfort, care, and connection. Whether you’re here for leisure, business, or relaxation, our blend of warm hospitality, thoughtful amenities, and elegant accommodations ensures a truly memorable escape. Step into a sanctuary designed to refresh your mind and uplift your spirit. From restful rooms and delicious dining to personalized services that cater to your every need, every detail at our hotel is dedicated to making your stay seamless, rejuvenating, and unforgettable.
                  <br /><br />
                  Forget the weather, fatigue, and worries—this is your time to relax, rejuvenate, and reconnect with yourself. From luxury to luxurious, every moment at our resort is dedicated to your wellness. Indulge in our exclusive treatments and embrace a new level of vitality.<br /><br />
                </p>
              </div>

              {/* Accordion */}
              <div className="w-full md:max-w-2xl mx-auto mb-8">
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
                    <div key={idx} className="mb-2 border border-gray-200 rounded-lg bg-white shadow-sm">
                      <button
                        className={`w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-lg transition focus:outline-none ${isOpen ? 'text-amber-700' : 'text-gray-800'}`}
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

            {/* Right: Images Grid */}
            <div className="lg:w-1/2 min-h-[600px] h-full flex ">
              <div className="grid grid-cols-5 gap-4 w-full ">
                <div className="col-span-3">
                  <Image src="/A1.jpg" alt="A1" width={900} height={400} className="rounded-lg object-contain w-full h-full" />
                </div>
                <div className="col-span-2">
                  <Image src="/A2.jpg" alt="A2" width={300} height={400} className="rounded-lg object-contain w-full h-full" />
                </div>

                <div className="col-span-5 row-span-2">
                  <Image src="/A3.jpg" alt="A3" width={800} height={300} className="rounded-lg object-contain w-full h-auto" />
                </div>
                <div className="col-span-5 row-span-2">
                  <Image src="/A4.jpg" alt="A4" width={400} height={300} className="rounded-lg object-contain w-full h-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutMe;