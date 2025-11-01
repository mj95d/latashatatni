import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // تخصيص النظام حسب نوع الطلب
    let systemPrompt = "";
    
    switch (type) {
      case "product_explain":
        systemPrompt = "أنت مساعد ذكي متخصص في شرح المنتجات والعروض. اشرح بطريقة واضحة وجذابة مع التركيز على الفوائد والمميزات.";
        break;
      case "content_summary":
        systemPrompt = "أنت مساعد ذكي متخصص في تلخيص المحتوى. قدم ملخصات موجزة ودقيقة مع الحفاظ على النقاط الرئيسية.";
        break;
      case "text_analysis":
        systemPrompt = "أنت مساعد ذكي متخصص في تحليل النصوص. قدم تحليلات عميقة ومفيدة مع استخراج المعلومات المهمة.";
        break;
      case "order_tracking":
        systemPrompt = "أنت مساعد ذكي متخصص في مساعدة العملاء بتتبع طلباتهم. كن ودوداً ومساعداً وقدم معلومات واضحة.";
        break;
      default:
        systemPrompt = "أنت مساعد ذكي لمنصة 'لا تشتتني' - منصة العروض والخصومات في السعودية. ساعد المستخدمين في إيجاد أفضل العروض، اشرح المنتجات، ساعد في تتبع الطلبات، وقدم دعماً فورياً. كن ودوداً ومفيداً واستخدم اللغة العربية بشكل احترافي.";
    }

    console.log("Sending request to Lovable AI with type:", type);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد إلى حساب Lovable AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "حدث خطأ في خدمة الذكاء الاصطناعي" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "حدث خطأ غير متوقع" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
