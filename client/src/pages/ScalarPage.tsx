import { Globe, Workflow, Bot } from "lucide-react";
import DivisionPortalTemplate, { type DivisionPortalConfig } from "./_divisions/DivisionPortalTemplate";

const cfg: DivisionPortalConfig = {
  name:              "SCALAR",
  pageTitle:         "Scalar — Web & Automation | HAMZURY",
  pageDescription:   "Websites that work. Systems that scale. CRM, WhatsApp automation, AI chatbots for Nigerian businesses.",
  splashTagline:     "Websites that work. Systems that scale.",
  heroHeading:       "Websites that work.",
  heroHighlight:     "Systems that scale.",
  heroSub:           "Professional websites. CRM integrations. WhatsApp + email automation. Business dashboards. AI chatbots. Engineered for Nigerian operations.",
  packagesEyebrow:   "RECOMMENDED",
  packagesTitle:     "From First Site to Full Platform.",
  packagesSub:       "Pick the tier that matches what your business needs this year.",
  servicesEyebrow:   "OUR SERVICES",
  servicesTitle:     "The layer behind every modern business.",
  accent:            "#D4A017",
  highlight:         "#0F172A",
  path:              "/scalar",
  footerLabel:       "SCALAR",
  motivationalDept:  "systemise",
  navLinks: [
    { label: "Bizdoc",  href: "/bizdoc" },
    { label: "Medialy", href: "/medialy" },
    { label: "HUB",     href: "/hub" },
    { label: "About",   href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "HAMZURY", href: "/" },
  ],
  packages: [
    {
      id: "presence", label: "PRESENCE",
      price: "₦300,000", sub: "One-time",
      items: ["5 responsive pages", "Contact form", "WhatsApp click-to-chat", "3 months hosting", "SSL + basic SEO"],
      context: "Scalar Presence Package",
    },
    {
      id: "growth", label: "GROWTH",
      price: "₦500,000", sub: "One-time",
      items: ["10 pages + blog", "Advanced SEO", "Google Analytics", "CMS you can edit", "6 months hosting"],
      context: "Scalar Growth Package",
    },
    {
      id: "automate", label: "AUTOMATE",
      price: "₦1,000,000", sub: "One-time",
      items: ["Everything in Growth", "CRM integration", "WhatsApp + email automation", "Payment gateway", "12 months hosting"],
      badge: "POPULAR",
      context: "Scalar Automate Package",
    },
    {
      id: "platform", label: "PLATFORM",
      price: "₦2,000,000", sub: "One-time + retainer",
      items: ["Everything in Automate", "Business dashboard", "AI chatbot trained on you", "System integrations", "Custom features + training"],
      note: "For businesses ready to systemise completely",
      dark: true,
      context: "Scalar Platform Package",
    },
  ],
  serviceCategories: [
    {
      id: "web", title: "Websites & Landing Pages", icon: Globe,
      items: [
        { name: "Professional Business Website", context: "Scalar Website" },
        { name: "E-commerce Store", context: "Scalar E-commerce" },
        { name: "Landing Page for Campaigns", context: "Scalar Landing Page" },
        { name: "Portfolio / Showcase Site", context: "Scalar Portfolio Site" },
        { name: "Hosting + Domain Management", context: "Scalar Hosting" },
      ],
    },
    {
      id: "automation", title: "Systems & Automation", icon: Workflow,
      items: [
        { name: "CRM Setup + Integration", context: "Scalar CRM" },
        { name: "WhatsApp Business API", context: "Scalar WhatsApp" },
        { name: "Email Marketing Automation", context: "Scalar Email Automation" },
        { name: "Payment Gateway (Paystack, Flutterwave)", context: "Scalar Payments" },
        { name: "Operational Dashboards", context: "Scalar Dashboards" },
      ],
    },
    {
      id: "ai", title: "AI & Intelligent Tools", icon: Bot,
      items: [
        { name: "AI Chatbot (trained on your business)", context: "Scalar AI Chatbot" },
        { name: "Lead Qualification Bot", context: "Scalar Lead Bot" },
        { name: "Custom AI Agents", context: "Scalar AI Agent", tag: "CUSTOM" },
        { name: "Workflow Automation", context: "Scalar Workflow" },
      ],
    },
  ],
};

export default function ScalarPage() {
  return <DivisionPortalTemplate cfg={cfg} />;
}
