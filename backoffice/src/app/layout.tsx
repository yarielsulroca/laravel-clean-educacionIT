import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <LanguageProvider>
          <AuthProvider>
            <ThemeProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </ThemeProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
