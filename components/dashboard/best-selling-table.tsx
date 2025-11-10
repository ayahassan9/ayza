'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface BestSellingItem {
  variant_id: string
  variant_name: string
  product_name: string
  category: string
  total_sold: number
}

export function BestSellingTable({ data }: { data: BestSellingItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No sales data available yet
      </div>
    )
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Variant</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Sold</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.variant_id}>
              <TableCell className="font-medium">{item.product_name}</TableCell>
              <TableCell>{item.variant_name}</TableCell>
              <TableCell className="capitalize">{item.category}</TableCell>
              <TableCell className="text-right">{item.total_sold}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
