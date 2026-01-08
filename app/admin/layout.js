"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  FileText,
  Settings,
  Menu,
  LogOut,
  ChevronRight,
  Award
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Examiners",
    href: "/admin/examiners",
    icon: Users,
  },
  {
    name: "Students",
    href: "/admin/students",
    icon: GraduationCap,
  },
  {
    name: "Procedures",
    href: "/admin/procedures",
    icon: ClipboardList,
  },
  {
    name: "Programs",
    href: "/admin/programs",
    icon: FileText,
  },
  {
    name: "Grades",
    href: "/admin/grades",
    icon: Award,
  },
];

function NavItems({ pathname, onNavigate }) {
  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
            {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-white">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <ClipboardList className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Admin Panel</span>
        </div>
        
        <ScrollArea className="flex-1 px-3 py-4">
          <NavItems pathname={pathname} onNavigate={() => {}} />
        </ScrollArea>
        
        <div className="border-t p-4">
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <ClipboardList className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Admin Panel</span>
          </div>
          
          <ScrollArea className="flex-1 px-3 py-4">
            <NavItems
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </ScrollArea>
          
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center gap-4 border-b bg-white px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex-1">
            <h1 className="text-xl font-semibold">
              {navigation.find((item) => item.href === pathname)?.name || "Admin"}
            </h1>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}