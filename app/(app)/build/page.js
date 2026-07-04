// Server component — Next.js passes searchParams reliably here (no Suspense/useSearchParams quirks)
import BuildClient from './BuildClient'

export default async function BuildPage({ searchParams }) {
  const params = await searchParams
  const projectId = params?.id || null

  // key forces BuildClient to fully remount when switching between projects or to new project.
  // Without this, clicking "New Project" while on /build?id=xxx keeps the old state alive.
  return <BuildClient key={projectId ?? 'new'} projectId={projectId} />
}