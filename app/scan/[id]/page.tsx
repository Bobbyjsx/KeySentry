import Layout from "@/components/Layout"
import ScanDetailsView from "@/components/scan/ScanDetailsView"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ScanDetailsPage({ params }: PageProps) {
  const { id } = await params

  return (
    <Layout>
      <ScanDetailsView scanId={id} />
    </Layout>
  )
}
