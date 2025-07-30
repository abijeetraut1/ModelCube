import React from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home/Home'
import Settings from './pages/Settings/Settings'
import Download from './pages/Download/Download'
import Search from './pages/Search/Search'
import { Toaster } from 'sonner';
import Chat from "./pages/Chat/Chat"
import CodeSpace from "./pages/Code_Space/CodeSpace";

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"


function AppLayout() {
    const location = useLocation();
    const isCodeSpace = location.pathname === "/code-space";

    if (isCodeSpace) {
        return (
            <Routes>
                <Route path="/code-space" element={<CodeSpace />} />
            </Routes>
        );
    }

    // Render layout for all other routes
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset className="bg-muted/40">
                <SiteHeader />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/download" element={<Download />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/c/:slug" element={<Chat />} />
                    {/* We still include code-space route here for safety but it won't be rendered due to the condition above */}
                    <Route path="/code-space" element={<CodeSpace />} />
                </Routes>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function App() {
    return (
        <HashRouter>
            <AppLayout />

            <Toaster
                theme="dark"
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />
        </HashRouter>
    );
}
