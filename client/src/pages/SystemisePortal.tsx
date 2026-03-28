import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight, ArrowLeft, ChevronDown, ChevronRight, ChevronLeft,
  Layers, Monitor, Search, Instagram,
  PieChart, Home, Loader2, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";

/* ═══════════════════════════════════════════════════════════════════════════
   SYSTEMIZE PORTAL. /systemise
   ═══════════════════════════════════════════════════════════════════════════ */

const G  = "#0A1F1C";   // Dark teal — Systemise primary
const Au = "#C9A97E";   // Gold accent (5% usage)
const Cr = "#FAFAF8";   // Milk white background
const W  = "#FFFFFF";

// ── WHAT YOU GET accordion ────────────────────────────────────────────────────
const SERVICES = [
  {
    id: "brand", icon: Layers, badge: "BRANDING",
    pain: "Brand looks cheap. Clients undervalue what you offer",
    solution: "Brand Identity. Full visual system for premium positioning",
    description: "Logo, colour system, typography, brand guide, tone of voice. Engineered to attract the right clients.",
    outcomes: ["Logo + brand mark (primary + secondary variants)", "Full colour palette + typography system", "Brand style guide (PDF + editable)", "Business card, letterhead, and social templates", "Positioning statement and tone of voice document"],
  },
  {
    id: "website", icon: Monitor, badge: "WEBSITE",
    pain: "No website. Or one that doesn't convert",
    solution: "Website Design. A sales tool, not a brochure",
    description: "Fast, mobile-first, designed around your buyer's journey. Closes enquiries while you sleep.",
    outcomes: ["Custom design (not a template)", "Mobile-first, fast-loading, SEO-ready", "Clear conversion path (CTA, enquiry, contact)", "Integrated contact forms and WhatsApp CTA", "Hosting setup + 30-day post-launch support"],
  },
  {
    id: "seo", icon: Search, badge: "VISIBILITY",
    pain: "Nobody can find my business online",
    solution: "SEO & Digital Visibility. Found first, organically",
    description: "High-intent buyers discover you through search. Before your competitors. No ad budget required.",
    outcomes: ["Google Business Profile setup and optimisation", "On-page SEO audit and implementation", "Keyword targeting for your sector and location", "Directory listings (Google, Bing, Apple Maps, industry sites)", "Monthly visibility report"],
  },
  {
    id: "social", icon: Instagram, badge: "SOCIAL MEDIA",
    pain: "Social media eats time. Still no growth",
    solution: "Social Media Management. Professional presence, hands-off",
    description: "Content created, scheduled, managed. Your audience grows without your hours.",
    outcomes: ["Content calendar (monthly, planned in advance)", "12–16 branded posts per month (graphics + captions)", "Story content + highlight covers", "Community engagement management", "Monthly analytics and performance report"],
  },
  {
    id: "crm", icon: PieChart, badge: "CRM",
    pain: "Losing track of leads. No visibility on pipeline",
    solution: "CRM & Sales Dashboard. Every lead, every deal, visible",
    description: "CRM pipeline and sales dashboard. Always know where every prospect stands.",
    outcomes: ["CRM setup (Notion, HubSpot, or custom to your workflow)", "Lead stage pipeline (Awareness → Proposal → Closed)", "Sales dashboard with real-time conversion tracking", "Lead source attribution", "Team training + handover documentation"],
  },
];

// ── HOW WE WORK ───────────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", title: "Get Clarity", short: "Tell us where you are and where you want to go", detail: "Speak to a strategist. We listen for what you actually need. Most founders discover gaps they hadn't considered." },
  { num: "02", title: "We Audit You", short: "Brand, visibility, and systems assessed", detail: "Brand, website, social, sales process reviewed. Within 48 hours: your biggest growth blockers identified." },
  { num: "03", title: "You Approve", short: "Scoped plan. Tools, timeline, investment", detail: "Written scope of work. What we build, in what order, what it costs. You approve before we start." },
  { num: "04", title: "We Build", short: "Brand, website, systems. Professionally executed", detail: "Designers, developers, systems specialists execute. Regular updates. You focus on your business." },
  { num: "05", title: "We Hand Over", short: "Documented, trained, live. You own everything", detail: "Every asset in your name. Every system documented. 30 days post-delivery support." },
];

// ── BUSINESS BLUEPRINT ────────────────────────────────────────────────────────
const SYS_STAGE_TABS = [
  { id: "brand", label: "Brand", num: "01" },
  { id: "website", label: "Website", num: "02" },
  { id: "visibility", label: "Visibility", num: "03" },
  { id: "social", label: "Social Media", num: "04" },
  { id: "crm", label: "CRM & Sales", num: "05" },
  { id: "automation", label: "Automation", num: "06" },
];

type SysPrimary = { name: string; note: string };
type SysStage = { id: string; label: string; tagline: string; primary: SysPrimary[]; secondary: string[]; automations: string[] };
type SysBlueprint = { id: string; label: string; tagline: string; stages: SysStage[]; mayAlsoNeed?: { trigger: string; items: string[] }[] };

const SYS_BLUEPRINTS: SysBlueprint[] = [
  {
    id: "restaurant",
    label: "Restaurant / Food Business",
    tagline: "From brand identity to a fully booked, digitally visible food business.",
    stages: [
      {
        id: "brand", label: "Brand", tagline: "Most food businesses fail on first visual impression before the food is even tasted. Brand identity built for your pricing tier and target customer.",
        primary: [
          { name: "Logo + Visual Identity", note: "Logo, colour palette, and typography tuned to your positioning. Street food, upscale dining, or catering. Visual brand determines your perceived price point before anyone reads your menu." },
          { name: "Menu Design", note: "Menu layout engineered for average order value. strategic item placement, photography recommendations, and pricing psychology. Well-designed menus increase per-table revenue by 20-30%." },
          { name: "Brand Packaging Design", note: "Branded takeaway bags, cups, boxes, and stickers. Packaging is your cheapest marketing. Every delivery is a moving billboard." },
          { name: "Brand Voice & Positioning", note: "Are you the affordable everyday option, the premium experience, or the specialist? Positioning determines who you attract and what you can charge." },
        ],
        secondary: ["Staff uniform design", "Branded receipt and invoice template", "Loyalty card design", "Branded social media bio and link-in-bio page"],
        automations: ["Canva brand template library (shared access)", "Social media post templates (auto-resizing)", "Menu update workflow"],
      },
      {
        id: "website", label: "Website", tagline: "A food business without a website loses bookings, private dining enquiries, and catering contracts daily to competitors who have one.",
        primary: [
          { name: "Restaurant Website with Menu", note: "Fast, mobile-first website with digital menu, location, hours, gallery, and contact. Most customers check online before visiting. If they can't find you, they choose someone else." },
          { name: "Online Reservation System", note: "Table booking integration (OpenTable, Eat, or WhatsApp Business) reduces no-shows and captures guest data for remarketing." },
          { name: "Catering / Private Dining Enquiry Page", note: "Dedicated page for catering, private dining, and corporate events. With a scoped enquiry form. This channel typically generates your highest-margin orders." },
          { name: "Google Maps + Schema Markup", note: "Technical setup so your restaurant appears in Google 'near me' searches with correct hours, menu, and star rating. Most restaurant searches trigger map results." },
        ],
        secondary: ["Online ordering integration (for delivery)", "Gift voucher sales page", "Loyalty programme sign-up page", "Blog for recipe content and SEO"],
        automations: ["Automated booking confirmation email/WhatsApp", "Review request automation (post-visit)", "Catering enquiry follow-up sequence"],
      },
      {
        id: "visibility", label: "Visibility", tagline: "92% of people check restaurant reviews online before visiting. Your digital presence determines your occupancy before they even leave home.",
        primary: [
          { name: "Google Business Profile Optimisation", note: "Fully optimised GBP with photos, menu, hours, posts, and Q&A. Restaurants with optimised GBP get 3x more calls and 5x more direction requests." },
          { name: "TripAdvisor + Restaurant-Specific Directories", note: "Active management on TripAdvisor, Yelp (for international customers), and local food guides. Reviews directly impact occupancy." },
          { name: "Food Delivery Platform Listings", note: "Jumia Food, Chowdeck, and Bolt Food. Properly set up with professional photography, descriptions, and strategic pricing to maximise platform orders." },
          { name: "Local SEO Strategy", note: "Rank for '[your cuisine] in [your city]' searches. Local SEO content targeting neighbourhood-specific and cuisine-specific keywords." },
        ],
        secondary: ["Influencer review seeding strategy", "Food blog partnerships", "WhatsApp Business catalogue setup", "Facebook and Instagram page optimisation"],
        automations: ["Review monitoring dashboard", "Competitor ranking tracker", "Delivery platform performance report"],
      },
      {
        id: "social", label: "Social Media", tagline: "Food is the most shared content category online. Your product is infinitely photographable. A consistent social media presence is your lowest-cost marketing channel.",
        primary: [
          { name: "Instagram Content Strategy", note: "Content pillars: behind-the-scenes, signature dishes, team culture, customer stories. Instagram is the primary discovery channel for food businesses." },
          { name: "Monthly Content Calendar", note: "12–16 posts per month planned and scheduled in advance. Consistent posting is more valuable than occasional viral content." },
          { name: "Food Photography Brief & Standards", note: "Professional food photography is the single highest-ROI investment in restaurant marketing. We brief your photographer or shoot on your behalf." },
          { name: "Story Content + Highlights", note: "Daily story content showing real-time activity. Today's specials, kitchen action, team moments. Stories drive more profile visits than feed posts." },
        ],
        secondary: ["TikTok content strategy (food trends)", "Facebook community management", "WhatsApp broadcast list management", "Influencer collaboration framework"],
        automations: ["Content scheduling (Buffer / Later)", "Auto-reply for DM enquiries", "Story posting reminder system"],
      },
      {
        id: "crm", label: "CRM & Sales", tagline: "Repeat customers cost 5x less than new ones. Your CRM captures, retains, and reactivates every guest you win.",
        primary: [
          { name: "Guest Database & CRM", note: "Name, phone, visit history, preferences, spend level. A proper guest database enables targeted re-engagement, birthday offers, and VIP treatment for your best customers." },
          { name: "Corporate Sales Pipeline", note: "Corporate lunch accounts, event bookings, and catering contracts tracked from first contact to signed agreement. Corporate clients are your highest-margin, most predictable revenue." },
          { name: "Private Dining & Events Sales Tracker", note: "Pipeline for private dining enquiries, weddings, and events. From initial enquiry through quote, deposit, and delivery." },
          { name: "Sales Dashboard", note: "Daily, weekly, and monthly revenue tracking. Covers, average spend, table turn rate, and peak hour analysis. Decisions backed by numbers." },
        ],
        secondary: ["Loyalty programme management", "Referral tracking (word-of-mouth)", "Delivery platform order analytics", "Gift voucher redemption tracking"],
        automations: ["Birthday offer automation", "Re-engagement campaign (lapsed guests)", "Event enquiry follow-up sequence", "Corporate account renewal reminder"],
      },
      {
        id: "automation", label: "Automation", tagline: "Restaurant operations are labour-intensive by nature. Every manual task you automate is time returned to quality and service.",
        primary: [
          { name: "Booking Confirmation & Reminder System", note: "Automated WhatsApp/email confirmation on booking and reminder 24 hours before. Reduces no-shows by 35-50% for table service restaurants." },
          { name: "Review Request Automation", note: "Automated post-visit review request (Google, TripAdvisor) sent 2 hours after the meal. The difference between 4.1★ and 4.7★ is mostly consistency of asking." },
          { name: "Delivery Order Notifications", note: "Automated order status updates to customers from order placed to delivery. Reduces inbound customer service calls by 60%." },
          { name: "Social Media Scheduling", note: "All content scheduled 2-4 weeks in advance. Post at optimal times automatically. Your social presence runs while you focus on service." },
        ],
        secondary: ["Supplier reorder automation", "Staff rota notification system", "Monthly revenue report automation", "Customer feedback survey (post-visit)"],
        automations: ["Booking → CRM → Reminder pipeline", "Review request trigger (post-visit)", "Low stock alert (integrated with POS)", "Monthly analytics report (auto-generated)"],
      },
    ],
    mayAlsoNeed: [
      { trigger: "If operating delivery or ghost kitchen", items: ["Delivery platform onboarding (Jumia Food, Chowdeck, Bolt Food)", "Packaging design for delivery", "Google Ads for delivery keyword targeting"] },
      { trigger: "If expanding to franchise or multiple locations", items: ["Brand standards manual", "Franchise marketing kit", "Multi-location CRM setup"] },
    ],
  },
  {
    id: "ecommerce",
    label: "E-commerce / Online Store",
    tagline: "From product photography to a fully automated sales machine that sells while you sleep.",
    stages: [
      {
        id: "brand", label: "Brand", tagline: "Online shoppers make purchase decisions in 8 seconds. Your brand must communicate quality, trust, and value instantly.",
        primary: [
          { name: "E-commerce Brand Identity", note: "Logo, colour palette, and typography tuned for digital trust. E-commerce customers buy from brands, not just products. Your visual identity determines whether they trust you with their money." },
          { name: "Product Photography Standards", note: "Professional product photography brief and style guide. Clean backgrounds, lifestyle shots, and detail close-ups. Quality product photography increases conversion rate by 30-60%." },
          { name: "Brand Voice & Copy System", note: "Product description templates, category page copy, and email tone of voice. Words sell on e-commerce. Your copy converts or kills the sale." },
          { name: "Packaging Design", note: "Branded packaging that creates an unboxing experience customers share. Unboxing content is free marketing. Make it worth filming." },
        ],
        secondary: ["Thank-you card and insert design", "Returns and exchange policy copy", "About page copywriting", "Brand origin story for marketing"],
        automations: ["Product description template system", "Photography checklist automation", "Social media product post templates"],
      },
      {
        id: "website", label: "Website", tagline: "Your online store is your 24/7 sales team. It must load fast, convert visitors, and handle payments without friction.",
        primary: [
          { name: "E-commerce Website (Shopify / WooCommerce)", note: "Custom-designed store built for conversion. Clear product categories, fast checkout, mobile optimised, and payment gateway integrated (Paystack, Flutterwave)." },
          { name: "Product Page Optimisation", note: "High-converting product pages with benefit-led copy, multiple product images, size guides, FAQs, and reviews. Product page quality is the primary conversion lever." },
          { name: "Abandoned Cart Recovery Setup", note: "Automated email/WhatsApp sequence for customers who add to cart but don't complete purchase. Recovers 15-25% of abandoned orders." },
          { name: "Trust Signals Integration", note: "Customer reviews, secure payment badges, return policy highlight, and social proof. All designed to reduce purchase hesitation at checkout." },
        ],
        secondary: ["Upsell and cross-sell widgets", "Wishlist and saved items", "Bundle product pages", "Gift card functionality"],
        automations: ["Abandoned cart email/WhatsApp sequence", "Order confirmation automation", "Shipping update notifications", "Review request post-delivery"],
      },
      {
        id: "visibility", label: "Visibility", tagline: "Organic traffic is the most profitable channel for e-commerce. customers who find you through search already want what you sell.",
        primary: [
          { name: "E-commerce SEO Setup", note: "Category and product page SEO. Titles, descriptions, schema markup, and image alt text. Properly optimised product pages rank in Google Shopping for free." },
          { name: "Google Shopping Feed", note: "Product catalogue integration with Google Merchant Centre. Google Shopping ads show your products with price and image at the top of search results." },
          { name: "Jumia / Konga Marketplace Listings", note: "Professional marketplace listings with optimised titles, keywords, and photography. Marketplace presence adds a high-traffic sales channel with zero additional marketing spend." },
          { name: "Social Commerce Setup", note: "Instagram Shop and TikTok Shop. Product catalogue synced to social media so followers can purchase without leaving the app." },
        ],
        secondary: ["Pinterest product pins", "Facebook Marketplace listings", "Influencer seeding strategy", "YouTube product review strategy"],
        automations: ["Google Merchant Centre feed auto-sync", "Inventory sync across platforms", "Price change automation", "Out-of-stock SEO redirect management"],
      },
      {
        id: "social", label: "Social Media", tagline: "Social media is the primary discovery channel for most e-commerce brands in Nigeria. And the cheapest traffic source when done well.",
        primary: [
          { name: "Instagram Commerce Strategy", note: "Feed, stories, reels, and shopping tags. Unified content strategy that drives traffic to your store. Instagram drives 60%+ of social e-commerce traffic." },
          { name: "TikTok Product Content", note: "Short-form product videos, unboxing content, and trend participation. TikTok virality can drive thousands of orders in 24 hours. Without ad spend." },
          { name: "WhatsApp Business Channel", note: "Broadcast list for new arrivals, restocks, and flash sales. WhatsApp messages have 90%+ open rates. Vastly more effective than email for Nigerian audiences." },
          { name: "Monthly Content Calendar", note: "12–16 posts per month planned around product launches, seasons, and trends. Consistent posting builds the audience that funds your business." },
        ],
        secondary: ["Facebook group community management", "User-generated content strategy", "Influencer affiliate programme", "Customer photo repost system"],
        automations: ["Content scheduling (Buffer / Later / Metricool)", "WhatsApp broadcast automation", "DM reply automation for FAQs", "New product launch notification sequence"],
      },
      {
        id: "crm", label: "CRM & Sales", tagline: "E-commerce profitability comes from repeat customers. Your CRM captures every buyer and brings them back automatically.",
        primary: [
          { name: "Customer Database & Segmentation", note: "Every buyer segmented by purchase history, order value, product category, and location. Segmented campaigns generate 3x the revenue of unsegmented broadcasts." },
          { name: "Email Marketing System", note: "Klaviyo, Mailchimp, or similar. Automated welcome series, post-purchase flow, and seasonal campaigns. Email is the highest-ROI owned channel in e-commerce." },
          { name: "Sales Dashboard", note: "Daily revenue, conversion rate, average order value, top products, and traffic sources. Know your numbers every morning in 60 seconds." },
          { name: "Wholesale & B2B Pipeline", note: "Bulk order pipeline for corporate buyers, gift buyers, and resellers. B2B orders 10-50x average retail order value." },
        ],
        secondary: ["Customer loyalty programme", "Referral programme (friend discount)", "Win-back campaign (lapsed customers)", "VIP tier management"],
        automations: ["Post-purchase upsell automation", "Reorder reminder (consumable products)", "Customer birthday discount", "Lapsed customer re-engagement sequence"],
      },
      {
        id: "automation", label: "Automation", tagline: "The most successful e-commerce brands are mostly automated. They generate revenue with minimal daily manual intervention.",
        primary: [
          { name: "Order Fulfillment Workflow", note: "Automated order routing from website to fulfilment. Confirmation sent to customer, notification to warehouse/packer, and dispatch confirmation with tracking." },
          { name: "Inventory Reorder Alerts", note: "Automated low-stock alerts and reorder triggers. Never run out of your best-selling products during peak demand periods." },
          { name: "Customer Service Automation", note: "FAQ chatbot for order status, returns, and sizing questions. Handles 70-80% of inbound enquiries without human intervention." },
          { name: "Email & WhatsApp Flows", note: "Welcome series, abandoned cart, post-purchase, review request, and re-engagement. All automated and running 24/7." },
        ],
        secondary: ["Returns processing automation", "Flash sale campaign automation", "Price change notification system", "Supplier invoice automation"],
        automations: ["Order → confirm → dispatch → track pipeline", "Abandoned cart recovery flow", "Inventory reorder trigger", "Monthly business performance report"],
      },
    ],
    mayAlsoNeed: [
      { trigger: "If selling internationally", items: ["International payment gateway (Stripe, PayPal)", "International shipping calculator", "Import duty and customs labelling compliance"] },
      { trigger: "If scaling to ₦10M+ monthly revenue", items: ["Performance marketing (Meta/Google Ads management)", "Influencer partnership programme", "Warehouse management system integration"] },
    ],
  },
  {
    id: "realestate",
    label: "Real Estate / Property",
    tagline: "From brand authority to a lead generation system that attracts serious buyers and landlords.",
    stages: [
      {
        id: "brand", label: "Brand", tagline: "Real estate is a trust business. Your brand determines whether high-value clients call you or scroll past you.",
        primary: [
          { name: "Real Estate Brand Identity", note: "Logo, colour palette, and typography that positions you as a credible, professional agency. Property buyers and landlords judge your seriousness by how you look before they ever speak to you." },
          { name: "Property Listing Presentation System", note: "Branded property brochure template, floor plan presentation, and listing descriptions that justify premium pricing. Well-presented properties sell faster at higher prices." },
          { name: "Personal Brand for Principal Agent", note: "LinkedIn, headshots, and thought leadership positioning for the lead agent or CEO. In real estate, people buy from the person first, the brand second." },
          { name: "Brand Positioning Statement", note: "Are you the volume residential agent, the luxury property specialist, or the commercial property expert? Clear positioning prevents competing on commission." },
        ],
        secondary: ["For-sale signage design", "Business card and email signature design", "Office interior branding", "Staff ID and uniform guidelines"],
        automations: ["Property brochure generation template", "Listing description AI writing assistant", "Brand asset management system"],
      },
      {
        id: "website", label: "Website", tagline: "80% of property searches start online. Your website is your highest-value lead generation tool if built correctly.",
        primary: [
          { name: "Property Agency Website", note: "Professional website with searchable property listings, featured properties, team profiles, and lead capture forms. Must be mobile-first. Most property searches happen on phone." },
          { name: "Property Search & Filter System", note: "Location, price range, bedrooms, and property type filters. Buyers who can self-filter are 3x more likely to submit an enquiry." },
          { name: "Landlord Valuation Landing Page", note: "Dedicated page for property owners to request a free valuation. Your best landlord acquisition tool. Converts passive landlords into managed property mandates." },
          { name: "WhatsApp Integration & Lead Forms", note: "Every listing and page with direct WhatsApp CTA and lead capture form. In Nigeria, WhatsApp is how property deals actually start. Frictionless contact is essential." },
        ],
        secondary: ["Virtual tour integration", "Mortgage calculator widget", "Neighbourhood guide content pages", "Agent profile pages with individual contact"],
        automations: ["New listing notification email/WhatsApp", "Enquiry auto-reply and booking system", "Saved search alert for buyers"],
      },
      {
        id: "visibility", label: "Visibility", tagline: "Property buyers search before they call. Your visibility in those searches determines your listing volume.",
        primary: [
          { name: "Property Portal Listings (PropertyPro, Nigeria Property Centre)", note: "Optimised listings on the major Nigerian property portals with professional photography, detailed descriptions, and strategic pricing." },
          { name: "Google Business Profile", note: "Optimised GBP for your agency so you appear in 'property agent in [location]' searches. Essential for local buyers and landlords searching for agents." },
          { name: "Local SEO for Property Keywords", note: "Rank for '[3 bed flat in Lekki]' type searches. Area-specific content pages targeting the locations you operate in." },
          { name: "Google Ads for Buyer Keywords", note: "Targeted ads for 'buy property in [area]' and 'houses for rent [location]'. Lowest-cost per qualified lead for property agencies when set up correctly." },
        ],
        secondary: ["YouTube property tour channel", "Instagram property showcase strategy", "Facebook property group management", "Expat and diaspora targeting strategy"],
        automations: ["Portal listing sync", "Competitor listing monitor", "Lead source attribution tracking"],
      },
      {
        id: "social", label: "Social Media", tagline: "Property is a high-consideration purchase. social media builds the trust and familiarity that makes buyers call you first.",
        primary: [
          { name: "Instagram Property Showcase", note: "Property photography and video tours, market insights, and team culture content. Instagram is the primary social discovery channel for property in Nigeria." },
          { name: "WhatsApp Property Broadcast List", note: "New listings, price reductions, and market updates sent to an engaged broadcast list. WhatsApp lists have 90%+ open rates. Your most effective owned channel." },
          { name: "LinkedIn for Commercial & Corporate", note: "Thought leadership content for commercial property clients. Facility managers, developers, and corporate tenants. LinkedIn is where commercial deals start." },
          { name: "Monthly Content Calendar", note: "12–16 posts per month covering new listings, sold properties, market updates, and educational content. Consistency builds the credibility that drives inbound calls." },
        ],
        secondary: ["TikTok property tour content", "Facebook community group management", "Property market newsletter", "YouTube virtual tour channel"],
        automations: ["New listing social post automation", "Open house reminder sequence", "Sold property announcement automation", "Content scheduling system"],
      },
      {
        id: "crm", label: "CRM & Sales", tagline: "Property sales cycles are long. Your CRM tracks every buyer and landlord from first contact to completion without losing anyone.",
        primary: [
          { name: "Property CRM (Buyer & Landlord Pipeline)", note: "Full pipeline from enquiry through viewing, offer, negotiation, and completion. For both buy/rent transactions and property management mandates." },
          { name: "Buyer Requirements Database", note: "Every registered buyer's requirements (location, price, size, timeline). So when a matching listing comes in, you know exactly who to call first." },
          { name: "Landlord & Property Management Pipeline", note: "Landlord onboarding, property condition reports, maintenance requests, and renewal pipelines. All tracked in one system." },
          { name: "Sales Dashboard", note: "Monthly listing volume, viewing-to-offer ratio, average days on market, and transaction values. Manage by numbers, not memory." },
        ],
        secondary: ["Referral tracking (client introduction)", "Corporate relocation accounts", "Developer new project pipeline", "Investment buyer portfolio tracking"],
        automations: ["New listing → matching buyer alert", "Viewing reminder sequence", "Post-viewing follow-up", "Lease renewal reminder (6 months out)"],
      },
      {
        id: "automation", label: "Automation", tagline: "Property management is documentation-heavy. Automation eliminates the admin so your team focuses on deals and relationships.",
        primary: [
          { name: "Property Viewing Booking System", note: "Online viewing booking. Buyer selects date and time, automatic confirmation and reminder sent. Eliminates back-and-forth scheduling and reduces no-shows." },
          { name: "Tenancy Agreement Generation", note: "Automated tenancy agreement populated from CRM data. Landlord, tenant, property, terms. One click from CRM to signed PDF." },
          { name: "Rent Collection & Reminder System", note: "Automated rent due reminders 7 days, 3 days, and 1 day before due date. And overdue escalation. Virtually eliminates late payment administration." },
          { name: "Maintenance Request Workflow", note: "Tenant submits maintenance request → assigned to contractor → completion confirmed → landlord notified. Full audit trail automatically maintained." },
        ],
        secondary: ["Property inspection scheduling", "Void period alert system", "Landlord statement generation", "End-of-tenancy deposit reconciliation"],
        automations: ["Viewing → follow-up → offer pipeline", "Rent reminder sequence", "Tenancy renewal workflow", "Maintenance request tracker"],
      },
    ],
    mayAlsoNeed: [
      { trigger: "If selling off-plan or new developments", items: ["Developer landing page with reservation system", "Investor information pack design", "Off-plan buyer CRM and payment tracking"] },
      { trigger: "If managing short-let / serviced apartments", items: ["Airbnb / Booking.com listing optimisation", "Dynamic pricing strategy", "Guest communication automation"] },
    ],
  },
  {
    id: "consulting",
    label: "Professional Services / Consulting",
    tagline: "From personal brand authority to a client acquisition system that generates retainers consistently.",
    stages: [
      {
        id: "brand", label: "Brand", tagline: "In professional services, you are the brand. How you present determines whether you compete on fees or attract clients at your price.",
        primary: [
          { name: "Personal + Business Brand Identity", note: "Logo, visual identity, and professional presentation system for your firm. And personal brand positioning for the principal consultant. Clients hire the person before the firm." },
          { name: "Authority Positioning Statement", note: "A precise, differentiated statement of who you serve, what you solve, and what you achieve for clients. Vague positioning forces price competition. Sharp positioning commands premium fees." },
          { name: "Case Study & Portfolio System", note: "Structured case study template capturing the client problem, your approach, and measurable outcome. Two or three strong case studies close more clients than any brochure." },
          { name: "Credentials & Capability Document", note: "A professional credentials document. Firm overview, methodology, key team profiles, client testimonials, and service descriptions. The first document prospective clients request." },
        ],
        secondary: ["Thought leadership content pillars", "Award and recognition strategy", "Speaking kit and bio templates", "Partner and associate brand guidelines"],
        automations: ["Case study generation template", "Proposal document system", "Client testimonial collection workflow"],
      },
      {
        id: "website", label: "Website", tagline: "Your website is your 24/7 business development asset. It must qualify leads, establish credibility, and convert enquiries.",
        primary: [
          { name: "Consulting Firm Website", note: "Services, case studies, team, and content hub. Designed to establish credibility and generate qualified enquiries. Visitors must immediately understand who you help and how." },
          { name: "Service Landing Pages", note: "A dedicated page per service with clear outcomes, process, investment range, and CTA. Specific pages convert better than general 'services' overview pages." },
          { name: "Thought Leadership Blog / Resource Hub", note: "Articles, guides, and tools your ideal clients find valuable. Content builds trust before the sales conversation. And drives organic traffic." },
          { name: "Discovery Call Booking System", note: "Integrated calendar booking (Calendly or similar) so qualified prospects can book immediately. Without email back-and-forth that kills momentum." },
        ],
        secondary: ["Email newsletter sign-up", "Free resource download (lead magnet)", "Client portal login", "Press and media page"],
        automations: ["Discovery call booking → confirmation → reminder sequence", "Post-meeting follow-up automation", "Newsletter welcome sequence"],
      },
      {
        id: "visibility", label: "Visibility", tagline: "Consulting clients trust Google rankings and LinkedIn presence as proxies for expertise. You must rank where your clients search.",
        primary: [
          { name: "LinkedIn Profile Optimisation", note: "Headline, summary, experience, and content strategy for the principal consultant. LinkedIn drives more B2B consulting enquiries than any other channel in Nigeria." },
          { name: "Google for Consulting Keywords", note: "Rank for '[your specialty] consultant in Nigeria' and specific problem searches. Organic SEO positions you as the default expert your clients discover." },
          { name: "Thought Leadership Content Distribution", note: "Articles, LinkedIn posts, and newsletter content that demonstrate expertise. In consulting, visibility of thinking = credibility = inbound enquiries." },
          { name: "Podcast and Speaking Visibility", note: "Guest podcast appearances and speaking engagements. The fastest way to build authority with a new audience. One podcast episode reaches more people than 100 LinkedIn posts." },
        ],
        secondary: ["Google Scholar and publication listings (if applicable)", "Industry association membership and visibility", "Award submission strategy", "Media and PR placement strategy"],
        automations: ["Content scheduling and distribution", "LinkedIn engagement tracking", "Speaking opportunity pipeline", "PR mention monitoring"],
      },
      {
        id: "social", label: "Social Media", tagline: "Professional service clients follow, assess, and then buy. Your social media builds the trust that converts followers into clients.",
        primary: [
          { name: "LinkedIn Content Strategy", note: "Weekly insights, client results, process education, and opinion posts. LinkedIn is the primary business development channel for consulting firms targeting corporates and SMEs." },
          { name: "Newsletter / Email Community", note: "A weekly or fortnightly newsletter to your network. Market insights, practical advice, and firm updates. Newsletter subscribers convert to clients at 5-10x the rate of social followers." },
          { name: "Case Study Content System", note: "Regular before/after posts, client result announcements, and process breakdowns. Social proof is the most effective content type for professional services." },
          { name: "Monthly Content Calendar", note: "8–12 posts per month across LinkedIn and relevant platforms. Planned against a content matrix of authority, education, proof, and culture." },
        ],
        secondary: ["Twitter/X for thought leadership", "YouTube for long-form content", "Instagram for culture and team", "Podcast production or co-hosting"],
        automations: ["LinkedIn post scheduling", "Newsletter send automation", "Content repurposing workflow", "Engagement monitoring and response system"],
      },
      {
        id: "crm", label: "CRM & Sales", tagline: "Consulting retainers are won and lost in the pipeline. Your CRM turns a network into a predictable revenue machine.",
        primary: [
          { name: "Business Development Pipeline", note: "Lead → contacted → discovery call → proposal → negotiation → closed. Tracked per prospect with next action dates and follow-up notes. Most consultants lose deals because they forget to follow up." },
          { name: "Proposal Tracking System", note: "Live proposals tracked by client, value, stage, and decision timeline. Know exactly what's in the pipeline and when decisions are expected." },
          { name: "Retainer Client Management Dashboard", note: "Active retainer clients tracked by scope, deliverables, milestone completion, and renewal dates. Retain clients by delivering visibly. Dashboards make your value tangible." },
          { name: "Revenue Dashboard", note: "Monthly recurring revenue, pipeline value, win rate, average deal size, and revenue by service line. Manage the business with numbers." },
        ],
        secondary: ["Referral partner tracking", "Alumni / ex-client re-engagement pipeline", "Speaking and event lead pipeline", "Partnership and JV pipeline"],
        automations: ["Proposal follow-up sequence", "Retainer renewal reminder (2 months out)", "Monthly client report generation", "Lead source attribution tracking"],
      },
      {
        id: "automation", label: "Automation", tagline: "Consulting delivery is time-intensive. automation of the administrative and marketing layers gives your team more time for the work clients pay for.",
        primary: [
          { name: "Client Onboarding Workflow", note: "Automated onboarding sequence. welcome email, contract sent for signature, kick-off meeting scheduled, and access to client portal. All triggered by deal won. First impression sets the engagement standard." },
          { name: "Proposal Generation System", note: "Proposal template populated from CRM data. Client name, services, investment, and timeline. One-click from CRM to professional PDF proposal." },
          { name: "Invoicing & Payment Reminder", note: "Automated invoice generation and payment reminders. Eliminates the awkward payment chase and ensures your cash flow stays predictable." },
          { name: "Content Publishing Automation", note: "Blog posts, LinkedIn articles, and newsletter. Scheduled and published automatically. Your content machine runs even when you're deep in client delivery." },
        ],
        secondary: ["Project milestone notification system", "Team task assignment automation", "Client satisfaction survey (mid-engagement)", "End-of-engagement feedback collection"],
        automations: ["Onboarding → contract → kick-off pipeline", "Invoice → reminder → reconcile flow", "Monthly report generation and distribution", "Proposal → follow-up → close tracking"],
      },
    ],
    mayAlsoNeed: [
      { trigger: "If offering online courses or digital products", items: ["Course platform setup (Teachable, Kajabi)", "Digital product sales page", "Email course funnel"] },
      { trigger: "If building a group practice or hiring associates", items: ["Team member brand guidelines", "Associate onboarding system", "Multi-consultant CRM and territory management"] },
    ],
  },
  {
    id: "tech",
    label: "Tech Startup / SaaS",
    tagline: "From product positioning to a demand generation system that acquires users and converts them to paying customers.",
    stages: [
      {
        id: "brand", label: "Brand", tagline: "Tech products compete on perceived innovation and trust. Your brand communicates both before a single line of product is experienced.",
        primary: [
          { name: "Tech Brand Identity", note: "Logo, colour system, and typography built for digital-first application. App, website, social, and marketing materials. Tech brand must look modern, scalable, and trustworthy." },
          { name: "Product Positioning Statement", note: "Clear articulation of the problem, the solution, who it's for, and why it's better than alternatives. Positioning is the foundation of all marketing copy, sales conversations, and investor pitches." },
          { name: "Brand Voice & Messaging Framework", note: "Consistent tone across your product UI, marketing, support, and social media. Tech companies with clear voice build trust faster and retain users longer." },
          { name: "Pitch Deck Design", note: "Investor pitch deck and sales presentation. Designed for clarity and impact. A well-designed deck doesn't guarantee funding, but a poorly designed one loses it." },
        ],
        secondary: ["App icon and store listing design", "Product explainer video brief", "Conference and event branding", "Merch and swag design"],
        automations: ["Brand asset management system", "Presentation template library", "Onboarding email brand consistency check"],
      },
      {
        id: "website", label: "Website", tagline: "Your product website is your primary conversion asset. It must explain what you do, prove it works, and drive sign-ups.",
        primary: [
          { name: "SaaS Marketing Website", note: "Homepage, features page, pricing, case studies, and sign-up flow. Optimised for conversion. The difference between a 1% and 3% visitor-to-trial conversion rate is a 3x increase in user acquisition at the same traffic." },
          { name: "Landing Pages for Campaigns", note: "Dedicated landing pages for each campaign, audience, and channel. Campaign-specific pages outperform homepage sends by 30-50%." },
          { name: "Product Documentation / Help Centre", note: "In-app help, FAQ, and knowledge base. Reduces support tickets and improves user activation. Self-serve support is free support." },
          { name: "Demo Booking System", note: "Frictionless calendar booking for product demos. No email exchange. Every extra step in the demo booking flow costs you conversions." },
        ],
        secondary: ["Changelog and product update page", "API documentation site", "Partner and integration pages", "Affiliate programme landing page"],
        automations: ["Demo booking → confirmation → reminder sequence", "Trial sign-up onboarding sequence", "Churned user win-back sequence"],
      },
      {
        id: "visibility", label: "Visibility", tagline: "Software is discovered through search, community, and content. Your organic visibility strategy is your lowest-cost user acquisition channel.",
        primary: [
          { name: "SEO Content Strategy", note: "Problem-focused content targeting the searches your ideal users make before they know your product exists. Top-of-funnel SEO builds a self-replenishing pipeline of sign-ups." },
          { name: "Product Hunt & AppSumo Launch", note: "Launch strategy for Product Hunt and AppSumo. Both can generate hundreds of customers in 24-48 hours when executed correctly." },
          { name: "LinkedIn Thought Leadership (B2B)", note: "Founder-led content on the problem your product solves. B2B SaaS deals start with trust in the founder's expertise, not product features." },
          { name: "Community Presence", note: "Active participation in communities where your users gather. Slack groups, Discord servers, LinkedIn groups, and forums. Community-led growth is the most cost-efficient acquisition channel for early-stage SaaS." },
        ],
        secondary: ["YouTube tutorial channel", "Podcast guest strategy", "G2 / Capterra listing and review strategy", "Quora and Reddit answer strategy"],
        automations: ["Content publishing pipeline", "Community monitoring and response system", "Review request automation (post-activation)", "Competitor mention monitoring"],
      },
      {
        id: "social", label: "Social Media", tagline: "Tech audiences follow founders and products on Twitter/X and LinkedIn before they buy. Your social channels build the trust that converts.",
        primary: [
          { name: "Twitter/X (Founder Account)", note: "Build-in-public content, product updates, and industry commentary. Twitter is where the tech community forms opinions about founders and products." },
          { name: "LinkedIn (Company + Founder)", note: "Case studies, product wins, and thought leadership. B2B SaaS purchasing decisions are influenced by LinkedIn content more than any other social platform." },
          { name: "Product Update Communications", note: "Regular product changelog posts, new feature announcements, and roadmap previews. Users who see active development stay. Users who don't see it churn." },
          { name: "Monthly Content Calendar", note: "Consistent content across founder and company accounts. Covering product, team, customers, and industry. Consistency compounds into authority." },
        ],
        secondary: ["YouTube product demo channel", "Discord or Slack community", "Instagram for culture content", "TikTok for product education"],
        automations: ["Content scheduling system", "Product update announcement pipeline", "New user welcome social message", "Case study publishing workflow"],
      },
      {
        id: "crm", label: "CRM & Sales", tagline: "SaaS revenue is built on activation, retention, and expansion. Your CRM tracks every lever of your MRR growth.",
        primary: [
          { name: "Lead to Trial Pipeline", note: "Every lead tracked from first touch through sign-up, activation, and conversion to paying. Knowing where leads drop off is the most valuable insight in early SaaS growth." },
          { name: "Customer Success Tracking", note: "Usage, activation milestones, NPS, and health scores per account. Customer success is your best retention tool and your best upsell signal." },
          { name: "MRR Dashboard", note: "New MRR, expansion MRR, churned MRR, and net revenue retention. Tracked weekly. The dashboard every SaaS founder must wake up to." },
          { name: "Enterprise Sales Pipeline", note: "For B2B SaaS. Lead through discovery, demo, proposal, legal, and close. Enterprise deals take longer but drive disproportionate revenue." },
        ],
        secondary: ["Investor reporting dashboard", "Partner/reseller pipeline", "Feature request tracking and prioritisation", "Cohort retention analysis"],
        automations: ["Trial → onboarding → activation sequence", "Churn risk alert (usage drop)", "Renewal reminder sequence", "Expansion opportunity trigger (usage threshold)"],
      },
      {
        id: "automation", label: "Automation", tagline: "The best SaaS companies automate onboarding, retention, and support. Freeing the team to build product and close enterprise deals.",
        primary: [
          { name: "User Onboarding Sequence", note: "Triggered email/in-app sequence guiding new users to activation milestones. The first 7 days determine whether a user activates. And whether they stay past 30 days." },
          { name: "Trial-to-Paid Conversion Flow", note: "Automated nudge sequence for free trial users approaching expiry. Featuring the features they actually used, social proof, and a personalised upgrade offer." },
          { name: "Churn Prevention Automation", note: "Usage-based alerts when accounts go inactive. triggered outreach from customer success or automated re-engagement campaign." },
          { name: "Support Ticket Triage", note: "Automated categorisation and first-response for support tickets. AI-powered first response resolves 40-60% of tickets without human intervention." },
        ],
        secondary: ["Feature announcement in-app messages", "NPS survey automation (post-activation)", "Invoice and billing automation", "Affiliate payout automation"],
        automations: ["Sign-up → onboard → activate pipeline", "Trial expiry conversion sequence", "Churn risk intervention flow", "Monthly MRR report (auto-generated)"],
      },
    ],
    mayAlsoNeed: [
      { trigger: "If raising investment", items: ["Investor deck design and narrative", "Data room preparation", "Financial model presentation"] },
      { trigger: "If expanding to enterprise sales", items: ["Enterprise pitch deck and case studies", "Security and compliance documentation design", "Partner programme collateral"] },
    ],
  },
  {
    id: "fashion",
    label: "Fashion & Lifestyle Brand",
    tagline: "From aesthetic brand identity to a content-driven sales machine that builds a loyal buying community.",
    stages: [
      {
        id: "brand", label: "Brand", tagline: "Fashion is bought with the eyes. Your brand aesthetic. Photography, colour, typography. Is the product before the product.",
        primary: [
          { name: "Fashion Brand Identity", note: "Logo, colour palette, typography, and aesthetic direction that communicates your price point and customer. Luxury minimalism, bold Afrocentric, or accessible everyday. Your visual language must be unmistakable." },
          { name: "Photography Art Direction", note: "Shot lists, model selection brief, backdrop and lighting direction, and editing style guide. Photography is your most important brand investment. Every other channel depends on it." },
          { name: "Lookbook Design", note: "Seasonal lookbook (digital and print). The primary sales tool for wholesale buyers, stockists, and corporate gifting clients." },
          { name: "Brand Story & Values", note: "The narrative behind your brand. Sourcing story, design philosophy, and founder journey. Emotional brand stories increase customer loyalty and justify premium pricing." },
        ],
        secondary: ["Hang tag and label design", "Branded tissue paper and packaging", "Collaborator and influencer brief template", "Brand ambassador selection criteria"],
        automations: ["Photography brief template system", "New season launch content calendar", "Influencer brief automation"],
      },
      {
        id: "website", label: "Website", tagline: "Your online store is your most important salesperson. Available 24/7 to sell your entire collection without commissions.",
        primary: [
          { name: "Fashion E-commerce Store", note: "Custom-designed store on Shopify. Collection pages, product pages with full sizing and care information, and a checkout that converts. Mobile-first, as 80%+ of fashion purchases start on phone." },
          { name: "Size Guide & Fit System", note: "Detailed size guide with measurement instructions and model measurements listed. Fit anxiety is the #1 reason fashion customers abandon purchase. remove it." },
          { name: "Wholesale / Stockist Landing Page", note: "Dedicated page for wholesale enquiries with minimum order quantities, lead times, and terms. Wholesale multiplies your revenue without multiplying your marketing spend." },
          { name: "New Collection Launch Pages", note: "Dedicated launch pages per collection with countdown timer, early access sign-up, and editorial photography. Collection launches drive your biggest revenue spikes." },
        ],
        secondary: ["Virtual styling guide", "Gift registry system", "Birthday and occasion messaging at checkout", "Style blog and editorial content"],
        automations: ["New arrival notification sequence", "Abandoned cart recovery flow", "Post-purchase styling recommendations", "Restock notification for sold-out items"],
      },
      {
        id: "visibility", label: "Visibility", tagline: "Fashion discovery happens on Instagram, TikTok, and search. Your visibility strategy targets all three.",
        primary: [
          { name: "Instagram Shopping Setup", note: "Product catalogue tagged in every feed and story post. One tap from content to purchase. Instagram Shopping reduces purchase friction to near zero." },
          { name: "TikTok Fashion Content Strategy", note: "Styling videos, get-ready-with-me content, and fashion haul videos. TikTok is the highest organic reach platform for fashion brands. One video regularly drives thousands of orders." },
          { name: "Google Shopping Feed", note: "Product catalogue synced to Google Merchant Centre. Your products appear with images and prices in Google search results for free." },
          { name: "Fashion Influencer Strategy", note: "Micro-influencer gifting and commission programme. 10 micro-influencers (10K-50K followers) outperform one macro-influencer for fashion brand discovery." },
        ],
        secondary: ["Pinterest fashion boards", "Jumia Fashion and Konga listing optimisation", "Fashion editorial pitching (magazines, blogs)", "Affiliate programme for loyal customers"],
        automations: ["Influencer tracking system", "Product tag automation", "New collection distribution sequence", "Platform inventory sync"],
      },
      {
        id: "social", label: "Social Media", tagline: "Fashion brands are built on social media. Your feed, stories, and reels are your showroom, your magazine, and your community.",
        primary: [
          { name: "Instagram Content Strategy", note: "Editorial feed, product showcases, styling content, behind-the-scenes, and community reposts. Instagram is where fashion customers decide to follow, fall in love, and buy." },
          { name: "TikTok Content System", note: "Styling hauls, before/after, get-ready-with-me, and trend participation. TikTok is your most powerful organic growth channel. 1 video can bring 10,000 new followers overnight." },
          { name: "WhatsApp Broadcast for Drops", note: "New collection drops, restocks, and flash sales sent to subscribers. WhatsApp broadcasts have 90%+ open rates. Announce drops here first." },
          { name: "Monthly Content Calendar", note: "Full month of content planned against collection calendar. New arrivals, sold-out reminders, styling tips, and lifestyle content." },
        ],
        secondary: ["Pinterest board strategy", "Facebook community group", "YouTube styling content", "Clubhouse / Twitter Spaces for community"],
        automations: ["Content scheduling system", "WhatsApp drop announcement automation", "UGC (user-generated content) repost workflow", "Influencer performance tracking"],
      },
      {
        id: "crm", label: "CRM & Sales", tagline: "Fashion customers are emotional buyers. Your CRM keeps them engaged, valued, and coming back every season.",
        primary: [
          { name: "Customer Database & Purchase History", note: "Every customer's purchase history, size profile, and preferences. Enabling personalised recommendations, birthday offers, and early access for VIPs." },
          { name: "Email Marketing System", note: "New collection emails, restock alerts, styling guides, and seasonal campaigns. Email drives 30-40% of revenue for established fashion brands." },
          { name: "Wholesale CRM", note: "Stockist and wholesale buyer pipeline. From initial enquiry through sample request, order placement, and reorder cycle." },
          { name: "Sales Dashboard", note: "Daily revenue, best-selling products, returning customer rate, and collection performance. Know which pieces to restock and which to discontinue." },
        ],
        secondary: ["VIP loyalty programme", "Referral programme (friend discount)", "Gifting and occasion purchase tracking", "Seasonal reactivation campaigns"],
        automations: ["New collection email launch sequence", "Restock alert to waitlist subscribers", "Birthday discount automation", "Repeat customer VIP upgrade trigger"],
      },
      {
        id: "automation", label: "Automation", tagline: "Fashion operations are fast-paced. Automation keeps your business running during drops, launches, and peak seasons without adding headcount.",
        primary: [
          { name: "New Collection Launch Automation", note: "Pre-launch sign-up → countdown email → launch day announcement → sold-out notification. All automated and triggered in sequence." },
          { name: "Order Fulfilment & Dispatch Notifications", note: "Automated order confirmation, dispatch notification with tracking link, and delivery confirmation. Keeps customers informed without customer service calls." },
          { name: "Restock Waitlist System", note: "Customers join waitlist for sold-out items. Notified automatically when restocked. Restock launches to a warm, pre-qualified audience every time." },
          { name: "Influencer Gifting Workflow", note: "Influencer receives gift → follow-up message → content check → reposts tracked. Automate the admin of your influencer programme." },
        ],
        secondary: ["Returns processing workflow", "Inventory low-stock alerts", "End-of-season sale automation", "Wholesale order confirmation system"],
        automations: ["Launch → early access → public drop sequence", "Order → dispatch → delivery pipeline", "Waitlist → restock notification flow", "Post-purchase review request"],
      },
    ],
    mayAlsoNeed: [
      { trigger: "If selling internationally", items: ["International shipping and duties calculator", "Multi-currency store setup", "International influencer strategy"] },
      { trigger: "If moving into retail / physical stores", items: ["In-store brand experience design", "Point-of-sale and retail system setup", "Local foot traffic visibility strategy"] },
    ],
  },
  {
    id: "school",
    label: "School / Education",
    tagline: "From school branding to a fully enrolled, digitally visible institution.",
    stages: [
      {
        id: "brand", label: "Brand", tagline: "Parents choose schools on trust and first impression. Your institution's identity must project excellence before a visit.",
        primary: [
          { name: "School Logo & Identity System", note: "Logo, colours, crest, and typography aligned to your school tier. Nursery, primary, secondary, or tertiary. Visual brand sets tuition expectation before any conversation." },
          { name: "Prospectus Design", note: "Professional school prospectus (print + digital) covering programmes, facilities, staff credentials, fees, and admission process. Converts enquiries into applications." },
          { name: "Uniform & Merchandise Design", note: "School uniform concept, branded sport kits, and merchandise. uniforms are your most visible daily brand touchpoint in the community." },
          { name: "School Positioning Statement", note: "One clear sentence that defines what your school is uniquely best at. Used in all marketing, signage, and communications." },
        ],
        secondary: ["Staff ID card and lanyard design", "Branded report card and certificate templates", "School bus branding", "Parent communication templates"],
        automations: ["Canva brand kit for staff", "Admissions document template library", "Newsletter automation"],
      },
      {
        id: "website", label: "Website", tagline: "80% of parents research schools online before visiting. A poor or missing website loses enrolments to competitors daily.",
        primary: [
          { name: "School Website with Admissions Page", note: "Fast, mobile-first school website with programmes, staff, gallery, fee structure, and admissions form. The first impression for every prospective parent." },
          { name: "Online Application Form", note: "Digital admission application. Collect student details, supporting documents, and payment proof. Removes paper forms and lost applications." },
          { name: "Events & News Section", note: "School events calendar, news updates, and achievement highlights. Active school websites rank higher and keep current parents engaged." },
          { name: "Virtual School Tour / Gallery", note: "Photo and video gallery showcasing facilities. Parents who can't visit in person decide based on what they see online." },
        ],
        secondary: ["Parent portal / notice board", "Staff recruitment page", "Alumni network page", "Online fee payment integration"],
        automations: ["Admissions enquiry auto-response", "Application status notification", "Event reminder emails to parents"],
      },
      {
        id: "visibility", label: "Visibility", tagline: "Parents searching for schools in your area should find your school first. Before the competition.",
        primary: [
          { name: "Google Business Profile (School)", note: "Fully optimised GBP with photos, programmes, hours, and reviews. Schools with optimised GBP appear in 'near me' searches and get 3× more calls." },
          { name: "Education Directory Listings", note: "Listed on SchoolsNet, PrivateSchoolsNG, and relevant local education directories. Parents actively use these platforms during school selection." },
          { name: "Local SEO. Location & Subject Keywords", note: "Rank for 'best [type] school in [city/area]' searches. Most enrolment enquiries start with a Google search." },
          { name: "Online Reputation Management", note: "Monitor and respond to school reviews on Google and directories. A school with 4.5+ star ratings converts 3× more enquiries than one without." },
        ],
        secondary: ["Facebook and Instagram page setup", "WhatsApp Business profile for admissions", "SMS broadcast for open days", "Parent WhatsApp group management system"],
        automations: ["Review request automation post-term", "Competitor school ranking tracker", "Enquiry source analytics dashboard"],
      },
      {
        id: "social", label: "Social Media", tagline: "Parents, students, and the community follow schools that celebrate achievement. Your social media is your cheapest enrolment tool.",
        primary: [
          { name: "School Social Media Strategy", note: "Content pillars: student achievements, academic results, sports and arts, staff spotlights, and community service. Schools with active social media attract more applications." },
          { name: "Monthly Content Calendar", note: "12–16 posts per month planned around the academic calendar. Exams, events, graduation, open day." },
          { name: "Achievement Post Templates", note: "Branded templates for WAEC/JAMB results, competitions, sport wins, and graduations. Viral celebration posts are the most effective free enrolment marketing." },
          { name: "Open Day Promotions", note: "Targeted social media campaigns for open days, with event pages, countdown posts, and parent testimonial content." },
        ],
        secondary: ["Teacher recruitment social campaigns", "Alumni stories series", "Facebook group for parents", "YouTube school tour video"],
        automations: ["Results announcement post automation", "Open day RSVP collection", "Monthly performance report"],
      },
      {
        id: "crm", label: "CRM & Sales", tagline: "Admissions is a sales process. Most schools lose parents between first enquiry and application because nobody follows up.",
        primary: [
          { name: "Admissions Pipeline CRM", note: "Track every prospective family from enquiry → school visit → application → offer → enrolment. No lead falls through the cracks." },
          { name: "Follow-Up Sequence", note: "Automated follow-up WhatsApp or email sequence after every enquiry and school visit. Most enrolments are won at the 3rd to 5th follow-up." },
          { name: "Enrolment Conversion Dashboard", note: "Real-time view of enquiry volume, conversion rate, and enrolment sources. Know exactly what's working." },
          { name: "Re-enrolment Campaign", note: "Annual re-enrolment reminder campaign to existing families. Reduces late confirmations and prevents last-minute attrition." },
        ],
        secondary: ["Fee payment tracking dashboard", "Scholarship application management", "Staff recruitment CRM", "Alumni database management"],
        automations: ["Enquiry → visit invitation → application sequence", "Fee reminder automation", "Term-start checklist for new students"],
      },
      {
        id: "automation", label: "Automation", tagline: "School administration consumes enormous time. The right automations give your staff back hours every week.",
        primary: [
          { name: "Admissions Workflow Automation", note: "Enquiry received → auto-response → CRM logged → visit scheduled → confirmation sent. Entirely without manual input." },
          { name: "Fee Collection & Reminder System", note: "Automated fee payment reminders via WhatsApp and email at 30, 14, and 7 days before due date. Reduces arrears without awkward calls." },
          { name: "Report Card Distribution", note: "Digital report card generation and automated delivery to parents by email or parent portal. Eliminates printing, sorting, and distribution." },
          { name: "Staff Communication Hub", note: "Internal notices, meeting alerts, and academic calendar updates distributed automatically to all staff via WhatsApp or email broadcast." },
        ],
        secondary: ["Timetable generation tool", "Exam result processing system", "Library management system integration", "Parent-teacher meeting scheduling"],
        automations: ["Term start onboarding sequence", "Weekly academic update to parents", "Exam timetable distribution pipeline"],
      },
    ],
    mayAlsoNeed: [
      { trigger: "If running multiple campuses", items: ["Multi-campus brand consistency guidelines", "Centralised CRM across locations", "Campus-specific social media management"] },
      { trigger: "If launching an e-learning programme", items: ["LMS platform selection and setup", "Online course content structure", "Digital payment and enrolment system"] },
    ],
  },
  {
    id: "hospital",
    label: "Hospital / Healthcare",
    tagline: "From clinic brand identity to a trusted, fully visible medical practice.",
    stages: [
      {
        id: "brand", label: "Brand", tagline: "Patients choose healthcare providers on trust and first impression. Your brand must project clinical credibility before a visit.",
        primary: [
          { name: "Healthcare Brand Identity", note: "Logo, colours, and typography that communicate trust, hygiene, and professional competence. Brand tier determines patient expectation before they enter." },
          { name: "Patient-Facing Materials", note: "Branded appointment cards, letterheads, prescriptions, discharge summaries, and patient information leaflets. Every touchpoint reinforces credibility." },
          { name: "Staff Uniform & ID Design", note: "Uniform concept, staff ID badges, and scrub colour coding by department. Communicates organisation and professionalism to every patient." },
          { name: "Facility Signage System", note: "Internal wayfinding, department signage, and exterior identity signage. A well-signed facility reduces patient anxiety and staff interruptions." },
        ],
        secondary: ["Branded stationery and prescription pads", "Medical report and certificate templates", "Ambulance and vehicle branding", "Pharmacy labelling system"],
        automations: ["Patient communication template library", "Prescription template system", "Appointment card auto-generation"],
      },
      {
        id: "website", label: "Website", tagline: "Patients research clinics online before booking. A missing or poor website sends them to your competitor.",
        primary: [
          { name: "Hospital / Clinic Website", note: "Professional website with services, doctors, departments, opening hours, location, and contact. Mobile-first. Most health searches happen on phone." },
          { name: "Online Appointment Booking", note: "Self-service appointment booking for selected departments. Reduces receptionist workload and captures after-hours bookings." },
          { name: "Doctor Profiles", note: "Individual doctor profile pages with qualifications, specialties, and availability. Patients book with greater confidence when they know who they're seeing." },
          { name: "Patient Education Blog", note: "Health articles targeting local search queries. 'symptoms of [condition] in Nigeria', 'best clinic for [condition] in [city]'. Organic SEO engine." },
        ],
        secondary: ["Health package sales page (HMO, annual checkups)", "Telemedicine booking integration", "Emergency contact and directions page", "Careers / recruitment page"],
        automations: ["Appointment confirmation and reminder", "Post-visit satisfaction survey", "Health tip email sequence for registered patients"],
      },
      {
        id: "visibility", label: "Visibility", tagline: "When someone needs a doctor urgently, they search Google. Your practice must appear at the top before the competition.",
        primary: [
          { name: "Google Business Profile (Healthcare)", note: "Fully optimised GBP with photos, services, hours, and reviews. Healthcare providers with optimised GBP get 4× more appointment calls." },
          { name: "Health Directory Listings", note: "Listed on HealthNG, Doctoora, ConnectMed, and sector-specific directories. HMO referrals and private patients both use these platforms." },
          { name: "Local Medical SEO", note: "Rank for '[specialty] in [city]' and '[condition] treatment [area]' searches. Medical SEO converts at higher rates than any other local service sector." },
          { name: "HMO Partner Visibility", note: "Visibility strategy to attract HMO panel inclusion. Structured documentation, digital presence, and credibility positioning." },
        ],
        secondary: ["Social proof and testimonial collection strategy", "Patient review management system", "WhatsApp Business for appointment booking", "Facebook and Instagram presence for health campaigns"],
        automations: ["Review request automation post-consultation", "Competitor service gap tracker", "Monthly visibility analytics report"],
      },
      {
        id: "social", label: "Social Media", tagline: "Health education content builds trust. The clinic that educates its community online becomes the community's preferred provider.",
        primary: [
          { name: "Healthcare Social Media Strategy", note: "Content pillars: health tips, disease awareness, staff introductions, patient success stories (anonymised), facility tours. Educational content builds authority." },
          { name: "Monthly Health Content Calendar", note: "12–16 posts per month aligned with WHO health calendar. World Health Days, seasonal campaigns, vaccination drives." },
          { name: "Doctor Feature Series", note: "Weekly or biweekly doctor Q&A posts or short videos. Patients who know a doctor's face and expertise book with greater confidence." },
          { name: "Health Awareness Campaigns", note: "Targeted content for high-impact health events. Malaria season, cancer awareness month, World AIDS Day. Community content drives referrals." },
        ],
        secondary: ["Staff recruitment campaigns", "Free health camp promotion content", "Facebook health community group", "YouTube health education channel"],
        automations: ["Health tip post scheduling", "Campaign performance reporting", "Patient testimonial collection workflow"],
      },
      {
        id: "crm", label: "CRM & Sales", tagline: "Patients who visit once are worth more over time. A retention system turns a first visit into a long-term relationship.",
        primary: [
          { name: "Patient Relationship Management", note: "CRM tracking every patient interaction. Visit history, diagnosis category, follow-up due, package type. Know your patient base as a business asset." },
          { name: "Follow-Up & Recall System", note: "Automated follow-up for post-discharge patients, chronic disease monitoring reminders, and annual checkup invitations. Recall systems increase returning patient rate by 40%." },
          { name: "Health Package Sales Pipeline", note: "Manage enquiries and subscriptions for annual health packages, executive checkups, and HMO plans with clear pipeline stages." },
          { name: "Referral Tracking Dashboard", note: "Track referrals from GPs, HMO partners, and community sources. Know your best referral channels and double down on them." },
        ],
        secondary: ["Staff performance dashboard", "Inventory and consumables tracking", "HMO claims pipeline", "Specialist referral management"],
        automations: ["Post-visit follow-up sequence", "Medication refill reminder", "Annual checkup invitation campaign"],
      },
      {
        id: "automation", label: "Automation", tagline: "Healthcare administration is paper-heavy and time-intensive. The right automations reduce errors and free clinical staff for patient care.",
        primary: [
          { name: "Appointment Management System", note: "Online booking → confirmation → 24-hour reminder → check-in notification → post-visit review request. Fully automated from booking to feedback." },
          { name: "Patient Record Workflow", note: "New patient registration → file creation → alert to consulting doctor → post-consultation notes triggered. Reduces receptionist errors and wait time." },
          { name: "Prescription & Pharmacy Integration", note: "Doctor issues prescription → pharmacy notified immediately → patient directed. Reduces dispensing errors and eliminates manual relay." },
          { name: "HMO Claims Processing", note: "Automated HMO claims documentation. Patient visit logged, treatment coded, claim generated and submitted to HMO portal on schedule." },
        ],
        secondary: ["Staff shift and rota management automation", "Consumables low-stock alert system", "Patient discharge checklist automation", "Monthly revenue reconciliation report"],
        automations: ["New patient onboarding pipeline", "HMO claims submission calendar", "Weekly clinical KPI report"],
      },
    ],
    mayAlsoNeed: [
      { trigger: "If expanding to multiple locations", items: ["Multi-site brand consistency framework", "Centralised patient database", "Location-specific SEO strategy"] },
      { trigger: "If launching telemedicine", items: ["Telemedicine platform setup", "Virtual consultation booking system", "Remote patient communication workflow"] },
    ],
  },
  {
    id: "ngo",
    label: "NGO / Non-Profit",
    tagline: "From mission clarity to a funded, visible, impactful organisation.",
    stages: [
      {
        id: "brand", label: "Brand", tagline: "Donors, partners, and beneficiaries all judge your impact by your brand before reading your reports.",
        primary: [
          { name: "NGO Brand Identity", note: "Logo, colours, and visual language that communicates your mission, values, and target community. Strong NGO branding increases donor trust and retention." },
          { name: "Annual Report Design", note: "Professionally designed annual report. Impact statistics, beneficiary stories, financial summary, and donor appreciation. The primary fundraising tool." },
          { name: "Donor-Facing Materials", note: "Pitch deck, one-pager, case study templates, and impact infographics. Every fundraising interaction requires a different asset." },
          { name: "Campaign Visual Identity", note: "Each fundraising or awareness campaign should have its own sub-brand: name, visual, and hashtag that's consistent across all channels." },
        ],
        secondary: ["Staff and volunteer ID cards", "Branded event banners and rollups", "Merchandise for fundraising (branded tote, t-shirts)", "Beneficiary certificate templates"],
        automations: ["Annual report generation workflow", "Campaign asset template library", "Donor communication templates"],
      },
      {
        id: "website", label: "Website", tagline: "Your website is your organisation's credibility engine. it must convert visitors into donors, volunteers, and partners.",
        primary: [
          { name: "NGO Website with Donation Integration", note: "Professional website with mission, programmes, impact metrics, team, and online donation via Paystack or Flutterwave. Every visit is a fundraising opportunity." },
          { name: "Programme & Project Pages", note: "Dedicated pages for each programme. impact data, beneficiary stories, photos, and funding progress. Donors give more when they can see exactly where money goes." },
          { name: "Volunteer Sign-Up System", note: "Online volunteer application with role selection, availability form, and automated confirmation. Recruits volunteers while you sleep." },
          { name: "Impact Reporting Page", note: "Live or quarterly-updated impact dashboard. Beneficiaries reached, funds disbursed, communities served. Transparent impact pages increase donor retention." },
        ],
        secondary: ["Corporate partnership enquiry page", "Grant application documentation page", "Event RSVP and ticketing page", "Media / press pack download page"],
        automations: ["Donation confirmation and receipt automation", "Volunteer follow-up sequence", "Grant deadline reminder alerts"],
      },
      {
        id: "visibility", label: "Visibility", tagline: "Donors and grant-makers search for credible NGOs online. Your digital presence determines your funding pipeline.",
        primary: [
          { name: "NGO Directory Listings", note: "Listed on NGO registries, donor platforms, and grant discovery sites relevant to your sector. Grant-makers verify NGOs through online searches." },
          { name: "Google for Nonprofits (Google Ad Grant)", note: "Up to $10,000/month in free Google Ads for eligible NGOs. We handle the application and campaign setup. This alone can transform your donor acquisition." },
          { name: "Local & Sector SEO", note: "Rank for your cause and location. 'youth empowerment NGO Lagos', 'climate advocacy Nigeria'. Organic visibility means consistent inbound interest." },
          { name: "Media & PR Strategy", note: "Press release distribution, journalist outreach, and thought leadership placements. Media coverage is the highest-credibility marketing channel for NGOs." },
        ],
        secondary: ["LinkedIn organisation page optimisation", "Twitter/X presence for advocacy campaigns", "WhatsApp broadcast for donor and volunteer updates", "YouTube channel for impact documentaries"],
        automations: ["Google Ad Grant campaign monitoring", "Media mention tracking", "Donor acquisition analytics dashboard"],
      },
      {
        id: "social", label: "Social Media", tagline: "The organisations changing the world tell the best stories. Your social media is your most powerful fundraising and advocacy tool.",
        primary: [
          { name: "NGO Social Media Strategy", note: "Content pillars: beneficiary stories, impact numbers, team culture, campaign launches, and transparency posts. Social proof drives donations." },
          { name: "Monthly Content Calendar", note: "12–16 posts per month planned around your programmes, campaigns, and global cause awareness days." },
          { name: "Impact Story Content", note: "Individual beneficiary stories told with permission. Photos, quotes, before/after journey. Single story posts consistently outperform every other content type for NGO donation conversion." },
          { name: "Fundraising Campaign Social Content", note: "End-of-year Giving Season, Ramadan campaigns, and cause-specific drives with countdown content, matching gift promotions, and real-time progress updates." },
        ],
        secondary: ["Volunteer recruitment campaigns", "Corporate CSR partnership outreach content", "Facebook fundraiser integration", "Instagram donation sticker campaigns"],
        automations: ["Campaign progress post scheduling", "Donor shoutout automation", "Monthly impact post generation"],
      },
      {
        id: "crm", label: "CRM & Sales", tagline: "Fundraising is relationship management. The NGOs with the most loyal donor bases track every interaction systematically.",
        primary: [
          { name: "Donor CRM", note: "Track every donor. First gift date, giving frequency, communication history, interests. The data needed to retain donors year after year." },
          { name: "Fundraising Pipeline", note: "Corporate grant → proposal submitted → review → decision → disbursement. Manage every funding opportunity with clarity." },
          { name: "Recurring Donor Management", note: "Monthly giving programme. sign-up, automated receipting, impact updates, and retention sequence. Recurring donors are 5× more valuable than one-time givers." },
          { name: "Partner & Volunteer CRM", note: "Track all corporate partners, individual volunteers, and in-kind supporters. Relationship management turns one-off partners into long-term funders." },
        ],
        secondary: ["Event attendee management", "Beneficiary case management system", "Board and governance CRM", "Grant reporting calendar"],
        automations: ["Donor retention sequence", "Grant deadline tracker with alerts", "Monthly donor giving summary report"],
      },
      {
        id: "automation", label: "Automation", tagline: "Small NGO teams do the work of large organisations. Automation handles the admin so your team focuses on impact.",
        primary: [
          { name: "Donation Processing Automation", note: "Donor gives → receipt issued → CRM updated → thank-you message sent → quarterly impact report queued. Zero manual steps from donation to relationship maintenance." },
          { name: "Grant Application Workflow", note: "Identify grant → gather documents → submit → track deadline → follow up. Structured workflow means no missed opportunities." },
          { name: "Volunteer Onboarding Automation", note: "Volunteer applies → form submitted → welcome email → orientation schedule sent → team assignment notified. Onboards volunteers while you focus on programming." },
          { name: "Impact Reporting Pipeline", note: "Monthly data collection from programme teams → automatic aggregation → quarterly report draft generated → approved and distributed. Takes reporting from days to hours." },
        ],
        secondary: ["Board meeting scheduling and minutes distribution", "Budget tracking and alert system", "Beneficiary follow-up communication", "Annual returns and SCUML filing reminders"],
        automations: ["Year-end giving campaign pipeline", "Grant cycle management calendar", "Quarterly impact report generation"],
      },
    ],
    mayAlsoNeed: [
      { trigger: "If seeking international grants", items: ["INGO partnership documentation framework", "Foreign funding compliance (CBN SCUML)", "International donor CRM setup"] },
      { trigger: "If running large-scale events", items: ["Event management system", "Ticketing and RSVP automation", "Sponsorship proposal deck"] },
    ],
  },
  {
    id: "logistics",
    label: "Logistics / Transport",
    tagline: "From fleet branding to a digitally visible, operationally efficient logistics business.",
    stages: [
      {
        id: "brand", label: "Brand", tagline: "Clients choose logistics providers based on trust and perceived reliability. Your brand must communicate professionalism before the first delivery.",
        primary: [
          { name: "Logistics Brand Identity", note: "Logo, colour system, and typography that projects reliability, speed, and operational professionalism. Brand tier determines what contracts you can win." },
          { name: "Fleet & Vehicle Branding", note: "Vehicle wrap design for trucks, vans, and bikes. Fleet branding turns every delivery into a mobile billboard reaching thousands per day." },
          { name: "Waybill & Documentation Design", note: "Branded waybills, delivery notes, invoices, and packaging materials. Professional documentation signals operational maturity to corporate clients." },
          { name: "Driver & Staff Uniform Design", note: "Branded uniforms and ID cards for drivers, dispatch riders, and warehouse staff. Uniformed teams convert more deliveries and reduce liability disputes." },
        ],
        secondary: ["Warehouse signage and safety signage", "Branded packaging and tape", "Company profile and pitch deck", "Fleet maintenance log templates"],
        automations: ["Waybill generation system", "Invoice auto-generation on delivery confirmation", "Driver ID card printing workflow"],
      },
      {
        id: "website", label: "Website", tagline: "Corporate clients, e-commerce businesses, and manufacturers research logistics partners online before making contact.",
        primary: [
          { name: "Logistics Company Website", note: "Professional website with services (last-mile, haulage, warehousing, express), coverage area, fleet size, and client inquiry form. Required for any corporate contract." },
          { name: "Quote Request System", note: "Online shipment quote calculator or structured enquiry form. Captures route, weight, urgency, and contact details. Qualifies leads automatically." },
          { name: "Tracking Portal", note: "Client-facing shipment tracking page. Clients who can track their shipments call less, complain less, and retain longer." },
          { name: "Corporate Client Case Studies", note: "Published client results. Sectors served, volumes handled, turnaround times. Corporate decision-makers look for proof of scale before engaging." },
        ],
        secondary: ["Driver and rider recruitment page", "Warehouse space availability page", "Partner carrier application form", "ISO / certification display page"],
        automations: ["Quote request auto-response", "Delivery confirmation notification", "Client satisfaction survey automation"],
      },
      {
        id: "visibility", label: "Visibility", tagline: "Manufacturers, importers, and e-commerce businesses search for logistics partners online. You need to be found before your competitors.",
        primary: [
          { name: "Google Business Profile (Logistics)", note: "Fully optimised GBP for your depot and branch locations. Local searches for 'logistics company in [city]' trigger map results. You must appear." },
          { name: "Logistics Directory Listings", note: "Listed on Nigerian logistics directories, supply chain platforms, and freight exchange sites. Corporate procurement teams use these to source partners." },
          { name: "B2B SEO Strategy", note: "Rank for '[haulage/logistics] [route/city]' and sector-specific queries. 'pharmaceutical cold chain logistics Nigeria', 'Abuja to Lagos same-day delivery'." },
          { name: "LinkedIn & Corporate Visibility", note: "LinkedIn company page optimisation, employee advocacy programme, and thought leadership content targeting supply chain managers and procurement heads." },
        ],
        secondary: ["Industry association membership and listing", "Trade publication features and press", "WhatsApp Business for client communication", "Fleet tracking visibility for corporate SLAs"],
        automations: ["Lead source attribution dashboard", "Corporate prospect monitoring", "Monthly visibility and enquiry report"],
      },
      {
        id: "social", label: "Social Media", tagline: "Social media builds brand trust for logistics companies attracting SME and e-commerce clients who research suppliers online.",
        primary: [
          { name: "Logistics Social Media Strategy", note: "Content pillars: delivery success stories, fleet and team features, operational transparency, industry insights, and service range. Social proof converts SME clients." },
          { name: "Monthly Content Calendar", note: "12–16 posts per month covering deliveries completed, new routes launched, fleet additions, and client milestones." },
          { name: "Driver & Team Spotlight Series", note: "Feature drivers and operations staff. Builds human connection and trust. Clients trust businesses where they know the people behind the deliveries." },
          { name: "Service Range Content", note: "Dedicated posts for each service. same-day, interstate, warehousing, cold chain. Targeting the specific businesses that need each service." },
        ],
        secondary: ["E-commerce client acquisition content", "LinkedIn B2B content for corporate clients", "Driver recruitment social campaigns", "Crisis communication templates (delayed deliveries, disruptions)"],
        automations: ["Delivery milestone celebration automation", "Client testimonial request workflow", "Monthly performance summary post"],
      },
      {
        id: "crm", label: "CRM & Sales", tagline: "Logistics revenue is built on account clients who ship consistently. A CRM turns one-off shipments into retained accounts.",
        primary: [
          { name: "Client Account CRM", note: "Track every client. Shipment history, revenue, communication log, contract renewal date, and service tier. Know your most valuable accounts at a glance." },
          { name: "Corporate Sales Pipeline", note: "Prospect → RFQ received → proposal submitted → rate negotiated → contract signed → onboarded. Track every B2B opportunity from first contact to closed account." },
          { name: "Rate Management & Quoting System", note: "Standardised rate cards by route, weight, and service level. With a quoting tool for sales team. Consistent pricing prevents margin erosion." },
          { name: "Contract Renewal Dashboard", note: "Alert system for contract renewals 90, 60, and 30 days in advance. Retained accounts are worth 5× a new client. Never miss a renewal." },
        ],
        secondary: ["Driver performance and delivery KPI dashboard", "Fuel cost and profitability tracker", "Insurance and vehicle renewal tracker", "Vendor and subcontractor relationship management"],
        automations: ["New client onboarding sequence", "Monthly shipment summary report to clients", "Contract renewal reminder campaign"],
      },
      {
        id: "automation", label: "Automation", tagline: "Logistics operations run on speed and accuracy. Automation reduces errors, cuts costs, and keeps clients informed without adding headcount.",
        primary: [
          { name: "Shipment Lifecycle Automation", note: "Order received → driver assigned → pickup confirmed → in-transit update → delivery confirmed → invoice issued → payment tracked. Every step automated." },
          { name: "Client Notification System", note: "Automated WhatsApp or SMS updates at key stages. Pickup, in-transit, out for delivery, delivered. Proactive communication reduces inbound calls by 60%." },
          { name: "Driver Dispatch Workflow", note: "Order → route optimisation → driver assignment → dispatch confirmation → real-time tracking enabled. Reduces dispatch time and errors." },
          { name: "Invoice & Payment Reconciliation", note: "Delivery confirmed → invoice generated → sent to client → payment tracked → outstanding balance report generated. Eliminates manual billing." },
        ],
        secondary: ["Fleet maintenance scheduling and alert system", "Fuel card and expense tracking", "Warehouse inventory scan and update system", "Incident and complaint management workflow"],
        automations: ["Daily dispatch summary report", "Weekly revenue reconciliation pipeline", "Monthly client shipment volume analysis"],
      },
    ],
    mayAlsoNeed: [
      { trigger: "If expanding interstate or nationally", items: ["Multi-depot brand and operations framework", "Regional agent / partner network management", "National route coverage SEO strategy"] },
      { trigger: "If offering warehousing services", items: ["Warehouse management system setup", "Inventory client portal", "Warehousing service pricing and proposal template"] },
    ],
  },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function SystemizePortal() {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // What You Get accordion
  const [openCard, setOpenCard] = useState<string | null>(null);

  // How We Work
  const [activeStep, setActiveStep] = useState(0);
  const [openStep, setOpenStep] = useState<number | null>(null);

  // Business Blueprint
  const blueprintRef = useRef<HTMLElement>(null);
  const [bizPage, setBizPage] = useState(0);
  const [selectedBiz, setSelectedBiz] = useState<string | null>(null);
  const [activeBpTab, setActiveBpTab] = useState(0);
  const BIZ_PER_PAGE = 6;
  const bizPageCount = Math.ceil(SYS_BLUEPRINTS.length / BIZ_PER_PAGE);
  const pagedBiz = SYS_BLUEPRINTS.slice(bizPage * BIZ_PER_PAGE, (bizPage + 1) * BIZ_PER_PAGE);
  const selectedBp = SYS_BLUEPRINTS.find((b) => b.id === selectedBiz);
  const activeBpTabDef = SYS_STAGE_TABS[activeBpTab];
  const activeBpStage = selectedBp?.stages.find((s) => s.id === activeBpTabDef?.id) ?? null;

  // My Update
  const myUpdateRef = useRef<HTMLElement>(null);
  const [trackCode, setTrackCode] = useState("");
  const [trackSubmitted, setTrackSubmitted] = useState(false);
  const trackQuery = trpc.tracking.lookup.useQuery(
    { ref: trackCode.trim().toUpperCase() },
    { enabled: false, retry: false }
  );
  const handleTrackInput = (val: string) => {
    setTrackCode(val.toUpperCase());
    setTrackSubmitted(false);
  };
  const handleTrack = () => {
    if (trackCode.trim().length < 4) return;
    setTrackSubmitted(true);
    trackQuery.refetch();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen text-[#2C2C2C]" style={{ backgroundColor: Cr }}>
      <PageMeta
        title="Systemize. Brand, Website & Growth Systems | HAMZURY"
        description="Brand identity, website design, automation and SEO for growing businesses."
      />

      {/* ─── NAV ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 relative ${scrolled ? "py-3" : "py-5"}`}
        style={{
          backgroundColor: scrolled ? `${W}F5` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? `1px solid ${Au}18` : "none",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[56px] flex items-center justify-between">
          <span className="font-semibold tracking-[2px] text-sm" style={{ color: G }}>SYSTEMIZE</span>
          <button
            onClick={() => setNavMenuOpen(p => !p)}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 transition-colors"
            style={{ color: G }}
            aria-label="Menu"
          >
            {navMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Dropdown */}
        {navMenuOpen && (
          <div
            className="absolute top-full left-0 right-0 z-50 border-t"
            style={{ backgroundColor: W, borderColor: `${Au}20`, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {[
                { label: "Home",          href: "/" },
                { label: "BizDoc Consult", href: "/bizdoc" },
                { label: "Skills",         href: "/skills" },
              ].map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setNavMenuOpen(false)}
                  className="block px-3 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors"
                  style={{ color: G }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO - UNTOUCHED ─── */}
      <section className="min-h-[calc(100vh-72px)] flex flex-col justify-center px-6 md:px-[8%] max-w-[1200px] mx-auto pt-[72px]">
        <span className="text-[#C9A97E] uppercase text-xs tracking-[3px] font-normal mb-6">
          Strategy & Automation Studio
        </span>
        <h1 className="text-[clamp(40px,7vw,72px)] leading-[1.05] font-normal text-[#0A1F1C] tracking-tight mb-6">
          Clarity first.
          <br />
          Systems that scale.
        </h1>
        <p className="text-[clamp(16px,2vw,20px)] leading-relaxed text-[#2C2C2C] font-light max-w-[600px] mb-12">
          Structure and visibility for ambitious businesses. Built to scale.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button
            onClick={() => blueprintRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="bg-[#0A1F1C] hover:bg-[#0d2e28] text-white px-10 py-6 rounded-lg text-sm font-medium uppercase tracking-[1px] shadow-lg shadow-[#0A1F1C]/20 hover:-translate-y-1 transition-all gap-3"
          >
            Business Blueprint <ArrowRight className="w-5 h-5" />
          </Button>
          <button
            onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[14px] font-semibold transition-opacity hover:opacity-80 border"
            style={{ borderColor: `${G}30`, color: G, backgroundColor: "transparent" }}
          >
            Our Services <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section id="services" className="py-20 md:py-28" style={{ backgroundColor: Cr }}>
        <div className="max-w-3xl mx-auto px-5">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: Au }}>WHAT YOU GET</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-bold mb-3" style={{ color: G }}>Five systems. One studio.</h2>
          <p className="text-[15px] opacity-60 mb-12" style={{ color: G }}>Every growing business has at least one gap. We find it and fix it.</p>

          <div className="flex flex-col gap-3">
            {SERVICES.map((svc) => {
              const isOpen = openCard === svc.id;
              const Icon = svc.icon;
              return (
                <div key={svc.id} className="rounded-2xl overflow-hidden transition-all duration-300"
                  style={{ backgroundColor: isOpen ? G : W, border: `1.5px solid ${isOpen ? G : Au + "30"}`, boxShadow: isOpen ? "0 8px 32px rgba(10,31,28,0.15)" : "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <button onClick={() => setOpenCard(isOpen ? null : svc.id)} className="w-full text-left px-6 py-5 flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" style={{ color: isOpen ? Au : G }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: isOpen ? `${Au}25` : `${G}08`, color: isOpen ? Au : `${G}70` }}>
                          {svc.badge}
                        </span>
                      </div>
                      <p className="text-[15px] font-semibold leading-snug pr-4" style={{ color: isOpen ? W : G }}>{svc.pain}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 flex-shrink-0 mt-1 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      style={{ color: isOpen ? Au : `${G}40` }} />
                  </button>
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "600px" : "0px" }}>
                    <div className="px-6 pb-6">
                      <div className="pl-9">
                        <p className="text-[13px] font-semibold mb-1" style={{ color: Au }}>{svc.solution}</p>
                        <p className="text-[13px] leading-relaxed mb-4 opacity-70" style={{ color: W }}>{svc.description}</p>
                        <ul className="space-y-1.5 mb-5">
                          {svc.outcomes.map((o, i) => (
                            <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: `${W}CC` }}>
                              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: Au }} />
                              {o}
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => blueprintRef.current?.scrollIntoView({ behavior: "smooth" })}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:-translate-y-0.5"
                          style={{ backgroundColor: Au, color: G }}>
                          Get Started <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW WE WORK ── */}
      <section className="py-20 md:py-28" style={{ backgroundColor: W }}>
        <div className="max-w-4xl mx-auto px-5">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: Au }}>HOW WE WORK</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-bold mb-12" style={{ color: G }}>From first conversation to a running system.</h2>

          <div className="hidden md:block">
            <div className="flex gap-0 rounded-2xl overflow-hidden border mb-8" style={{ borderColor: `${G}10` }}>
              {STEPS.map((s, i) => (
                <button key={i} onClick={() => setActiveStep(i)}
                  className="flex-1 py-4 px-3 text-center transition-all duration-200"
                  style={{ backgroundColor: activeStep === i ? G : "transparent", borderRight: i < STEPS.length - 1 ? `1px solid ${G}10` : "none" }}>
                  <div className="text-[10px] font-bold tracking-[0.2em] mb-1" style={{ color: activeStep === i ? Au : `${G}40` }}>{s.num}</div>
                  <div className="text-[13px] font-semibold" style={{ color: activeStep === i ? W : G }}>{s.title}</div>
                </button>
              ))}
            </div>
            <div className="rounded-2xl p-8" style={{ backgroundColor: `${G}06` }}>
              <p className="text-[13px] font-semibold mb-2" style={{ color: Au }}>{STEPS[activeStep].short}</p>
              <p className="text-[15px] leading-relaxed" style={{ color: G }}>{STEPS[activeStep].detail}</p>
            </div>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {STEPS.map((s, i) => {
              const isOpen = openStep === i;
              return (
                <div key={i} className="rounded-2xl overflow-hidden border transition-all"
                  style={{ borderColor: isOpen ? G : `${G}12`, backgroundColor: isOpen ? G : W }}>
                  <button onClick={() => setOpenStep(isOpen ? null : i)} className="w-full text-left px-5 py-4 flex items-center gap-4">
                    <span className="text-[11px] font-bold tracking-wider w-6" style={{ color: isOpen ? Au : `${G}40` }}>{s.num}</span>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold" style={{ color: isOpen ? W : G }}>{s.title}</p>
                      <p className="text-[11px] opacity-60 mt-0.5" style={{ color: isOpen ? W : G }}>{s.short}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} style={{ color: isOpen ? Au : `${G}40` }} />
                  </button>
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "300px" : "0px" }}>
                    <p className="px-5 pb-5 text-[13px] leading-relaxed" style={{ color: `${W}CC` }}>{s.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BUSINESS BLUEPRINT ── */}
      <section ref={blueprintRef} id="blueprint" className="py-20 md:py-28" style={{ backgroundColor: Cr }}>
        <div className="max-w-5xl mx-auto px-5">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: Au }}>BUSINESS BLUEPRINT</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-bold mb-3" style={{ color: G }}>Your industry. Every growth stage mapped.</h2>
          <p className="text-[15px] opacity-60 mb-12" style={{ color: G }}>Brand. Website. Visibility. Social. CRM. Automation. Pick your industry to see exactly what we build.</p>

          {!selectedBiz && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                {pagedBiz.map((biz) => (
                  <button key={biz.id}
                    onClick={() => { setSelectedBiz(biz.id); setActiveBpTab(0); }}
                    className="rounded-2xl p-4 text-left transition-all duration-200 border hover:border-[#0A1F1C] hover:shadow-md"
                    style={{ backgroundColor: W, borderColor: "rgba(10,31,28,0.10)" }}>
                    <p className="text-[14px] font-bold mb-1" style={{ color: G }}>{biz.label}</p>
                    <p className="text-[11px] leading-tight opacity-60" style={{ color: G }}>{biz.tagline.split(".")[0].trim()}</p>
                  </button>
                ))}
              </div>
              {bizPageCount > 1 && (
                <div className="flex items-center justify-end gap-2 mb-8">
                  <button onClick={() => setBizPage((p) => Math.max(0, p - 1))} disabled={bizPage === 0}
                    className="p-2 rounded-xl disabled:opacity-30" style={{ backgroundColor: W, border: `1px solid ${G}20` }}>
                    <ChevronLeft size={16} style={{ color: G }} />
                  </button>
                  <span className="text-[12px] opacity-50" style={{ color: G }}>{bizPage + 1} / {bizPageCount}</span>
                  <button onClick={() => setBizPage((p) => Math.min(bizPageCount - 1, p + 1))} disabled={bizPage === bizPageCount - 1}
                    className="p-2 rounded-xl disabled:opacity-30" style={{ backgroundColor: W, border: `1px solid ${G}20` }}>
                    <ChevronRight size={16} style={{ color: G }} />
                  </button>
                </div>
              )}
            </>
          )}
          {selectedBiz && selectedBp && (
            <div className="rounded-3xl overflow-hidden border" style={{ borderColor: `${G}20` }}>
                <div className="px-8 py-7" style={{ backgroundColor: G }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: Au }}>BLUEPRINT</p>
                      <h3 className="text-[clamp(22px,3vw,30px)] font-bold mb-2" style={{ color: W }}>{selectedBp.label}</h3>
                      <p className="text-[13px] opacity-60" style={{ color: W }}>{selectedBp.tagline}</p>
                    </div>
                    <button onClick={() => setSelectedBiz(null)}
                      className="shrink-0 text-[12px] font-medium px-4 py-2 rounded-xl"
                      style={{ backgroundColor: "rgba(255,255,255,0.12)", color: W }}>
                      Close
                    </button>
                  </div>

                  <div className="flex gap-1 mt-6 overflow-x-auto pb-1">
                    {SYS_STAGE_TABS.map((tab, i) => {
                      const stageExists = selectedBp.stages.find((s) => s.id === tab.id);
                      if (!stageExists) return null;
                      const active = activeBpTab === i;
                      return (
                        <button key={tab.id} onClick={() => setActiveBpTab(i)}
                          className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
                          style={{ backgroundColor: active ? Au : "rgba(255,255,255,0.1)", color: active ? G : "rgba(255,255,255,0.6)" }}>
                          <span className="opacity-50 mr-1">{tab.num}</span>{tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {activeBpStage && (
                  <div className="px-7 py-8" style={{ backgroundColor: W }}>
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <p className="text-[11px] font-bold tracking-wider uppercase mb-1" style={{ color: `${G}60` }}>STAGE {activeBpTabDef.num}</p>
                        <h4 className="text-[20px] font-bold mb-1" style={{ color: G }}>{activeBpStage.label}</h4>
                        <p className="text-[13px] leading-relaxed max-w-xl" style={{ color: G, opacity: 0.6 }}>{activeBpStage.tagline}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: `${Au}20`, color: Au }}>
                        Systemize
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <p className="text-[11px] font-bold tracking-widest uppercase mb-4 flex items-center gap-2" style={{ color: Au }}>
                          <span className="w-3 h-px inline-block" style={{ backgroundColor: Au }} />
                          Primary (build first)
                        </p>
                        <div className="flex flex-col gap-3">
                          {activeBpStage.primary.map((item) => (
                            <div key={item.name} className="rounded-xl p-4" style={{ backgroundColor: Cr }}>
                              <p className="text-[13px] font-semibold mb-1" style={{ color: G }}>{item.name}</p>
                              <p className="text-[12px] leading-relaxed" style={{ color: G, opacity: 0.6 }}>{item.note}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-6">
                        <div>
                          <p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: `${G}50` }}>Secondary</p>
                          <ul className="flex flex-col gap-2">
                            {activeBpStage.secondary.map((s) => (
                              <li key={s} className="flex items-start gap-2 text-[12px]" style={{ color: G, opacity: 0.7 }}>
                                <span className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: G, opacity: 0.4 }} />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: `${G}50` }}>⚡ Automations</p>
                          <ul className="flex flex-col gap-2">
                            {activeBpStage.automations.map((a) => (
                              <li key={a} className="flex items-start gap-2 text-[12px]" style={{ color: G, opacity: 0.7 }}>
                                <span className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: Au, opacity: 0.6 }} />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                          className="mt-2 w-full py-3 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-90"
                          style={{ backgroundColor: G, color: Au }}>
                          Get Started →
                        </button>
                      </div>
                    </div>

                    {activeBpTab === SYS_STAGE_TABS.length - 1 && selectedBp.mayAlsoNeed && (
                      <div className="mt-8 pt-6 border-t" style={{ borderColor: `${G}10` }}>
                        <p className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: Au }}>YOU MAY ALSO NEED</p>
                        <div className="flex flex-col gap-4">
                          {selectedBp.mayAlsoNeed.map((need) => (
                            <div key={need.trigger} className="rounded-xl p-4" style={{ backgroundColor: Cr }}>
                              <p className="text-[12px] font-semibold mb-2" style={{ color: G }}>{need.trigger}</p>
                              <ul className="flex flex-col gap-1">
                                {need.items.map((item) => (
                                  <li key={item} className="flex items-start gap-2 text-[12px]" style={{ color: G, opacity: 0.65 }}>
                                    <span className="shrink-0 mt-0.5">→</span>{item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
          )}
        </div>
      </section>


      {/* ── URGENCY CTA ── */}
      <section className="py-20 px-5 text-center" style={{ backgroundColor: G }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-4" style={{ color: Au }}>THE HAMZURY STANDARD</p>
          <h2 className="text-[clamp(26px,4vw,38px)] font-bold leading-tight mb-6" style={{ color: W }}>
            We don't take every project.<br />We take yours seriously.
          </h2>
          <p className="text-[15px] leading-relaxed mb-10 opacity-70" style={{ color: W }}>
            We only partner with founders ready to build lasting authority. If we take on your project, you get absolute transparency, premium execution, and systems built strictly for ROI.
          </p>
        </div>
      </section>

      {/* ── TRACK ── */}
      <section ref={myUpdateRef} className="py-16 px-6 border-t" style={{ borderColor: `${G}10`, backgroundColor: W }}>
        <div className="max-w-lg mx-auto">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: Au }}>TRACK</p>
          <h2 className="text-[clamp(22px,3vw,30px)] font-light tracking-tight mb-2" style={{ color: G }}>Track Your Project</h2>
          <p className="text-[13px] mb-8 opacity-50" style={{ color: G }}>Enter the reference code from your confirmation message.</p>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={trackCode}
              onChange={e => handleTrackInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleTrack()}
              placeholder="e.g. HMZ-26/3-XXXX"
              className="flex-1 px-4 py-3 rounded-xl border text-[14px] font-mono outline-none transition-all"
              style={{ borderColor: `${G}20`, backgroundColor: `${G}04`, color: G }}
            />
            <button
              onClick={handleTrack}
              disabled={trackCode.trim().length < 4 || trackQuery.isFetching}
              className="px-5 py-3 rounded-xl text-[13px] font-medium transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ backgroundColor: G, color: Au }}
            >
              {trackQuery.isFetching ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              {trackQuery.isFetching ? "Checking…" : "Check"}
            </button>
          </div>
          {/* Result */}
          {trackSubmitted && !trackQuery.isFetching && (
            <div>
              {trackQuery.data?.found ? (
                <div className="rounded-2xl p-5 border" style={{ borderColor: `${G}12`, backgroundColor: `${G}04` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono opacity-40" style={{ color: G }}>{trackQuery.data.ref}</span>
                    <span
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide"
                      style={{ backgroundColor: `${Au}20`, color: Au }}
                    >
                      {trackQuery.data.status}
                    </span>
                  </div>
                  <p className="text-[15px] font-light mb-1" style={{ color: G }}>
                    {trackQuery.data.businessName || trackQuery.data.clientName}
                  </p>
                  <p className="text-[12px] mb-4 opacity-50" style={{ color: G }}>{trackQuery.data.service}</p>
                  <div className="w-full h-1.5 rounded-full mb-2" style={{ backgroundColor: `${G}10` }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.round(((trackQuery.data.statusIndex + 1) / trackQuery.data.statusTotal) * 100)}%`,
                        backgroundColor: Au,
                      }}
                    />
                  </div>
                  <p className="text-[12px] opacity-50" style={{ color: G }}>{trackQuery.data.statusMessage}</p>
                </div>
              ) : (
                <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: `${G}05` }}>
                  <p className="text-[14px] font-light mb-1" style={{ color: G }}>Reference not found</p>
                  <p className="text-[12px] opacity-40" style={{ color: G }}>
                    Check the ref format. E.g. HMZ-26/3-1234. Or WhatsApp us on 08067149356.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── CTO QUOTE ── */}
      <section className="py-16 px-6" style={{ backgroundColor: G }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[clamp(18px,3vw,26px)] font-light leading-relaxed italic mb-8" style={{ color: "rgba(255,255,255,0.8)" }}>
            "A business without systems is a job. We turn founders into operators by building infrastructure that works without them."
          </p>
          <Link href="/systemise/cto">
            <div className="inline-flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: Au, color: G }}>SL</div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white group-hover:underline">CTO & Systems Architect</p>
                <p className="text-[11px]" style={{ color: Au, opacity: 0.7 }}>View profile →</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 px-5 border-t" style={{ borderColor: `${G}10`, backgroundColor: W }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] opacity-50" style={{ color: G }}>
          <p className="text-[12px] font-light italic mb-3" style={{ color: `${G}80` }}>
            "Structure before speed. That is how we build." — Muhammad Hamzury, Founder
          </p>
          <p>© {new Date().getFullYear()} HAMZURY Systemize. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing"><span className="hover:opacity-100 transition-opacity cursor-pointer">Pricing</span></Link>
            <Link href="/alumni"><span className="hover:opacity-100 transition-opacity cursor-pointer">Alumni</span></Link>
            <Link href="/ridi"><span className="hover:opacity-100 transition-opacity cursor-pointer">RIDI</span></Link>
            <Link href="/privacy"><span className="hover:opacity-100 transition-opacity cursor-pointer">Privacy</span></Link>
            <Link href="/terms"><span className="hover:opacity-100 transition-opacity cursor-pointer">Terms</span></Link>
            <a href="/login" className="hover:opacity-100 transition-opacity">Staff</a>
          </div>
        </div>
      </footer>

      {/* ─── MOBILE BOTTOM BAR ─── */}
      <MotivationalQuoteBar color="#1E3A5F" />
      <div className="md:hidden h-10" />
    </div>
  );
}
