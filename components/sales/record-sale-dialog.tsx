'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShoppingCart, Plus, Trash2 } from 'lucide-react'
import { createSale } from '@/app/actions/sales'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface RecordSaleDialogProps {
  userId: string
}

interface CartItem {
  variantId: string
  variantName: string
  productName: string
  imageUrl: string | null
  quantity: number
  price: number
}

export function RecordSaleDialog({ userId }: RecordSaleDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [variants, setVariants] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchVariants()
    }
  }, [open])

  const fetchVariants = async () => {
    const { data } = await supabase
      .from('product_variants')
      .select(`
        *,
        product:products(name, category)
      `)
      .gt('stock_quantity', 0)
      .order('product(name)')

    setVariants(data || [])
  }

  const addToCart = () => {
    if (!selectedVariantId || !quantity) return

    const variant = variants.find((v) => v.id === selectedVariantId)
    if (!variant) return

    const existingItem = cart.find((item) => item.variantId === selectedVariantId)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.variantId === selectedVariantId
            ? { ...item, quantity: item.quantity + parseInt(quantity) }
            : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          variantId: variant.id,
          variantName: variant.variant_name,
          productName: variant.product.name,
          imageUrl: variant.product.image_url,
          quantity: parseInt(quantity),
          price: parseFloat(variant.price),
        },
      ])
    }

    setSelectedVariantId('')
    setQuantity('1')
  }

  const removeFromCart = (variantId: string) => {
    setCart(cart.filter((item) => item.variantId !== variantId))
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('Please add at least one item to the cart')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await createSale(
        cart.map((item) => ({
          variant_id: item.variantId,
          quantity: item.quantity,
          price_at_sale: item.price,
        })),
        userId
      )

      if (!result.success) {
        throw new Error(result.error)
      }

      setOpen(false)
      setCart([])
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Record New Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
          <DialogDescription>Add products to complete the sale</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Item Form */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-2">
              <Label>Product Variant</Label>
              <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product..." />
                </SelectTrigger>
                <SelectContent>
                  {variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      <div className="flex items-center gap-2">
                        {variant.product.image_url && (
                          <img 
                            src={variant.product.image_url} 
                            alt={variant.product.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        )}
                        <span>
                          {variant.product.name} - {variant.variant_name} (
                          {formatCurrency(variant.price)}) - Stock: {variant.stock_quantity}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <Button onClick={addToCart} disabled={!selectedVariantId}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.variantId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.productName}
                              className="w-10 h-10 object-cover rounded border" 
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded border flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No img</span>
                            </div>
                          )}
                          <span>{item.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.variantName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFromCart(item.variantId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-semibold">
                      Total:
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {formatCurrency(totalAmount)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {cart.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              No items added yet. Select a product above to add to cart.
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || cart.length === 0}>
            {loading ? 'Processing...' : `Complete Sale (${formatCurrency(totalAmount)})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
