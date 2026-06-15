"use client"
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ChevronDown, LogOutIcon, Mail, Phone, User2Icon } from "lucide-react"
import Link from "next/link"
import MenuBar from "./MenuBar"
import { Button } from "./ui/button"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import LanguageSelector from "./LanguageSelector"
import SearchBar from "./SearchBar"
import Cart from "./Cart";
import { ShoppingCart, Heart, User } from "lucide-react"
import { useCart } from "../context/CartContext";
import { ArrowDown, Menu, X } from "lucide-react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
const Header = () => {
  const authDropdownRef = React.useRef(null);
  const pathName = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  // Close auth dropdown when clicking outside
  useEffect(() => {
    if (!isAuthDropdownOpen) return;
    const handleClick = (e) => {
      if (authDropdownRef.current && !authDropdownRef.current.contains(e.target)) {
        setIsAuthDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [isAuthDropdownOpen]);
  const [menuItems, setMenuItems] = useState([]);
  const { data: session, status } = useSession();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [openFixedMenu, setOpenFixedMenu] = useState(null);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/getAllMenuItems")
      .then(res => res.json())
      .then(data => setMenuItems(data));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowHeader(true);
      } else if (window.scrollY > lastScrollY) {
        setShowHeader(false); // scrolling down
      } else {
        setShowHeader(true); // scrolling up
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Only render header after mount to avoid hydration mismatch
  if (!isMounted) return null;

  const isUser = session && !session.user.isAdmin;

  return (
    <header
      className={`print:hidden ${pathName.includes("admin") ||
        // pathName.includes("category") ||
        pathName.includes("page") ||
        // pathName.includes("about-us") ||
        // pathName.includes("contact") ||
        // pathName.includes("privacy-policy") ||
        // pathName.includes("refund-cancellation") ||
        // pathName.includes("terms-condition") ||
        // pathName.includes("shipping-policy") ||
        // pathName.includes("product") ||
        // pathName.includes("artisan") ||
        // pathName.includes("cartDetails") ||
        // pathName.includes("checkout") ||
        // pathName.includes("search") ||
        pathName.includes("sign-up") ||
        pathName.includes("sign-in") ||
        pathName.includes("customEnquiry")
        ? "hidden"
        : "block"
        } bg-[#fcf7f1] text-black border-b sticky top-0 left-0 right-0 transition-all duration-300 font-barlow tracking-wider ease-in-out z-50 mx-auto w-full py-2
         ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="md:flex hidden items-center justify-between gap-8 border-b py-1 border-gray-400 md:px-8 ">
        <p className="text-md">Inner Peace is Trending – Find Yours Today</p>
        <div className="flex flex-row justify-center items-center gap-4">
          <div className="items-center z-50 gap-4 flex">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 px-2 border-r-2 border-black">
                  <Mail size={18} />
                  <Link href={"mailto:hotelmahadev.rishikesh@gmail.com"}>
                    <p className="text-sm font-semibold hover:underline">hotelmahadev.rishikesh@gmail.com</p>
                  </Link>
                </div>
                <div className="border-r-2 gap-2 border-black items-center flex h-6 pr-4">
                  <Phone size={18} />
                  <Link href={"tel:+911354053504"}>
                    <p className="text-sm font-semibold tracking-widest hover:underline"> +91 1354053504</p>
                  </Link>
                  <Link href={"tel:+919557701203"}>
                    <p className="text-sm font-semibold tracking-widest hover:underline"> +91 9557701203</p>
                  </Link>
                  <Link href={"tel:+919927677716"}>
                    <p className="text-sm font-semibold tracking-widest hover:underline"> +91 9927677716</p>
                  </Link>
                </div>
              </div>
              <div className="relative border-r-2 border-black items-center flex h-6">
                {status === "loading" ? (
                  <Loader2 className="animate-spin text-blue-600" size={26} />
                ) : isUser ? (
                  <>
                    {/* Profile Picture Button */}
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="focus:outline-none border-dashed border-4 border-blue-600 rounded-full"
                    >
                      <Image
                        src={session.user.image || "/user.png"}
                        alt="Profile"
                        width={35}
                        height={35}
                        className="rounded-full cursor-pointer"
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                      <div className="absolute top-14 right-0 mt-2 w-fit text-black bg-white shadow-lg rounded-lg border z-50">
                        <p className="px-4 pt-2 text-sm font-bold text-gray-700">{session.user.name}</p>
                        <p className="px-4 pb-2 text-sm text-gray-700">{session.user.email}</p>
                        <div className="h-px bg-gray-200" />
                        <Link
                          href="/dashboard"
                          className="flex items-center rounded-lg w-full text-left px-4 py-2 hover:bg-blue-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User2Icon size={26} className="mr-2" /> Dashboard
                        </Link>
                        {/* <Link
                        href={`/account/${session.user.id}`}
                        className="flex items-center rounded-lg w-full text-left px-4 py-2 hover:bg-blue-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User2Icon size={20} className="mr-2" /> My Account
                      </Link> */}
                        <button
                          className="flex items-center rounded-lg w-full text-red-600 text-left px-4 py-2 hover:bg-blue-100"
                          onClick={() => signOut()}
                        >
                          <LogOutIcon size={20} className="mr-2" /> Sign Out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="relative">
                    <button onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)} className="flex items-center pr-4 py-2">
                      <User className="" size={26} />
                    </button>
                    {isAuthDropdownOpen && (
                      <div ref={authDropdownRef} className="absolute top-12 right-0 mt-2 w-48 text-black bg-white shadow-lg rounded-lg border">
                        <Link href="/sign-in" onClick={() => setIsAuthDropdownOpen(false)} className="block px-4 py-2 hover:bg-blue-100">Sign In</Link>
                        <Link href="/sign-up" onClick={() => setIsAuthDropdownOpen(false)} className="block px-4 py-2 hover:bg-blue-100">Create Account</Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Mobile Language Selector - only visible on small screens */}
            <div className="text-right">
              <LanguageSelector />
            </div>
          </div>
        </div>

      </div>
      <div className="lg:flex hidden items-center z-50 justify-center md:justify-between py-2 md:px-4 ">
        <Link href={"/"}>
          <img className="w-44 drop-shadow-xl" src="/logo.png" alt="Rishikesh Handmade" />
        </Link>

        <div className="relative flex items-center">
          {/* <MenuBar menuItems={menuItems.filter(item => item.active)} /> */}
          <MenuBar menuItems={menuItems} />
        </div>

        <SearchBar />


      </div>
      <div className="lg:hidden flex items-center z-50 justify-between md:justify-between py-1 px-2">
        <div className="relative flex items-center">
          {/* <MenuBar menuItems={menuItems.filter(item => item.active)} /> */}
          <MenuBar menuItems={menuItems} />
        </div>
        <Link href={"/"}>
          <img className="w-32 drop-shadow-xl" src="/logo.png" alt="Rishikesh Handmade" />
        </Link>

        <div className="flex items-center gap-3">

          <div className="relative">
            {status === "loading" ? (
              <Loader2 className="animate-spin text-blue-600" size={26} />
            ) : isUser ? (
              <>
                {/* Profile Picture Button */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="focus:outline-none border-dashed border-4 border-blue-600 rounded-full"
                >
                  <Image
                    src={session.user.image || "/user.png"}
                    alt="Profile"
                    width={26}
                    height={26}
                    className="rounded-full cursor-pointer"
                  />
                </button>
                {/* <SearchBar /> */}

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute top-14 right-0 mt-2 w-fit text-black bg-white shadow-lg rounded-lg border z-100">
                    <p className="px-4 pt-2 text-sm font-bold text-gray-700">{session.user.name}</p>
                    <p className="px-4 pb-2 text-sm text-gray-700">{session.user.email}</p>
                    <div className="h-px bg-gray-200" />
                    <Link
                      href="/dashboard"
                      className="flex items-center rounded-lg w-full text-left px-4 py-2 hover:bg-blue-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User2Icon size={20} className="mr-2" /> Dashboard
                    </Link>
                    {/* <Link
                        href={`/account/${session.user.id}`}
                        className="flex items-center rounded-lg w-full text-left px-4 py-2 hover:bg-blue-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User2Icon size={20} className="mr-2" /> My Account
                      </Link> */}
                    <button
                      className="flex items-center rounded-lg w-full text-red-600 text-left px-4 py-2 hover:bg-blue-100"
                      onClick={() => signOut()}
                    >
                      <LogOutIcon size={20} className="mr-2" /> Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="relative">
                <button onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)} className="flex items-center px-4 py-2">
                  <User className="ml-2" size={20} />
                </button>
                {isAuthDropdownOpen && (
                  <div className="absolute top-12 right-0 mt-2 w-48 text-black bg-white shadow-lg rounded-lg border z-100">
                    <Link href="/sign-in" onClick={() => setIsAuthDropdownOpen(false)} className="block px-4 py-2 hover:bg-blue-100">Sign In</Link>
                    <Link href="/sign-up" onClick={() => setIsAuthDropdownOpen(false)} className="block px-4 py-2 hover:bg-blue-100">Create Account</Link>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}

export default Header
