"use client";
import Image from "next/image";
import Link from "next/link";
import './fonts/fonts.css';
const VisionMission = () => {
  return (
    <section className="w-full  bg-[#fcf7f1] min-h-screen">
      <div className="w-full">
        <div className="relative w-full md:h-[400px] h-[100px] flex items-center justify-center bg-[#fcf7f1] overlay-black-light">
          <Image
            src="/bg3.jpg"
            alt="Vision Mission Banner"
            layout="fill"
                   
          className="z-0 md:object-cover object-contain"
            priority
          />
        </div>
        <div className="w-full container mx-auto flex gap-5 md:gap-10 items-center mt-10 px-5 md:px-20">
          {/* Left: Intro & Image */}
          <div className="w-full flex flex-col items-start">
            <h2 className="pacifico-h2 text-green-800 text-xl md:text-4xl mb-6 text-start lg:text-start">To create meaningful guest experiences that blend comfort, wellness, and spirituality.</h2>
            <p className="md:text-lg text-gray-700 leading-relaxed mb-6 lg:text-justify">
            At Hotel Mahadev Rishikesh, we offer more than a stay—we offer an awakening. Reconnect with yourself in the lap of the Himalayas while enjoying warm hospitality, nourishing meals, and soulful experiences. Explore the sacred charm of Rishikesh through guided walks, temple visits, and the timeless Ganga Aarti, all while resting in serene accommodations that breathe peace into your journey.
            </p>
          </div>

        </div> {/* Right: Vision & Mission */}
        <div className="container mx-auto w-full flex md:flex-row flex-col w-full gap-8 px-10 md:px-20">
          <div className="md:w-2/3 w-full flex justify-center mb-6 ">
            <Image src="/Vision.jpg" alt="Vision Mission Banner" width={500} height={500} className="rounded-xl object-cover w-fit h-auto " />
          </div>
          {/* Vision */}
          <div className="md:w-1/2 w-full flex-col mb-4">
            <div className="rounded-xl  p-6 mb-4 border border-gray-400">
              <h3 className="text-2xl font-bold mb-2 text-amber-700">Our Vision</h3>
              <p className="text-gray-700 text-base">
              Our vision is to create a sanctuary where travelers from across the world experience world-class hospitality while embracing the spiritual essence, natural beauty, and cultural heritage of Rishikesh. Guided by this vision, our mission is to blend comfort with soulful experiences—offering warm hospitality, nourishing meals, and serene stays that rejuvenate mind, body, and spirit. We are committed to sustainable practices that honor nature, while curating meaningful experiences such as guided walks, sacred temple visits, and the Ganga Aarti. At our hotel, every detail is designed to ensure that your stay is not just memorable, but truly enriching.
              </p>
            </div>
            {/* Mission */}
            <div className=" rounded-xl p-6 border border-gray-400">
              <h3 className="text-2xl font-bold mb-2 text-amber-700">Our Mission</h3>
              <ul className="pl-6 text-gray-700 text-base space-y-2 list-disc">
                <li>Our mission is to provide exceptional hospitality by combining comfort, care, and innovation. We strive to create memorable guest experiences through personalized services, high-quality accommodations, and authentic local connections. With a commitment to sustainability, cultural respect, and global standards, we aim to be more than a place to stay—we aim to be a home where every guest feels valued, relaxed, and inspired.</li>
                <li>To offer warm, personalized, and heartfelt hospitality rooted in Indian values.
                </li>
                <li>To create meaningful guest experiences that blend comfort, wellness, and spirituality.
                </li>
                <li>To promote sustainable and eco-friendly practices that honor nature and the Ganga.
                </li>
                <li>To serve as a gateway for guests to explore Rishikesh’s sacred sites, traditions, and natural wonders.
                </li>
                <li>To continuously enhance our services, ensuring every stay is enriching, peaceful, and unforgettable.
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>

  );
};

export default VisionMission;