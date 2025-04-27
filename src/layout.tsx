import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import React, { useEffect, useState, ReactElement } from "react";
import axios from "axios";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('');

   const handleLogout = (): void => {
    // Clear token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setAuthenticated(false);
    setUserRole('');
    // Force page reload to reset any app state
    window.location.href = '/login';
  };
  return (
    <SidebarProvider>
    <AppSidebar handleLogout={handleLogout} />
    <main>
      <SidebarTrigger />
      {children}
    </main>
  </SidebarProvider>
  )
}
