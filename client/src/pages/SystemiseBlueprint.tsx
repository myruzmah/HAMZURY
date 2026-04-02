import { useState, useEffect } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { ArrowRight, ChevronLeft, ChevronRight, X, Menu, MessageSquare } from "lucide-react";
import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";

/* ═══════════════════════════════════════════════════════════════════════════
   HAMZURY SYSTEMISE — POSITIONING BLUEPRINT  /systemise/blueprint
   Industry-specific digital roadmaps: Brand → Website → Social → CRM → AI → Scale
   ═══════════════════════════════════════════════════════════════════════════ */

const G     = "#2563EB";   // Authority blue
const Au    = "#B48C4C";
const Cr    = "#FFFAF6";
const TEXT  = "#1A1A1A";
const W     = "#FFFFFF";
const CREAM = "#F5F3EF";

// ── PHASE TABS ────────────────────────────────────────────────────────────────
const PHASE_TABS = [
  { id: "brand",      num: "01", label: "Brand" },
  { id: "website",    num: "02", label: "Website" },
  { id: "social",     num: "03", label: "Social" },
  { id: "crm",        num: "04", label: "CRM & Sales" },
  { id: "automation",  num: "05", label: "AI & Automation" },
  { id: "scale",      num: "06", label: "Scale" },
];

type PhaseItem = { title: string; detail: string };
type Phase = { id: string; tagline: string; primary: PhaseItem[]; recommended: string[] };
type Blueprint = { id: string; label: string; tagline: string; badge: string; phases: Phase[] };

const BLUEPRINTS: Blueprint[] = [
  {
    id: "ecommerce", label: "E-commerce / Online Store", badge: "RETAIL & COMMERCE",
    tagline: "From product photos to a fully automated online store — the digital system behind profitable e-commerce.",
    phases: [
      {
        id: "brand",
        tagline: "Your brand is why people buy from you instead of the next seller.",
        primary: [
          { title: "Visual Identity System", detail: "Logo, colour palette, typography, and brand guidelines. Consistency across your website, social media, packaging, and ads builds trust and recognition." },
          { title: "Product Photography Style", detail: "Define your visual standard — white background for catalogue, lifestyle shots for social. Every product should look like it belongs to the same brand." },
          { title: "Brand Voice & Messaging", detail: "How you write captions, product descriptions, and emails. Professional? Friendly? Bold? Define it once and apply everywhere." },
          { title: "Packaging Design", detail: "Unboxing is marketing. Custom packaging, branded tape, thank-you cards, and insert cards drive repeat purchases and social sharing." },
        ],
        recommended: ["⭐ Digital Starter (₦350K) — Brand + Landing Page", "Brand Identity package", "Product Photography add-on"],
      },
      {
        id: "website",
        tagline: "Your website is your 24/7 sales representative. Make it close deals.",
        primary: [
          { title: "E-commerce Platform Setup", detail: "Shopify, WooCommerce, or custom-built store. Product pages, categories, search, filters, and checkout — optimised for mobile (80%+ of Nigerian traffic is mobile)." },
          { title: "Payment Integration", detail: "Paystack, Flutterwave, or bank transfer with auto-confirmation. Multiple payment options reduce cart abandonment." },
          { title: "Product Pages That Convert", detail: "High-quality images, detailed descriptions, size guides, reviews, and clear pricing. Every product page should answer every question a buyer has." },
          { title: "Delivery & Returns Page", detail: "Clear shipping costs, delivery timelines, and return policy. Ambiguity kills conversion — Nigerian buyers need confidence before paying online." },
        ],
        recommended: ["⭐ Business Launch (₦500K) — Brand + Full Website + Social", "E-commerce Website build", "Paystack integration"],
      },
      {
        id: "social",
        tagline: "Social media is your storefront, customer service, and marketing department combined.",
        primary: [
          { title: "Content Calendar", detail: "Plan 30 days of content — product features, behind-the-scenes, customer testimonials, lifestyle shots, and promotional posts. Batch create, schedule, publish." },
          { title: "Instagram Shop & TikTok Shop", detail: "Tag products directly in posts and stories. Reduce friction — let people buy without leaving the app." },
          { title: "User-Generated Content Strategy", detail: "Encourage customers to post their purchases. Repost, incentivise with discounts, and build a community of brand advocates." },
          { title: "Influencer & Creator Partnerships", detail: "Micro-influencers (5K-50K followers) in your niche. Send products, create affiliate codes, track which creators drive actual sales — not just likes." },
        ],
        recommended: ["Social Media Management package", "Skills Faceless Content Intensive (₦25K)", "Skills Digital Marketing Program (₦45K)"],
      },
      {
        id: "crm",
        tagline: "Track every customer, every order, every opportunity.",
        primary: [
          { title: "Customer Database", detail: "Every buyer goes into your CRM — name, email, phone, purchase history, preferences. This data is your most valuable asset for repeat sales." },
          { title: "Order Management System", detail: "Track orders from placement to delivery. Automated status updates via WhatsApp or SMS. Reduce 'where is my order' messages by 80%." },
          { title: "Abandoned Cart Recovery", detail: "Automated emails/WhatsApp messages to customers who added items but didn't pay. Recovers 10-15% of lost sales with zero manual effort." },
          { title: "Loyalty & Repeat Purchase System", detail: "Points system, birthday discounts, early access to new collections. Acquiring a new customer costs 5x more than retaining one." },
        ],
        recommended: ["CRM & Automation package", "⭐ Full Architecture (from ₦1.2M)", "WhatsApp Business automation"],
      },
      {
        id: "automation",
        tagline: "Automate the repetitive. Focus on the creative.",
        primary: [
          { title: "Order Confirmation & Tracking", detail: "Automated email/SMS when order is placed, processed, shipped, and delivered. Zero manual work, professional customer experience." },
          { title: "Inventory Alerts", detail: "Low stock notifications, restock reminders, and auto-disable out-of-stock products. Never oversell or miss a restock deadline." },
          { title: "AI Product Descriptions", detail: "Generate SEO-optimised product descriptions at scale using AI. Write once, adapt for website, social media, and ads." },
          { title: "Chatbot for FAQs", detail: "AI-powered chatbot that answers sizing questions, delivery estimates, and return policies 24/7. Handles 60-70% of customer inquiries without human intervention." },
        ],
        recommended: ["AI & Automation package", "⭐ Full Architecture (from ₦1.2M)", "Skills AI Business Courses (from ₦25K)"],
      },
      {
        id: "scale",
        tagline: "From solo seller to a real brand with systems.",
        primary: [
          { title: "Multi-Channel Selling", detail: "Website + Instagram Shop + Jumia + Konga + WhatsApp. Centralised inventory management across all channels so you never oversell." },
          { title: "Paid Advertising System", detail: "Meta Ads, Google Shopping, TikTok Ads — all driving traffic to your optimised product pages. Start with ₦5K/day, scale what works." },
          { title: "Analytics & Reporting Dashboard", detail: "Revenue, top products, conversion rate, traffic sources, customer lifetime value — all in one view. Make decisions based on data, not gut feeling." },
          { title: "Wholesale & B2B Channel", detail: "Separate pricing, bulk order forms, and a dedicated inquiry system for wholesale buyers. Add a second revenue stream alongside retail." },
        ],
        recommended: ["Business Growth consultation", "Systemise Analytics Dashboard", "SEO package"],
      },
    ],
  },
  {
    id: "professional-services", label: "Professional Services Firm", badge: "CONSULTING & SERVICES",
    tagline: "Build a digital presence that positions you as the authority and generates qualified leads on autopilot.",
    phases: [
      {
        id: "brand",
        tagline: "Clients choose you based on how you look before they hear what you do.",
        primary: [
          { title: "Professional Brand Identity", detail: "Logo, colour system, and brand guidelines that signal competence and trust. No clip art. No Canva templates. A proper identity system." },
          { title: "Brand Positioning Statement", detail: "Who you serve, what you solve, and why you're different — in one clear statement. This drives every piece of content and every sales conversation." },
          { title: "Professional Collateral", detail: "Business cards, letterhead, proposal template, presentation deck — all branded consistently. First impressions happen on paper and screen." },
          { title: "Headshots & Team Photography", detail: "Professional photography for your team. LinkedIn profiles, website, and proposals all need real faces — not stock photos." },
        ],
        recommended: ["⭐ Digital Starter (₦350K) — Brand + Landing Page", "Brand Identity package"],
      },
      {
        id: "website",
        tagline: "Your website is your credibility check. Make it pass.",
        primary: [
          { title: "Authority Website", detail: "Clean, professional website with service pages, team bios, case studies, and a clear contact pathway. Mobile-optimised, fast-loading, and SEO-ready." },
          { title: "Service Pages That Convert", detail: "Each service gets its own page — problem, solution, process, pricing framework, and CTA. Don't make prospects guess what you do or how to hire you." },
          { title: "Case Studies & Testimonials", detail: "Documented client outcomes with real numbers. 'We helped X achieve Y in Z timeframe' — this is your most powerful sales asset." },
          { title: "Lead Capture System", detail: "Contact forms, booking calendar (Calendly/Cal.com), and lead magnet downloads. Capture every interested visitor — don't rely on them emailing you." },
        ],
        recommended: ["⭐ Business Launch (₦500K) — Brand + Website + Social", "Website Design package"],
      },
      {
        id: "social",
        tagline: "LinkedIn is your conference, your networking event, and your billboard — all in one.",
        primary: [
          { title: "LinkedIn Content Strategy", detail: "Post 3-4 times per week — insights, frameworks, client lessons (anonymised), and industry commentary. LinkedIn is where B2B clients hire." },
          { title: "Thought Leadership Content", detail: "Long-form articles, guides, and opinion pieces. Position yourself as the expert others quote. Authority attracts clients — ads rent attention." },
          { title: "Twitter/X Presence", detail: "Short-form insights, threads, and commentary. Build a following of potential clients and referral partners." },
          { title: "Newsletter", detail: "Weekly or bi-weekly email to your audience. Share insights, wins, and industry analysis. Email lists are owned audiences — social media is rented." },
        ],
        recommended: ["Social Media Management package", "Skills Digital Marketing Program (₦45K)"],
      },
      {
        id: "crm",
        tagline: "Every conversation is a potential engagement. Track them all.",
        primary: [
          { title: "Lead Pipeline", detail: "Track every prospect from initial inquiry to signed contract. Stages: Lead → Qualified → Proposal → Negotiation → Won/Lost. Never lose track of a deal." },
          { title: "Proposal Management", detail: "Standardised proposal templates with auto-fill client details. Track when proposals are opened, time to response, and win rates." },
          { title: "Client Relationship Tracking", detail: "Log every call, meeting, and email. Set follow-up reminders. Relationships are your business — manage them systematically." },
          { title: "Revenue Forecasting", detail: "Pipeline value × probability = forecast. Know your expected revenue 30, 60, 90 days out. Makes financial planning possible." },
        ],
        recommended: ["CRM & Automation package", "⭐ Full Architecture (from ₦1.2M)"],
      },
      {
        id: "automation",
        tagline: "Automate the admin so you can focus on billable work.",
        primary: [
          { title: "Automated Follow-Ups", detail: "When a lead fills a form, they get an immediate response + a follow-up sequence. No more 'I forgot to reply' — the system handles it." },
          { title: "Booking & Scheduling", detail: "Calendly or Cal.com integration — clients book calls directly from your website. Eliminates the back-and-forth scheduling emails." },
          { title: "Invoice & Payment Automation", detail: "Automated invoicing at project milestones, payment reminders, and receipt generation. Get paid faster with less chasing." },
          { title: "Client Portal", detail: "Shared workspace where clients access project updates, deliverables, and communications. Reduces email volume and increases transparency." },
        ],
        recommended: ["AI & Automation package", "Skills AI Business Courses (from ₦25K)"],
      },
      {
        id: "scale",
        tagline: "From solo practitioner to a firm with a brand bigger than any one person.",
        primary: [
          { title: "Team Capacity Planning", detail: "Track utilisation rates, billable hours, and project allocation. Know when to hire before you're overwhelmed — not after." },
          { title: "Knowledge Management System", detail: "Templates, methodologies, research, and past deliverables — organised and searchable. New team members ramp up faster. Quality stays consistent." },
          { title: "Referral & Partnership Programme", detail: "Structured referral programme with other professionals — lawyers, accountants, consultants. Formalise what already happens informally." },
          { title: "Analytics Dashboard", detail: "Revenue per service line, client acquisition cost, average engagement value, and referral tracking. Data-driven decisions for growth." },
        ],
        recommended: ["Business Growth consultation", "Systemise Analytics Dashboard"],
      },
    ],
  },
  {
    id: "real-estate", label: "Real Estate & Property", badge: "PROPERTY",
    tagline: "Digital systems that generate leads, showcase properties, and close deals faster.",
    phases: [
      {
        id: "brand",
        tagline: "In real estate, your brand is your reputation made visible.",
        primary: [
          { title: "Premium Brand Identity", detail: "Logo, colours, and visual system that signals trust and quality. Real estate is high-value — your brand needs to match the price point." },
          { title: "Property Branding", detail: "Individual estate or development branding — name, logo, brochure design, and signage. Premium developments deserve their own identity." },
          { title: "Marketing Collateral", detail: "Brochures, flyers, banners, and digital assets. Professional property marketing materials that make buyers take you seriously." },
          { title: "Brand Consistency", detail: "Every touchpoint — website, social media, WhatsApp catalogue, physical office — looks like it belongs to the same company. Consistency = credibility." },
        ],
        recommended: ["⭐ Digital Starter (₦350K) — Brand + Landing Page", "Brand Identity package"],
      },
      {
        id: "website",
        tagline: "Your website is your listing platform. Own it.",
        primary: [
          { title: "Property Listing Website", detail: "Professional website with searchable property listings — photos, floor plans, pricing, location maps, and inquiry forms. Mobile-first design." },
          { title: "Virtual Tours & Video", detail: "360-degree virtual tours and video walkthroughs for premium listings. Buyers who've seen virtual tours are 60% more likely to schedule a physical visit." },
          { title: "Landing Pages for Developments", detail: "Dedicated landing pages for each estate or development — with pricing, payment plans, amenities, and direct inquiry buttons." },
          { title: "SEO for Property Keywords", detail: "Rank for 'land for sale in [location]', 'apartments in [area]'. Property searches start on Google — be there when buyers search." },
        ],
        recommended: ["⭐ Business Launch (₦500K) — Brand + Website + Social", "Website Design package", "SEO package"],
      },
      {
        id: "social",
        tagline: "Properties sell on social media. Period.",
        primary: [
          { title: "Instagram & Facebook Strategy", detail: "Property photos, video tours, customer testimonials, construction updates, and lifestyle content. Real estate is visual — show, don't tell." },
          { title: "YouTube Channel", detail: "Property tour videos, neighbourhood guides, and market updates. YouTube videos rank in Google search — double the visibility." },
          { title: "WhatsApp Broadcast Lists", detail: "Segment by buyer type (investors, homebuyers, land buyers). Send targeted updates to the right audience. WhatsApp is Nigeria's primary communication channel." },
          { title: "Paid Social Campaigns", detail: "Facebook and Instagram ads targeting by location, income bracket, and interest. Property ads with lead forms capture serious buyers." },
        ],
        recommended: ["Social Media Management package", "Skills Digital Marketing Program (₦45K)"],
      },
      {
        id: "crm",
        tagline: "Every inquiry is a potential commission. Never lose one.",
        primary: [
          { title: "Lead Management System", detail: "Every inquiry from every channel (website, social, referral, walk-in) goes into one system. Assign, track, and follow up systematically." },
          { title: "Property Matching", detail: "Tag leads by budget, location preference, and property type. When new listings come in, instantly match them to waiting buyers." },
          { title: "Follow-Up Sequences", detail: "Automated follow-up emails and WhatsApp messages after inquiry. Most property sales close after 5-7 touchpoints — don't drop leads after one call." },
          { title: "Sales Pipeline Tracking", detail: "Inquiry → Site Visit → Offer → Documentation → Closed. Track every deal's stage. Know your conversion rate at each step." },
        ],
        recommended: ["CRM & Automation package", "⭐ Full Architecture (from ₦1.2M)"],
      },
      {
        id: "automation",
        tagline: "Automate lead capture and nurturing — close deals while you sleep.",
        primary: [
          { title: "Automated Lead Response", detail: "Instant auto-response to every inquiry — acknowledgement, brochure download, and next steps. Speed to response determines who gets the sale." },
          { title: "Property Alert System", detail: "Automated notifications to matched buyers when new properties are listed. Keeps your audience engaged and coming back." },
          { title: "Document Generation", detail: "Automated offer letters, allocation letters, and payment schedules. Reduce manual paperwork and speed up the sales process." },
          { title: "AI Chatbot for Inquiries", detail: "Answer common questions — pricing, location, payment plans, availability — 24/7 without a human. Capture leads at 2am when buyers are browsing." },
        ],
        recommended: ["AI & Automation package", "Skills AI Business Courses (from ₦25K)"],
      },
      {
        id: "scale",
        tagline: "From one estate to a portfolio — systems that scale with you.",
        primary: [
          { title: "Multi-Property Dashboard", detail: "Manage all listings, leads, and sales across multiple estates from one dashboard. Central oversight, decentralised execution." },
          { title: "Agent & Referral Network", detail: "Digital referral system for agents and brokers. Track referrals, commissions, and performance. Scale your sales force without fixed costs." },
          { title: "Payment Tracking & Instalment Management", detail: "Automated instalment tracking, payment reminders, and default notifications. Instalment plans are standard in Nigerian real estate — manage them properly." },
          { title: "Market Analytics", detail: "Track inquiry volume, conversion rates, average time-to-close, and revenue per development. Make data-driven decisions about pricing and marketing spend." },
        ],
        recommended: ["Business Growth consultation", "Systemise Analytics Dashboard"],
      },
    ],
  },
  {
    id: "restaurant-hospitality", label: "Restaurant & Hospitality", badge: "FOOD & HOSPITALITY",
    tagline: "Digital ordering, delivery systems, and brand presence for food and hospitality businesses.",
    phases: [
      {
        id: "brand",
        tagline: "Your brand is the reason someone chooses you over the restaurant next door.",
        primary: [
          { title: "Restaurant Brand Identity", detail: "Logo, colours, menu design language, and visual system. Your brand should make people hungry before they read the menu." },
          { title: "Menu Design", detail: "Professional menu design — physical and digital. Psychology-driven layout that highlights high-margin items and guides ordering decisions." },
          { title: "Packaging & Takeaway Branding", detail: "Branded packaging for delivery and takeaway. Every bag that leaves your restaurant is a billboard — make it memorable." },
          { title: "Interior & Signage Design", detail: "Interior styling guide and signage design. The physical space is part of the brand experience." },
        ],
        recommended: ["⭐ Digital Starter (₦350K) — Brand + Landing Page", "Brand Identity package"],
      },
      {
        id: "website",
        tagline: "People check your website before they check your food.",
        primary: [
          { title: "Restaurant Website", detail: "Menu, location, opening hours, online ordering, and reservation system. Mobile-first — most food searches happen on phones within 5 minutes of a meal decision." },
          { title: "Online Ordering System", detail: "Direct ordering from your website — no commission to delivery platforms. Paystack/Flutterwave payment. Orders go straight to your kitchen display." },
          { title: "Google Business Profile", detail: "Optimised Google listing with photos, menu, reviews, and operating hours. This is how people find you when they search 'restaurants near me'." },
          { title: "Reservation System", detail: "Online table reservation with automatic confirmation. Reduce phone calls and no-shows with SMS reminders." },
        ],
        recommended: ["⭐ Business Launch (₦500K) — Brand + Website + Social", "Website Design package"],
      },
      {
        id: "social",
        tagline: "Food is the most shared content on social media. Use it.",
        primary: [
          { title: "Instagram & TikTok Content", detail: "Daily food content — plating videos, kitchen behind-the-scenes, chef spotlights, and customer reviews. Food content performs naturally well — be consistent." },
          { title: "User-Generated Content", detail: "Encourage diners to tag you. Repost their content. Create photo-worthy plating and spaces that make sharing irresistible." },
          { title: "Food Delivery Platform Presence", detail: "Optimised listings on Chowdeck, Glovo, and Bolt Food. Professional photos, complete menu, and competitive pricing." },
          { title: "WhatsApp Ordering Channel", detail: "WhatsApp Business with full catalogue. Automated order acknowledgement and status updates. WhatsApp is still Nigeria's #1 ordering channel for food." },
        ],
        recommended: ["Social Media Management package", "Skills Faceless Content Intensive (₦25K)"],
      },
      {
        id: "crm",
        tagline: "Turn one-time diners into regulars with data.",
        primary: [
          { title: "Customer Database", detail: "Collect customer details at every touchpoint — orders, reservations, feedback forms. Build a database of people who already love your food." },
          { title: "Loyalty Programme", detail: "Digital loyalty system — points per order, free item after X visits, birthday rewards. Repeat customers spend 67% more than new ones." },
          { title: "Feedback & Review Management", detail: "Automated post-dining feedback requests. Respond to every Google and social media review — positive and negative. Reputation is everything." },
          { title: "Event & Catering CRM", detail: "Track corporate clients, event inquiries, and catering leads separately. These are high-value, recurring revenue opportunities." },
        ],
        recommended: ["CRM & Automation package", "⭐ Full Architecture (from ₦1.2M)"],
      },
      {
        id: "automation",
        tagline: "Automate the back-of-house so your team can focus on the front.",
        primary: [
          { title: "Order Management System", detail: "Digital order flow from customer to kitchen to delivery. Automated status updates. Reduce errors, speed up service." },
          { title: "Inventory & Restock Alerts", detail: "Track ingredient levels, set restock triggers, and get alerts before you run out. Reduce food waste and avoid 'sorry, we're out of that' moments." },
          { title: "Staff Scheduling", detail: "Automated shift scheduling based on expected demand (weekday vs weekend, events, holidays). Reduce overstaffing and understaffing." },
          { title: "AI Chatbot for Orders & FAQs", detail: "Automated responses to 'what's on the menu?', 'do you deliver to X?', 'what are your hours?' — 24/7 without tying up your phone line." },
        ],
        recommended: ["AI & Automation package", "Skills AI Business Courses (from ₦25K)"],
      },
      {
        id: "scale",
        tagline: "From one location to a chain — with systems that replicate.",
        primary: [
          { title: "Multi-Location Management", detail: "Centralised menu, brand standards, and reporting across all locations. Each branch operates independently but reports centrally." },
          { title: "Franchise / Branch Playbook", detail: "Documented SOPs, training materials, and brand guidelines for new locations. This is how you replicate quality at scale." },
          { title: "Central Kitchen System", detail: "If scaling to multiple outlets, a central kitchen with delivery scheduling reduces costs and ensures consistency." },
          { title: "Performance Analytics", detail: "Revenue per location, average order value, delivery time, customer satisfaction scores — all in one dashboard. Spot problems before they become crises." },
        ],
        recommended: ["Business Growth consultation", "Systemise Analytics Dashboard"],
      },
    ],
  },
  {
    id: "education", label: "Education & Training", badge: "EDTECH & TRAINING",
    tagline: "Digital systems for schools, training centres, and online educators to attract, teach, and retain students.",
    phases: [
      {
        id: "brand",
        tagline: "Parents and students judge your quality by your brand before they attend a single class.",
        primary: [
          { title: "Education Brand Identity", detail: "Logo, colours, and visual system that communicates trust, competence, and modernity. Schools and training centres compete on perception as much as results." },
          { title: "Programme Branding", detail: "Each programme or course gets its own visual identity within the master brand. Makes marketing clearer and enrolment simpler." },
          { title: "Student & Parent Communication Templates", detail: "Branded email templates, certificates, report cards, and notification formats. Every touchpoint reinforces your professional standards." },
          { title: "Merchandise & Uniform Design", detail: "Branded uniforms, notebooks, and promotional items. Physical branding builds community and pride among students." },
        ],
        recommended: ["⭐ Digital Starter (₦350K) — Brand + Landing Page", "Brand Identity package"],
      },
      {
        id: "website",
        tagline: "Your website is where parents decide to enrol their children.",
        primary: [
          { title: "School / Training Centre Website", detail: "Programme listings, tuition information, faculty profiles, gallery, and online application form. Mobile-optimised — parents browse on phones." },
          { title: "Online Application & Enrolment", detail: "Digital application form with document upload, payment integration, and automated confirmation. Reduce manual processing by 80%." },
          { title: "Student Portal", detail: "Grades, attendance, assignments, and communication — accessible to students and parents. Reduces 'how is my child doing?' calls." },
          { title: "Course Catalogue & Curriculum", detail: "Detailed programme pages with curriculum breakdown, outcomes, duration, and pricing. Help prospects understand exactly what they're getting." },
        ],
        recommended: ["⭐ Business Launch (₦500K) — Brand + Website + Social", "Website Design package"],
      },
      {
        id: "social",
        tagline: "Show your impact. Parents enrol when they see results.",
        primary: [
          { title: "Student Success Stories", detail: "Feature graduations, achievements, placements, and testimonials. Real outcomes from real students — this is your most compelling content." },
          { title: "Educational Content", detail: "Share tips, insights, and mini-lessons on social media. Position your institution as an authority in your field." },
          { title: "Event & Activity Highlights", detail: "Document every event — excursions, workshops, guest lectures, competitions. Shows an active, engaging learning environment." },
          { title: "WhatsApp Community", detail: "WhatsApp groups or channels for prospective students. Share updates, answer questions, and build community before enrolment." },
        ],
        recommended: ["Social Media Management package", "Skills Digital Marketing Program (₦45K)"],
      },
      {
        id: "crm",
        tagline: "Track every inquiry from first contact to graduation.",
        primary: [
          { title: "Inquiry & Enrolment Pipeline", detail: "Track every prospective student: Inquiry → Tour/Demo → Application → Enrolled → Active. Know your conversion rates and where you lose people." },
          { title: "Student Records Management", detail: "Digital student profiles — contact details, programme, payment status, grades, attendance. Everything in one system, not scattered across spreadsheets." },
          { title: "Parent Communication", detail: "Automated progress updates, event notifications, and fee reminders to parents. Proactive communication reduces complaints." },
          { title: "Alumni Network", detail: "Track graduates, their outcomes, and maintain relationships. Alumni are your best marketing channel — their success is your proof." },
        ],
        recommended: ["CRM & Automation package", "⭐ Full Architecture (from ₦1.2M)"],
      },
      {
        id: "automation",
        tagline: "Automate administration. Free up time for teaching.",
        primary: [
          { title: "Automated Fee Collection & Reminders", detail: "Payment links, instalment tracking, and automated reminders before due dates. Reduce late payments and manual follow-ups." },
          { title: "Certificate & Report Generation", detail: "Auto-generated certificates, report cards, and transcripts from student data. What used to take days now takes minutes." },
          { title: "Attendance & Notification System", detail: "Digital attendance with auto-SMS to parents for absences. Real-time visibility for parents and administrators." },
          { title: "AI-Powered Q&A", detail: "Chatbot that answers FAQs about programmes, fees, schedules, and admission requirements — 24/7 without admin staff involvement." },
        ],
        recommended: ["AI & Automation package", "Skills AI Business Courses (from ₦25K)"],
      },
      {
        id: "scale",
        tagline: "From one programme to a full institution — digital systems that grow with you.",
        primary: [
          { title: "Online Learning Platform", detail: "LMS (Learning Management System) for hybrid or fully online delivery. Recorded lessons, quizzes, assignments, and certificates — all digital." },
          { title: "Multi-Programme Dashboard", detail: "Manage all programmes, cohorts, and instructors from one dashboard. Centralised oversight, decentralised delivery." },
          { title: "Performance Analytics", detail: "Enrolment rates, completion rates, student satisfaction, and revenue per programme. Data-driven decisions about which programmes to expand." },
          { title: "Franchise / Branch Expansion", detail: "Digital playbook for opening new locations or licensing your curriculum. Replicate quality with documented systems." },
        ],
        recommended: ["Business Growth consultation", "Systemise Analytics Dashboard"],
      },
    ],
  },
];

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SystemiseBlueprint() {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedBp, setSelectedBp] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const PER_PAGE = 6;
  const pageCount = Math.ceil(BLUEPRINTS.length / PER_PAGE);
  const paged = BLUEPRINTS.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const bp = BLUEPRINTS.find(b => b.id === selectedBp);
  const tabDef = PHASE_TABS[activeTab];
  const phase = bp?.phases.find(p => p.id === tabDef?.id) ?? null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: Cr, color: TEXT }}>
      <PageMeta
        title="Positioning Blueprint — HAMZURY Systemise"
        description="Industry-specific digital roadmaps covering brand, website, social, CRM, automation, and scale — with package recommendations."
      />

      {/* ── NAV (architect style — matches Systemise portal) ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}
        style={{
          backgroundColor: scrolled ? `${W}F5` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between relative">
          <span
            className="text-[13px] tracking-[4px] font-light uppercase cursor-default select-none"
            style={{ color: scrolled ? G : W, letterSpacing: "0.25em" }}
          >
            SYSTEMIZE
          </span>
          <button
            onClick={() => setNavMenuOpen(p => !p)}
            className="flex items-center justify-center w-9 h-9 transition-opacity hover:opacity-70"
            style={{ color: scrolled ? G : W }}
            aria-label="Menu"
          >
            {navMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {navMenuOpen && (
            <div
              className="absolute top-12 right-0 rounded-2xl py-2 min-w-[220px] shadow-xl"
              style={{ backgroundColor: W }}
              onClick={() => setNavMenuOpen(false)}
            >
              {[
                { label: "Systemise Home", href: "/systemise" },
                { label: "Home",           href: "/" },
                { label: "BizDoc",         href: "/bizdoc" },
                { label: "Skills",         href: "/skills" },
                { label: "Pricing",        href: "/pricing" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: G }}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO (full viewport, architect style) ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden" style={{ backgroundColor: G }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-6" style={{ color: Au }}>POSITIONING BLUEPRINT</p>
          <h1
            className="text-[clamp(32px,6vw,48px)] font-light leading-[1.1] mb-6 tracking-tight"
            style={{ color: W }}
          >
            Your digital{" "}
            <span style={{ color: Au }}>architecture.</span>
          </h1>
          <p className="text-[14px] leading-relaxed mb-12 max-w-md mx-auto" style={{ color: W, opacity: 0.55 }}>
            Brand. Website. Social. CRM. Automation. Scale. Every digital layer mapped to the systems your business needs.
          </p>
          <button
            onClick={() => document.getElementById("blueprints")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 rounded-full text-[14px] font-medium transition-all duration-300 hover:scale-[1.02]"
            style={{ backgroundColor: Au, color: "#1A1A1A" }}
          >
            Select Your Industry
          </button>
        </div>
      </section>

      <MotivationalQuoteBar department="systemise" />

      {/* ── BLUEPRINT GRID / DETAIL ── */}
      <section id="blueprints" className="py-24 md:py-32 px-6" style={{ backgroundColor: Cr }}>
        <div className="max-w-5xl mx-auto">
          {!selectedBp && (
            <>
              <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4 text-center" style={{ color: Au }}>
                SELECT YOUR INDUSTRY
              </p>
              <h2
                className="text-[clamp(28px,4vw,42px)] font-light mb-20 text-center leading-tight tracking-tight"
                style={{ color: G }}
              >
                What does your business need?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                {paged.map((b) => (
                  <button key={b.id}
                    onClick={() => { setSelectedBp(b.id); setActiveTab(0); }}
                    className="rounded-[20px] p-8 text-left transition-all duration-300 hover:-translate-y-1"
                    style={{ backgroundColor: W, boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${Au}18`, color: Au }}>{b.badge}</span>
                    </div>
                    <h3 className="text-[16px] font-semibold mb-2" style={{ color: G }}>{b.label}</h3>
                    <p className="text-[13px] leading-relaxed mb-4" style={{ color: G, opacity: 0.55 }}>{b.tagline.slice(0, 90)}…</p>
                    <span className="text-[13px] font-medium flex items-center gap-1.5" style={{ color: Au }}>
                      View Roadmap <ArrowRight size={13} />
                    </span>
                  </button>
                ))}
              </div>
              {pageCount > 1 && (
                <div className="flex items-center justify-end gap-2 mb-8">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="p-2 rounded-xl disabled:opacity-30" style={{ backgroundColor: W, border: `1px solid ${G}25` }}>
                    <ChevronLeft size={16} style={{ color: G }} />
                  </button>
                  <span className="text-[12px] opacity-50" style={{ color: TEXT }}>{page + 1} / {pageCount}</span>
                  <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page === pageCount - 1}
                    className="p-2 rounded-xl disabled:opacity-30" style={{ backgroundColor: W, border: `1px solid ${G}25` }}>
                    <ChevronRight size={16} style={{ color: G }} />
                  </button>
                </div>
              )}
            </>
          )}

          {selectedBp && bp && (
            <div className="rounded-[20px] overflow-hidden" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.08)" }}>
              {/* Header */}
              <div className="px-8 py-7" style={{ backgroundColor: G }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${Au}25`, color: Au }}>{bp.badge}</span>
                    </div>
                    <h3 className="text-[clamp(22px,3vw,30px)] font-bold mb-1" style={{ color: W }}>{bp.label}</h3>
                    <p className="text-[13px] opacity-60" style={{ color: W }}>{bp.tagline}</p>
                  </div>
                  <button onClick={() => setSelectedBp(null)}
                    className="shrink-0 text-[12px] font-medium px-4 py-2 rounded-xl"
                    style={{ backgroundColor: "rgba(255,255,255,0.12)", color: W }}>
                    Close
                  </button>
                </div>
                <div className="flex gap-1 mt-6 overflow-x-auto pb-1 scrollbar-hide">
                  {PHASE_TABS.map((tab, i) => {
                    const active = activeTab === i;
                    return (
                      <button key={tab.id} onClick={() => setActiveTab(i)}
                        className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
                        style={{ backgroundColor: active ? Au : "rgba(255,255,255,0.1)", color: active ? TEXT : "rgba(255,255,255,0.6)" }}>
                        <span className="opacity-50 mr-1">{tab.num}</span>{tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {phase && (
                <div className="px-8 py-10" style={{ backgroundColor: W }}>
                  <p className="text-[14px] leading-relaxed max-w-xl mb-8" style={{ color: TEXT, opacity: 0.55 }}>{phase.tagline}</p>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-6 flex items-center gap-2" style={{ color: Au }}>
                        <span className="w-4 h-px inline-block" style={{ backgroundColor: Au }} />
                        WHAT YOU NEED
                      </p>
                      <div className="flex flex-col gap-4">
                        {phase.primary.map((item) => (
                          <div key={item.title} className="rounded-[16px] p-5" style={{ backgroundColor: Cr }}>
                            <p className="text-[14px] font-semibold mb-1.5" style={{ color: G }}>{item.title}</p>
                            <p className="text-[13px] leading-relaxed" style={{ color: TEXT, opacity: 0.55 }}>{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-8">
                      <div>
                        <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: `${TEXT}55` }}>RECOMMENDED</p>
                        <ul className="flex flex-col gap-3">
                          {phase.recommended.map((s) => (
                            <li key={s} className="flex items-start gap-2.5 text-[13px]" style={{ color: G, opacity: 0.75 }}>
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: Au }} />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <a href="/systemise"
                        className="mt-auto w-full py-3.5 rounded-full text-[14px] font-medium transition-all duration-300 hover:scale-[1.02] text-center block"
                        style={{ backgroundColor: Au, color: TEXT }}>
                        Get Started
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 md:py-32 text-center" style={{ backgroundColor: W }}>
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: Au }}>
            NOT SURE WHERE TO START?
          </p>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-light tracking-tight mb-6" style={{ color: G }}>
            Tell us your business. We'll architect the system.
          </h2>
          <a href="/systemise"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[14px] font-medium transition-all duration-300 hover:scale-[1.02]"
            style={{ backgroundColor: Au, color: TEXT }}>
            Talk to Systemise <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: G }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[13px] tracking-[4px] font-light uppercase" style={{ color: `${W}88` }}>SYSTEMIZE</span>
          <div className="flex items-center gap-6 text-[12px] flex-wrap justify-center sm:justify-end">
            <a href="/systemise" className="hover:opacity-80 transition-opacity" style={{ color: `${W}55` }}>Systemise Home</a>
            <a href="/bizdoc" className="hover:opacity-80 transition-opacity" style={{ color: `${W}55` }}>BizDoc</a>
            <a href="/skills" className="hover:opacity-80 transition-opacity" style={{ color: `${W}55` }}>Skills</a>
            <a href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: `${W}55` }}>Privacy</a>
            <a href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: `${W}55` }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
