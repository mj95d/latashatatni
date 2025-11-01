import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatType = "general" | "product_explain" | "content_summary" | "text_analysis" | "order_tracking";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatType, setChatType] = useState<ChatType>("general");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: newMessages,
          type: chatType 
        }),
      });

      if (resp.status === 429) {
        toast({
          title: "تجاوز الحد المسموح",
          description: "تم تجاوز عدد الطلبات المسموح، يرجى المحاولة لاحقاً.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (resp.status === 402) {
        toast({
          title: "خطأ في الدفع",
          description: "يرجى إضافة رصيد إلى حساب Lovable AI.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!resp.ok || !resp.body) {
        throw new Error("فشل الاتصال بالخدمة");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("خطأ في الشات:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء المحادثة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    await streamChat(userMessage);
  };

  const quickActions = [
    { label: "شرح منتج", type: "product_explain" as ChatType, icon: "🛍️" },
    { label: "تلخيص محتوى", type: "content_summary" as ChatType, icon: "📝" },
    { label: "تحليل نص", type: "text_analysis" as ChatType, icon: "🔍" },
    { label: "تتبع طلب", type: "order_tracking" as ChatType, icon: "📦" },
  ];

  return (
    <>
      {/* زر فتح الشات */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* نافذة الشات */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          {/* رأس الشات */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">مساعد لا تشتتني الذكي</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* إجراءات سريعة */}
          {messages.length === 0 && (
            <div className="p-4 border-b">
              <p className="text-sm text-muted-foreground mb-3">كيف يمكنني مساعدتك؟</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.type}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setChatType(action.type);
                      toast({
                        title: "تم تفعيل",
                        description: `وضع ${action.label}`,
                      });
                    }}
                    className={chatType === action.type ? "border-primary bg-primary/10" : ""}
                  >
                    <span className="mr-2">{action.icon}</span>
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* منطقة الرسائل */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-10">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>مرحباً! أنا مساعدك الذكي</p>
                <p className="text-sm mt-2">اختر وضع المساعدة أو ابدأ المحادثة مباشرة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-primary text-white"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* حقل الإدخال */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="اكتب رسالتك..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default AIChatbot;
