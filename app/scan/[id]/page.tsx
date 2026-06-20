import Layout from "@/components/Layout"
import ScanDetailsView from "@/components/scan/ScanDetailsView"
import { getScanDetailsAction } from "@/lib/actions/scan"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ScanDetailsPage({ params }: PageProps) {
  const { id } = await params

  try {
    const details = await getScanDetailsAction(id)
    return (
      <Layout>
        <ScanDetailsView scanId={id} initialData={details} />
      </Layout>
    )
  } catch (error) {
    console.error("Failed to load scan details", error)
    return notFound()
  }
}
