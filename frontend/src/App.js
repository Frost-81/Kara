import "@/App.css";
import { useState, useRef, useEffect, createContext, useContext } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { 
  Key, ShieldCheck, Wrench, Clock, Smartphone, TrendingUp, 
  MessageSquare, Users, Home, Send, X, ChevronDown, Menu,
  Phone, Mail, MapPin, CheckCircle, ArrowRight, Building2,
  Camera, Globe, ArrowLeft
} from "lucide-react";
import translations from "./translations";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ==================== Language Context ====================
const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    return saved || "fr";
  });

  const t = translations[language];

  const toggleLanguage = () => {
    const newLang = language === "fr" ? "en" : "fr";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// ==================== Language Switcher ====================
const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-700"
      data-testid="language-switcher"
    >
      <Globe className="w-4 h-4" />
      {language === "fr" ? "EN" : "FR"}
    </button>
  );
};

// ==================== Navbar ====================
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "backdrop-blur-md bg-white/80 border-b border-slate-200/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between h-20">
          <Link to="/" data-testid="logo" className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-teal-600" />
            <span className="font-heading text-xl font-bold text-slate-900">
              Kara Immobilier
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("services")}
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              data-testid="nav-services"
            >
              {t.nav.services}
            </button>
            <button
              onClick={() => scrollToSection("benefits")}
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              data-testid="nav-benefits"
            >
              {t.nav.benefits}
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              data-testid="nav-contact"
            >
              {t.nav.contact}
            </button>
            <LanguageSwitcher />
            <button
              onClick={() => scrollToSection("contact")}
              className="bg-slate-900 text-white hover:bg-slate-800 h-12 px-6 rounded-sm font-medium tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              data-testid="nav-cta"
            >
              {t.nav.cta}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
              data-testid="mobile-menu-btn"
            >
              <Menu className="w-6 h-6 text-slate-900" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-6 space-y-4" data-testid="mobile-menu">
            <button
              onClick={() => scrollToSection("services")}
              className="block w-full text-left py-2 text-slate-600 hover:text-slate-900"
            >
              {t.nav.services}
            </button>
            <button
              onClick={() => scrollToSection("benefits")}
              className="block w-full text-left py-2 text-slate-600 hover:text-slate-900"
            >
              {t.nav.benefits}
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="block w-full text-left py-2 text-slate-600 hover:text-slate-900"
            >
              {t.nav.contact}
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="w-full bg-slate-900 text-white py-3 rounded-sm font-medium"
            >
              {t.nav.cta}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

// ==================== Hero Section ====================
const HeroSection = () => {
  const { t } = useLanguage();

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      data-testid="hero-section"
      className="relative min-h-screen flex items-center pt-20"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1757439402190-99b73ac8e807?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Modern luxury living room"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-24">
        <div className="max-w-2xl">
          <p className="text-teal-400 font-medium tracking-wide uppercase mb-4 animate-fade-in">
            {t.hero.subtitle}
          </p>
          <h1
            className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
            data-testid="hero-title"
          >
            {t.hero.title} <span className="text-teal-400">{t.hero.titleAccent}</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8">
            {t.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={scrollToContact}
              className="bg-teal-500 text-white hover:bg-teal-600 h-14 px-8 rounded-sm font-medium tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              data-testid="hero-cta-primary"
            >
              {t.hero.ctaPrimary}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="border-2 border-white/30 text-white hover:bg-white/10 h-14 px-8 rounded-sm font-medium tracking-wide transition-all flex items-center justify-center"
              data-testid="hero-cta-secondary"
            >
              {t.hero.ctaSecondary}
            </button>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white">500+</p>
              <p className="text-slate-400 text-sm">{t.hero.stats.properties}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white">98%</p>
              <p className="text-slate-400 text-sm">{t.hero.stats.satisfaction}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white">2+</p>
              <p className="text-slate-400 text-sm">{t.hero.stats.experience}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white/60" />
      </div>
    </section>
  );
};

// ==================== Services Section ====================
const serviceIcons = [Camera, Users, TrendingUp, Clock, Wrench, ShieldCheck, Smartphone];

const ServicesSection = () => {
  const { t } = useLanguage();

  return (
    <section
      id="services"
      data-testid="services-section"
      className="py-24 md:py-32 bg-slate-50"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <p className="text-teal-600 font-medium tracking-wide uppercase mb-4">
            {t.services.subtitle}
          </p>
          <h2 className="font-heading text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight">
            {t.services.title}
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            {t.services.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.services.items.map((service, index) => {
            const Icon = serviceIcons[index] || ShieldCheck;
            return (
              <div
                key={index}
                data-testid={`service-card-${index}`}
                className="bg-white p-8 border border-slate-200/50 hover:border-teal-500/50 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-colors">
                  <Icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ==================== Benefits Section ====================
const benefitIcons = [Clock, ShieldCheck, TrendingUp];

const BenefitsSection = () => {
  const { t } = useLanguage();

  return (
    <section
      id="benefits"
      data-testid="benefits-section"
      className="py-24 md:py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        {/* Speech Section */}
        <div className="mb-20 text-center max-w-4xl mx-auto">
          <p className="text-teal-600 font-medium tracking-wide uppercase mb-4">
            {t.benefits.subtitle}
          </p>
          <h2 className="font-heading text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight mb-8">
            {t.benefits.title}
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            {t.benefits.speech}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="space-y-8">
              {t.benefits.items.map((benefit, index) => {
                const Icon = benefitIcons[index];
                return (
                  <div key={index} className="flex gap-4" data-testid={`benefit-${index}`}>
                    <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
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
};

// ==================== Contact Section ====================
const ContactSection = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    property_type: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post(`${API}/contact`, formData);
      setSubmitStatus({ type: "success", message: t.contact.form.success });
      setFormData({ name: "", email: "", phone: "", message: "", property_type: "" });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: t.contact.form.error
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="py-24 md:py-32 bg-slate-900"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <p className="text-teal-400 font-medium tracking-wide uppercase mb-4">
              {t.contact.subtitle}
            </p>
            <h2 className="font-heading text-3xl md:text-5xl font-semibold text-white tracking-tight mb-6">
              {t.contact.title}
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              {t.contact.description}
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{t.contact.phone}</p>
                  <p className="text-white font-medium">438-439-9590</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{t.contact.email}</p>
                  <p className="text-white font-medium">infokaraimmo@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{t.contact.areas}</p>
                  <p className="text-white font-medium">Montréal | Laval | Longueuil | Brossard | Trois-Rivières</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-sm shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.contact.form.name} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 px-4 border border-slate-300 rounded-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  placeholder={t.contact.form.namePlaceholder}
                  data-testid="contact-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.contact.form.email} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 px-4 border border-slate-300 rounded-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  placeholder={t.contact.form.emailPlaceholder}
                  data-testid="contact-email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.contact.form.phone}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-12 px-4 border border-slate-300 rounded-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  placeholder={t.contact.form.phonePlaceholder}
                  data-testid="contact-phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.contact.form.propertyType}
                </label>
                <select
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                  className="w-full h-12 px-4 border border-slate-300 rounded-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  data-testid="contact-property-type"
                >
                  <option value="">{t.contact.form.propertyTypePlaceholder}</option>
                  <option value="apartment">{t.contact.form.propertyTypes.apartment}</option>
                  <option value="house">{t.contact.form.propertyTypes.house}</option>
                  <option value="building">{t.contact.form.propertyTypes.building}</option>
                  <option value="commercial">{t.contact.form.propertyTypes.commercial}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.contact.form.message} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none"
                  placeholder={t.contact.form.messagePlaceholder}
                  data-testid="contact-message"
                />
              </div>
              
              {submitStatus && (
                <div
                  className={`p-4 rounded-sm ${
                    submitStatus.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                  data-testid="contact-status"
                >
                  {submitStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 h-14 rounded-sm font-medium tracking-wide transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-testid="contact-submit"
              >
                {isSubmitting ? (
                  t.contact.form.submitting
                ) : (
                  <>
                    {t.contact.form.submit}
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== AI Chatbot ====================
const AIChatbot = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([{ role: "assistant", content: t.chatbot.welcome }]);
  }, [language, t.chatbot.welcome]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: userMessage,
        session_id: sessionId,
        language: language
      });
      
      setSessionId(response.data.session_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.response }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t.chatbot.error }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50"
        data-testid="chatbot-toggle"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden z-50 border border-slate-200"
          data-testid="chatbot-window"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">{t.chatbot.title}</h3>
              <p className="text-xs text-slate-400">{t.chatbot.subtitle}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-teal-500 text-white"
                      : "bg-white text-slate-800 border border-slate-200"
                  }`}
                  data-testid={`chat-message-${index}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-800 p-3 rounded-lg border border-slate-200">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.chatbot.placeholder}
                className="flex-1 h-10 px-4 border border-slate-300 rounded-full focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                data-testid="chatbot-input"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                data-testid="chatbot-send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

// ==================== Footer ====================
const Footer = () => {
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
            <p className="text-slate-400 leading-relaxed mb-6 max-w-md">
              {t.footer.description}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footer.servicesTitle}</h4>
            <ul className="space-y-2 text-slate-400">
              {t.footer.servicesList.map((service, index) => (
                <li key={index}>
                  <a href="#services" className="hover:text-teal-400 transition-colors">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footer.contactTitle}</h4>
            <ul className="space-y-2 text-slate-400">
              <li>438-439-9590</li>
              <li>infokaraimmo@gmail.com</li>
              <li>Montréal | Laval | Longueuil</li>
              <li>Brossard | Trois-Rivières</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            {t.footer.copyright}
          </p>
          <div className="flex gap-6 text-slate-500 text-sm">
            <Link to="/terms" className="hover:text-teal-400 transition-colors">
              {t.footer.terms}
            </Link>
            <Link to="/privacy" className="hover:text-teal-400 transition-colors">
              {t.footer.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ==================== Legal Pages ====================
const LegalPageLayout = ({ children }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-teal-500" />
              <span className="font-heading text-xl font-bold">Kara Immobilier Service</span>
            </Link>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.nav.services === "Services" ? "Back" : "Retour"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

const PrivacyPage = () => {
  const { t } = useLanguage();
  const privacy = t.legal.privacy;

  return (
    <LegalPageLayout>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-8 md:p-12 rounded-sm shadow-lg">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {privacy.title}
          </h1>
          <p className="text-teal-600 font-medium mb-2">{privacy.subtitle}</p>
          <p className="text-slate-500 text-sm mb-8">{privacy.lastUpdate}</p>

          <div className="space-y-6">
            {privacy.sections.map((section, index) => (
              <div key={index}>
                <h2 className="font-semibold text-lg text-slate-900 mb-2">
                  {section.title}
                </h2>
                <p className="text-slate-600 whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="font-semibold text-slate-900">{privacy.responsible}</p>
            <p className="text-slate-600">{privacy.responsibleEntity}</p>
          </div>
        </div>
      </div>
    </LegalPageLayout>
  );
};

const TermsPage = () => {
  const { t } = useLanguage();
  const terms = t.legal.terms;

  return (
    <LegalPageLayout>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-8 md:p-12 rounded-sm shadow-lg">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {terms.title}
          </h1>
          <p className="text-teal-600 font-medium mb-2">{terms.subtitle}</p>
          <p className="text-slate-500 text-sm mb-8">{terms.lastUpdate}</p>

          <div className="space-y-6">
            {terms.sections.map((section, index) => (
              <div key={index}>
                <h2 className="font-semibold text-lg text-slate-900 mb-2">
                  {section.title}
                </h2>
                <p className="text-slate-600 whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LegalPageLayout>
  );
};

// ==================== Home Page ====================
const HomePage = () => {
  return (
    <>
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <BenefitsSection />
      <ContactSection />
      <Footer />
      <AIChatbot />
    </>
  );
};

// ==================== Main App ====================
function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
}

export default App;
