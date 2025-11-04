// دوال مساعدة للطلب عبر واتساب

interface WhatsAppMessageParams {
  storeName: string;
  offerName?: string;
  productName?: string;
}

/**
 * بناء رسالة واتساب مُهيأة مسبقاً
 */
export function buildWhatsAppMessage({ 
  storeName, 
  offerName,
  productName 
}: WhatsAppMessageParams): string {
  let message = `السلام عليكم ورحمة الله وبركاته\n\n`;
  
  if (offerName) {
    message += `أرغب في الاستفسار عن العرض:\n📢 ${offerName}\n\n`;
  } else if (productName) {
    message += `أرغب في الاستفسار عن المنتج:\n🛍️ ${productName}\n\n`;
  }
  
  message += `من المتجر:\n🏪 ${storeName}\n\n`;
  message += `بياناتي:\n`;
  message += `الاسم: \n`;
  message += `رقم الجوال: \n`;
  message += `المدينة/الحي: \n`;
  message += `طريقة الاستلام: [ ] توصيل  [ ] استلام من المحل\n\n`;
  message += `ملاحظات إضافية: `;
  
  return message;
}

/**
 * إنشاء رابط واتساب
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  // تنظيف رقم الهاتف من المسافات والرموز
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // ترميز الرسالة للURL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * رقم واتساب المنصة الرئيسي
 */
export const PLATFORM_WHATSAPP = "966532402020";
