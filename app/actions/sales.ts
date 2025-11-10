'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Twilio from 'twilio'
import { SaleItemInput } from '@/lib/types'

// Make Twilio optional - only initialize if credentials are provided
const twilioClient = process.env.TWILIO_ACCOUNT_SID && 
                      process.env.TWILIO_AUTH_TOKEN && 
                      process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
  ? Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

// Send low stock alert via SMS
export async function sendLowStockAlert(
  variantName: string,
  remainingStock: number,
  productName: string
) {
  try {
    const supabase = createClient()

    // Get admin phone number
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('phone_number')
      .eq('role', 'admin')
      .not('phone_number', 'is', null)

    if (adminError) throw adminError

    if (!admins || admins.length === 0) {
      console.log('No admin phone numbers found')
      return { success: false, error: 'No admin phone numbers configured' }
    }

    // Send SMS to all admins with phone numbers (only if Twilio is configured)
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      const messagePromises = admins.map((admin) =>
        twilioClient.messages.create({
          body: `LOW STOCK ALERT: ${productName} - ${variantName} is running low. Only ${remainingStock} left in stock.`,
          from: process.env.TWILIO_PHONE_NUMBER!,
          to: admin.phone_number!,
        })
      )

      await Promise.all(messagePromises)
    } else {
      console.log('Twilio not configured, skipping SMS alert')
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error sending low stock alert:', error)
    return { success: false, error: error.message }
  }
}

// Create a new sale with transaction support
export async function createSale(items: SaleItemInput[], userId: string) {
  try {
    const supabase = createClient()

    // Validate that all variants have enough stock
    for (const item of items) {
      const { data: variant, error } = await supabase
        .from('product_variants')
        .select('stock_quantity, variant_name, product:products(name)')
        .eq('id', item.variant_id)
        .single()

      if (error) throw new Error(`Error fetching variant: ${error.message}`)

      if (!variant) {
        throw new Error('Product variant not found')
      }

      if (variant.stock_quantity < item.quantity) {
        const productName = Array.isArray(variant.product) 
          ? variant.product[0]?.name 
          : (variant.product as any)?.name
        throw new Error(
          `Insufficient stock for ${productName} - ${variant.variant_name}. Available: ${variant.stock_quantity}, Requested: ${item.quantity}`
        )
      }
    }

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price_at_sale * item.quantity,
      0
    )

    // Create the sale
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
      })
      .select()
      .single()

    if (saleError) throw saleError

    // Create sale items and update stock
    for (const item of items) {
      // Insert sale item
      const { error: saleItemError } = await supabase.from('sale_items').insert({
        sale_id: sale.id,
        variant_id: item.variant_id,
        quantity_sold: item.quantity,
        price_at_sale: item.price_at_sale,
      })

      if (saleItemError) throw saleItemError

      // Get current variant info before updating
      const { data: currentVariant } = await supabase
        .from('product_variants')
        .select('stock_quantity, low_stock_threshold, variant_name, product:products(name)')
        .eq('id', item.variant_id)
        .single()

      // Decrement stock
      const { error: stockError } = await supabase
        .from('product_variants')
        .update({
          stock_quantity: currentVariant!.stock_quantity - item.quantity,
        })
        .eq('id', item.variant_id)

      if (stockError) throw stockError

      // Check if low stock alert should be sent
      const newStockQuantity = currentVariant!.stock_quantity - item.quantity
      if (
        newStockQuantity <= currentVariant!.low_stock_threshold &&
        currentVariant!.stock_quantity > currentVariant!.low_stock_threshold
      ) {
        // Send low stock alert (non-blocking)
        const productName = Array.isArray(currentVariant!.product) 
          ? currentVariant!.product[0]?.name 
          : (currentVariant!.product as any)?.name
        sendLowStockAlert(
          currentVariant!.variant_name,
          newStockQuantity,
          productName || 'Unknown Product'
        ).catch((error) => console.error('Failed to send SMS alert:', error))
      }
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/stock')
    revalidatePath('/sales')

    return { success: true, data: sale }
  } catch (error: any) {
    console.error('Error creating sale:', error)
    return { success: false, error: error.message || 'Failed to create sale' }
  }
}

// Get sales data with filtering
export async function getSales(userId?: string, limit?: number) {
  try {
    const supabase = createClient()

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

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching sales:', error)
    return { success: false, error: error.message }
  }
}
