import Sidebar from '@/components/layout/Sidebar'

export default function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#08080f' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto', position: 'relative', background: '#08080f' }}>
        {children}
      </main>
    </div>
  )
}