import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DashboardStats } from '@/components/dashboard/stats'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { BestSellingTable } from '@/components/dashboard/best-selling-table'
import { LowStockAlerts } from '@/components/dashboard/low-stock-alerts'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const supabase = createClient()

  // Get user and check if admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/sales')
  }

  // Get total revenue
  const { data: sales } = await supabase
    .from('sales')
    .select('total_amount')

  const totalRevenue = sales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0

  // Get total sales count
  const totalSales = sales?.length || 0

  // Get total items sold
  const { data: saleItems } = await supabase
    .from('sale_items')
    .select('quantity_sold')

  const totalItemsSold = saleItems?.reduce((sum, item) => sum + item.quantity_sold, 0) || 0

  // Get low stock count
  const { data: lowStock } = await supabase
    .from('product_variants')
    .select('id, stock_quantity, low_stock_threshold')

  const lowStockCount = lowStock?.filter(
    (item) => item.stock_quantity <= item.low_stock_threshold
  ).length || 0

  // Get best selling products
  const { data: bestSelling } = await supabase
    .from('sale_items')
    .select(`
      variant_id,
      quantity_sold,
      product_variant:product_variants(
        id,
        variant_name,
        product:products(name, category)
      )
    `)

  // Aggregate best selling
  const aggregated = bestSelling?.reduce((acc: any, item: any) => {
    const variantId = item.variant_id
    if (!acc[variantId]) {
      acc[variantId] = {
        variant_id: variantId,
        variant_name: item.product_variant.variant_name,
        product_name: item.product_variant.product.name,
        category: item.product_variant.product.category,
        total_sold: 0,
      }
    }
    acc[variantId].total_sold += item.quantity_sold
    return acc
  }, {})

  const bestSellingArray = aggregated
    ? Object.values(aggregated)
        .sort((a: any, b: any) => b.total_sold - a.total_sold)
        .slice(0, 10)
    : []

  // Get low stock items
  const { data: lowStockItems } = await supabase
    .from('product_variants')
    .select(`
      id,
      sku,
      variant_name,
      stock_quantity,
      low_stock_threshold,
      price,
      product:products(name, category)
    `)

  const lowStockAlerts = lowStockItems?.filter(
    (item) => item.stock_quantity <= item.low_stock_threshold
  ).sort((a, b) => a.stock_quantity - b.stock_quantity) || []

  return {
    stats: {
      totalRevenue,
      totalSales,
      totalItemsSold,
      lowStockCount,
    },
    bestSelling: bestSellingArray,
    lowStockAlerts,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your jewelry business performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaire</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <span className="text-2xl">🛒</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">Completed transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalItemsSold}</div>
            <p className="text-xs text-muted-foreground">Total items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <span className="text-2xl">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Revenue trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Selling Items</CardTitle>
            <CardDescription>Top 10 products by quantity sold</CardDescription>
          </CardHeader>
          <CardContent>
            <BestSellingTable data={data.bestSelling as any} />
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alerts</CardTitle>
          <CardDescription>
            Items that are at or below the low stock threshold
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LowStockAlerts data={data.lowStockAlerts as any} />
        </CardContent>
      </Card>
    </div>
  )
}
