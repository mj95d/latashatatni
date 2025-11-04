import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the form data to your backend
    toast({
      title: "تم الإرسال بنجاح",
      description: "شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 lg:px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4 shadow-glow">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text">
            اتصل بنا
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            نحن هنا لمساعدتك. تواصل معنا وسنرد عليك في أقرب وقت ممكن
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-8">
          {/* Contact Information */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-8 shadow-elegant border-2 hover:shadow-glow transition-smooth">
              <h2 className="text-2xl font-bold mb-6 gradient-text">معلومات التواصل</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">البريد الإلكتروني</h3>
                    <a 
                      href="mailto:info@latashatini.sa" 
                      className="text-muted-foreground hover:text-primary transition-smooth"
                    >
                      info@latashatini.sa
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">الهاتف</h3>
                    <a 
                      href="tel:+966532402020" 
                      className="text-muted-foreground hover:text-primary transition-smooth"
                      dir="ltr"
                    >
                      +966 53 240 2020
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">الموقع</h3>
                    <p className="text-muted-foreground">
                      المملكة العربية السعودية
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t-2 border-border/50">
                <h3 className="font-semibold text-lg mb-4">ساعات العمل</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>السبت - الخميس: 9:00 ص - 6:00 م</p>
                  <p>الجمعة: مغلق</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="md:col-span-3 p-8 md:p-10 shadow-elegant border-2">
            <h2 className="text-2xl font-bold mb-6 gradient-text">أرسل لنا رسالة</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">الاسم الكامل *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="أدخل اسمك الكامل"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+966 50 000 0000"
                    className="h-12"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-base">الموضوع *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="موضوع الرسالة"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-base">الرسالة *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="اكتب رسالتك هنا..."
                  className="min-h-[150px] resize-none"
                />
              </div>

              <Button 
                type="submit" 
                size="lg"
                className="w-full md:w-auto px-12 text-lg shadow-glow hover:shadow-xl hover:scale-105 transition-smooth"
              >
                <Send className="ml-2 h-5 w-5" />
                إرسال الرسالة
              </Button>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
