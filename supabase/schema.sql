-- Jewelry Business Manager Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'staff');
CREATE TYPE product_category AS ENUM ('necklace', 'bracelet', 'earrings', 'watch', 'ring');

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'staff',
    phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category product_category NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PRODUCT VARIANTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    variant_name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

-- =============================================
-- SALES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);

-- =============================================
-- SALE ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    quantity_sold INTEGER NOT NULL CHECK (quantity_sold > 0),
    price_at_sale DECIMAL(10, 2) NOT NULL CHECK (price_at_sale >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_variant_id ON public.sale_items(variant_id);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_products
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_product_variants
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- PRODUCTS POLICIES
-- =============================================

-- Admins can do everything with products
CREATE POLICY "Admins can insert products"
    ON public.products
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update products"
    ON public.products
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete products"
    ON public.products
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- All authenticated users can view products
CREATE POLICY "Authenticated users can view products"
    ON public.products
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- =============================================
-- PRODUCT VARIANTS POLICIES
-- =============================================

-- Admins can do everything with product variants
CREATE POLICY "Admins can insert product variants"
    ON public.product_variants
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update product variants"
    ON public.product_variants
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete product variants"
    ON public.product_variants
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- All authenticated users can view product variants
CREATE POLICY "Authenticated users can view product variants"
    ON public.product_variants
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- =============================================
-- SALES POLICIES
-- =============================================

-- Admins can view all sales
CREATE POLICY "Admins can view all sales"
    ON public.sales
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Staff can view their own sales
CREATE POLICY "Staff can view own sales"
    ON public.sales
    FOR SELECT
    USING (auth.uid() = user_id);

-- Authenticated users can insert sales
CREATE POLICY "Authenticated users can insert sales"
    ON public.sales
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- SALE ITEMS POLICIES
-- =============================================

-- Users can view sale items for sales they can see
CREATE POLICY "Users can view sale items"
    ON public.sale_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sales
            WHERE id = sale_items.sale_id
            AND (
                user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

-- Authenticated users can insert sale items
CREATE POLICY "Authenticated users can insert sale items"
    ON public.sale_items
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- HELPER FUNCTION: Create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (NEW.id, 'staff');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Insert a sample admin user profile
-- Note: You'll need to create the user in Supabase Auth first, then update this with their UUID
-- INSERT INTO public.profiles (id, role, phone_number)
-- VALUES ('your-admin-user-uuid-here', 'admin', '+1234567890');

-- Insert sample products
-- INSERT INTO public.products (name, description, category) VALUES
-- ('Gold Hoop Earrings', 'Classic 14k gold hoop earrings', 'earrings'),
-- ('Diamond Solitaire Ring', 'Beautiful diamond engagement ring', 'ring'),
-- ('Silver Chain Necklace', 'Sterling silver chain necklace', 'necklace');

-- =============================================
-- VIEWS FOR ANALYTICS (Optional but useful)
-- =============================================

-- View for low stock items
CREATE OR REPLACE VIEW public.low_stock_items AS
SELECT 
    pv.id,
    pv.sku,
    pv.variant_name,
    p.name as product_name,
    p.category,
    pv.stock_quantity,
    pv.low_stock_threshold,
    pv.price
FROM public.product_variants pv
JOIN public.products p ON pv.product_id = p.id
WHERE pv.stock_quantity <= pv.low_stock_threshold
ORDER BY pv.stock_quantity ASC;

-- View for best selling products
CREATE OR REPLACE VIEW public.best_selling_products AS
SELECT 
    pv.id as variant_id,
    p.name as product_name,
    pv.variant_name,
    p.category,
    SUM(si.quantity_sold) as total_sold,
    SUM(si.quantity_sold * si.price_at_sale) as total_revenue
FROM public.sale_items si
JOIN public.product_variants pv ON si.variant_id = pv.id
JOIN public.products p ON pv.product_id = p.id
GROUP BY pv.id, p.name, pv.variant_name, p.category
ORDER BY total_sold DESC;

-- View for sales analytics
CREATE OR REPLACE VIEW public.sales_analytics AS
SELECT 
    DATE(s.created_at) as sale_date,
    COUNT(DISTINCT s.id) as number_of_sales,
    SUM(s.total_amount) as total_revenue,
    SUM(si.quantity_sold) as total_items_sold,
    AVG(s.total_amount) as average_sale_amount
FROM public.sales s
JOIN public.sale_items si ON s.id = si.sale_id
GROUP BY DATE(s.created_at)
ORDER BY sale_date DESC;

-- Grant permissions for views
GRANT SELECT ON public.low_stock_items TO authenticated;
GRANT SELECT ON public.best_selling_products TO authenticated;
GRANT SELECT ON public.sales_analytics TO authenticated;
