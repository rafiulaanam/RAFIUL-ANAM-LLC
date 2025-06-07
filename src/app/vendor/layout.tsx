import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import NotificationBell from "@/components/vendor/NotificationBell";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "VENDOR") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <VendorSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white dark:bg-gray-800 px-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Vendor Dashboard</h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className="text-sm">
              Welcome, {session.user.name}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
} 