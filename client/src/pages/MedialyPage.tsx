import { Megaphone, Camera, BarChart3 } from "lucide-react";
import DivisionPortalTemplate, { type DivisionPortalConfig } from "./_divisions/DivisionPortalTemplate";

const cfg: DivisionPortalConfig = {
  name:              "MEDIALY",
  pageTitle:         "Medialy — Social Media | HAMZURY",
  pageDescription:   "Social media that actually brings clients. Strategy, daily posts, stories, analytics — and discipline.",
  splashTagline:     "Social media that actually brings clients.",
  heroHeading:       "Social media that actually",
  heroHighlight:     "brings clients.",
  heroSub:           "Content strategy. Daily posting. Engagement management. Monthly analytics. And the discipline to show up every single day.",
  packagesEyebrow:   "RECOMMENDED",
  packagesTitle:     "From Setup to Full Management.",
  packagesSub:       "Consistent content turns followers into clients. Pick where you want us to start.",
  servicesEyebrow:   "OUR SERVICES",
  servicesTitle:     "Everything it takes to show up every day.",
  accent:            "#7C2D12",
  highlight:         "#D4A574",
  path:              "/medialy",
  footerLabel:       "MEDIALY",
  motivationalDept:  "general",
  navLinks: [
    { label: "Bizdoc",  href: "/bizdoc" },
    { label: "Scalar",  href: "/scalar" },
    { label: "HUB",     href: "/hub" },
    { label: "About",   href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "HAMZURY", href: "/" },
  ],
  packages: [
    {
      id: "setup", label: "SETUP",
      price: "₦50,000", sub: "One-time",
      items: ["2-platform profile setup", "Content strategy document", "10 post templates", "1-hour training session", "Branded profile assets"],
      context: "Medialy Setup Package",
    },
    {
      id: "manage", label: "MANAGE",
      price: "₦150,000", sub: "Per month",
      items: ["20 posts / month", "Daily stories", "Community management", "Monthly analytics report", "2 platforms"],
      context: "Medialy Manage Package",
    },
    {
      id: "accelerate", label: "ACCELERATE",
      price: "₦300,000", sub: "Per month",
      items: ["40 posts across 3 platforms", "8 reels / TikToks monthly", "Influencer outreach", "Competitor analysis", "Biweekly strategy calls"],
      badge: "POPULAR",
      context: "Medialy Accelerate Package",
    },
    {
      id: "authority", label: "AUTHORITY",
      price: "₦500,000", sub: "Per month",
      items: ["All 5+ platforms", "Paid ads management", "₦100k ad spend included", "Advanced analytics", "Dedicated social strategist"],
      note: "For brands ready to dominate their niche",
      dark: true,
      context: "Medialy Authority Package",
    },
  ],
  serviceCategories: [
    {
      id: "strategy", title: "Strategy & Content", icon: Megaphone,
      items: [
        { name: "Monthly Content Strategy", context: "Medialy Content Strategy" },
        { name: "Content Calendar Planning", context: "Medialy Content Calendar" },
        { name: "Brand Voice + Visual Identity", context: "Medialy Brand Voice" },
        { name: "Caption Writing + Hashtag Research", context: "Medialy Captions" },
        { name: "Audience Research + Personas", context: "Medialy Audience Research" },
      ],
    },
    {
      id: "production", title: "Production & Posting", icon: Camera,
      items: [
        { name: "Feed Posts (carousels, flyers)", context: "Medialy Posts" },
        { name: "Daily Stories + Highlights", context: "Medialy Stories" },
        { name: "Reels + TikToks", context: "Medialy Reels" },
        { name: "Video Editing + Voice-Over", context: "Medialy Video" },
        { name: "Photography / Product Shoots", context: "Medialy Photography" },
      ],
    },
    {
      id: "growth", title: "Growth & Analytics", icon: BarChart3,
      items: [
        { name: "Community Management (replies, DMs)", context: "Medialy Community" },
        { name: "Influencer + Collaboration Outreach", context: "Medialy Influencer Outreach" },
        { name: "Paid Ads Management", context: "Medialy Paid Ads", tag: "ADD-ON" },
        { name: "Monthly Performance Report", context: "Medialy Analytics" },
      ],
    },
  ],
};

export default function MedialyPage() {
  return <DivisionPortalTemplate cfg={cfg} />;
}
