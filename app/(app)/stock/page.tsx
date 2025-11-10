import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StockTable } from '@/components/stock/stock-table'
import { AddProductDialog } from '@/components/stock/add-product-dialog'

async function getStockData() {
  const supabase = createClient()

  // Check auth and role
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

  // Get all products with variants
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return { products: [] }
  }

  return { products: products || [] }
}

export default async function StockPage() {
  const { products } = await getStockData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground">
            Manage your jewelry inventory and product variants
          </p>
        </div>
        <AddProductDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            All products and their variants in your stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockTable products={products} />
        </CardContent>
      </Card>
    </div>
  )
}
