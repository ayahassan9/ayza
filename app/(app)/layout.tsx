import { Sidebar } from '@/components/sidebar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background p-4 pt-20 lg:p-8 lg:pt-8">
        {children}
      </main>
    </div>
  )
}
