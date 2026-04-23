import { Shield, Award, Briefcase, Factory, Receipt, FileCheck } from "lucide-react";
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
  /* ─────────────────────────────────────────────────────────────────
   * Services arranged as a LADDER, mirroring the client onboarding form:
   *   Package A (₦90k)  = Registration (CAC + TIN)
   *   Package B (₦150k) = A + Certificates (SCUML)
   *   Package C (₦300k) = B + Tax Management (monthly VAT/PAYE/WHT, annual)
   *   Package D (₦500k) = C + Full Compliance (PENCOM, NSITF, ITF, BPP, FIRS)
   * Plus standalone add-ons (Industry packages, Advisory).
   * ─────────────────────────────────────────────────────────────────*/
  serviceCategories: [
    {
      id: "registration", title: "Step 1 · Registration & Setup", icon: Briefcase,
      items: [
        { name: "CAC Business Name (BN)", context: "CAC Business Name", tag: "PKG A" },
        { name: "CAC Private Limited Company (Ltd)", context: "CAC Limited Company", tag: "PKG A" },
        { name: "CAC NGO / Trusteeship", context: "CAC NGO Registration" },
        { name: "TIN Registration", context: "TIN Registration", tag: "PKG A" },
        { name: "Director / Shareholder Changes", context: "Director Shareholder Changes" },
        { name: "Address / Name Changes", context: "Address Name Changes" },
        { name: "Share Allotments", context: "Share Allotments" },
      ],
    },
    {
      id: "certificates", title: "Step 2 · Certificates & Clearance", icon: FileCheck,
      items: [
        { name: "SCUML Certificate", context: "SCUML Certificate", tag: "PKG B" },
        { name: "Tax Clearance Certificate (TCC)", context: "Tax Clearance Certificate", tag: "₦150K" },
        { name: "ITF Certificate", context: "ITF Certificate" },
        { name: "NSITF Certificate", context: "NSITF Certificate" },
        { name: "BPP Registration", context: "BPP Registration" },
      ],
    },
    {
      id: "tax-management", title: "Step 3 · Monthly Tax Management", icon: Receipt,
      items: [
        { name: "Monthly VAT Filing", context: "Monthly VAT Filing", tag: "₦50K/MO · PKG C" },
        { name: "Withholding Tax (WHT) Filing", context: "WHT Filing", tag: "₦20K/MO · PKG C" },
        { name: "PAYE Setup + Monthly Management", context: "PAYE Setup + Management", tag: "₦100K + ₦30K/MO · PKG C" },
        { name: "Corporate Income Tax (CIT)", context: "Corporate Income Tax", tag: "₦150K/YR" },
        { name: "Annual Returns Filing", context: "Annual Returns" },
        { name: "Tax Audit Support", context: "Tax Audit Support", tag: "₦300K–₦1M" },
      ],
    },
    {
      id: "full-compliance", title: "Step 4 · Full Compliance Management", icon: Shield,
      items: [
        { name: "FIRS Full Compliance Package", context: "FIRS Full Compliance", tag: "₦200–₦500K/YR · PKG D" },
        { name: "PENCOM Compliance (Quarterly)", context: "PENCOM Compliance", tag: "₦80K/Q · PKG D" },
        { name: "NAFDAC Registration (Food / Drug / Cosmetics)", context: "NAFDAC Registration", tag: "₦500K–₦2M" },
        { name: "SON Certification (Product)", context: "SON Certification", tag: "₦300K–₦1M" },
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
      ],
    },
  ],
};

export default function BizdocPage() {
  return <DivisionPortalTemplate cfg={cfg} />;
}
