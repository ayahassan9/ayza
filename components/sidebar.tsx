'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Package, ShoppingCart, LogOut } from 'lucide-react'
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
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2">
          <img src="/icon-192.png" alt="Ayza" className="h-8 w-8 rounded" />
          <h2 className="text-lg font-semibold">Ayza Manager</h2>
        </div>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
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
  )
}
