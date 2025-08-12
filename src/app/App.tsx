import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Settings from './pages/Settings/Settings'
import Download from './pages/Download/Download'
import Search from './pages/Search/Search'
import History from './pages/History/History'
import { Toaster } from 'sonner';
import Chat from "./pages/Chat/Chat"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import TrainModel from "@/app/pages/TrainModel/TrainModel";

// import TitleBar from "@/app/compnents/Titlebar/Titlebar"

document.title = "ModelCube"

function AppLayout() {


    // Render layout for all other routes
    return (
        <div className="min-h-screen bg-background">
            {/* <TitleBar title="ModelCube" /> */}
            <div>
                <SidebarProvider
                    style={
                        {
                            "--sidebar-width": "calc(var(--spacing) * 72)",
                            "--header-height": "calc(var(--spacing) * 12)",
                        } as React.CSSProperties
                    }
                >
                    <AppSidebar variant="inset" />
                    <SidebarInset className="h-screen bg-muted/40 flex flex-col">
                        {/* Fixed header */}
                        <div className="flex-shrink-0">
                            <SiteHeader />
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-auto designed-scroll-bar">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/history" element={<History />} />
                                <Route path="/download" element={<Download />} />
                                <Route path="/search" element={<Search />} />
                                <Route path="/c/:slug" element={<Chat />} />
                            </Routes>
                        </div>
                    </SidebarInset>

                </SidebarProvider>
            </div>
        </div>
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