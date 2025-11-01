import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t-2 border-border/50">
      <div className="container mx-auto px-4 lg:px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl transition-smooth group-hover:scale-110">
                <img 
                  src={logo} 
                  alt="لا تشتتني" 
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                لا تشتتني
              </h3>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              منصة سعودية محلية تجمع لك المتاجر والعروض القريبة منك في مكان واحد بدون تشتت
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-5">روابط سريعة</h4>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">عن المنصة</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">كيف تعمل؟</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">للتجار</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">المدونة</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-5">الدعم</h4>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">الأسئلة الشائعة</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">سياسة الخصوصية</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">الشروط والأحكام</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">اتصل بنا</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-5">تواصل معنا</h4>
            <ul className="space-y-4 text-base text-muted-foreground">
              <li className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <a href="mailto:info@latashatini.sa" className="hover:text-primary transition-smooth">
                  info@latashatini.sa
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <a href="tel:+966500000000" className="hover:text-primary transition-smooth" dir="ltr">
                  +966 50 000 0000
                </a>
              </li>
            </ul>

            {/* Social Media */}
            <div className="flex items-center gap-3 mt-8">
              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth hover:scale-110 shadow-soft"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth hover:scale-110 shadow-soft"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth hover:scale-110 shadow-soft"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t-2 border-border/50 text-center">
          <p className="text-base text-muted-foreground">
            © 2025 <span className="font-semibold text-primary">لا تشتتني</span>. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
