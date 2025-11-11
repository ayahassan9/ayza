'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Package, ShoppingCart, LogOut, Menu, X, Home } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import { UserRole } from '@/lib/types'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function fetchUserRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        console.log('Profile data:', profile) // Debug log
        console.log('Profile error:', error) // Debug log
        console.log('User role fetched:', profile?.role) // Debug log
        
        setUserRole(profile?.role || null)
      }
      setLoading(false)
    }

    fetchUserRole()
  }, [supabase, pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return null
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      adminOnly: true,
    },
    {
      name: 'Stock',
      href: '/stock',
      icon: Package,
      adminOnly: true,
    },
    {
      name: 'Sales',
      href: '/sales',
      icon: ShoppingCart,
      adminOnly: false,
    },
  ]

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || userRole === 'admin'
  )

  console.log('User role:', userRole) // Debug log
  console.log('Filtered navigation:', filteredNavigation) // Debug log

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <img src="/icon-192.png" alt="Ayza" className="h-8 w-8 rounded" />
          <h2 className="text-lg font-semibold">Ayza Manager</h2>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Desktop Header */}
        <div className="hidden h-16 items-center justify-between border-b px-6 lg:flex">
          <div className="flex items-center gap-2">
            <img src="/icon-192.png" alt="Ayza" className="h-8 w-8 rounded" />
            <h2 className="text-lg font-semibold">Ayza Manager</h2>
          </div>
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 mt-16 lg:mt-0">
          {filteredNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="mb-2 px-3">
            <p className="text-sm text-muted-foreground">
              Role: <span className="font-medium capitalize">{userRole}</span>
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card lg:hidden">
        <nav className="flex items-center justify-around px-2 py-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors min-w-0 flex-1 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
