'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface LowStockItem {
  id: string
  sku: string
  variant_name: string
  stock_quantity: number
  low_stock_threshold: number
  price: number
  product: {
    name: string
    category: string
  }
}

export function LowStockAlerts({ data }: { data: LowStockItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-green-600 dark:text-green-400">
        ✅ All products are well stocked!
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Variant</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Stock</TableHead>
          <TableHead className="text-right">Threshold</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.product.name}</TableCell>
            <TableCell>{item.variant_name}</TableCell>
            <TableCell className="font-mono text-sm">{item.sku}</TableCell>
            <TableCell className="capitalize">{item.product.category}</TableCell>
            <TableCell className="text-right">
              <Badge
                variant={item.stock_quantity === 0 ? 'destructive' : 'secondary'}
              >
                {item.stock_quantity}
              </Badge>
            </TableCell>
            <TableCell className="text-right">{item.low_stock_threshold}</TableCell>
            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
