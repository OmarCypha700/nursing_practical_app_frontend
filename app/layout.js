import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner"


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
        <Navbar />
        {children}
        <Toaster position="top-right" richColors/>
        </AuthProvider>
      </body>
    </html>
  );
}
