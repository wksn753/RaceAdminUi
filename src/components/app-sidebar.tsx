import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { useEffect } from "react";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/login",
    icon: Home,
  },
  {
    title: "Races",
    url: "/races",
    icon: Inbox,
  },
  {
    title: "Tracking",
    url: "/live-tracking",
    icon: Calendar,
  },
  {
    title: "Leaderboard",
    url: "/leader-Board",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

interface AppSidebarProps {
  handleLogout: () => void;
}

export function AppSidebar({ handleLogout }: AppSidebarProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Define explicit styles to fix transparency issues
  const sidebarStyle = {
    backgroundColor: "var(--sidebar, rgb(250, 250, 250))",
    color: "var(--sidebar-foreground, rgb(10, 10, 10))",
    height: "100%",
    borderRight: "1px solid var(--sidebar-border, rgb(229, 231, 235))"
  };

  const headerStyle = {
    backgroundColor: "var(--sidebar, rgb(250, 250, 250))",
    borderBottom: "1px solid var(--sidebar-border, rgb(229, 231, 235))",
    padding: "1rem"
  };

  const contentStyle = {
    backgroundColor: "var(--sidebar, rgb(250, 250, 250))"
  };

  const buttonStyle = {
    backgroundColor: "var(--sidebar, rgb(250, 250, 250))",
    color: "var(--sidebar-foreground, rgb(10, 10, 10))",
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    borderRadius: "0.25rem",
    transition: "background-color 0.2s"
  };

  const buttonHoverStyle = {
    backgroundColor: "var(--sidebar-accent, rgb(243, 244, 246))"
  };

  const footerStyle = {
    backgroundColor: "var(--sidebar, rgb(250, 250, 250))",
    borderTop: "1px solid var(--sidebar-border, rgb(229, 231, 235))",
    padding: "1rem"
  };

  return (
    <Sidebar className="bg-gray-50" style={sidebarStyle}>
      <SidebarHeader className="p-4" style={headerStyle}>
        <h2 className="text-lg font-bold">Racer Admin Dashboard</h2>
      </SidebarHeader>
      
      <SidebarContent style={contentStyle}>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild style={buttonStyle}>
                    <Link 
                      to={item.url} 
                      className="flex items-center gap-2"
                      style={buttonStyle}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter style={footerStyle}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              className="text-red-600"
              style={{...buttonStyle, color: "rgb(220, 38, 38)"}}
            >
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}