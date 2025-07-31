"use client"
import { useEffect, useState } from "react"

import {
  IconDashboard,
  IconInnerShadowTop,
  IconSettings,
  IconPrompt
} from "@tabler/icons-react"
import { Download, History, Search } from "lucide-react";
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
  navMain: [
    {
      title: "use of socket in nodejs",
      url: "#",
      icon: IconPrompt,
      complete: true

    },
  ],
  navSecondary: [
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
                <FileBox className="!size-5" />
                <span className="text-base font-semibold">Local LLM.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={history} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
