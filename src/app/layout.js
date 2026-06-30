import { LeadsProvider } from '@/lib/LeadsContext';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export const metadata = {
  title: 'Lucky Arrow Retreat — Sales Dashboard',
  description: 'Sales funnel dashboard for Lucky Arrow Retreat',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-50 antialiased">
        <LeadsProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto scrollbar-thin">
              {children}
            </main>
          </div>
        </LeadsProvider>
      </body>
    </html>
  );
}
