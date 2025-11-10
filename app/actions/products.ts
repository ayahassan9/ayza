'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  CreateProductForm,
  CreateVariantForm,
  UpdateVariantForm,
  ProductCategory,
} from '@/lib/types'

// Create a new product with its first variant
export async function createProduct(formData: CreateProductForm) {
  try {
    const supabase = createClient()

    // Create the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        image_url: formData.image_url || null,
      })
      .select()
      .single()

    if (productError) throw productError

    // Create the first variant
    const { error: variantError } = await supabase
      .from('product_variants')
      .insert({
        product_id: product.id,
        variant_name: formData.variant_name,
        sku: formData.sku,
        price: formData.price,
        stock_quantity: formData.stock_quantity,
        low_stock_threshold: formData.low_stock_threshold,
      })

    if (variantError) throw variantError

    revalidatePath('/stock')
    revalidatePath('/dashboard')

    return { success: true, data: product }
  } catch (error: any) {
    console.error('Error creating product:', error)
    return { success: false, error: error.message || 'Failed to create product' }
  }
}

// Create a new variant for an existing product
export async function createVariant(formData: CreateVariantForm) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('product_variants')
      .insert({
        product_id: formData.product_id,
        variant_name: formData.variant_name,
        sku: formData.sku,
        price: formData.price,
        stock_quantity: formData.stock_quantity,
        low_stock_threshold: formData.low_stock_threshold,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/stock')
    revalidatePath('/dashboard')

    return { success: true, data }
  } catch (error: any) {
    console.error('Error creating variant:', error)
    return { success: false, error: error.message || 'Failed to create variant' }
  }
}

// Update an existing product variant
export async function updateVariant(id: string, formData: UpdateVariantForm) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('product_variants')
      .update(formData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/stock')
    revalidatePath('/dashboard')

    return { success: true, data }
  } catch (error: any) {
    console.error('Error updating variant:', error)
    return { success: false, error: error.message || 'Failed to update variant' }
  }
}

// Delete a product variant
export async function deleteVariant(id: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/stock')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting variant:', error)
    return { success: false, error: error.message || 'Failed to delete variant' }
  }
}

// Get all products with their variants
export async function getProductsWithVariants() {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return { success: false, error: error.message }
  }
}

// Get low stock items
export async function getLowStockItems() {
  try {
    const supabase = createClient()

    // Fetch all variants and filter in application code
    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        *,
        product:products(*)
      `)
      .order('stock_quantity', { ascending: true })

    if (error) throw error

    // Filter for low stock items (where stock_quantity <= low_stock_threshold)
    const lowStockItems = data?.filter(
      variant => variant.stock_quantity <= variant.low_stock_threshold
    ) || []

    return { success: true, data: lowStockItems }
  } catch (error: any) {
    console.error('Error fetching low stock items:', error)
    return { success: false, error: error.message }
  }
}
