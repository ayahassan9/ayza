'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { SaleWithItems } from '@/lib/types'

interface SalesTableProps {
  sales: SaleWithItems[]
}

export function SalesTable({ sales }: SalesTableProps) {
  if (!sales || sales.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No sales recorded yet.</p>
        <p className="text-sm mt-2">Click "Record New Sale" to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sales.map((sale) => (
        <div key={sale.id} className="border rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">Sale #{sale.id.slice(0, 8)}</div>
              <div className="text-sm text-muted-foreground">
                {formatDateTime(sale.created_at)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{formatCurrency(sale.total_amount)}</div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.sale_items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.product_variant.product.image_url ? (
                        <img 
                          src={item.product_variant.product.image_url} 
                          alt={item.product_variant.product.name}
                          className="w-10 h-10 object-cover rounded border" 
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded border flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No img</span>
                        </div>
                      )}
                      <span>{item.product_variant.product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.product_variant.variant_name}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.price_at_sale)}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity_sold}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.price_at_sale * item.quantity_sold)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  )
}
