import { Shield, Award, Briefcase } from "lucide-react";
import DivisionPortalTemplate, { type DivisionPortalConfig } from "./_divisions/DivisionPortalTemplate";

const cfg: DivisionPortalConfig = {
  name:              "BIZDOC",
  pageTitle:         "Bizdoc — Tax & Compliance | HAMZURY",
  pageDescription:   "We handle FIRS so you can handle business. CAC, tax, licences — one team.",
  splashTagline:     "Every filing. Every licence. Handled.",
  heroHeading:       "Every filing. Every licence.",
  heroHighlight:     "Handled.",
  heroSub:           "CAC registration. Tax compliance. Sector licences. Legal documents. So you can operate, win contracts, and scale.",
  packagesEyebrow:   "RECOMMENDED",
  packagesTitle:     "Start Right. Stay Compliant.",
  packagesSub:       "Choose the package that matches where your business is right now.",
  servicesEyebrow:   "OUR SERVICES",
  servicesTitle:     "Every layer your business needs.",
  accent:            "#1B4D3E",
  highlight:         "#B48C4C",
  path:              "/bizdoc",
  footerLabel:       "BIZDOC CONSULT",
  motivationalDept:  "bizdoc",
  navLinks: [
    { label: "Scalar",  href: "/scalar" },
    { label: "Medialy", href: "/medialy" },
    { label: "HUB",     href: "/hub" },
    { label: "About",   href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "HAMZURY", href: "/" },
  ],
  packages: [
    {
      id: "starter", label: "STARTER",
      price: "₦90,000", sub: "One-time setup",
      items: ["CAC Ltd Registration", "TIN Issuance", "Letterhead + Business Cards", "3 Document Templates"],
      context: "Bizdoc Starter Package",
    },
    {
      id: "compliant", label: "COMPLIANT",
      price: "₦150,000", sub: "One-time setup",
      items: ["Everything in Starter", "SCUML Certificate", "Document Handover", "Compliance Checklist"],
      context: "Bizdoc Compliant Package",
    },
    {
      id: "promax", label: "PROMAX",
      price: "₦300,000", sub: "12 months managed",
      items: ["Everything in Compliant", "1-Year Tax Management", "Monthly VAT/PAYE/WHT", "Annual Return Filed", "TCC Renewal Included"],
      badge: "POPULAR",
      context: "Bizdoc ProMax Package",
    },
    {
      id: "enterprise", label: "ENTERPRISE",
      price: "₦500,000", sub: "12 months full compliance",
      items: ["Everything in ProMax", "PENCOM, NSITF, ITF", "BPP Registration", "Industry Licences", "Dedicated Compliance Officer"],
      note: "Best after 1 year of operations",
      dark: true,
      context: "Bizdoc Enterprise Package",
    },
  ],
  serviceCategories: [
    {
      id: "registration", title: "Registration & Modification", icon: Briefcase,
      items: [
        { name: "CAC Business Name (BN)", context: "CAC Business Name" },
        { name: "CAC Private Limited Company (Ltd)", context: "CAC Limited Company" },
        { name: "CAC NGO / Trusteeship", context: "CAC NGO Registration" },
        { name: "Director / Shareholder Changes", context: "Director Shareholder Changes" },
        { name: "Address Updates", context: "Address Updates" },
        { name: "Name Changes", context: "Name Changes" },
        { name: "Share Allotments", context: "Share Allotments" },
        { name: "Annual Returns", context: "Annual Returns" },
      ],
    },
    {
      id: "subscriptions", title: "Subscription Packages", icon: Shield,
      items: [
        { name: "Tax ProMax Update", context: "Tax ProMax Update", tag: "₦150K/YEAR" },
        { name: "Tax + CAC + SCUML Management", context: "Tax CAC SCUML Management", tag: "₦300K/YEAR" },
        { name: "Full Compliance Management", context: "Full Compliance Management", tag: "₦500K/YEAR" },
      ],
    },
    {
      id: "renewals", title: "Renewals & Documents", icon: Award,
      items: [
        { name: "Tax & Contract Documents (TCC, ITF, NSITF, BPP)", context: "Tax Contract Documents" },
        { name: "SCUML Certificate", context: "SCUML Certificate" },
        { name: "Licences & Permits", context: "Sector Licences" },
        { name: "Legal & Template Documents", context: "Legal Documents" },
      ],
    },
  ],
};

export default function BizdocPage() {
  return <DivisionPortalTemplate cfg={cfg} />;
}
