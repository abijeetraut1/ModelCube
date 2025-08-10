"use client"
import { useEffect, useState } from "react"

import {
  IconDashboard,
  IconInnerShadowTop,
  IconSettings,
  IconPrompt
} from "@tabler/icons-react"
import { Download, History, Search, Home, Image, ScanFace, ScanText, BrainCircuit } from "lucide-react";
import { FileBox } from "lucide-react";
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom";

import { checkHistory } from "@/lib/Database/CheckHistory";
import type { Icon } from "@/components/nav-secondary"

const data = {
  // navMain: [
  //   {
  //     title: "Face Mesh",
  //     url: "/face-Mesh",
  //     icon: ScanFace as Icon,
  //     complete: true
  //   },
  //   {
  //     title: "Image Classifier",
  //     url: "/image-classifier",
  //     icon: Image as Icon,
  //     complete: true
  //   },
  // ],
  navSecondary: [
    {
      title: "Text Based ML",
      url: "/ai",
      icon: BrainCircuit as Icon,
      complete: true
    },
    {
      title: "Home",
      url: "/",
      icon: Home as Icon,
      complete: true
    },
    {
      title: "Histroy",
      url: "/history",
      icon: History as Icon,
      complete: true
    },
    {
      title: "Search Model",
      url: "/search",
      icon: Search as Icon,
      complete: true
    },
    {
      title: "Download",
      url: "/download",
      icon: Download as Icon,
      complete: true
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings as Icon,
      complete: true
    },

  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // const [history, setHistory] = useState([]);

  // useEffect(() => {
  //   const fetchHistory = async () => {
  //     const chatHistory = await checkHistory();
  //     console.log(chatHistory)
  //     setHistory(chatHistory?.map((el: { conversation_id: string }) => el.conversation_id) || []);
  //   };

  //   fetchHistory();
  // }, []);


  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <span className="text-base font-semibold">ModelCube.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
