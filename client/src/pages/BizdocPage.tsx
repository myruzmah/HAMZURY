import { Shield, Award, Briefcase, Factory, Receipt } from "lucide-react";
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
      id: "tax-services", title: "Tax Services", icon: Receipt,
      items: [
        { name: "Monthly VAT Filing", context: "Monthly VAT Filing", tag: "₦50K/MO" },
        { name: "Withholding Tax (WHT) Filing", context: "WHT Filing", tag: "₦20K/MO" },
        { name: "PAYE Setup + Monthly Management", context: "PAYE Setup + Management", tag: "₦100K + ₦30K/MO" },
        { name: "Corporate Income Tax (CIT)", context: "Corporate Income Tax", tag: "₦150K/YR" },
        { name: "Tax Clearance Certificate (TCC)", context: "Tax Clearance Certificate", tag: "₦150K" },
        { name: "Tax Audit Support", context: "Tax Audit Support", tag: "₦300K–₦1M" },
      ],
    },
    {
      id: "compliance-management", title: "Compliance Management", icon: Shield,
      items: [
        { name: "CAC Registration (BN / Ltd / NGO)", context: "CAC Registration", tag: "₦150K" },
        { name: "NAFDAC Registration (Food / Drug / Cosmetics)", context: "NAFDAC Registration", tag: "₦500K–₦2M" },
        { name: "SON Certification (Product)", context: "SON Certification", tag: "₦300K–₦1M" },
        { name: "PENCOM Compliance (Quarterly)", context: "PENCOM Compliance", tag: "₦80K/Q" },
        { name: "FIRS Full Compliance Package", context: "FIRS Full Compliance", tag: "₦200–₦500K/YR" },
        { name: "SCUML Certificate", context: "SCUML Certificate" },
        { name: "Monthly Advisory Retainer", context: "Monthly Advisory Retainer", tag: "₦50K/MO" },
      ],
    },
    {
      id: "industry-specific", title: "Industry-Specific Packages", icon: Factory,
      items: [
        { name: "Healthcare (NAFDAC + MDCAN/PPDRA + Pharmacy Licence)", context: "Healthcare Compliance Package", tag: "₦800K–₦3M" },
        { name: "Manufacturing (SON + Factory + Environmental)", context: "Manufacturing Compliance Package", tag: "₦1M–₦5M" },
        { name: "Food & Beverage (NAFDAC + SON + Halal)", context: "Food Beverage Compliance Package", tag: "₦800K–₦2.5M" },
        { name: "Mining & Extraction (Licence + EIA + CDA)", context: "Mining Extraction Package", tag: "₦2M–₦10M" },
      ],
    },
    {
      id: "advisory", title: "Advisory & Reviews", icon: Award,
      items: [
        { name: "Tax Planning & Optimisation", context: "Tax Planning Optimisation", tag: "₦200K–₦500K" },
        { name: "Compliance Health Check (full audit)", context: "Compliance Health Check", tag: "₦100K" },
        { name: "Legal & Template Documents", context: "Legal Templates" },
        { name: "Annual Returns Filing", context: "Annual Returns" },
      ],
    },
  ],
};

export default function BizdocPage() {
  return <DivisionPortalTemplate cfg={cfg} />;
}
