import { memo, lazy, Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Building2,
  Camera,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  GraduationCap,
  Key,
  Mail,
  MapPin,
  Menu,
  Phone,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useGlobalError } from "@/context/ErrorContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

const AIChatbot = lazy(() => import("@/components/chat/AIChatbot"));

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
  service_type: string;
  property_type: string;
};

const serviceIcons = [Camera, Users, TrendingUp, Clock, Wrench, ShieldCheck, Smartphone];
const benefitIcons = [Clock, ShieldCheck, TrendingUp];

const Navbar = memo(function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  }, []);

  const desktopLinkClass = isScrolled
    ? "text-slate-600 hover:text-slate-900"
    : "text-white hover:text-white/80";
  const mobileMenuClass = isScrolled
    ? "absolute right-0 top-full pb-6 space-y-4 mt-1"
    : "absolute right-0 top-full mt-2 rounded-sm bg-slate-900/25 px-4 pb-6 pt-2 shadow-xl ring-1 ring-white/20 backdrop-blur-md space-y-4 w-fit";
  const mobileLinkClass = isScrolled
    ? "text-slate-600 hover:text-slate-900"
    : "text-white hover:text-white/80";

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "backdrop-blur-md bg-white/80 border-b border-slate-200/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative">
        <div className="flex items-center justify-between h-20">
          <Link to="/" data-testid="logo" className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-teal-600" />
            <span className={`font-heading text-xl font-bold ${isScrolled ? "text-slate-900" : "text-white"}`}>Kara Immobilier</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection("services")} className={`${desktopLinkClass} transition-colors font-medium`}>
              {t.nav.services}
            </button>
            <button onClick={() => scrollToSection("benefits")} className={`${desktopLinkClass} transition-colors font-medium`}>
              {t.nav.benefits}
            </button>
            <button onClick={() => scrollToSection("about")} className={`${desktopLinkClass} transition-colors font-medium`}>
              {t.nav.about}
            </button>
            <button onClick={() => scrollToSection("pricing")} className={`${desktopLinkClass} transition-colors font-medium`}>
              {t.nav.pricing}
            </button>
            <button onClick={() => scrollToSection("contact")} className={`${desktopLinkClass} transition-colors font-medium`}>
              {t.nav.contact}
            </button>
            <LanguageSwitcher />
            <button
              onClick={() => scrollToSection("contact")}
              className="bg-slate-900 text-white hover:bg-slate-800 h-12 px-6 rounded-sm font-medium tracking-wide transition-all"
            >
              {t.nav.cta}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitcher />
            <button onClick={() => setIsMobileMenuOpen((prev) => !prev)} className="p-2" data-testid="mobile-menu-btn">
              <Menu className={`w-6 h-6 ${isScrolled ? "text-slate-900" : "text-white"}`} />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className={`md:hidden ${mobileMenuClass}`} data-testid="mobile-menu">
            <button onClick={() => scrollToSection("services")} className={`block w-full text-left py-2 transition-colors ${mobileLinkClass}`}>{t.nav.services}</button>
            <button onClick={() => scrollToSection("benefits")} className={`block w-full text-left py-2 transition-colors ${mobileLinkClass}`}>{t.nav.benefits}</button>
            <button onClick={() => scrollToSection("about")} className={`block w-full text-left py-2 transition-colors ${mobileLinkClass}`}>{t.nav.about}</button>
            <button onClick={() => scrollToSection("pricing")} className={`block w-full text-left py-2 transition-colors ${mobileLinkClass}`}>{t.nav.pricing}</button>
            <button onClick={() => scrollToSection("contact")} className={`block w-full text-left py-2 transition-colors ${mobileLinkClass}`}>{t.nav.contact}</button>
          </div>
        )}
      </div>
    </nav>
  );
});

const HeroSection = memo(function HeroSection() {
  const { t } = useLanguage();
  const scrollToContact = useCallback(() => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <section data-testid="hero-section" className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1757439402190-99b73ac8e807?crop=entropy&cs=srgb&fm=jpg&q=85" alt="Modern luxury living room" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-24">
        <div className="max-w-2xl">
          <p className="text-teal-400 font-medium tracking-wide uppercase mb-4">{t.hero.subtitle}</p>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            {t.hero.title} <span className="text-teal-400">{t.hero.titleAccent}</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8">{t.hero.description}</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={scrollToContact} className="bg-teal-500 text-white hover:bg-teal-600 h-14 px-8 rounded-sm font-medium tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5" data-testid="hero-cta-primary">
              {t.hero.ctaPrimary}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={scrollToContact} className="bg-white text-slate-900 hover:bg-slate-100 h-14 px-8 rounded-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5" data-testid="hero-cta-secondary">
              {t.hero.ctaSecondary}
              <Key className="w-5 h-5" />
            </button>
          </div>

          {/* Promises */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {t.hero.promises.map((promise, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm px-4 py-3" data-testid={`hero-promise-${i}`}>
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <p className="text-white font-medium text-sm md:text-base">{promise}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tagline overlay bottom-right */}
      <div className="absolute bottom-12 right-6 md:right-12 lg:right-20 z-10 hidden md:block pointer-events-none">
        <p className="font-heading text-2xl lg:text-3xl text-white/95 italic tracking-tight drop-shadow-lg" data-testid="hero-tagline">
          {t.hero.tagline}
        </p>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white/60" />
      </div>
    </section>
  );
});

const ServicesSection = memo(function ServicesSection() {
  const { t } = useLanguage();
  const renderedServices = useMemo(() => t.services.items, [t.services.items]);

  return (
    <section id="services" className="py-24 md:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <p className="text-teal-600 font-medium tracking-wide uppercase mb-4">{t.services.subtitle}</p>
          <h2 className="font-heading text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight">{t.services.title}</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">{t.services.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderedServices.map((service, index) => {
            const Icon = serviceIcons[index] || ShieldCheck;
            return (
              <div key={`${service.title}-${index}`} className="bg-white p-8 border border-slate-200/50 hover:border-teal-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

const BenefitsSection = memo(function BenefitsSection() {
  const { t } = useLanguage();

  return (
    <section id="benefits" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="mb-20 text-center max-w-4xl mx-auto">
          <p className="text-teal-600 font-medium tracking-wide uppercase mb-4">{t.benefits.subtitle}</p>
          <h2 className="font-heading text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight mb-8">{t.benefits.title}</h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">{t.benefits.speech}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {t.benefits.items.map((benefit, index) => {
              const Icon = benefitIcons[index];
              return (
                <div key={`${benefit.title}-${index}`} className="flex gap-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative">
            <img
              src="https://customer-assets.emergentagent.com/job_blog-105/artifacts/woi14lel_E66333AF-6F9C-4C90-B765-E043C6EF258B.PNG"
              alt="Luxury apartment building"
              className="w-full h-[500px] object-cover rounded-sm shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 shadow-xl rounded-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">100%</p>
                  <p className="text-slate-600 text-sm">{t.benefits.satisfaction}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

const AboutSection = memo(function AboutSection() {
  const { t } = useLanguage();

  return (
    <section id="about" data-testid="about-section" className="py-24 md:py-32 bg-slate-50 relative overflow-hidden">
      {/* decorative blob */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-50/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Photo */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-teal-500/20 to-slate-900/10 rounded-sm -z-10" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-2xl">
              <img
                src="https://customer-assets.emergentagent.com/job_site-showcase-87/artifacts/55lsw96d_PHOTO-2026-04-02-04-06-23%202.jpg"
                alt="Yakhara Hane — Fondatrice de Kara Immobilier Service"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-teal-300 text-sm font-medium tracking-wide uppercase mb-1">Kara Immobilier Service</p>
                <p className="text-xl font-semibold">Yakhara Hane</p>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-6 -right-6 bg-white shadow-2xl rounded-sm p-4 hidden md:flex items-center gap-3 border border-slate-100">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-sm flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Fondatrice</p>
                <p className="text-sm font-semibold text-slate-900">B.A.A — Administration</p>
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200/50 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-medium tracking-wide uppercase text-teal-700">{t.about.badge}</span>
            </div>

            <p className="text-teal-600 font-medium tracking-wide uppercase mb-3 text-sm">{t.about.subtitle}</p>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight mb-3">
              {t.about.title}
            </h2>
            <p className="text-lg text-slate-500 italic mb-8 border-l-2 border-teal-500 pl-4">
              {t.about.role}
            </p>

            <div className="space-y-5 text-slate-600 leading-relaxed">
              {t.about.paragraphs.map((p, i) => (
                <p key={i} className="text-[15px] md:text-base">{p}</p>
              ))}
            </div>

            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              {t.about.values.map((v, i) => {
                const Icon = [GraduationCap, Target, Award][i] || Sparkles;
                return (
                  <div key={i} className="bg-white p-5 border border-slate-200/70 rounded-sm hover:border-teal-500/50 hover:-translate-y-1 transition-all duration-300">
                    <Icon className="w-5 h-5 text-teal-600 mb-3" />
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{v.label}</p>
                    <p className="text-sm font-semibold text-slate-900 leading-snug">{v.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

const PricingSection = memo(function PricingSection() {
  const { t } = useLanguage();

  const planIcons: Record<string, typeof Camera> = {
    listing: Building2,
    management: ShieldCheck,
    maintenance: Wrench,
    info: Sparkles,
  };

  const scrollToContact = useCallback(() => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <section id="pricing" data-testid="pricing-section" className="py-24 md:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <p className="text-teal-600 font-medium tracking-wide uppercase mb-4">{t.pricing.subtitle}</p>
          <h2 className="font-heading text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-lg text-slate-600">{t.pricing.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {t.pricing.plans.map((plan, idx) => {
            const Icon = planIcons[plan.icon] || ShieldCheck;
            const featured = (plan as { featured?: boolean }).featured;
            return (
              <div
                key={idx}
                data-testid={`pricing-card-${idx}`}
                className={`relative flex flex-col p-8 md:p-10 rounded-sm transition-all duration-300 bg-white border ${
                  featured ? "border-teal-500/40 shadow-xl" : "border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1"
                }`}
              >
                {featured && (
                  <div className="absolute top-6 right-6 px-3 py-1 bg-teal-500 text-white text-xs font-semibold tracking-wider uppercase rounded-full shadow-sm">
                    Populaire
                  </div>
                )}

                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-slate-900 leading-tight">{plan.name}</h3>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6">{plan.intro}</p>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm text-slate-700">{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.priceLabel && plan.priceLines.length > 0 && (
                  <div className="mt-auto bg-teal-50/60 border border-teal-200/50 rounded-sm p-5">
                    <p className="text-sm font-semibold text-slate-900 mb-2">{plan.priceLabel}</p>
                    <ul className="space-y-1.5">
                      {plan.priceLines.map((line, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-teal-600 font-bold mt-0.5">•</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={scrollToContact}
            className="bg-slate-900 text-white hover:bg-slate-800 h-14 px-8 rounded-sm font-medium tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
            data-testid="pricing-cta"
          >
            {t.pricing.cta}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
});

const ContactSection = memo(function ContactSection() {
  const { t } = useLanguage();
  const { handleError } = useGlobalError();

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
    service_type: "",
    property_type: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.post("/contact", formData);
      toast.success(t.contact.form.success);
      setFormData({ name: "", email: "", phone: "", message: "", service_type: "", property_type: "" });
    } catch (error) {
      handleError(error, "contact.submit", {
        email: formData.email,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" data-testid="contact-section" className="py-24 md:py-32 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <p className="text-teal-400 font-medium tracking-wide uppercase mb-4">{t.contact.subtitle}</p>
            <h2 className="font-heading text-3xl md:text-5xl font-semibold text-white tracking-tight mb-6">{t.contact.title}</h2>

            {/* Response badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/15 border border-teal-400/30 rounded-full mb-6" data-testid="response-badge">
              <Clock className="w-4 h-4 text-teal-300" />
              <span className="text-teal-200 text-sm font-medium">{t.contact.responseBadge}</span>
            </div>

            <p className="text-slate-400 text-lg leading-relaxed mb-8">{t.contact.description}</p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{t.contact.phone}</p>
                  <p className="text-white font-medium">438-439-9590</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{t.contact.email}</p>
                  <p className="text-white font-medium">infokaraimmo@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{t.contact.address}</p>
                  <p className="text-white font-medium">{t.contact.addressValue}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{t.contact.areas}</p>
                  <p className="text-white font-medium">
                    <strong>Montréal</strong> | <strong>Laval</strong> | <strong>Longueuil</strong> | <strong>Brossard</strong> | <strong>Trois-Rivières</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-sm shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.contact.form.name} *</label>
                <input required value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} className="w-full h-12 px-4 border border-slate-300 rounded-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" placeholder={t.contact.form.namePlaceholder} data-testid="contact-name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.contact.form.email} *</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} className="w-full h-12 px-4 border border-slate-300 rounded-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" placeholder={t.contact.form.emailPlaceholder} data-testid="contact-email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.contact.form.phone}</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} className="w-full h-12 px-4 border border-slate-300 rounded-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" placeholder={t.contact.form.phonePlaceholder} data-testid="contact-phone" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.contact.form.serviceType} *</label>
                <select required value={formData.service_type} onChange={(e) => setFormData((prev) => ({ ...prev, service_type: e.target.value }))} className="w-full h-12 px-4 border border-slate-300 rounded-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all bg-white" data-testid="contact-service-type">
                  <option value="">{t.contact.form.serviceTypePlaceholder}</option>
                  <option value="rental">{t.contact.form.serviceTypes.rental}</option>
                  <option value="management">{t.contact.form.serviceTypes.management}</option>
                  <option value="information">{t.contact.form.serviceTypes.information}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.contact.form.message} *</label>
                <textarea required rows={4} value={formData.message} onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))} className="w-full px-4 py-3 border border-slate-300 rounded-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none" placeholder={t.contact.form.messagePlaceholder} data-testid="contact-message" />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white hover:bg-slate-800 h-14 rounded-sm font-medium tracking-wide transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2" data-testid="contact-submit">
                {isSubmitting ? <LoadingSpinner label={t.contact.form.submitting} className="text-white" /> : <>{t.contact.form.submit}<Send className="w-5 h-5" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
});

const Footer = memo(function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 text-white py-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-teal-500" />
              <span className="font-heading text-xl font-bold">Kara Immobilier Service</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-teal-300 text-xs font-semibold tracking-wide">{t.footer.tagline}</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-6 max-w-md">{t.footer.description}</p>

            {/* Cities in bold */}
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">{t.footer.areasTitle}</p>
              <p className="text-white text-sm leading-relaxed">
                {t.footer.cities.map((city, i) => (
                  <span key={city}>
                    <strong className="font-bold text-teal-100">{city}</strong>
                    {i < t.footer.cities.length - 1 && <span className="text-slate-600 mx-2">|</span>}
                  </span>
                ))}
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t.footer.servicesTitle}</h4>
            <ul className="space-y-2 text-slate-400">
              {t.footer.servicesList.map((service, index) => (
                <li key={`${service}-${index}`}>{service}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t.footer.contactTitle}</h4>
            <ul className="space-y-2 text-slate-400">
              <li>438-439-9590</li>
              <li>infokaraimmo@gmail.com</li>
              <li className="text-slate-300">9008 2e Avenue, Montréal</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-slate-500 text-sm">{t.footer.copyright}</p>
            <p className="text-slate-500 text-sm">
              {t.footer.creditPrefix}{" "}
              <a
                href="https://mtlprogramming.com"
                target="_blank"
                rel="noreferrer"
                className="text-teal-300 hover:text-teal-200 transition-colors"
              >
                {t.footer.creditLabel}
              </a>
            </p>
          </div>
          <div className="flex gap-6 text-slate-500 text-sm">
            <Link to="/terms" className="hover:text-teal-400 transition-colors">{t.footer.terms}</Link>
            <Link to="/privacy" className="hover:text-teal-400 transition-colors">{t.footer.privacy}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default function HomePage() {
  const { language } = useLanguage();

  return (
    <>
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <BenefitsSection />
      <AboutSection />
      <PricingSection />
      <ContactSection />
      <Footer />
      <Suspense fallback={<div className="fixed bottom-6 right-6"><LoadingSpinner label="Assistant..." /></div>}>
        <AIChatbot language={language} />
      </Suspense>
    </>
  );
}
