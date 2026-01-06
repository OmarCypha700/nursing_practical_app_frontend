"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading, login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && isAuthenticated) {
      //  Check if user is admin and redirect accordingly
      checkUserRoleAndRedirect();
    }
  }, [loading, isAuthenticated, router]);


  const checkUserRoleAndRedirect = async () => {
    try {
      // Fetch current user info to check role
      const res = await api.get("/accounts/me/");
      
      if (res.data.role == "admin") {
        router.replace("/admin");
      } else {
        router.replace("/programs");
      }
    } catch (err) {
      console.error("Failed to check user role", err);
      router.replace("/programs"); // Default to programs if check fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await api.post("/accounts/login/", {
        username,
        password,
      });

      login(res.data.token);
      if (res.data.user.role == "admin") {
        router.push("/admin");
        toast.success(`Welcome ${res.data.user.username}!`);
      }
      else if (res.data.user.role == "examiner") {
        router.push("/programs");
        toast.success(`Welcome ${res.data.user.username}!`);
      }
      
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
        <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left illustration */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-blue-50 rounded-l-lg">
        <Image
          src="/next.svg"
          alt="Login illustration"
          className="w-3/4 max-w-md"
          width={500}
          height={500}
          priority
        />
      </div>

      {/* Login form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-white rounded-r-lg">
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/health.svg"
            alt="Logo"
            width={90}
            height={90}
            priority
          />
          <div className="ml-3">
            <p className="font-bold text-2xl text-center">NURSING</p>
            <p className="text-center">PRACTICALS APP</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 w-full max-w-sm"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            EXAMINER LOGIN
          </h2>

          {error && (
            <p className="mb-3 text-sm text-red-600 text-center">
              {error}
            </p>
          )}

          <input
            type="text"
            placeholder="Username"
            className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={submitting}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={submitting}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
