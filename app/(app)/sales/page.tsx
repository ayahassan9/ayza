import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RecordSaleDialog } from '@/components/sales/record-sale-dialog'
import { SalesTable } from '@/components/sales/sales-table'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getSalesData() {
  const supabase = createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Get sales based on role
  let query = supabase
    .from('sales')
    .select(`
      *,
      profiles:user_id(id, role),
      sale_items(
        *,
        product_variant:product_variants(
          *,
          product:products(*)
        )
      )
    `)
    .order('created_at', { ascending: false })

  // If staff, only show their own sales
  if (profile?.role === 'staff') {
    query = query.eq('user_id', user.id)
  }

  const { data: sales, error } = await query

  if (error) {
    console.error('Error fetching sales:', error)
    return { sales: [], user, profile }
  }

  // Calculate stats
  const totalRevenue = sales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0
  const totalSales = sales?.length || 0

  return { sales: sales || [], user, profile, stats: { totalRevenue, totalSales } }
}

export default async function SalesPage() {
  const { sales, user, profile, stats } = await getSalesData()

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Sales</h1>
          <p className="text-sm text-muted-foreground lg:text-base">
            Record new sales and view transaction history
          </p>
        </div>
        <RecordSaleDialog userId={user.id} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 lg:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <span className="text-2xl">🛒</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSales || 0}</div>
            <p className="text-xs text-muted-foreground">
              {profile?.role === 'staff' ? 'Your sales' : 'All sales'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {profile?.role === 'staff' ? 'Your revenue' : 'All revenue'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl">Sales History</CardTitle>
          <CardDescription className="text-xs lg:text-sm">
            {profile?.role === 'staff'
              ? 'Your recent sales transactions'
              : 'All sales transactions'}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <SalesTable sales={sales} />
        </CardContent>
      </Card>
    </div>
  )
}
