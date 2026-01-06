"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, User, LogOut } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [username, setUsername] = useState("");

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    if (isAuthenticated) {
      getUserData();
    }
  }, [isAuthenticated]);

  const getUserData = async () => {
    try {
      const res = await api.get("/accounts/me/");
      setUsername(res.data.username);
    } catch (err) {
      console.error("Failed to check user data", err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-black shadow-md border-b px-6 py-3 flex items-center justify-between">
      <div
        className="font-bold text-xl text-white cursor-pointer"
        onClick={() => router.push("/")}
      >
        Nursing Practical App
      </div>

      {isAuthenticated && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="p-0 rounded-full flex items-center gap-1 hover:bg-black"
            >
              <Avatar>
                {/* <AvatarImage src="/avatar.png" alt="User" /> */}
                <AvatarFallback>
                  <User className="h-6 w-6 text-primary" />
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="text-white" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleLogout} className="bg-red-700 text-white">
              <LogOut className="mr-2 h-4 w-4 text-white" />
              Logout
            </DropdownMenuItem>
            <DropdownMenuItem>
              {username || "Loading..."}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
