// دوال مساعدة للطلب عبر واتساب

interface WhatsAppMessageParams {
  storeName: string;
  offerName?: string;
  productName?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryMethod?: string;
  price?: number;
  quantity?: number;
  storePhone?: string;
  orderId?: string;
}

/**
 * بناء رسالة واتساب احترافية مُهيأة مسبقاً
 */
export function buildWhatsAppMessage({ 
  storeName, 
  offerName,
  productName,
  customerName,
  customerPhone,
  deliveryMethod,
  price,
  quantity = 1,
  storePhone,
  orderId
}: WhatsAppMessageParams): string {
  const hasCustomerInfo = customerName || customerPhone || deliveryMethod;
  
  let message = `السلام عليكم ورحمة الله وبركاته\n`;
  message += `أرغب في تقديم طلب جديد عبر منصة *لا تشتتني* ✅\n\n`;
  
  // Order ID
  if (orderId) {
    message += `🔹 *رقم الطلب:* ${orderId}\n`;
  }
  
  // Product/Offer Info
  if (productName) {
    message += `🔹 *اسم المنتج:* ${productName}\n`;
  } else if (offerName) {
    message += `🔹 *العرض:* ${offerName}\n`;
  }
  
  // Quantity & Price
  if (quantity) {
    message += `🔹 *الكمية:* ${quantity}\n`;
  }
  if (price) {
    message += `🔹 *السعر:* ${price} ر.س\n`;
  }
  
  message += `\n`;
  
  // Store Info
  message += `🔹 *اسم المتجر:* ${storeName}\n`;
  if (storePhone) {
    message += `🔹 *رقم صاحب المتجر:* ${storePhone}\n`;
  }
  
  message += `\n`;
  
  // Customer Info
  if (hasCustomerInfo) {
    message += `*معلومات التواصل:*\n`;
    if (customerName) {
      message += `الاسم: ${customerName}\n`;
    }
    if (customerPhone) {
      message += `رقم الجوال: ${customerPhone}\n`;
    }
    if (deliveryMethod) {
      message += `طريقة الاستلام: ${deliveryMethod}\n`;
    }
  } else {
    message += `*معلومات التواصل:*\n`;
    message += `الاسم: \n`;
    message += `رقم الجوال: \n`;
    message += `المدينة/الحي: \n`;
    message += `طريقة الاستلام: [ ] توصيل  [ ] استلام من المحل\n`;
  }
  
  return message;
}

/**
 * توليد رقم طلب فريد
 */
export function generateOrderId(): string {
  return `ORD-${Math.floor(Math.random() * 90000) + 10000}`;
}

/**
 * إنشاء رابط واتساب
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  // تنظيف رقم الهاتف من المسافات والرموز وعلامة +
  let cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // إضافة علامة + إذا لم تكن موجودة
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone;
  }
  
  // ترميز الرسالة للURL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * رقم واتساب المنصة الرئيسي
 */
export const PLATFORM_WHATSAPP = "+966532402020";
