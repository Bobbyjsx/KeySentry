
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import { auth } from "@/auth";
import LandingPage from "@/components/landing/LandingPage";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return <LandingPage />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>
      <AnalyticsDashboard />
    </div>
  );
}
