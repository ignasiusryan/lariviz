import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { RunDataProvider } from "@/components/providers/RunDataProvider";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "./DashboardContent";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  return (
    <RunDataProvider athleteName={session.athlete_name}>
      <div className="dashboard-shell">
        <Sidebar />
        <div className="dashboard-main">
          <DashboardHeader athleteName={session.athlete_name} />
          <DashboardContent>{children}</DashboardContent>
        </div>
      </div>
    </RunDataProvider>
  );
}
