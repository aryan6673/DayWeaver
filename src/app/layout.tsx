
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import ClientProviders from '@/components/layout/client-providers';
import { AuthProvider } from '@/components/auth/auth-provider';


export const metadata: Metadata = {
  title: 'Day Weaver',
  description: 'Your day. Your goals. No stress. Let AI handle the mess.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <ClientProviders>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
