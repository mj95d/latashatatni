import { Mail, Phone, Facebook, Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-transparent.png";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const [settings, setSettings] = useState<{
    contact_email?: string;
    contact_phone?: string;
    support_phone?: string;
    facebook_url?: string;
    twitter_url?: string;
    instagram_url?: string;
  }>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("setting_key, setting_value")
        .in("setting_key", [
          "contact_email",
          "contact_phone",
          "support_phone",
          "facebook_url",
          "twitter_url",
          "instagram_url",
        ]);

      if (error) throw error;

      const settingsMap = data?.reduce((acc, item) => {
        acc[item.setting_key] = item.setting_value;
        return acc;
      }, {} as any);

      setSettings(settingsMap || {});
    } catch (error) {
      console.error("Error fetching footer settings:", error);
    }
  };

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
                <Link to="/about" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">عن المنصة</span>
                </Link>
              </li>
              <li>
                <Link to="/stores" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">المتاجر</span>
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">العروض</span>
                </Link>
              </li>
              <li>
                <Link to="/cities" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">المدن</span>
                </Link>
              </li>
              <li>
                <Link to="/tourism" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">السياحة</span>
                </Link>
              </li>
              <li>
                <Link to="/plans" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">الاشتراكات</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-5">الدعم</h4>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li>
                <Link to="/help" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">الأسئلة الشائعة</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">سياسة الخصوصية</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">الشروط والأحكام</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-smooth inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-smooth">اتصل بنا</span>
                </Link>
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
                <a href={`mailto:${settings.contact_email || "info@latashatini.sa"}`} className="hover:text-primary transition-smooth">
                  {settings.contact_email || "info@latashatini.sa"}
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <a href="tel:+966532402020" className="hover:text-primary transition-smooth" dir="ltr">
                  +966 53 240 2020
                </a>
              </li>
              {settings.support_phone && (
                <li className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <a href={`tel:${settings.support_phone}`} className="hover:text-primary transition-smooth" dir="ltr">
                    {settings.support_phone}
                  </a>
                </li>
              )}
            </ul>

            {/* Social Media */}
            <div className="flex items-center gap-3 mt-8">
              {settings.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth hover:scale-110 shadow-soft"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              <a
                href={settings.instagram_url || "https://www.instagram.com/latashtetni?igsh=MXU2aDY4bDVxYmx4Nw=="}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth hover:scale-110 shadow-soft"
              >
                <Instagram className="w-5 h-5" />
              </a>
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth hover:scale-110 shadow-soft"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t-2 border-border/50">
          <div className="text-center">
            <p className="text-base text-muted-foreground">
              © 2025 <span className="font-semibold text-primary">لا تشتتني</span>. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
