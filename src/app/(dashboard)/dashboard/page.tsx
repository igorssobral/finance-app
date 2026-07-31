import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Visão geral das suas finanças" />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}
