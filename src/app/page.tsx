import { getSession } from "@/lib/session";
import { LoginCard } from "@/components/LoginCard";
import { Dashboard } from "@/components/Dashboard";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    return <LoginCard />;
  }

  return <Dashboard athleteName={session.athlete_name} />;
}
