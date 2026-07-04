// Server component — Next.js passes searchParams reliably here (no Suspense/useSearchParams quirks)
import BuildClient from './BuildClient'

export default async function BuildPage({ searchParams }) {
  // In Next.js App Router, searchParams is always available on the server — never null.
  const params = await searchParams
  const projectId = params?.id || null

  return <BuildClient projectId={projectId} />
}