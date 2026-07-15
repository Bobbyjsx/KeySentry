import Layout from "@/components/Layout"
import { auth } from "@/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    return <>{children}</>
  }

  return <Layout>{children}</Layout>
}
