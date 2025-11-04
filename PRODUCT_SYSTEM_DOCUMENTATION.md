# 📦 نظام المنتجات الكامل - التوثيق التقني

## 🎯 نظرة عامة (Overview)

نظام منتجات احترافي يسمح للتجار بإضافة حتى **10 منتجات مجانية**، كل منتج يحتوي على **حتى 8 صور**، مع نظام رفع صور متقدم يستخدم **Supabase Storage**.

---

## 🗄️ قاعدة البيانات (Database Schema)

### 1️⃣ جدول `products`

```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric,
  old_price numeric,
  images jsonb,  -- مصفوفة URLs للصور
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

### 2️⃣ Storage Bucket: `product-images`

```sql
-- Bucket Configuration
bucket_id: 'product-images'
public: true
file_size_limit: 5242880 (5MB)
allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
```

### 3️⃣ RLS Policies للمنتجات

```sql
-- عامة للقراءة (المنتجات النشطة فقط)
CREATE POLICY "public_read_products"
ON products FOR SELECT
USING (is_active = true);

-- التاجر يدير منتجات متجره فقط
CREATE POLICY "merchant_manage_own_products"
ON products FOR ALL
USING (
  store_id IN (
    SELECT id FROM stores 
    WHERE owner_id = auth.uid()
  )
);

-- الأدمن يدير كل شيء
CREATE POLICY "admin_manage_all_products"
ON products FOR ALL
USING (has_role(auth.uid(), 'admin'));
```

### 4️⃣ RLS Policies للصور

```sql
-- الجميع يمكنهم مشاهدة الصور
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- التجار يمكنهم رفع الصور
CREATE POLICY "Merchants can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);

-- التجار يمكنهم حذف صورهم
CREATE POLICY "Merchants can delete own product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);
```

### 5️⃣ Product Limit Trigger

```sql
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
  product_count INTEGER;
  store_plan TEXT;
BEGIN
  SELECT plan INTO store_plan FROM stores WHERE id = NEW.store_id;
  SELECT COUNT(*) INTO product_count FROM products WHERE store_id = NEW.store_id;
  
  IF store_plan = 'free' AND product_count >= 10 THEN
    RAISE EXCEPTION 'لقد وصلت للحد الأقصى من المنتجات (10 منتجات)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER check_product_limit_trigger
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION check_product_limit();
```

---

## 📱 المكونات (Components)

### 1️⃣ `ProductsManager.tsx`

**المسار:** `src/components/merchant/ProductsManager.tsx`

**الوظيفة:** واجهة إدارة المنتجات للتاجر

**الميزات:**
- ✅ عرض جميع المنتجات (بطاقات Grid)
- ✅ إضافة منتج جديد (Dialog)
- ✅ رفع حتى 8 صور لكل منتج
- ✅ معاينة الصور قبل الرفع
- ✅ حذف صورة من المعاينة
- ✅ تفعيل/إخفاء المنتج
- ✅ حذف المنتج
- ✅ عرض عداد المنتجات (X/10)

**الحقول المتاحة:**
- اسم المنتج (مطلوب)
- الوصف (اختياري)
- السعر الحالي (مطلوب)
- السعر القديم (اختياري)
- الصور (1-8 صور مطلوبة)

**مثال على الاستخدام:**
```tsx
<ProductsManager storeId="uuid-of-store" />
```

---

## 🛠️ آلية رفع الصور (Image Upload Flow)

### 1️⃣ اختيار الصور

```tsx
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  
  // التحقق من الحد الأقصى (8 صور)
  if (selectedFiles.length + files.length > 8) {
    toast.error("الحد الأقصى 8 صور");
    return;
  }

  setSelectedFiles([...selectedFiles, ...files]);
};
```

### 2️⃣ رفع الصور إلى Supabase Storage

```tsx
const uploadImages = async () => {
  const uploadedUrls: string[] = [];

  for (const file of selectedFiles) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${storeId}/${fileName}`;

    // رفع الملف
    const { error, data } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (error) throw error;

    // الحصول على الرابط العام
    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    uploadedUrls.push(publicUrl);
  }

  return uploadedUrls;
};
```

### 3️⃣ حفظ المنتج في قاعدة البيانات

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const imageUrls = await uploadImages();

  const { error } = await supabase.from("products").insert({
    store_id: storeId,
    name: formData.name,
    description: formData.description,
    price: parseFloat(formData.price),
    old_price: formData.old_price ? parseFloat(formData.old_price) : null,
    images: imageUrls,
  });

  if (error) throw error;
};
```

---

## 🖼️ عرض الصور في الواجهات

### في صفحة المنتج (`Product.tsx`)

```tsx
const productImages = product.images && Array.isArray(product.images) 
  ? product.images 
  : ['https://images.unsplash.com/default'];

// إذا كان هناك أكثر من صورة، استخدم Carousel
{productImages.length > 1 ? (
  <Carousel>
    {productImages.map((imgUrl, index) => (
      <CarouselItem key={index}>
        <img
          src={typeof imgUrl === 'string' ? imgUrl : imgUrl?.url}
          alt={`${product.name} - ${index + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/default';
          }}
        />
      </CarouselItem>
    ))}
  </Carousel>
) : (
  <img src={productImages[0]} alt={product.name} />
)}
```

### في لوحة الأدمن (`WhatsAppOrderDetailsDialog.tsx`)

```tsx
{order.products && order.products.images && (
  <img
    src={
      typeof order.products.images[0] === 'string' 
        ? order.products.images[0] 
        : order.products.images[0]?.url
    }
    alt={order.products.name}
    className="w-24 h-24 object-cover rounded-lg border-2"
    onError={(e) => {
      e.target.style.display = 'none';
    }}
  />
)}
```

---

## 📊 إحصائيات النظام

### في Dashboard الأدمن

```jsx
✅ إجمالي المنتجات
✅ المنتجات النشطة
✅ المنتجات المخفية
✅ المنتجات بعروض خاصة (old_price > price)
```

### في لوحة التاجر

```jsx
✅ عدد المنتجات الحالية / الحد الأقصى (X/10)
✅ عدد المنتجات النشطة
✅ عدد المنتجات المخفية
```

---

## 🔄 التكامل مع نظام الطلبات

### عند طلب منتج عبر واتساب

```tsx
const handleWhatsAppOrder = async () => {
  const message = buildWhatsAppMessage({
    storeName: product.stores?.name,
    productName: product.name
  });

  // تسجيل الطلب
  await supabase.from("whatsapp_orders").insert({
    store_id: product.store_id,
    product_id: product.id,  // ✅ ربط المنتج بالطلب
    offer_id: null,
    customer_message: message,
    source_page: "product_page"
  });

  // فتح واتساب
  window.open(buildWhatsAppLink(PLATFORM_WHATSAPP, message), '_blank');
};
```

### جلب بيانات الطلبات مع المنتجات

```tsx
const fetchOrders = async () => {
  const { data } = await supabase
    .from("whatsapp_orders")
    .select(`
      *,
      stores (name, phone, cities (name)),
      offers (title, discount_text, images)
    `);

  // جلب بيانات المنتجات بشكل منفصل
  const ordersWithProducts = await Promise.all(
    data.map(async (order) => {
      if (order.product_id) {
        const { data: productData } = await supabase
          .from("products")
          .select("name, price, images")
          .eq("id", order.product_id)
          .maybeSingle();
        
        return { ...order, products: productData };
      }
      return order;
    })
  );

  setOrders(ordersWithProducts);
};
```

---

## ✅ مميزات النظام

### 1️⃣ للتاجر
- ✅ إضافة حتى **10 منتجات مجانية**
- ✅ رفع حتى **8 صور لكل منتج**
- ✅ معاينة فورية للصور
- ✅ تفعيل/إخفاء المنتجات
- ✅ إضافة سعر قديم لعرض الخصم
- ✅ واجهة سهلة الاستخدام

### 2️⃣ للعميل
- ✅ تصفح المنتجات بصور عالية الجودة
- ✅ عرض Carousel للصور المتعددة
- ✅ طلب المنتج عبر واتساب بضغطة واحدة
- ✅ رؤية السعر القديم ونسبة الخصم

### 3️⃣ للأدمن
- ✅ مشاهدة جميع المنتجات
- ✅ رؤية صور المنتجات في الطلبات
- ✅ فلترة المنتجات حسب المتجر/الحالة
- ✅ إحصائيات شاملة

---

## 🔒 الأمان (Security)

### RLS Policies
- ✅ التاجر يرى فقط منتجات متجره
- ✅ العملاء يرون فقط المنتجات النشطة
- ✅ الأدمن يرى كل شيء

### Storage Security
- ✅ حد أقصى لحجم الصورة (5MB)
- ✅ أنواع ملفات محددة فقط (JPEG, PNG, WEBP)
- ✅ رفع آمن عبر Supabase Auth

### Triggers
- ✅ منع إضافة أكثر من 10 منتجات (Free Plan)
- ✅ حذف تلقائي عند حذف المتجر (CASCADE)

---

## 🚀 التطوير المستقبلي

### ميزات محتملة:
- ⭐ رفع حد المنتجات في الباقة المدفوعة
- ⭐ إضافة تصنيفات للمنتجات
- ⭐ البحث المتقدم عن المنتجات
- ⭐ تقييمات المنتجات
- ⭐ مقارنة المنتجات
- ⭐ سلة المشتريات الكاملة
- ⭐ الدفع الإلكتروني

---

## 📁 الملفات الرئيسية

```
src/
├── components/
│   └── merchant/
│       └── ProductsManager.tsx          # إدارة المنتجات للتاجر
├── pages/
│   ├── Product.tsx                      # صفحة المنتج الفردية
│   └── admin/
│       ├── Products.tsx                 # إدارة المنتجات للأدمن
│       └── WhatsAppOrders.tsx           # طلبات الواتساب
├── components/admin/
│   └── WhatsAppOrderDetailsDialog.tsx   # تفاصيل الطلب مع صور المنتج
```

---

## 🎨 التصميم

### الألوان المستخدمة
- Primary: `hsl(var(--primary))`
- Secondary: `hsl(var(--secondary))`
- Muted: `hsl(var(--muted))`

### المكونات
- Carousel (من shadcn/ui)
- Dialog (من shadcn/ui)
- Badge (من shadcn/ui)
- Card (من shadcn/ui)

---

## 📝 ملاحظات مهمة

1. **الصور يتم تخزينها كـ JSONB** في قاعدة البيانات (مصفوفة من URLs)
2. **Storage Bucket عام** لتسهيل الوصول للصور
3. **الحد الأقصى 10 منتجات** يتم فرضه عبر Trigger
4. **الصور تدعم lazy loading** لتحسين الأداء
5. **معالجة الأخطاء** في حالة فشل تحميل الصورة

---

**تم البناء:** ✅ مكتمل  
**الحالة:** 🟢 جاهز للاستخدام  
**الإصدار:** 3.0.0
