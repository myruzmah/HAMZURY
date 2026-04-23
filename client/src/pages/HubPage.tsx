import { Code2, PenTool, TrendingUp } from "lucide-react";
import DivisionPortalTemplate, { type DivisionPortalConfig } from "./_divisions/DivisionPortalTemplate";

const cfg: DivisionPortalConfig = {
  name:              "HUB",
  pageTitle:         "HUB — Tech Training | HAMZURY",
  pageDescription:   "Tech skills that get you paid. Web dev, graphics, data, marketing, Excel, QuickBooks — with job placement.",
  splashTagline:     "Tech skills that get you paid.",
  heroHeading:       "Tech skills that",
  heroHighlight:     "get you paid.",
  heroSub:           "Six in-demand programmes. Certified instructors. Real portfolios. Job-placement support. We don't teach for certificates — we teach for pay slips.",
  packagesEyebrow:   "RECOMMENDED",
  packagesTitle:     "Individual, Certification, Team, Corporate.",
  packagesSub:       "Learn solo. Train your team. Upskill your company. Same standard.",
  servicesEyebrow:   "PROGRAMMES",
  servicesTitle:     "Six programmes. All portfolio-based.",
  accent:            "#1E3A5F",
  highlight:         "#B48C4C",
  path:              "/hub",
  footerLabel:       "HUB",
  motivationalDept:  "skills",
  navLinks: [
    { label: "Bizdoc",  href: "/bizdoc" },
    { label: "Scalar",  href: "/scalar" },
    { label: "Medialy", href: "/medialy" },
    { label: "About",   href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "HAMZURY", href: "/" },
  ],
  packages: [
    {
      id: "single", label: "SINGLE COURSE",
      price: "₦50k – ₦100k", sub: "4 – 6 weeks",
      items: ["One programme", "Certificate on completion", "Live + recorded sessions", "Lifetime material access"],
      context: "HUB Single Course",
    },
    {
      id: "certification", label: "CERTIFICATION",
      price: "₦200k – ₦400k", sub: "8 – 12 weeks",
      items: ["Deeper curriculum", "Real-client portfolio", "Job-placement support", "1-on-1 mentorship", "Certificate + reference"],
      badge: "POPULAR",
      context: "HUB Certification",
    },
    {
      id: "team", label: "TEAM TRAINING",
      price: "₦500,000", sub: "One-time",
      items: ["5 – 10 staff", "Customised curriculum", "On-site or virtual", "All certificates", "Manager progress reports"],
      context: "HUB Team Training",
    },
    {
      id: "corporate", label: "CORPORATE",
      price: "₦1M+", sub: "Retainer",
      items: ["10+ employees", "Full curriculum customisation", "Ongoing coaching", "Skills assessment framework", "Quarterly reviews"],
      note: "For companies training an entire function",
      dark: true,
      context: "HUB Corporate Training",
    },
  ],
  serviceCategories: [
    {
      id: "tech", title: "Technical Programmes", icon: Code2,
      items: [
        { name: "Code Craft — Full-Stack Web Development", context: "HUB Code Craft" },
        { name: "Data Analysis — Excel, SQL, Power BI", context: "HUB Data Analysis" },
        { name: "Microsoft Office Mastery", context: "HUB MS Office" },
        { name: "QuickBooks for Bookkeepers", context: "HUB QuickBooks" },
      ],
    },
    {
      id: "creative", title: "Creative Programmes", icon: PenTool,
      items: [
        { name: "Graphics Design — Brand, Print, Digital", context: "HUB Graphics Design" },
        { name: "Video Editing + Motion", context: "HUB Video Editing" },
        { name: "UI/UX Fundamentals", context: "HUB UI/UX" },
      ],
    },
    {
      id: "growth", title: "Growth Programmes", icon: TrendingUp,
      items: [
        { name: "Digital Marketing — SEO, Ads, Funnels", context: "HUB Digital Marketing" },
        { name: "Social Media Management", context: "HUB Social Media" },
        { name: "Sales + Client Acquisition", context: "HUB Sales" },
      ],
    },
  ],
};

export default function HubPage() {
  return <DivisionPortalTemplate cfg={cfg} />;
}
