"use client"

import * as React from "react"
import {
  BarChart,
  Boxes,
  ClipboardList,
  ClockArrowUp,
  Flame,
  Image,
  MapPin,
  MenuIcon,
  MessageCircleMore,
  Plus,
  Rss,
  Send,
  ShoppingBag,
  Star,
  StickyNote,
  User,
  Users,
  ShoppingCart,
} from "lucide-react"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

const data = {
  user: {
    name: "Welcome, Admin",
    email: "hotelmahadev.rishikesh@gmail.com",
  },
  projects: [
    // First group: Admin management
    {
      name: "Create/Manage Admin",
      url: "/admin/create_user",
      icon: User,
    },
    { divider: true },
    {
      name: "Manage Banner",
      url: "/admin/change_banner_image",
      icon: Image,
    },
    { divider: true },
    {
      name: "Create Team",
      url: "/admin/create_team",
      icon: User,
    },
    {
      name: "View / Edit Team",
      url: "/admin/edit_team",
      icon: User,
    },
    { divider: true },

    {
      name: "Add Direct Packages",
      url: "/admin/add_direct_packages",
      icon: Plus,
    },
    { divider: true },

    {
      name: "Activity Page",
      url: "/admin/add_activity",
      icon: Plus,
    },
    { divider: true },
    {
      name: "Add Room",
      url: "/admin/add_room",
      icon: Plus,
    },
    { divider: true },
    {
      name: "Add Team",
      url: "/admin/add_team",
      icon: Plus,
    },
    { divider: true },
    {
      name: "Promotional Banner",
      url: "/admin/promotional_banner",
      icon: Image
    },
    {
      name: "Featured Offered Banner",
      url: "/admin/featured_offered_banner",
      icon: Image
    },
    {
      name: "Category Advertisment",
      url: "/admin/category_advertisment",
      icon: Image
    },
    {
      name: "PopUp Banner",
      url: "/admin/popup_banner",
      icon: Image
    },

    // Space (empty item)
    { divider: true },
    {
      name: "Insta or Facebook Post",
      url: "/admin/insta_fb_post",
      icon: Image
    },
    {
      name: "Manage Blogs",
      url: "/admin/manage_blogs",
      icon: Rss,
    },
    {
      name: "News",
      url: "/admin/news",
      icon: Rss,
    },
    
    // Space (empty item)
    { divider: true },


    // Third group: Content management
    {
      name: "Manage Featured Packages",
      url: "/admin/manage_featured_packages",
      icon: Image,
    },
    {
      name: "Manage Menu Section",
      url: "/admin",
      icon: MenuIcon,
    },
    {
      name: "Manage Sub Menu Section",
      url: "/admin/manage_sub_menu",
      icon: MenuIcon,
    },
    {
      name: "Manage Packages & Category",
      url: "/admin/manage_packages_category",
      icon: Boxes,
    },
    {
      name: "Approve/Reject Reviews",
      url: "/admin/manage_reviews",
      icon: Star,
    },
    {
      name: "FAQ",
      url: "/admin/faq",
      icon: Star,
    },
    { divider: true },
    {
      name: "Room Order",
      url: "/admin/room_order",
      icon: ShoppingCart,
    },
    {
      name: "Package Booking Orders",
      url: "/admin/package_booking",
      icon: ShoppingCart,
    },
    // Space (empty item)
    { divider: true },
    // Fourth group: Blog & pages
    {
      name: "Manage Webpages",
      url: "/admin/manage_webpage",
      icon: StickyNote,
    },

    // Space (empty item)
    { divider: true },

    // Fifth group: Enquiries
    {
      name: "Contact Page Enquiry",
      url: "/admin/contact_page_enquiry",
      icon: MessageCircleMore,
    },
    {
      name: "Enquiry Chat Page",
      url: "/admin/chat",
      icon: MessageCircleMore,
    },

    // Space (empty item)
    { divider: true },

    // Sixth group: Reports & tools

    {
      name: "Send Promotional Emails",
      url: "/admin/send_promotional_emails",
      icon: Send,
    },
    {
      name: "User Login Logs/Report",
      url: "/admin/user_login_logs",
      icon: Users,
    },
  ],
}

const dataManager = {
  user: {
    name: "Welcome, Manager",
    email: "hotelmahadev.rishikesh@gmail.com",
  },
  projects: [
    {
      name: "Sales Section",
      url: "/admin/sales_section",
      icon: BarChart,
    },
    {
      name: "Enquiry Chat Page",
      url: "/admin/manager_enquiry_chat",
      icon: MessageCircleMore,
    },
    {
      name: "Send Promotional Emails",
      url: "/admin/send_promotional_emails",
      icon: Send,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const { data: session } = useSession();

  const pathName = usePathname()

  return (
    (
      pathName !== "/admin/login" && (
        <Sidebar variant="inset"  {...props}>
          <NavUser user={session} />
          <SidebarContent {...props}>
            {session?.user?.isSubAdmin && <NavProjects projects={dataManager.projects} />}
            {(!session?.user?.isSubAdmin && session?.user?.isAdmin) && <NavProjects projects={data.projects} />}
          </SidebarContent>
        </Sidebar>
      ))
  );
}
