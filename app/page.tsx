import Layout from "@/components/Layout";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import { getAnalyticsDataAction } from "@/lib/actions/analytics";
import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/landing/LandingPage";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return <LandingPage />;
  }

  const initialData = await getAnalyticsDataAction().catch(() => ({
    keys: [],
    scanHistory: [],
  }));

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <AnalyticsDashboard initialData={initialData} />
      </div>
    </Layout>
  );
}
