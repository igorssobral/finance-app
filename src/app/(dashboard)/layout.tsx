import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const unreadNotifications = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar user={session.user} unreadNotifications={unreadNotifications} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
