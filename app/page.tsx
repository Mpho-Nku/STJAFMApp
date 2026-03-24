"use client";

import Image from "next/image";
import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Church = {
  name: string;
  img: string;
};

const churches: Church[] = [
  { name: "Find Church within the community", img: "/church.png" },
  { name: "Get Updated with Upcoming Events", img: "/EventsIcon.png" },
  { name: "Faith Revival Ministries", img: "/Seller.png" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  const viewChurch = (name: string) => {
  router.push(`/churches?search=${encodeURIComponent(name)}`);
  };

   const viewEvents= (event: string) => {
    router.push(`/events?search=${encodeURIComponent(event)}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 flex flex-col">
        {/* ===== HERO ===== */}
     <section className="p-4 sm:p-6 lg:p-8">
  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6 items-center">
    
    {/* IMAGE */}
    <div className="w-full md:w-1/2">
      <Image
        src="/Rama.png"
        alt="Church"
        width={600}
        height={400}
        className="rounded-xl object-cover w-full h-[200px] sm:h-[250px] md:h-[300px]"
      />
    </div>

    {/* TEXT */}
    <div className="w-full md:w-1/2 text-center md:text-left">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">
       Explore what you can do with STJ AFM Platform
      </h1>

      <p className="text-gray-600 text-sm sm:text-base mb-5">
        Discover churches, services, and events happening in your community.
      </p>

      <button
        onClick={() => navigate("/churches")}
        className="bg-black text-white px-6 py-3 rounded-full w-full sm:w-auto"
      >
        Browse Churches
      </button>
    </div>
  </div>
</section>

        {/* ===== CHURCHES ===== */}
<section className="px-4 sm:px-6 lg:px-8">
  <h1 className="text-xl sm:text-2xl font-bold mb-6">
    Explore churches near you
  </h1>

  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

    {/* -------- CARD 1 -------- */}
    <div className="bg-gray-100 rounded-2xl p-5 flex items-center justify-between hover:bg-gray-200 transition">
      <div className="max-w-[65%]">
        <h6 className="font-semibold text-base sm:text-lg">
         Find Churches
        </h6>

        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          Find any ST John AFM circuit within your community and get directions to the church, view service times, and learn about their ministries.
        </p>

        <button
          onClick={() => viewChurch("/churches")}
          className="mt-4 px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm hover:bg-gray-50"
        >
          Detail
        </button>
      </div>

      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
        <Image
          src="/church.png"
          alt="Grace Bible Church"
          fill
          className="object-contain"
        />
      </div>
    </div>

    {/* -------- CARD 2 -------- */}
    <div className="bg-gray-100 rounded-2xl p-5 flex items-center justify-between hover:bg-gray-200 transition">
      <div className="max-w-[65%]">
        <h6 className="font-semibold text-base sm:text-lg">
          Get Updated with Upcoming Events
        </h6>

        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
        Find any event within your community and get directions to the church, view service times, and learn about their ministries.
        </p>

        <button
          onClick={() => viewEvents("find events")}
          className="mt-4 px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm hover:bg-gray-50"
        >
          Detail
        </button>
      </div>

      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
        <Image
          src="/EventsIcon.png"
          alt="St John's Church"
          fill
          className="object-contain"
        />
      </div>
    </div>

    {/* -------- CARD 3 -------- */}
    <div className="bg-gray-100 rounded-2xl p-5 flex items-center justify-between hover:bg-gray-200 transition">
      <div className="max-w-[65%]">
        <h6 className="font-semibold text-base sm:text-lg">
          Find Church uniforms from trusted and verified sellers
        </h6>

        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          Buy church merchandise, books, and resources directly from the app. Support your church and grow in faith with just a few taps.
        </p>

        <button
          onClick={() => viewChurch("Christ Embassy")}
          className="mt-4 px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm hover:bg-gray-50"
        >
          Detail
        </button>
      </div>

      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
        <Image
          src="/Seller.png"
          alt="Christ Embassy"
          fill
          className="object-contain"
        />
      </div>
    </div>

  </div>
</section>

        {/* ===== FEATURES ===== */}
      <section className="px-4 sm:px-6 lg:px-8 py-10">
  <h6 className="text-2xl sm:text-3xl font-bold mb-6">
    Plan your church event
  </h6>

  <div className="grid lg:grid-cols-3 gap-6">

    {/* LEFT MAIN CARD */}
    <div className="lg:col-span-2 bg-[#8FB7C1] rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">

      {/* TEXT */}
      <div className="max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-black">
          Discover and attend church events near you
        </h2>

        <p className="text-sm text-gray-800 mt-4">
          Choose a date and time to explore upcoming services, conferences, and gatherings.
        </p>

        {/* INPUTS */}
        

        {/* CTA */}
        <button
          onClick={() => navigate("/events")}
          className="mt-6 w-full sm:w-auto bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition"
        >
          Find Events
        </button>
      </div>

      {/* IMAGE (RIGHT SIDE) */}
      <div className="absolute right-0 bottom-0 w-40 sm:w-56 opacity-90">
        <img
          src="/EventsIcon.png" // 👈 replace with your generated calendar image
          alt="Event Calendar"
          className="w-full object-contain"
        />
      </div>
    </div>

    {/* RIGHT BENEFITS PANEL */}
    <div className="bg-white border rounded-2xl p-6 space-y-5">
      <h3 className="font-semibold text-lg">Benefits</h3>

      <div className="flex items-start gap-3 text-sm text-gray-700">
        <span>📅</span>
        <p>
          Discover events up to 90 days in advance.
        </p>
      </div>

      <hr />

      <div className="flex items-start gap-3 text-sm text-gray-700">
        <span>⏰</span>
        <p>
          Never miss a service or special church gathering.
        </p>
      </div>

      <hr />

      <div className="flex items-start gap-3 text-sm text-gray-700">
        <span>📍</span>
        <p>
          Find events near your location instantly.
        </p>
      </div>

      <hr />

      <button className="text-sm underline text-gray-600 hover:text-black" onClick={() => navigate("/events/add")}>
        Add Your Event
      </button>
    </div>

  </div>
</section>
      </main>
    </div>
  );
}

/* ===== SIDEBAR ===== */

function NavItem({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <p
      onClick={onClick}
      className="cursor-pointer hover:text-blue-600 transition"
    >
      {label}
    </p>
  );
}

/* ===== FEATURE ===== */
function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm text-center hover:shadow-md transition">
      <div className="text-2xl sm:text-3xl mb-2">📍</div>
      <h3 className="font-semibold text-base sm:text-lg">{title}</h3>
      <p className="text-gray-600 text-xs sm:text-sm mt-2">{desc}</p>
    </div>
  );
}