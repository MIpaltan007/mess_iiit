
import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Changed font to Inter
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Added Toaster

export const dynamic = 'force-dynamic'; // Opt into dynamic rendering for all pages

const inter = Inter({ // Initialize Inter font
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'IIIT Mess', // Updated app title
  description: 'Manage your weekly meal plans with ease.', // Updated app description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}> {/* Used Inter font variable */}
        {children}
        <Toaster /> {/* Added Toaster component for notifications */}
      </body>
    </html>
  );
}
