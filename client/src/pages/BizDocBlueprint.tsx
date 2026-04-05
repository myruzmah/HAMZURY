import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Search, Youtube, ChevronDown, ChevronUp, Palette, BarChart2, Monitor, Bot } from "lucide-react";

const G = "#1B4D3E";
const Au = "#B48C4C";
const Cr = "#FFFAF6";

// ─── Types ───────────────────────────────────────────────────────────────────

type CategoryKey = "branding" | "management" | "digital" | "ai";

type BusinessData = {
  id: string;
  name: string;
  emoji: string;
  tags: string[];
  videoUrl: string;
  branding: string[];
  management: string[];
  digital: string[];
  ai: string[];
};

// ─── Data ────────────────────────────────────────────────────────────────────

const BUSINESSES: BusinessData[] = [
  {
    id: "restaurant",
    name: "Restaurant / Food Business",
    emoji: "🍽️",
    tags: ["food", "restaurant", "catering", "canteen", "eatery"],
    videoUrl: "#",
    branding: ["Logo & brand identity", "Menu design (print & digital)", "Branded packaging & takeaway bags", "Staff uniform design", "Signage & fascia board"],
    management: ["Business plan & financial projections", "Food safety & NAFDAC compliance docs", "Staff SOP manual", "Supplier & inventory management policy", "CAC registration & health permit"],
    digital: ["Restaurant website with online menu", "Online order & delivery integration", "Point-of-sale (POS) dashboard", "Customer loyalty app / WhatsApp order system", "Google Business profile setup"],
    ai: ["AI-powered inventory forecasting", "Automated order-taking chatbot", "Customer feedback sentiment analysis", "Smart upsell recommendations at checkout", "Wastage reduction AI alerts"],
  },
  {
    id: "fashion",
    name: "Fashion & Clothing",
    emoji: "👗",
    tags: ["fashion", "clothing", "tailoring", "boutique", "apparel"],
    videoUrl: "#",
    branding: ["Logo & fashion brand identity", "Lookbook design & brand guidelines", "Hang tags, labels & packaging", "Social media visual templates", "Brand photography brief"],
    management: ["Business plan for fashion brand", "CAC registration (BN or Ltd)", "Supplier & fabric sourcing SOP", "Sales & returns policy", "Staff roles & responsibilities manual"],
    digital: ["E-commerce website (with Instagram shop sync)", "Product catalog & sizing guide online", "Order tracking & customer portal", "WhatsApp business automation for orders", "Social media content calendar tool"],
    ai: ["AI outfit recommendation engine", "Trend forecasting for buying decisions", "Automated social media post generator", "Chatbot for order status & FAQs", "AI size guide from customer measurements"],
  },
  {
    id: "realestate",
    name: "Real Estate / Property",
    emoji: "🏠",
    tags: ["real estate", "property", "housing", "land", "rent", "lease"],
    videoUrl: "#",
    branding: ["Real estate brand identity & logo", "Property listing templates", "Branded signage & billboards", "Business card & letterhead design", "Social media listing cards"],
    management: ["CAC registration & ESBN documents", "Real estate agent licence (ESVARBON)", "Standard tenancy agreement template", "Property inspection & due diligence checklist", "Client onboarding & KYC process"],
    digital: ["Property listings website", "Virtual tour & 360° property viewer", "CRM for client & property management", "Automated rent reminder system", "Land registry & title verification portal access"],
    ai: ["AI property valuation tool", "Lead qualification chatbot", "Automated listing descriptions generator", "Market price trend analysis", "Smart tenant screening assistant"],
  },
  {
    id: "transport",
    name: "Transportation / Logistics",
    emoji: "🚚",
    tags: ["transport", "logistics", "haulage", "delivery", "courier", "freight"],
    videoUrl: "#",
    branding: ["Logo & fleet livery design", "Branded vehicle wrap design", "Waybill & invoice templates", "Driver uniform design", "Company profile document"],
    management: ["CAC registration & TIN", "FRSC vehicle roadworthiness compliance", "Driver contracts & employment handbook", "Route management & dispatch SOP", "Fleet maintenance schedule"],
    digital: ["Logistics website with shipment tracking", "Fleet GPS tracking dashboard", "Customer shipment portal", "Automated invoice & payment system", "Driver mobile app for route management"],
    ai: ["AI route optimization engine", "Predictive maintenance alerts for fleet", "Automated delivery notifications to clients", "Demand forecasting for capacity planning", "AI fuel consumption monitor"],
  },
  {
    id: "agriculture",
    name: "Agriculture / Farming",
    emoji: "🌾",
    tags: ["agriculture", "farming", "crops", "agro", "produce", "farm"],
    videoUrl: "#",
    branding: ["Farm brand identity & logo", "Produce packaging design", "Branded farm signage", "Company profile & pitch deck", "Agro product label design"],
    management: ["CAC registration (BN or Ltd)", "NAFDAC certification for processed goods", "Farm management & crop cycle SOP", "Land lease or ownership documents", "Cooperative or investor agreement template"],
    digital: ["Farm business website", "Produce marketplace listing", "Farm management dashboard (crop cycles, inputs)", "E-commerce for direct-to-consumer sales", "Government & NGO grant application portal"],
    ai: ["Crop disease detection via image AI", "Soil quality & weather analysis AI", "Automated market price alerts", "Yield prediction model", "AI irrigation scheduling system"],
  },
  {
    id: "beauty",
    name: "Beauty & Cosmetics",
    emoji: "💄",
    tags: ["beauty", "cosmetics", "salon", "spa", "makeup", "skincare"],
    videoUrl: "#",
    branding: ["Luxury beauty brand identity & logo", "Product label & packaging design", "Branded price list & service menu", "Social media template kit", "Gift card & loyalty card design"],
    management: ["CAC registration & NAFDAC product number", "Client consultation & consent forms", "Staff training & service SOP manual", "Pricing strategy & cost breakdown", "Salon/studio lease or permit"],
    digital: ["Beauty brand website with booking", "Online appointment scheduling system", "E-commerce for product sales", "Client loyalty & referral program platform", "Instagram & TikTok content automation"],
    ai: ["AI skin analysis & product recommendation", "Automated booking reminders & follow-ups", "Personalized beauty routine generator", "Inventory restock prediction", "Social media caption AI generator"],
  },
  {
    id: "construction",
    name: "Construction & Building",
    emoji: "🏗️",
    tags: ["construction", "building", "civil", "engineering", "contractor", "renovation"],
    videoUrl: "#",
    branding: ["Company logo & brand identity", "Site board & hoarding design", "Branded workwear & PPE design", "Company profile & capability statement", "Proposal & quotation templates"],
    management: ["CAC Ltd registration & TIN", "COREN or NIA professional licence", "Tax clearance & PENCOM/NSITF/ITF certs", "Contract agreement & subcontractor templates", "HSE policy & site safety manual"],
    digital: ["Construction company website with portfolio", "Project management dashboard (Gantt, milestones)", "Client portal for project updates", "Automated invoicing & payment tracking", "BPP / procurement portal registration"],
    ai: ["AI project cost estimator", "Schedule optimization & delay prediction", "Automated progress report generator", "Material procurement price tracker", "AI safety incident risk scoring"],
  },
  {
    id: "importexport",
    name: "Import & Export",
    emoji: "🚢",
    tags: ["import", "export", "trade", "customs", "shipping"],
    videoUrl: "#",
    branding: ["Trade company logo & brand identity", "Company profile & capability statement", "Product catalogue design", "Branded letterhead & pro forma invoice", "Email signature & business card"],
    management: ["CAC Ltd registration & TIN", "NEPC registration for export", "Form M / Form NXP documentation", "SON product compliance certification", "Tax clearance certificate"],
    digital: ["Trade company website with product listings", "Customs & cargo tracking integration", "B2B buyer portal for overseas clients", "Automated shipping document generator", "NEPC & NCS portal access setup"],
    ai: ["AI market demand & price forecasting", "Automated customs classification (HS codes)", "Trade regulation & tariff update alerts", "AI-generated export pitches for new markets", "Buyer lead generation chatbot"],
  },
  {
    id: "mining",
    name: "Mining Business",
    emoji: "⛏️",
    tags: ["mining", "mineral", "quarry", "solid minerals", "extraction"],
    videoUrl: "#",
    branding: ["Mining company logo & identity", "Company profile & investor presentation", "Site branding & safety signage design", "Branded workwear design", "Letterhead & proposal templates"],
    management: ["CAC Ltd registration & TIN", "Mining Cadastre Office licence/lease", "Environmental Impact Assessment (EIA)", "Community Development Agreement (CDA)", "PENCOM, NSITF & ITF compliance certs"],
    digital: ["Mining company website", "Investor relations portal", "Mineral production tracking dashboard", "Regulatory compliance document manager", "Tender & contract management system"],
    ai: ["AI ore grade & deposit estimation", "Equipment predictive maintenance AI", "Environmental compliance monitoring AI", "Production yield optimization model", "Automated regulatory report generator"],
  },
  {
    id: "travel",
    name: "Travel Agency",
    emoji: "✈️",
    tags: ["travel", "agency", "tours", "holiday", "flights", "visa"],
    videoUrl: "#",
    branding: ["Travel brand identity & logo", "Travel package brochure design", "Social media travel card templates", "Branded booking confirmations", "Business card & letterhead"],
    management: ["CAC registration & TIN", "NANTA membership", "IATA accreditation (if ticketing)", "State tourism board registration", "Standard client booking agreement"],
    digital: ["Travel agency website with package listings", "Online booking & payment system", "Visa application tracking portal", "WhatsApp travel enquiry automation", "CRM for repeat client management"],
    ai: ["AI trip itinerary builder", "Automated visa requirement checker", "Personalized travel package recommender", "Price comparison & fare alert AI", "Post-trip feedback collection chatbot"],
  },
  {
    id: "contractor",
    name: "Contractor Business",
    emoji: "📋",
    tags: ["contractor", "government contract", "procurement", "tender", "supplier"],
    videoUrl: "#",
    branding: ["Company logo & brand identity", "Company profile & capability statement", "Proposal & tender document templates", "Branded letterhead & invoice", "Presentation & pitch deck design"],
    management: ["CAC Ltd registration & TIN", "Tax clearance certificate (3 years)", "PENCOM, NSITF & ITF compliance certs", "BPP federal procurement registration", "Board resolution & prequalification docs pack"],
    digital: ["Contractor company website with portfolio", "Tender & bid management dashboard", "Client relationship management (CRM)", "Automated compliance certificate tracker", "Government procurement portal accounts"],
    ai: ["AI tender opportunity scanner", "Automated bid document assembler", "Competitor bid price intelligence", "Compliance expiry reminder system", "AI-generated project execution summaries"],
  },
  {
    id: "pharmacy",
    name: "Pharmacy / Healthcare",
    emoji: "💊",
    tags: ["pharmacy", "healthcare", "hospital", "clinic", "medical", "health"],
    videoUrl: "#",
    branding: ["Healthcare brand identity & logo", "Branded prescription bags & labels", "Clinic/pharmacy interior signage", "Uniform design for staff", "Patient information leaflets design"],
    management: ["CAC registration & PCN (Pharmacists Council) licence", "NAFDAC drug storage compliance docs", "Standard operating procedures (dispensing SOP)", "Patient confidentiality & HIPAA-equivalent policy", "Staff employment & professional conduct policy"],
    digital: ["Pharmacy/clinic website", "Inventory & drug stock management system", "Patient appointment & records portal", "Insurance & HMO billing integration", "WhatsApp prescription refill automation"],
    ai: ["AI drug interaction checker", "Inventory demand forecasting & reorder AI", "Automated patient medication reminders", "Symptom triage chatbot", "Health insurance pre-authorization AI assistant"],
  },
  {
    id: "education",
    name: "Education / School",
    emoji: "🎓",
    tags: ["education", "school", "academy", "training", "tutoring", "learning"],
    videoUrl: "#",
    branding: ["School logo & brand identity", "Prospectus & admissions brochure", "School uniform & badge design", "Certificate & award templates", "Social media & website banners"],
    management: ["CAC registration & TIN", "State Ministry of Education approval", "Academic calendar & curriculum framework", "Staff employment contracts & code of conduct", "Student enrollment & fee policy document"],
    digital: ["School website with admissions portal", "Learning Management System (LMS)", "Student & parent communication portal", "Fee payment & receipt automation", "School management software (attendance, grades)"],
    ai: ["AI personalized learning pathways", "Automated assignment grading assistant", "Student performance prediction & early warning", "Chatbot for admissions enquiries", "AI-generated lesson plan builder"],
  },
  {
    id: "events",
    name: "Event Management",
    emoji: "🎉",
    tags: ["events", "event management", "wedding", "conference", "entertainment"],
    videoUrl: "#",
    branding: ["Event company logo & brand identity", "Event flyer & poster templates", "Branded event backdrop & banner design", "Branded merchandise design", "Company profile & capability statement"],
    management: ["CAC registration & TIN", "Event venue permits & local government approvals", "Standard client event agreement", "Vendor & supplier contracts", "Event risk assessment & insurance policy"],
    digital: ["Event company website with portfolio", "Online ticketing & RSVP system", "Event planning project management tool", "Post-event feedback & review platform", "Social media event promotion automation"],
    ai: ["AI event budget estimator", "Guest list & seating optimization AI", "Automated vendor price comparison", "Social media content scheduler for events", "Post-event sentiment analysis from feedback"],
  },
  {
    id: "printing",
    name: "Printing & Publishing",
    emoji: "🖨️",
    tags: ["printing", "publishing", "press", "graphics", "print"],
    videoUrl: "#",
    branding: ["Print company logo & brand identity", "Product & service catalogue design", "Branded vehicle & delivery design", "Sample portfolio booklet", "Business card & letterhead"],
    management: ["CAC registration & TIN", "SON compliance for paper & printing standards", "Equipment maintenance & operations SOP", "Client brief & approval workflow policy", "Staff creative roles & responsibilities"],
    digital: ["Print company website with online order form", "Design upload & proofing portal", "Order tracking & delivery management system", "Automated quote generator", "WhatsApp order intake automation"],
    ai: ["AI design proofreading & error detection", "Automated price quote AI", "Print demand forecasting", "Client design suggestion AI", "Inventory & consumable reorder prediction"],
  },
  {
    id: "fuelstation",
    name: "Fuel Station / Oil & Gas",
    emoji: "⛽",
    tags: ["fuel", "petrol", "oil", "gas", "filling station", "DPR"],
    videoUrl: "#",
    branding: ["Fuel station logo & canopy branding", "Signage & price board design", "Staff uniform design", "Branded receipt & invoice templates", "Company profile document"],
    management: ["CAC Ltd registration & TIN", "DPR (now NUPRC) operating licence", "Environmental compliance & DPR safety audit", "PENCOM & NSITF compliance certs", "Staff operations manual & safety SOP"],
    digital: ["Fuel station website", "Pump & sales monitoring dashboard", "Automated stock level & reorder system", "Fleet account & corporate billing portal", "Daily sales & reconciliation report tool"],
    ai: ["AI fuel consumption & sales forecasting", "Theft & anomaly detection on pump readings", "Price optimization AI based on depot rates", "Automated compliance renewal reminders", "Staff attendance & shift optimization AI"],
  },
  {
    id: "supermarket",
    name: "Supermarket / Retail",
    emoji: "🛒",
    tags: ["supermarket", "retail", "shop", "store", "wholesale"],
    videoUrl: "#",
    branding: ["Retail brand identity & logo", "In-store signage & aisle branding", "Branded shopping bags & receipts", "Staff uniform design", "Loyalty card & promotional flyer design"],
    management: ["CAC registration & TIN", "NAFDAC compliance for food items stocked", "Supplier agreements & credit terms", "Store layout & operations SOP", "Staff roles, shifts & disciplinary policy"],
    digital: ["Retail website / online store", "Point-of-sale (POS) & inventory system", "Customer loyalty & rewards platform", "Supplier order management portal", "Sales analytics & performance dashboard"],
    ai: ["AI demand forecasting & restock alerts", "Personalized promotional offers engine", "Expired product detection AI", "Shrinkage & loss prevention AI", "Customer purchase pattern analysis"],
  },
  {
    id: "hotel",
    name: "Hotel / Hospitality",
    emoji: "🏨",
    tags: ["hotel", "hospitality", "guest house", "lodge", "inn", "accommodation"],
    videoUrl: "#",
    branding: ["Hotel brand identity & logo", "Room key card & amenity packaging design", "Branded menu & signage design", "Uniform & linen design brief", "Website photography & visual standards guide"],
    management: ["CAC Ltd registration & TIN", "Tourism Board / State hotel licence", "Health, safety & fire compliance certificate", "Standard guest check-in & service SOP", "Staff employment contracts & HR handbook"],
    digital: ["Hotel website with online booking engine", "Property management system (PMS)", "Channel manager (Booking.com, Airbnb integration)", "Guest communication & review management portal", "Revenue & occupancy analytics dashboard"],
    ai: ["AI dynamic pricing (yield management)", "Personalized guest experience AI", "Automated review response generator", "Housekeeping scheduling optimization AI", "Predictive maintenance for hotel facilities"],
  },
  {
    id: "ict",
    name: "ICT / Tech Company",
    emoji: "💻",
    tags: ["ICT", "tech", "software", "IT", "technology", "digital", "startup"],
    videoUrl: "#",
    branding: ["Tech brand identity & logo", "Product UI/UX design system", "Pitch deck & investor presentation", "Social media & content design kit", "Company profile & one-pager"],
    management: ["CAC Ltd registration & TIN", "NCC registration (if telecoms)", "Software product terms of service & privacy policy", "Employment contracts & IP ownership clauses", "Investor/shareholder agreement template"],
    digital: ["Company website & product landing pages", "Customer dashboard & SaaS portal", "CRM & helpdesk system", "API documentation portal", "Dev & project management tools (GitHub, Jira)"],
    ai: ["AI code review & quality assistant", "Automated customer support chatbot", "User behavior analytics AI", "AI-generated product release notes", "Predictive churn & retention model"],
  },
  {
    id: "consulting",
    name: "Consulting Firm",
    emoji: "🤝",
    tags: ["consulting", "consultancy", "advisory", "strategy", "management consulting"],
    videoUrl: "#",
    branding: ["Consulting firm logo & brand identity", "Professional pitch deck template", "Branded report & proposal templates", "Business card & letterhead design", "Thought leadership content design"],
    management: ["CAC Ltd registration & TIN", "Professional indemnity insurance", "Standard client engagement & retainer agreement", "Confidentiality / NDA template", "Internal quality & delivery framework"],
    digital: ["Consulting firm website with case studies", "Client project portal & reporting dashboard", "Automated proposal & invoice generator", "CRM for lead & client relationship tracking", "Newsletter & content publication platform"],
    ai: ["AI research & insight summarizer", "Automated proposal drafter", "Competitive landscape analysis AI", "Meeting notes transcription & action item extractor", "AI-powered client ROI calculator"],
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    emoji: "🏭",
    tags: ["manufacturing", "factory", "production", "industrial", "processing"],
    videoUrl: "#",
    branding: ["Manufacturing company logo & identity", "Product label & packaging design", "Company profile & capability statement", "Branded workwear & safety design", "Trade fair & exhibition materials"],
    management: ["CAC Ltd registration & TIN", "NAFDAC or SON product certification", "Environmental compliance & EIA", "ISO-aligned quality management SOP", "Staff factory safety & HR manual"],
    digital: ["Manufacturing company website", "Production tracking & ERP system", "B2B customer order portal", "Supply chain & vendor management platform", "Quality control & defect reporting dashboard"],
    ai: ["Predictive equipment maintenance AI", "Production yield optimization model", "AI quality defect detection (image analysis)", "Demand forecasting & production planning AI", "Raw material price tracking AI"],
  },
  {
    id: "cleaning",
    name: "Cleaning Services",
    emoji: "🧹",
    tags: ["cleaning", "janitorial", "fumigation", "sanitation", "housekeeping"],
    videoUrl: "#",
    branding: ["Cleaning company logo & brand identity", "Branded uniform & equipment labels", "Service flyer & rate card design", "Branded vehicle wrap design", "Company profile & capability document"],
    management: ["CAC registration (BN or Ltd)", "Compliance with NAFDAC for chemical products used", "Service level agreement (SLA) template", "Staff operations & safety manual", "Client onboarding & inspection checklist"],
    digital: ["Cleaning company website with service booking", "Job scheduling & staff dispatch dashboard", "Client management & recurring booking system", "Automated invoice & payment portal", "GPS staff tracking for field teams"],
    ai: ["Automated job scheduling & route planning AI", "Client feedback sentiment analysis", "Supply & consumable reorder prediction", "AI-generated service quotation tool", "Performance KPI tracker for cleaning teams"],
  },
  {
    id: "security",
    name: "Security Company",
    emoji: "🔒",
    tags: ["security", "guard", "surveillance", "protection", "CCTV"],
    videoUrl: "#",
    branding: ["Security company logo & brand identity", "Branded uniform design", "Company profile & capability statement", "Vehicle & equipment livery design", "Proposal & quotation templates"],
    management: ["CAC Ltd registration & TIN", "NSCDC (Nigeria Security & Civil Defence Corps) licence", "PENCOM, NSITF & ITF compliance certs", "Guard employment contracts & code of conduct", "Client service agreement & SLA template"],
    digital: ["Security company website", "Guard scheduling & attendance tracking dashboard", "Incident reporting & management platform", "Client site monitoring portal", "Patrol route management system"],
    ai: ["AI CCTV anomaly & threat detection", "Guard performance & attendance AI monitor", "Predictive incident hotspot analysis", "Automated shift scheduling optimization", "Client incident report generator AI"],
  },
  {
    id: "poultry",
    name: "Poultry / Livestock",
    emoji: "🐔",
    tags: ["poultry", "livestock", "farming", "chicken", "eggs", "cattle", "fish"],
    videoUrl: "#",
    branding: ["Farm brand identity & logo", "Branded packaging for eggs/meat", "Farm signage & gate branding design", "Company profile document", "Produce label & certification design"],
    management: ["CAC registration & TIN", "NAFDAC or SON product compliance (processed meat/eggs)", "State Ministry of Agriculture farm registration", "Biosecurity & farm operations SOP", "Investor or off-taker agreement template"],
    digital: ["Farm website & produce ordering portal", "Farm production tracking dashboard", "Veterinary & medication schedule tracker", "Supply & feed inventory management system", "Market price alert & off-taker network"],
    ai: ["Disease outbreak early warning AI", "Feed consumption optimization model", "AI egg/meat production yield forecaster", "Mortality rate prediction & alert", "Market price & demand trend analysis"],
  },
  {
    id: "photography",
    name: "Photography / Media",
    emoji: "📸",
    tags: ["photography", "videography", "media", "content creation", "film"],
    videoUrl: "#",
    branding: ["Photography brand identity & logo", "Portfolio website design brief", "Branded watermark & preset style guide", "Price list & service package design", "Social media visual identity kit"],
    management: ["CAC registration (BN or Ltd)", "Client photography agreement & rights policy", "Model release consent form template", "Delivery & usage licensing terms", "Equipment insurance & asset list"],
    digital: ["Photography portfolio website", "Online booking & payment system", "Client gallery delivery portal", "Social media content scheduler", "Studio booking & availability calendar"],
    ai: ["AI photo culling & selection tool", "Automated image editing & color grading AI", "Social media caption AI generator", "Client testimonial & review collection bot", "AI-driven upsell recommendation during booking"],
  },
  {
    id: "fitness",
    name: "Fitness & Gym",
    emoji: "💪",
    tags: ["fitness", "gym", "exercise", "health", "wellness", "sport"],
    videoUrl: "#",
    branding: ["Gym brand identity & logo", "Membership card & kit bag design", "Interior branding & motivational signage", "Social media fitness content templates", "Branded uniform & merchandise design"],
    management: ["CAC registration & TIN", "State health & sports authority permit", "Member registration & waiver/consent forms", "Trainer employment contracts & certification policy", "Gym operations & equipment maintenance SOP"],
    digital: ["Gym website with membership plans", "Online class booking & timetable system", "Member portal (workout history, nutrition tracking)", "Automated renewal & payment reminders", "Fitness app or WhatsApp check-in system"],
    ai: ["AI personalized workout plan builder", "Nutrition & diet recommendation AI", "Member churn prediction & retention alerts", "Automated class reminder & booking bot", "Equipment usage analytics & maintenance prediction"],
  },
  {
    id: "laundry",
    name: "Laundry / Dry Cleaning",
    emoji: "👕",
    tags: ["laundry", "dry cleaning", "laundromat", "washing"],
    videoUrl: "#",
    branding: ["Laundry brand identity & logo", "Branded bags, tags & receipts design", "Uniform & staff wear design", "Delivery vehicle livery design", "Service price list & brochure"],
    management: ["CAC registration (BN or Ltd)", "Garment care policy & liability disclaimer", "Order intake & tracking SOP", "Staff roles, shifts & conduct manual", "Supplier agreements (chemicals, equipment)"],
    digital: ["Laundry website with online order booking", "Order tracking portal for customers", "Pickup & delivery scheduling system", "Automated payment & receipt system", "Customer loyalty programme platform"],
    ai: ["Route optimization for pickup & delivery", "Demand forecasting for shift planning", "Automated order status notification bot", "Customer retention & win-back AI", "Chemical inventory reorder prediction"],
  },
  {
    id: "autorepair",
    name: "Auto Repair / Mechanic",
    emoji: "🔧",
    tags: ["auto repair", "mechanic", "garage", "car", "vehicle", "workshop"],
    videoUrl: "#",
    branding: ["Auto shop logo & brand identity", "Branded workshop signage & banners", "Jobcard & invoice templates", "Uniform & workwear design", "Company profile document"],
    management: ["CAC registration & TIN", "FRSC / VIO compliance for commercial workshop", "Standard repair estimate & jobcard template", "Warranty policy document for services rendered", "Staff technical roles & training SOP"],
    digital: ["Workshop website with service list & booking", "Vehicle job card & repair tracking system", "Customer management & service history portal", "Automated service reminder system", "Parts inventory management dashboard"],
    ai: ["AI vehicle fault diagnosis assistant", "Parts reorder prediction & price tracker", "Predictive maintenance schedule for fleet clients", "Automated service reminder notifications", "Customer feedback & rating analysis"],
  },
  {
    id: "bakery",
    name: "Bakery & Confectionery",
    emoji: "🍰",
    tags: ["bakery", "confectionery", "cake", "pastry", "food"],
    videoUrl: "#",
    branding: ["Bakery brand identity & logo", "Product packaging & label design", "Box, bag & sticker design", "Social media product photography brief", "Price list & menu design"],
    management: ["CAC registration & NAFDAC number (processed food)", "Health & sanitation compliance certificate", "Product recipe & production SOP", "Supplier agreements for raw materials", "Staff food handling & hygiene policy"],
    digital: ["Bakery website with online order form", "Custom order intake & tracking system", "WhatsApp order automation", "E-commerce for daily or bulk products", "Instagram shop & social media integration"],
    ai: ["AI demand forecasting & production planning", "Automated order confirmation & delivery bot", "Ingredient restock prediction", "Customer preference & bestseller analysis", "Social media content AI generator"],
  },
];

// ─── Category Config ──────────────────────────────────────────────────────────

const CATEGORIES: { key: CategoryKey; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "branding", label: "Branding Documents", icon: <Palette size={14} />, color: "#B48C4C" },
  { key: "management", label: "Management Documents", icon: <BarChart2 size={14} />, color: "#1B4D3E" },
  { key: "digital", label: "Website & Dashboard", icon: <Monitor size={14} />, color: "#3B82F6" },
  { key: "ai", label: "AI Tools", icon: <Bot size={14} />, color: "#8B5CF6" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function BizDocBlueprint() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CategoryKey>("branding");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return BUSINESSES;
    return BUSINESSES.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.tags.some(t => t.includes(q))
    );
  }, [query]);

  const selectedBiz = BUSINESSES.find(b => b.id === selected);

  const openChat = (context: string) => {
    localStorage.setItem("hamzury-chat-context", context);
    const btn = document.querySelector("[data-chat-trigger]") as HTMLElement;
    if (btn) btn.click();
  };

  const handleCardClick = (id: string) => {
    if (selected === id) {
      setSelected(null);
    } else {
      setSelected(id);
      setActiveTab("branding");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: Cr }}>
      <PageMeta
        title="Business Positioning Blueprint — HAMZURY BizDoc"
        description="Find your business type and discover every document, digital tool, and AI system you need to run it professionally in Nigeria."
      />

      {/* Header */}
      <div
        className="sticky top-0 z-30 backdrop-blur-md border-b"
        style={{ backgroundColor: `${Cr}ee`, borderColor: `${G}10` }}
      >
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center gap-3">
          <Link href="/bizdoc" className="flex items-center gap-2 text-sm" style={{ color: G }}>
            <ArrowLeft size={16} />
            Back to BizDoc
          </Link>
          <div className="flex-1" />
          <span className="text-xs font-medium tracking-wider uppercase" style={{ color: Au }}>
            Blueprint Tool
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-10">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-semibold mb-2" style={{ color: G }}>
          Business Positioning Blueprint
        </h1>
        <p className="text-sm opacity-60 mb-8 max-w-xl leading-relaxed" style={{ color: G }}>
          Search for your business below. We'll show you every branding document, management tool, digital system, and AI solution you need to run it professionally.
        </p>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-lg">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" style={{ color: G }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search business type or industry..."
            className="w-full h-12 pl-11 pr-4 rounded-2xl border text-sm outline-none transition-all"
            style={{
              backgroundColor: "#fff",
              borderColor: `${G}20`,
              color: G,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs opacity-40 hover:opacity-70"
              style={{ color: G }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Result Count */}
        {query && (
          <p className="text-xs mb-4 opacity-50" style={{ color: G }}>
            {filtered.length} {filtered.length === 1 ? "result" : "results"} for "{query}"
          </p>
        )}

        {/* Business Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
            {filtered.map(biz => {
              const isActive = selected === biz.id;
              return (
                <button
                  key={biz.id}
                  onClick={() => handleCardClick(biz.id)}
                  className="relative text-left rounded-2xl border p-4 transition-all hover:shadow-sm group"
                  style={{
                    backgroundColor: isActive ? `${G}08` : "#fff",
                    borderColor: isActive ? `${G}35` : `${G}10`,
                  }}
                >
                  {/* Video link */}
                  <a
                    href={biz.videoUrl}
                    onClick={e => e.stopPropagation()}
                    className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5"
                    style={{ backgroundColor: `${Au}15`, color: Au }}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Youtube size={10} />
                    Watch
                  </a>

                  <div className="text-2xl mb-2">{biz.emoji}</div>
                  <div className="text-xs font-medium leading-tight" style={{ color: G }}>
                    {biz.name}
                  </div>

                  {/* Expand indicator */}
                  <div className="mt-2 flex items-center gap-1 text-[10px] opacity-40" style={{ color: G }}>
                    {isActive ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    {isActive ? "Collapse" : "Explore"}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 opacity-40">
            <Search size={32} className="mx-auto mb-3" style={{ color: G }} />
            <p className="text-sm" style={{ color: G }}>No businesses match "{query}"</p>
          </div>
        )}

        {/* Expanded Detail Panel */}
        {selectedBiz && (
          <div
            className="rounded-3xl border mb-10 overflow-hidden"
            style={{ backgroundColor: "#fff", borderColor: `${G}15` }}
          >
            {/* Panel Header */}
            <div
              className="px-6 py-5 border-b flex items-center justify-between"
              style={{ borderColor: `${G}10`, backgroundColor: `${G}04` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedBiz.emoji}</span>
                <div>
                  <h2 className="text-base font-semibold" style={{ color: G }}>
                    {selectedBiz.name}
                  </h2>
                  <p className="text-xs opacity-50" style={{ color: G }}>
                    Select a category to explore
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedBiz.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium rounded-xl px-3 py-2 border transition-all hover:opacity-80"
                  style={{ borderColor: `${Au}30`, color: Au, backgroundColor: `${Au}08` }}
                >
                  <Youtube size={13} />
                  Watch Video
                </a>
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs opacity-40 hover:opacity-70 px-3 py-2"
                  style={{ color: G }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto border-b" style={{ borderColor: `${G}08` }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActiveTab(cat.key)}
                  className="flex items-center gap-2 px-5 py-3.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all shrink-0"
                  style={{
                    borderBottomColor: activeTab === cat.key ? cat.color : "transparent",
                    color: activeTab === cat.key ? cat.color : `${G}60`,
                    backgroundColor: activeTab === cat.key ? `${cat.color}06` : "transparent",
                  }}
                >
                  <span style={{ color: activeTab === cat.key ? cat.color : `${G}50` }}>
                    {cat.icon}
                  </span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Category Items */}
            <div className="p-6">
              {CATEGORIES.filter(c => c.key === activeTab).map(cat => {
                const items = selectedBiz[cat.key];
                return (
                  <div key={cat.key}>
                    <div className="flex items-center gap-2 mb-4">
                      <span style={{ color: cat.color }}>{cat.icon}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cat.color }}>
                        {cat.label}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl px-4 py-3 border"
                          style={{ borderColor: `${G}08`, backgroundColor: `${G}02` }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-sm" style={{ color: G }}>
                              {item}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              openChat(
                                `I need help with "${item}" for my ${selectedBiz.name} business. This falls under ${cat.label}. Please tell me more about this and how HAMZURY can help.`
                              )
                            }
                            className="text-[11px] font-medium shrink-0 ml-4 px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                            style={{ backgroundColor: `${cat.color}12`, color: cat.color }}
                          >
                            Learn More
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* CTA at bottom of category */}
                    <div className="mt-5 pt-4 border-t" style={{ borderColor: `${G}08` }}>
                      <Button
                        className="rounded-xl px-5 py-2.5 text-sm font-medium"
                        style={{ backgroundColor: G, color: "#fff" }}
                        onClick={() =>
                          openChat(
                            `I want to discuss ${cat.label} for my ${selectedBiz.name} business. Can you help me understand what I need and how HAMZURY can support me?`
                          )
                        }
                      >
                        <MessageCircle size={14} className="mr-2 inline" />
                        Discuss {cat.label} with Us
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Others CTA */}
        <div
          className="rounded-3xl border px-6 py-8 flex flex-col sm:flex-row items-center gap-5"
          style={{ borderColor: `${Au}20`, backgroundColor: `${Au}06` }}
        >
          <div className="flex-1">
            <h3 className="text-base font-semibold mb-1.5" style={{ color: G }}>
              Don't see your business here?
            </h3>
            <p className="text-sm opacity-60 leading-relaxed" style={{ color: G }}>
              Tell us your vision and goals — we'll help you figure out the right business structure, documents, and digital setup from scratch.
            </p>
          </div>
          <Button
            className="rounded-xl px-6 py-3 text-sm font-medium shrink-0"
            style={{ backgroundColor: G, color: "#fff" }}
            onClick={() =>
              openChat(
                "I don't see my business type listed. I want to discuss my vision and goals so you can recommend the right business structure, documents, and digital tools for me."
              )
            }
          >
            <MessageCircle size={15} className="mr-2 inline" />
            Talk to Us
          </Button>
        </div>
      </div>
    </div>
  );
}
