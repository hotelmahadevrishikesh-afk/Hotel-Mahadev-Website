"use client";
import Image from "next/image";
import Link from "next/link";
import './fonts/fonts.css';
import { useEffect, useState } from "react";

// No more dummy data. We'll fetch from API.

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch("/api/team");
        if (!res.ok) throw new Error("Failed to fetch team data");
        const data = await res.json();
        setTeamMembers(data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#fcf7f1]">
      {/* Banner */}
      <div className="relative w-full md:h-[400px] h-[100px]">
        <Image
          src="/bg2.jpg"
          alt="Team Banner"
          layout="fill"
          className="z-0 md:object-cover object-cover"
          priority
        />
      </div>
      {/* Main Content */}
      <section className="content-inner md:p-20 px-5 py-2">
        <div className="container mx-auto ">
          <div className="flex flex-col lg:flex-row gap-8 mb-10 items-start">
            {/* Left: Heading and Paragraph */}
            <div className={`${teamMembers.length === 0 ? 'w-full' : 'w-full lg:w-1/2'}`}>
              <h2 className="pacifico-h2 text-green-800 text-xl md:text-4xl my-4">Experience You Can Trust. Where Expertise Meets Himalayan Spirit.</h2>
              <p className="md:text-xl text-gray-700 mb-4 w-full">
                In the hotel industry, true strength lies in the dedication and vision of its management teams — passionate hoteliers and hospitality professionals who combine expertise in guest care, operations, and service excellence. More than managers, they are hosts who create environments where every guest feels valued, comfortable, and connected. With a balance of global standards and local traditions, effective hotel management ensures that each stay is not just about accommodation, but about delivering authentic, memorable, and enriching experiences.
              </p>
            </div>
            {/* Right: Two Images in a row (first two team members) */}
            {teamMembers.length > 0 && (
              <div className="hidden md:flex w-full lg:w-1/2 flex-row gap-8 items-start justify-center">
                {loading ? (
                  <div>Loading Team Member...</div>
                ) : (
                  teamMembers.slice(0, 2).map((member, idx) => (
                    <div key={member._id || idx} className="flex flex-col items-center">
                      <div className={`relative w-72 h-72 rounded-2xl overflow-hidden shadow-lg ${idx === 0 ? "bg-[#f6e9da]" : "bg-[#d6f0fa]"} flex items-center justify-center`}>
                        <Image src={member.image?.url || "/placeholder.jpeg"} alt={member.title} width={224} height={224} className="object-cover w-full h-full" />
                      </div>
                      <div className="mt-3 text-center">
                        <div className="font-bold text-lg">{member.title}</div>
                        <div className="text-xs text-gray-600">{member.designation}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {/* Team Grid (remaining team members) */}
          <div className="hidden md:flex grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-8 mb-10">
          {teamMembers.length > 0 && (
            loading ? (
              <div>Loading...</div>
            ) : teamMembers.length > 2 && (
              teamMembers.slice(2).map((member, idx) => (
                <div key={member._id || idx} className="flex flex-col items-center">
                  <div className="w-72 h-72 rounded-2xl overflow-hidden shadow-lg bg-[#d6f0fa] flex items-center justify-center">
                    <Image src={member.image?.url || "/placeholder.jpeg"} alt={member.title} width={224} height={224} className="object-cover w-full h-full" />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="font-bold text-lg">{member.title}</div>
                    <div className="text-xs text-gray-600">{member.designation}</div>
                  </div>
                </div>
              ))
            )
          )}
            </div>
          {/* Team Grid (remaining team members for mobile) */}
          <div className="md:hidden grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 md:gap-8 gap-4 mb-10">
          {teamMembers.length > 0 && (
            loading ? (
              <div>Loading Team Members...</div>
            ) : teamMembers.length > 0 && (
              teamMembers.map((member, idx) => (
                <div key={member._id || idx} className="flex flex-col items-center">
                  <div className="md:w-72 w-full h-full md:h-72 rounded-2xl overflow-hidden shadow-lg bg-[#d6f0fa] flex items-center justify-center">
                    <Image src={member.image?.url || "/placeholder.jpeg"} alt={member.title} width={224} height={224} className="object-cover w-full h-full" />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="font-bold text-md">{member.title}</div>
                    <div className="text-xs text-gray-600">{member.designation}</div>
                  </div>
                </div>
              ))
            )
          )}
          </div>
          <div className="mb-10 md:text-base text-gray-700">
            In the Hotel Mahadev, true strength lies in the dedication and vision of its management teams — passionate hoteliers and hospitality professionals who bring expertise in guest care, operations, and service excellence. From the very first welcome, guests are embraced with warmth, comfort, and a sense of belonging. Beyond accommodations, management ensures that every stay becomes a journey of discovery—inviting guests to explore local culture, cuisine, and unique experiences that leave lasting impressions.
          </div>

          {/* Contributions Section */}
          <div className="rounded-xl md:p-8 p-4 border border-gray-400">
            <h2 className="pacifico-h2 text-green-800 text-xl md:text-3xl mb-4 text-gray-800">Our Team’s Impact: Hospitality Beyond Service, Impact Beyond Stay.
            </h2>
            <ul className="list-decimal md:pl-6 p-2 text-base text-gray-700 space-y-2">
              <span className="">At Hotel Mahadev, our team’s work extends far beyond the mat. Rooted in service and community upliftment, their contributions have helped shape a more holistic and sustainable wellness experience for all:</span>
              <li><span className="font-bold">Warm Welcomes :</span> From the very first greeting, our team ensures guests feel valued, comfortable, and at home. Every smile, gesture, and detail reflects our commitment to heartfelt hospitality.
                : Our yoga experts have guided and mentored hundreds of aspiring practitioners and wellness facilitators, empowering the next generation through focused `training and authentic teachings in and around Rishikesh.</li>
              <li><span className="font-bold"> Seamless Stays:</span>  Behind the scenes, our dedicated staff work tirelessly to create smooth, stress-free experiences—ensuring every stay is marked by comfort, care, and efficiency.
              </li>
              <li><span className="font-bold"> Local Connection: </span> By blending ancient yogic wisdom with contemporary wellness needs, our team ensures that every retreat remains both spiritually rooted and globally relevant.Our team bridges global hospitality with local traditions, offering guests authentic cultural experiences, guided explorations, and a true taste of the destination.
              </li>
              <li><span className="font-bold">Personalized Care:</span> We believe no two guests are alike. With thoughtful attention to detail, our team tailors every service to meet individual needs, creating memories that last.
              </li>
              <li><span className="font-bold">Lasting Impressions:</span>More than a stay, our people create moments of joy, peace, and connection—impacting not just guest satisfaction, but their journey of wellness, discovery, and renewal.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;