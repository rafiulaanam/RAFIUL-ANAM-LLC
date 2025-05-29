import { VendorSidebar } from "@/components/vendor/sidebar";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <VendorSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-800">
        {children}
      </main>
    </div>
  );
} 