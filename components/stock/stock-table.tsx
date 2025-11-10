'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ProductWithVariants } from '@/lib/types'
import { deleteVariant } from '@/app/actions/products'
import { useRouter } from 'next/navigation'

interface StockTableProps {
  products: ProductWithVariants[]
}

export function StockTable({ products }: StockTableProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleDelete = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return

    setLoading(variantId)
    try {
      const result = await deleteVariant(variantId)
      if (!result.success) {
        throw new Error(result.error)
      }
      router.refresh()
    } catch (error: any) {
      alert('Error deleting variant: ' + error.message)
    } finally {
      setLoading(null)
    }
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No products in stock yet.</p>
        <p className="text-sm mt-2">Click "Add Product" to get started.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Variant</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Threshold</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) =>
            product.product_variants.map((variant) => {
              const isLowStock = variant.stock_quantity <= variant.low_stock_threshold
              
              return (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded border" 
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded border flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No img</span>
                        </div>
                      )}
                      <span>{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{variant.variant_name}</TableCell>
                  <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                  <TableCell className="capitalize">{product.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(variant.price)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={isLowStock ? 'destructive' : 'secondary'}>
                      {variant.stock_quantity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{variant.low_stock_threshold}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => alert('Edit functionality coming soon')}
                        disabled={loading === variant.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(variant.id)}
                        disabled={loading === variant.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
