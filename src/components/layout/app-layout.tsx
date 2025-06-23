"use client";

import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"; 
import { SidebarNav } from "./sidebar-nav";
import { Button } from "@/components/ui/button";
import { BotMessageSquare } from "lucide-react"; // Or a more fitting logo icon
import Link from "next/link";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen >
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Button variant="ghost" className="h-10 w-10 p-0 flex items-center justify-center bg-primary text-primary-foreground rounded-full">
              <BotMessageSquare size={24} />
            </Button>
            <h1 className="text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">AutoApply</h1>
          </Link>
        </SidebarHeader>
        <SidebarNav />
        {/* SidebarFooter could be used for user profile summary or logout */}
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
            <div className="md:hidden">
                 <SidebarTrigger />
            </div>
            <div className="flex-1">
                {/* Potential breadcrumbs or page title here */}
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
