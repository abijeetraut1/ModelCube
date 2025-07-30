"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { ForwardRefExoticComponent, RefAttributes } from "react"
import { LucideProps } from "lucide-react"

export type Icon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
import { toast } from 'sonner';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"


export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon,
    complete: boolean
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {

  function onProgresToast(title: string) {
    toast.warning(`This ${title} page is currently on developement.`, {
      duration: 5000
    })
  }
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton size="default" asChild onClick={() => !item.complete && onProgresToast(item.title)} >
                <Link to={item.complete ? item.url : "/"}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
