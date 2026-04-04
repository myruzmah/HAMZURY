import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send, Loader2, MoreVertical, Phone, Star, Minus, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════════════════════════
   HAMZURY v7 CHAT WIDGET
   One calm, human, premium advisor. Not a menu machine. Not three bots.
   ═══════════════════════════════════════════════════════════════════════ */

type Department = "general" | "bizdoc" | "systemise" | "skills";

/* ── Translations for all static chat text ── */
const TRANSLATIONS: Record<string, Record<string, string>> = {
  English: {
    welcome: "Welcome to HAMZURY. Tell me what you need help with, and I will guide you to the right next step.",
    welcomeBack: "Welcome back, {name}. How can I help you today?",
    startRequest: "Start a request",
    trackWork: "Track my work",
    helpChoose: "Help me choose",
    positioning: "Positioning Guide",
    cantExplain: "I can't explain my problem",
    specificService: "I came for a specific service",
    viewUpdates: "View updates",
    continueRequest: "Continue my request",
    uploadNeeded: "Upload what you need",
    askAboutCase: "Ask about this case",
    recommendedService: "See recommended next service",
    talkSupport: "Talk to support",
    letsStart: "Yes, let's start",
    tellMore: "Tell me more first",
    bookCall: "Book a call instead",
    startMyRequest: "Start my request",
    keepChatting: "Keep chatting",
    howToPay: "How do I pay?",
    canBeFaster: "Can it be faster?",
    whatDoINeed: "What do I need to start?",
    seeExamples: "Can I see examples?",
    whenStart: "When does it start?",
    taxPenalties: "Am I owing penalties?",
    whatBusinessNeeds: "What does my business need?",
    whatSystems: "What systems do I need?",
    whichProgram: "Which program fits me?",
    tellMeMore: "Tell me more",
    letsGetStarted: "Let's get started",
    newChat: "Welcome to HAMZURY. Tell me what you need help with.",
    ourServices: "Our Services",
    talkToUs: "Talk to Us",
    trackProject: "Track My Project",
    completeCheckup: "Complete Checkup",
  },
  Hausa: {
    welcome: "Barka da zuwa HAMZURY. Gaya mani abin da kake bukata, zan jagorance ka zuwa matakin da ya dace.",
    welcomeBack: "Barka da dawowa, {name}. Ta yaya zan taimaka maka yau?",
    startRequest: "Fara bukata",
    trackWork: "Bi sawun aikina",
    helpChoose: "Taimaka ni zabar",
    positioning: "Jagorar Matsayi",
    cantExplain: "Ba zan iya bayyana matsalata ba",
    specificService: "Na zo domin wani sabis na musamman",
    viewUpdates: "Duba sabuntawa",
    continueRequest: "Ci gaba da bukata",
    uploadNeeded: "Aika abin da ake bukata",
    askAboutCase: "Tambaya game da wannan",
    recommendedService: "Duba sabis na gaba",
    talkSupport: "Yi magana da taimako",
    letsStart: "Ee, mu fara",
    tellMore: "Gaya mani karin bayani",
    bookCall: "Yi booking na kira",
    startMyRequest: "Fara bukata ta",
    keepChatting: "Ci gaba da magana",
    howToPay: "Ta yaya zan biya?",
    canBeFaster: "Za a iya yi da sauri?",
    whatDoINeed: "Me nake bukata don farawa?",
    seeExamples: "Zan iya ganin misali?",
    whenStart: "Yaushe zai fara?",
    taxPenalties: "Ina da tara?",
    whatBusinessNeeds: "Me kasuwancina yake bukata?",
    whatSystems: "Wane tsari nake bukata?",
    whichProgram: "Wane shiri ya dace da ni?",
    tellMeMore: "Gaya mani kari",
    letsGetStarted: "Mu fara",
    newChat: "Barka da zuwa HAMZURY. Gaya mani abin da kake bukata.",
    ourServices: "Sabis Dinmu",
    talkToUs: "Yi Magana Da Mu",
    trackProject: "Bi Sawun Aikina",
    completeCheckup: "Duba Kasuwanci",
  },
  Yoruba: {
    welcome: "Kaabo si HAMZURY. So fun mi ohun ti o nilo iranlowo pelu, emi yoo to o si igbesẹ to dara.",
    welcomeBack: "Kaabo pada, {name}. Bawo ni mo ṣe le ran ọ lọwọ loni?",
    startRequest: "Bẹrẹ ibeere",
    trackWork: "Tọpa iṣẹ mi",
    helpChoose: "Ran mi lọwọ lati yan",
    positioning: "Itọsọna Ipo",
    cantExplain: "Mi o le ṣalaye iṣoro mi",
    specificService: "Mo wa fun iṣẹ kan pato",
    viewUpdates: "Wo awọn imudojuiwọn",
    continueRequest: "Tẹsiwaju ibeere mi",
    uploadNeeded: "Fi ohun ti o nilo ranṣẹ",
    askAboutCase: "Beere nipa eyi",
    recommendedService: "Wo iṣẹ to tẹle",
    talkSupport: "Ba atilẹyin sọrọ",
    letsStart: "Bẹẹni, jẹ ka bẹrẹ",
    tellMore: "Sọ fun mi diẹ sii",
    bookCall: "Ṣe ipade ipe kan",
    startMyRequest: "Bẹrẹ ibeere mi",
    keepChatting: "Tẹsiwaju sisọrọ",
    howToPay: "Bawo ni mo ṣe le san?",
    canBeFaster: "Ṣe o le yara ju?",
    whatDoINeed: "Kini mo nilo lati bẹrẹ?",
    seeExamples: "Ṣe mo le ri apẹẹrẹ?",
    whenStart: "Nigbawo ni yoo bẹrẹ?",
    taxPenalties: "Ṣe mo jẹ owo iya?",
    whatBusinessNeeds: "Kini iṣowo mi nilo?",
    whatSystems: "Awọn eto wo ni mo nilo?",
    whichProgram: "Eto wo ni o dara fun mi?",
    tellMeMore: "Sọ fun mi sii",
    letsGetStarted: "Jẹ ka bẹrẹ",
    newChat: "Kaabo si HAMZURY. So fun mi ohun ti o nilo.",
    ourServices: "Awọn Iṣẹ Wa",
    talkToUs: "Ba Wa Sọrọ",
    trackProject: "Tẹle Iṣẹ Mi",
    completeCheckup: "Ayẹwo Iṣowo",
  },
  Igbo: {
    welcome: "Nnọọ na HAMZURY. Gwa m ihe ị chọrọ enyemaka, m ga-eduzi gị na nzọụkwụ ziri ezi.",
    welcomeBack: "Nnọọ azụ, {name}. Kedu ka m ga-esi nyere gị aka taa?",
    startRequest: "Malite arịrịọ",
    trackWork: "Soro ọrụ m",
    helpChoose: "Nyere m aka ịhọrọ",
    positioning: "Ntuziaka Ọnọdụ",
    cantExplain: "Enweghị m ike ịkọwa nsogbu m",
    specificService: "Abịara m maka otu ọrụ",
    viewUpdates: "Lee mmelite",
    continueRequest: "Gaa n'ihu",
    uploadNeeded: "Zipu ihe achọrọ",
    askAboutCase: "Jụọ banyere nke a",
    recommendedService: "Lee ọrụ na-esote",
    talkSupport: "Kpọọ ndị nkwado",
    letsStart: "Ee, ka anyị malite",
    tellMore: "Gwa m karịa",
    bookCall: "Debe oku",
    startMyRequest: "Malite arịrịọ m",
    keepChatting: "Gaa n'ihu ikwu okwu",
    howToPay: "Kedu ka m ga-esi kwụọ ụgwọ?",
    canBeFaster: "Ọ nwere ike ịdị ọsọ?",
    whatDoINeed: "Gịnị ka m chọrọ iji malite?",
    seeExamples: "Enwere m ike ịhụ ọmụmaatụ?",
    whenStart: "Kedu mgbe ọ ga-amalite?",
    taxPenalties: "A na m eji ụtụ isi?",
    whatBusinessNeeds: "Gịnị ka azụmaahịa m chọrọ?",
    whatSystems: "Kedu usoro m chọrọ?",
    whichProgram: "Kedu mmemme dabara m?",
    tellMeMore: "Gwa m karịa",
    letsGetStarted: "Ka anyị malite",
    newChat: "Nnọọ na HAMZURY. Gwa m ihe ị chọrọ.",
    ourServices: "Ọrụ Anyị",
    talkToUs: "Kpọtụrụ Anyị",
    trackProject: "Soro Ọrụ M",
    completeCheckup: "Nyocha Azụmaahịa",
  },
  Arabic: {
    welcome: "مرحباً بك في HAMZURY. أخبرني بما تحتاج مساعدة فيه، وسأرشدك إلى الخطوة الصحيحة.",
    welcomeBack: "مرحباً بعودتك، {name}. كيف يمكنني مساعدتك اليوم؟",
    startRequest: "ابدأ طلب",
    trackWork: "تتبع عملي",
    helpChoose: "ساعدني في الاختيار",
    positioning: "دليل التمركز",
    cantExplain: "لا أستطيع شرح مشكلتي",
    specificService: "جئت لخدمة محددة",
    viewUpdates: "عرض التحديثات",
    continueRequest: "متابعة طلبي",
    uploadNeeded: "ارفع ما تحتاجه",
    askAboutCase: "اسأل عن هذه الحالة",
    recommendedService: "الخدمة الموصى بها",
    talkSupport: "تحدث مع الدعم",
    letsStart: "نعم، لنبدأ",
    tellMore: "أخبرني المزيد",
    bookCall: "احجز مكالمة",
    startMyRequest: "ابدأ طلبي",
    keepChatting: "تابع المحادثة",
    howToPay: "كيف أدفع؟",
    canBeFaster: "هل يمكن أسرع؟",
    whatDoINeed: "ماذا أحتاج للبدء؟",
    seeExamples: "هل يمكنني رؤية أمثلة؟",
    whenStart: "متى يبدأ؟",
    taxPenalties: "هل علي غرامات؟",
    whatBusinessNeeds: "ماذا يحتاج عملي؟",
    whatSystems: "ما الأنظمة التي أحتاجها؟",
    whichProgram: "أي برنامج يناسبني؟",
    tellMeMore: "أخبرني المزيد",
    letsGetStarted: "لنبدأ",
    newChat: "مرحباً بك في HAMZURY. أخبرني بما تحتاج.",
    ourServices: "خدماتنا",
    talkToUs: "تحدث معنا",
    trackProject: "تتبع مشروعي",
    completeCheckup: "فحص شامل",
  },
  French: {
    welcome: "Bienvenue chez HAMZURY. Dites-moi ce dont vous avez besoin, et je vous guiderai vers la bonne étape.",
    welcomeBack: "Bon retour, {name}. Comment puis-je vous aider aujourd'hui?",
    startRequest: "Commencer une demande",
    trackWork: "Suivre mon dossier",
    helpChoose: "Aidez-moi à choisir",
    positioning: "Guide de positionnement",
    cantExplain: "Je ne sais pas expliquer mon problème",
    specificService: "Je viens pour un service précis",
    viewUpdates: "Voir les mises à jour",
    continueRequest: "Continuer ma demande",
    uploadNeeded: "Envoyer les documents",
    askAboutCase: "Poser une question",
    recommendedService: "Service recommandé",
    talkSupport: "Parler au support",
    letsStart: "Oui, commençons",
    tellMore: "Dites-moi en plus",
    bookCall: "Réserver un appel",
    startMyRequest: "Lancer ma demande",
    keepChatting: "Continuer à discuter",
    howToPay: "Comment payer?",
    canBeFaster: "Peut-on aller plus vite?",
    whatDoINeed: "De quoi ai-je besoin?",
    seeExamples: "Puis-je voir des exemples?",
    whenStart: "Quand ça commence?",
    taxPenalties: "Ai-je des pénalités?",
    whatBusinessNeeds: "De quoi mon entreprise a besoin?",
    whatSystems: "Quels systèmes me faut-il?",
    whichProgram: "Quel programme me convient?",
    tellMeMore: "En savoir plus",
    letsGetStarted: "Commençons",
    newChat: "Bienvenue chez HAMZURY. Dites-moi ce dont vous avez besoin.",
    ourServices: "Nos Services",
    talkToUs: "Contactez-nous",
    trackProject: "Suivre Mon Projet",
    completeCheckup: "Bilan Complet",
  },
  Chinese: {
    welcome: "欢迎来到HAMZURY。告诉我您需要什么帮助，我将引导您到正确的下一步。",
    welcomeBack: "欢迎回来，{name}。今天我能帮您什么？",
    startRequest: "开始请求",
    trackWork: "跟踪我的工作",
    helpChoose: "帮我选择",
    positioning: "定位指南",
    cantExplain: "我无法解释我的问题",
    specificService: "我来找特定服务",
    viewUpdates: "查看更新",
    continueRequest: "继续我的请求",
    uploadNeeded: "上传所需文件",
    askAboutCase: "询问此案例",
    recommendedService: "推荐的下一个服务",
    talkSupport: "联系支持",
    letsStart: "好的，开始吧",
    tellMore: "告诉我更多",
    bookCall: "预约电话",
    startMyRequest: "开始我的请求",
    keepChatting: "继续聊天",
    howToPay: "如何付款？",
    canBeFaster: "能更快吗？",
    whatDoINeed: "我需要什么才能开始？",
    seeExamples: "能看看例子吗？",
    whenStart: "什么时候开始？",
    taxPenalties: "我有罚款吗？",
    whatBusinessNeeds: "我的业务需要什么？",
    whatSystems: "我需要什么系统？",
    whichProgram: "哪个项目适合我？",
    tellMeMore: "告诉我更多",
    letsGetStarted: "开始吧",
    newChat: "欢迎来到HAMZURY。告诉我您需要什么。",
    ourServices: "我们的服务",
    talkToUs: "联系我们",
    trackProject: "跟踪我的项目",
    completeCheckup: "全面诊断",
  },
};

/** Get translated text for current language */
function t(lang: string, key: string, vars?: Record<string, string>): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.English;
  let text = dict[key] || TRANSLATIONS.English[key] || key;
  if (vars) { for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, v); }
  return text;
}

/* ── Service Pitch Data with amounts for checklist pricing ── */
type PitchItem = { name: string; price: string; amount: number };
const SERVICE_PITCH_MAP: Record<string, { dept: Department; pitch: string; items: PitchItem[] }> = {
  /* ═══════════════════════════════════════════════════════════
     PACKAGES — shown first, higher ticket, less decision fatigue
     ═══════════════════════════════════════════════════════════ */
  "BizDoc Packages": { dept: "bizdoc", pitch: "Most serious businesses need more than one thing. Our packs save you money and get everything done at once. Pick the level that fits where you are:", items: [
    { name: "BizDoc Starter (CAC Ltd + TIN + Bank + Seal)", price: "₦250,000", amount: 250000 },
    { name: "BizDoc Pro (Starter + Tax Filing + Compliance Mgmt)", price: "₦400,000", amount: 400000 },
    { name: "BizDoc Complete (Pro + Legal Pack + Sector Licence)", price: "₦600,000", amount: 600000 },
    { name: "I just need one service", price: "See individual", amount: 0 },
  ] },
  "Systemise Packages": { dept: "systemise", pitch: "Building a brand without systems is like opening a shop with no signboard. Our packs give you the full digital foundation:", items: [
    { name: "Digital Starter (Brand Identity + Landing Page)", price: "₦350,000", amount: 350000 },
    { name: "Business Launch (Brand + Website + Social Setup)", price: "₦500,000", amount: 500000 },
    { name: "Full Business Architecture (Brand + Web + Social + CRM + AI)", price: "From ₦1,200,000", amount: 1200000 },
    { name: "I just need one service", price: "See individual", amount: 0 },
  ] },
  "Skills Packages": { dept: "skills", pitch: "Learn the skills that make your business run smarter. Pick a program or bundle for your whole team:", items: [
    { name: "Founder Fast Track (AI Launchpad + Vibe Coding)", price: "₦120,000", amount: 120000 },
    { name: "Full Founder Bundle (All 3 programs + Mentorship)", price: "₦200,000", amount: 200000 },
    { name: "Corporate Team Package (Staff Training + Curriculum)", price: "From ₦350,000", amount: 350000 },
    { name: "I want a single program", price: "See programs", amount: 0 },
  ] },
  /* ═══════════════════════════════════════════════════════════
     INDIVIDUAL SERVICES — BizDoc
     ═══════════════════════════════════════════════════════════ */
  "Business Registration": { dept: "bizdoc", pitch: "There are 3 types of CAC registration. Each serves a different purpose:\n\nBusiness Name — For sole traders and small operations. Cheapest but limited. Cannot bid for contracts or open a corporate account.\n\nLimited Company (Ltd) — For serious businesses. Separate legal entity, can bid for contracts, open corporate accounts, attract investors, and protect your personal assets. Most businesses choose this.\n\nIncorporated Trustee (NGO) — For non-profits, foundations, and community organizations.\n\nTax note: Only Ltd companies can get Tax Clearance Certificates (TCC) needed for government contracts.\n\nChoose your type:", items: [
    { name: "CAC Business Name", price: "₦50,000", amount: 50000 }, { name: "CAC Limited Company (Recommended)", price: "₦150,000", amount: 150000 }, { name: "CAC Incorporated Trustee (NGO)", price: "₦200,000", amount: 200000 }, { name: "Post-Registration Pack (TIN + Bank + Seal)", price: "₦80,000", amount: 80000 }] },
  "Tax Compliance": { dept: "bizdoc", pitch: "Tax Compliance keeps your business penalty-free and contract-ready. Without it, you risk fines and cannot bid for tenders.", items: [
    { name: "TIN Registration", price: "₦30,000", amount: 30000 }, { name: "Annual Tax Filing", price: "₦80,000", amount: 80000 }, { name: "Tax Clearance Certificate", price: "₦100,000", amount: 100000 }, { name: "Tax Pro Max (Annual Subscription)", price: "₦150,000/yr", amount: 150000 }] },
  "Sector Licences": { dept: "bizdoc", pitch: "Sector Licences ensure you can legally operate in your industry. Operating without the right permit risks shutdown.", items: [
    { name: "NAFDAC Registration", price: "₦250,000+", amount: 250000 }, { name: "SCUML Certificate", price: "₦50,000", amount: 50000 }, { name: "NEPC Export Licence", price: "₦120,000", amount: 120000 }, { name: "Other Sector Permits", price: "From ₦60,000", amount: 60000 }] },
  "Foreign Business": { dept: "bizdoc", pitch: "Foreign Business services help non-Nigerians set up legally in Nigeria. CAMA 2020 compliance, residence permits, and business permits.", items: [
    { name: "Expatriate Quota", price: "₦350,000+", amount: 350000 }, { name: "CERPAC Residence Permit", price: "₦200,000+", amount: 200000 }, { name: "Business Permit", price: "₦250,000+", amount: 250000 }, { name: "Full Foreign Setup Pack", price: "₦800,000+", amount: 800000 }] },
  "Legal Documents": { dept: "bizdoc", pitch: "Legal Documents protect your business relationships and operations. Without proper contracts, you have no legal recourse.", items: [
    { name: "Contract Templates", price: "₦40,000", amount: 40000 }, { name: "Custom Legal Drafting", price: "₦80,000+", amount: 80000 }, { name: "NDA Pack", price: "₦35,000", amount: 35000 }, { name: "Full Document Pack", price: "₦60,000", amount: 60000 }] },
  /* ═══════════════════════════════════════════════════════════
     INDIVIDUAL SERVICES — Systemise
     ═══════════════════════════════════════════════════════════ */
  "Brand Identity": { dept: "systemise", pitch: "Brand Identity builds the visual foundation that makes clients trust you before they even speak to you. Every touchpoint matters.", items: [
    { name: "Logo Design", price: "₦80,000", amount: 80000 }, { name: "Full Brand System (Logo + Colors + Guidelines + Stationery)", price: "₦350,000", amount: 350000 }, { name: "Social Media Brand Kit", price: "₦60,000", amount: 60000 }] },
  "Website Design": { dept: "systemise", pitch: "Your website is your 24/7 salesperson. It should convert visitors into clients, not just look pretty.", items: [
    { name: "Landing Page (1 page)", price: "₦200,000", amount: 200000 }, { name: "Business Website (5-8 pages)", price: "₦400,000", amount: 400000 }, { name: "E-commerce Store", price: "₦500,000+", amount: 500000 }, { name: "Portal / Dashboard", price: "₦600,000+", amount: 600000 }] },
  "Social Media": { dept: "systemise", pitch: "Social Media Management builds your audience and turns followers into paying clients. Consistency wins.", items: [
    { name: "2 Platforms (IG + FB)", price: "₦200,000/mo", amount: 200000 }, { name: "Full Management (All Platforms)", price: "₦400,000/mo", amount: 400000 }, { name: "Content Only (Posts + Reels)", price: "₦120,000/mo", amount: 120000 }] },
  "CRM & Automation": { dept: "systemise", pitch: "CRM & Automation eliminates repeated manual work so you can focus on growing.", items: [
    { name: "CRM Setup", price: "₦200,000", amount: 200000 }, { name: "Workflow Automation", price: "₦150,000+", amount: 150000 }, { name: "AI Agent Build", price: "₦300,000+", amount: 300000 }, { name: "Lead Generation Pipeline", price: "₦180,000", amount: 180000 }] },
  "AI & Automation": { dept: "systemise", pitch: "AI & Automation lets your business run smarter with less manual work. Pick what fits your operation.", items: [
    { name: "AI Customer Support Agent", price: "₦250,000", amount: 250000 }, { name: "AI Lead Qualifier Bot", price: "₦200,000", amount: 200000 }, { name: "Invoice & Payment Automation", price: "₦150,000", amount: 150000 }, { name: "Workflow Automation Suite", price: "₦300,000+", amount: 300000 }, { name: "Custom AI Agent (Bespoke)", price: "₦400,000+", amount: 400000 }] },
  /* ═══════════════════════════════════════════════════════════
     INDIVIDUAL SERVICES — Skills
     ═══════════════════════════════════════════════════════════ */
  "AI Founder Launchpad": { dept: "skills", pitch: "AI Founder Launchpad teaches you to build, launch, and grow a business using AI tools. 6-week intensive program.", items: [
    { name: "Full Program (6 weeks)", price: "₦75,000", amount: 75000 }, { name: "Mentorship Add-on", price: "₦30,000", amount: 30000 }, { name: "Certificate + Portfolio", price: "₦15,000", amount: 15000 }] },
  "Vibe Coding": { dept: "skills", pitch: "Vibe Coding for Founders teaches you to build apps and websites without a traditional coding background. Build real products.", items: [
    { name: "Full Program (6 weeks)", price: "₦65,000", amount: 65000 }, { name: "Project Review Add-on", price: "₦20,000", amount: 20000 }] },
  "Corporate Training": { dept: "skills", pitch: "Corporate Staff Training upskills your entire team on AI tools, automation, and digital operations. Customized for your business.", items: [
    { name: "Half-Day Workshop (up to 20)", price: "₦200,000", amount: 200000 }, { name: "Full-Day Workshop (up to 20)", price: "₦350,000", amount: 350000 }, { name: "2-Week Staff Program", price: "₦500,000+", amount: 500000 }, { name: "Custom Curriculum Design", price: "₦150,000", amount: 150000 }] },
  /* ═══════════════════════════════════════════════════════════
     ADDITIONAL SERVICES
     ═══════════════════════════════════════════════════════════ */
  "SEO & AEO": { dept: "systemise" as Department, pitch: "Search visibility is everything. We'll make sure your business shows up where it matters — Google, ChatGPT, and beyond.", items: [
    { name: "Google Ranking Setup", price: "₦120,000", amount: 120000 }, { name: "AI Answer Optimization", price: "₦150,000", amount: 150000 }, { name: "Content Strategy (3 months)", price: "₦200,000", amount: 200000 }, { name: "Full SEO + AEO Package", price: "₦400,000", amount: 400000 }] },
  "Renewals": { dept: "bizdoc" as Department, pitch: "Keeping your business compliant means zero surprises. Let's renew what's due.", items: [
    { name: "CAC Annual Returns", price: "₦50,000", amount: 50000 }, { name: "Tax Clearance Certificate (1 year)", price: "₦90,000", amount: 90000 }, { name: "PENCOM Clearance", price: "₦75,000", amount: 75000 }, { name: "VAT Registration + Filing", price: "₦50,000", amount: 50000 }, { name: "Industry Licence Renewal", price: "Varies", amount: 0 }] },
  "Dashboards": { dept: "systemise" as Department, pitch: "See your entire business at a glance. We build dashboards that turn data into decisions.", items: [
    { name: "Business Analytics Dashboard", price: "₦250,000", amount: 250000 }, { name: "Compliance Dashboard", price: "₦200,000", amount: 200000 }, { name: "Custom Reports System", price: "₦180,000", amount: 180000 }] },
};

/** Match a chat context string to a known service */
function matchServicePitch(context: string): typeof SERVICE_PITCH_MAP[string] | null {
  const lower = context.toLowerCase();
  // Exact key match first
  for (const [key, val] of Object.entries(SERVICE_PITCH_MAP)) {
    if (lower.includes(key.toLowerCase())) return val;
  }
  // Partial / alias matching for new categories
  const aliases: [string[], string][] = [
    [["renewal", "renew", "annual return", "clearance renewal"], "Renewals"],
    [["seo", "aeo", "search engine", "google ranking", "answer engine"], "SEO & AEO"],
    [["dashboard", "analytics dashboard", "reporting", "custom reports"], "Dashboards"],
  ];
  for (const [keywords, pitchKey] of aliases) {
    if (keywords.some(k => lower.includes(k)) && SERVICE_PITCH_MAP[pitchKey]) return SERVICE_PITCH_MAP[pitchKey];
  }
  return null;
}

/** Generate contextual suggestion buttons based on AI response */
/** Map keywords in AI response to SERVICE_PITCH_MAP keys */
function detectPitchFromResponse(text: string): string | null {
  const lower = text.toLowerCase();
  const map: [string[], string][] = [
    [["registration", "cac", "incorporate"], "Business Registration"],
    [["tax", "tin", "tcc", "firs", "annual return"], "Tax Compliance"],
    [["licence", "permit", "nafdac", "scuml", "nepc", "son"], "Sector Licences"],
    [["foreign", "expatriate", "cerpac", "expat"], "Foreign Business"],
    [["contract", "legal", "nda", "agreement", "document"], "Legal Documents"],
    [["brand", "logo", "identity", "visual"], "Brand Identity"],
    [["website", "landing page", "web design", "web dev"], "Website Design"],
    [["social media", "instagram", "tiktok", "content", "posting"], "Social Media"],
    [["crm", "lead generation", "pipeline"], "CRM & Automation"],
    [["ai agent", "bot", "chatbot", "automation", "workflow"], "AI & Automation"],
    [["training", "course", "program", "cohort", "launchpad"], "AI Founder Launchpad"],
    [["corporate training", "staff training", "team training"], "Corporate Training"],
    [["coding", "vibe coding", "app building"], "Vibe Coding"],
    [["seo", "aeo", "search engine", "google ranking", "answer engine"], "SEO & AEO"],
    [["renewal", "renew", "annual return", "clearance renewal", "pencom"], "Renewals"],
    [["dashboard", "analytics dashboard", "reporting", "custom reports"], "Dashboards"],
  ];
  for (const [keywords, pitchKey] of map) {
    if (keywords.some(k => lower.includes(k)) && SERVICE_PITCH_MAP[pitchKey]) return pitchKey;
  }
  return null;
}

/** Detect if conversation involves renewal/upgrade */
function isRenewalContext(text: string): boolean {
  const lower = text.toLowerCase();
  return ["renewal", "renew", "upgrade", "annual return", "expiring", "expired", "re-registration", "reregist"].some(k => lower.includes(k));
}

function getSuggestedSteps(aiResponse: string, dept: Department, exchangeCount: number): { label: string; value: string }[] {
  const lower = aiResponse.toLowerCase();
  const suggestions: { label: string; value: string }[] = [];

  // Price-related
  if (lower.includes("₦") || lower.includes("price") || lower.includes("cost") || lower.includes("from"))
    suggestions.push({ label: "How do I pay?", value: "How do I make payment?" });
  // Timeline
  if (lower.includes("days") || lower.includes("week") || lower.includes("timeline"))
    suggestions.push({ label: "Can it be faster?", value: "Can the timeline be shorter if I pay now?" });
  // Documents
  if (lower.includes("document") || lower.includes("registration") || lower.includes("cac"))
    suggestions.push({ label: "What do I need to start?", value: "What documents or info do I need to get started?" });
  // Website/brand
  if (lower.includes("website") || lower.includes("brand") || lower.includes("design"))
    suggestions.push({ label: "Can I see examples?", value: "Can you show me examples of your work?" });
  // Programs
  if (lower.includes("program") || lower.includes("cohort") || lower.includes("training"))
    suggestions.push({ label: "When does it start?", value: "When does the next cohort start and how do I apply?" });
  // Tax
  if (lower.includes("tax") || lower.includes("tin") || lower.includes("tcc"))
    suggestions.push({ label: "Am I owing penalties?", value: "How do I know if my business has tax penalties?" });

  // Package suggestions — always try to upsell to a package
  if (suggestions.length < 2 && !lower.includes("pack") && !lower.includes("bundle")) {
    if (dept === "bizdoc") suggestions.push({ label: "See BizDoc Packages", value: "What packages do you have for BizDoc? I want to save money by bundling." });
    else if (dept === "systemise") suggestions.push({ label: "See Systemise Packages", value: "What packages do you have for digital services? I want to save money by bundling." });
    else if (dept === "skills") suggestions.push({ label: "See Skills Bundles", value: "What program bundles do you have? I want to save money." });
  }

  // General fallbacks if no specific match
  if (suggestions.length === 0) {
    if (dept === "bizdoc") suggestions.push({ label: "What does my business need?", value: "Based on my business type, what compliance package do I need?" });
    else if (dept === "systemise") suggestions.push({ label: "What systems do I need?", value: "What digital package would benefit my business most?" });
    else if (dept === "skills") suggestions.push({ label: "Which program fits me?", value: "Based on my goals, which program bundle should I join?" });
    else suggestions.push({ label: "Tell me more", value: "Can you explain that in more detail?" });
  }

  // After 2+ exchanges: show service checklist button OR renewal route
  if (exchangeCount >= 2) {
    if (isRenewalContext(aiResponse)) {
      suggestions.push({ label: "Talk to team about renewal", value: "AI_RENEWAL" });
    } else {
      suggestions.push({ label: "Let's get started", value: "AI_CLOSE_YES" });
    }
  }

  return suggestions.slice(0, 3);
}

type ChatMessage = {
  sender: "bot" | "user";
  text?: string;
  buttons?: { label: string; value: string }[];
};

type ChatState =
  | "INIT"
  | "LANG_SELECT"
  | "MAIN_MENU"
  | "AI_CHAT"
  | "SERVICES_DEPT"
  | "SERVICES_LIST"
  | "SERVICE_PITCH"
  | "SERVICE_CHECKOUT"
  | "TALK_OPTIONS"
  | "TALK_MESSAGE"
  | "CONSULTATION"
  | "TRACK_REF"
  | "LEAD_NAME"
  | "LEAD_BIZ"
  | "LEAD_PHONE"
  | "LEAD_EMAIL"
  | "PAYMENT_STAGE"
  | "UPSELL_STAGE"
  | "SCHEDULE_NAME"
  | "SCHEDULE_DATE"
  | "SCHEDULE_TIME"
  | "SCHEDULE_PHONE"
  | "SUCCESS";

type LeadData = {
  service?: string;
  context?: string;
  name?: string;
  businessName?: string;
  phone?: string;
  email?: string;
  schedDate?: string;
  schedTime?: string;
  selectedServices?: string[];
  referralCode?: string;
  referrerName?: string;
  referralSourceType?: string;
  notifyCso?: boolean;
  department?: string;
};

type Props = {
  department?: Department;
  /** Controlled mode — no floating button */
  open?: boolean;
  onClose?: () => void;
  /** Dashboard mode — show dashboard-specific buttons and tone preference */
  isDashboard?: boolean;
};

/* ── Brand constants ── */
const CHARCOAL = "#2D2D2D";
const GOLD = "#B48C4C";
const CREAM = "#FFFAF6";
const DARK = "#1A1A1A";

/** Department brand colors — header bg + accent per department */
const DEPT_BRAND: Record<Department, { header: string; accent: string; name: string }> = {
  general:   { header: "#0A1F1C", accent: "#C9A97E", name: "HAMZURY" },
  bizdoc:    { header: "#1B4D3E", accent: "#C9A97E", name: "BizDoc" },
  systemise: { header: "#2563EB", accent: "#C9A97E", name: "Systemise" },
  skills:    { header: "#1B2A4A", accent: "#C9A97E", name: "Skills" },
};

/* ── Service catalog with pricing (Packages first, then individual) ── */
const SERVICES: Record<string, { label: string; value: string; price: string; amount: number }[]> = {
  bizdoc: [
    // Packages — shown first
    { label: "⭐ BizDoc Starter Pack (CAC Ltd + TIN + Bank + Seal)", value: "BizDocStarter", price: "₦250,000", amount: 250000 },
    { label: "⭐ BizDoc Pro Pack (Starter + Tax + Compliance)", value: "BizDocPro", price: "₦400,000", amount: 400000 },
    { label: "⭐ BizDoc Complete (Pro + Legal + Licence)", value: "BizDocComplete", price: "₦600,000", amount: 600000 },
    // Individual
    { label: "CAC Registration", value: "CAC", price: "from ₦50,000", amount: 50000 },
    { label: "Tax Compliance (TIN/TCC)", value: "Tax", price: "from ₦30,000", amount: 30000 },
    { label: "Tax Pro Max (Annual)", value: "TaxProMax", price: "₦150,000/yr", amount: 150000 },
    { label: "Industry License or Permit", value: "License", price: "from ₦60,000", amount: 60000 },
    { label: "Legal Documentation", value: "Legal", price: "from ₦40,000", amount: 40000 },
    { label: "Foreign Business Setup", value: "Foreign", price: "from ₦350,000", amount: 350000 },
    { label: "Compliance Management Sub", value: "ComplianceMgmt", price: "₦50,000/mo", amount: 50000 },
  ],
  systemise: [
    // Packages — shown first
    { label: "⭐ Digital Starter (Brand + Landing Page)", value: "DigitalStarter", price: "₦350,000", amount: 350000 },
    { label: "⭐ Business Launch (Brand + Website + Social)", value: "BusinessLaunch", price: "₦500,000", amount: 500000 },
    { label: "⭐ Full Architecture (Brand + Web + Social + CRM + AI)", value: "FullArchitecture", price: "From ₦1,200,000", amount: 1200000 },
    // Individual
    { label: "Brand Identity", value: "Branding", price: "from ₦80,000", amount: 80000 },
    { label: "Website Design", value: "Website", price: "from ₦200,000", amount: 200000 },
    { label: "Social Media Management", value: "SocialMedia", price: "from ₦120,000/mo", amount: 120000 },
    { label: "CRM & Lead Generation", value: "CRM", price: "from ₦180,000", amount: 180000 },
    { label: "AI Agent (Custom)", value: "AIAgent", price: "from ₦200,000", amount: 200000 },
    { label: "Workflow Automation", value: "Automation", price: "from ₦150,000", amount: 150000 },
  ],
  skills: [
    // Packages — shown first
    { label: "⭐ Founder Fast Track (AI Launchpad + Vibe Coding)", value: "FounderFastTrack", price: "₦120,000", amount: 120000 },
    { label: "⭐ Full Founder Bundle (3 Programs + Mentorship)", value: "FullFounderBundle", price: "₦200,000", amount: 200000 },
    { label: "⭐ Corporate Team Package (Training + Curriculum)", value: "CorporateTeam", price: "From ₦350,000", amount: 350000 },
    // Individual
    { label: "AI Founder Launchpad", value: "AIFounder", price: "₦75,000", amount: 75000 },
    { label: "Vibe Coding for Founders", value: "VibeCoding", price: "₦65,000", amount: 65000 },
    { label: "AI Sales Operator", value: "AISales", price: "₦55,000", amount: 55000 },
    { label: "Service Business in 21 Days", value: "ServiceBiz21", price: "₦45,000", amount: 45000 },
    { label: "Operations Automation Sprint", value: "OpsSprint", price: "₦60,000", amount: 60000 },
    { label: "Corporate Staff Training", value: "CorporateTraining", price: "Contact us", amount: 0 },
    { label: "RIDI Sponsorship", value: "RIDI", price: "Sponsored", amount: 0 },
  ],
};

/* ── Payment accounts ── */
const PAYMENT_ACCOUNTS = {
  general: { bank: "Moniepoint", name: "Hamzury Ltd.", number: "8034620520" },
  bizdoc: { bank: "Moniepoint", name: "BIZDOC LTD", number: "8067149356" },
};

/* ── Typing dots ── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: CHARCOAL,
            opacity: 0.5,
            animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes typingBounce { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-4px);opacity:0.8} }`}</style>
    </div>
  );
}

export default function ChatWidget({ department = "general", open: externalOpen, onClose, isDashboard }: Props) {
  const isControlled = externalOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isOpen = isControlled ? externalOpen : internalOpen;

  const close = () => {
    if (isControlled) { setMounted(false); setTimeout(() => onClose?.(), 300); }
    else { setMounted(false); setTimeout(() => setInternalOpen(false), 300); }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [chatState, setChatState] = useState<ChatState>("INIT");
  const [leadData, setLeadData] = useState<LeadData>({});
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [checkedPitchItems, setCheckedPitchItems] = useState<Set<string>>(new Set());
  const checkedPitchRef = useRef<Set<string>>(new Set());
  const [currentPitchKey, setCurrentPitchKey] = useState<string>("");
  const [userLang, setUserLang] = useState("English");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dashboard tone preference
  const [tonePreference, setTonePreference] = useState("Professional");

  // Silent referral capture from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const source = params.get("source");
    const owner = params.get("lead_owner");
    if (ref) setLeadData(prev => ({ ...prev, referralCode: ref, referrerName: params.get("referrer") || undefined, referralSourceType: source || undefined, notifyCso: source === "CSO" }));
  }, []);

  const submitLead = trpc.leads.submit.useMutation({ onError: () => toast.error("Failed to submit. Please try again.") });
  const submitAppointment = trpc.systemise.submitAppointment.useMutation({ onError: () => toast.error("Scheduling failed.") });
  const trpcUtils = trpc.useUtils();

  // Animations
  useEffect(() => { if (isOpen) { const t = setTimeout(() => setMounted(true), 10); return () => clearTimeout(t); } }, [isOpen]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const reset = useCallback(() => {
    setMessages([]); setChatState("INIT"); setLeadData(prev => ({ referralCode: prev.referralCode, referrerName: prev.referrerName, referralSourceType: prev.referralSourceType, notifyCso: prev.notifyCso }));
    setInput(""); setInputError(""); setAiMessages([]);
  }, []);

  // Show initial flow on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Check for context passed from portal pages
      const ctx = localStorage.getItem("hamzury-chat-context");
      if (ctx) {
        localStorage.removeItem("hamzury-chat-context");
        // Check if context matches a known service → show sub-service pitch
        const pitch = matchServicePitch(ctx);
        if (pitch) {
          addBotMsg(pitch.pitch);
          setTimeout(() => {
            addBotButtons(pitch.items.map(item => ({ label: `${item.name} (${item.price})`, value: `Tell me about ${item.name}. What is included, timeline, and how to start?` })));
          }, 400);
          setChatState("AI_CHAT");
          return;
        }
        // No pitch match → send directly to AI
        addBotMsg(ctx);
        setChatState("AI_CHAT");
        handleAIChat(ctx);
        return;
      }
      // Only greet by name on dashboard — public chat has no memory
      if (isDashboard) {
        const session = loadClientSession();
        if (session?.name) {
          addBotMsg(t(userLang, "welcomeBack", { name: session.name }));
          showMainMenu();
          return;
        }
      }
      // Public chat: fresh greeting, no memory
      addBotMsg(t(userLang, "welcome"));
      showMainMenu();
    }
    if (!isOpen) reset();
  }, [isOpen]);

  // When language changes mid-conversation, restart with new language
  const prevLangRef = useRef(userLang);
  useEffect(() => {
    if (prevLangRef.current !== userLang && isOpen) {
      prevLangRef.current = userLang;
      reset();
      setTimeout(() => {
        addBotMsg(t(userLang, "welcome"));
        showMainMenu();
      }, 100);
    }
    prevLangRef.current = userLang;
  }, [userLang]);

  /* ── Helpers ── */
  const addBotMsg = (text: string) => setMessages(prev => [...prev, { sender: "bot", text }]);
  const addUserMsg = (text: string) => setMessages(prev => [...prev, { sender: "user", text }]);
  const addBotButtons = (btns: { label: string; value: string }[]) => setMessages(prev => [...prev, { sender: "bot", buttons: btns }]);

  function loadClientSession() {
    try {
      const raw = localStorage.getItem("hamzury-client-session");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) { localStorage.removeItem("hamzury-client-session"); return null; }
      return parsed;
    } catch { return null; }
  }

  function showMainMenu() {
    if (isDashboard) {
      addBotButtons([
        { label: t(userLang, "viewUpdates"), value: "DASH_UPDATES" },
        { label: t(userLang, "continueRequest"), value: "DASH_CONTINUE" },
        { label: t(userLang, "uploadNeeded"), value: "DASH_UPLOAD" },
        { label: t(userLang, "askAboutCase"), value: "AI_CHAT" },
        { label: t(userLang, "recommendedService"), value: "DASH_UPSELL" },
        { label: t(userLang, "talkSupport"), value: "TALK_SUPPORT" },
      ]);
    } else {
      addBotButtons([
        { label: t(userLang, "ourServices") || "Our Services", value: "OUR_SERVICES" },
        { label: t(userLang, "talkToUs") || "Talk to Us", value: "TALK_TO_US" },
        { label: t(userLang, "trackProject") || "Track My Project", value: "TRACK_MY_WORK" },
        { label: t(userLang, "completeCheckup") || "Complete Checkup", value: "COMPLETE_CHECKUP" },
      ]);
    }
    setChatState("MAIN_MENU");
  }

  function buildPricingSummary(services: string[], dept: string): string {
    const catalog = SERVICES[dept] || SERVICES.bizdoc;
    const lines = services.map(s => {
      const item = catalog.find(c => c.value === s);
      return item ? `${item.label}: ${item.price}` : s;
    });
    const total = services.reduce((sum, s) => {
      const item = catalog.find(c => c.value === s);
      return sum + (item?.amount || 0);
    }, 0);
    const hasCustom = services.some(s => { const item = catalog.find(c => c.value === s); return !item || item.amount === 0; });
    const totalLine = hasCustom
      ? `Estimated total: ₦${total.toLocaleString()} (plus items requiring a custom quote)`
      : `Estimated total: ₦${total.toLocaleString()}`;
    return `Here is your package summary:\n\n${lines.join("\n")}\n\n${totalLine}\n\nThis is an estimate. Final pricing depends on your specific requirements.`;
  }

  /* ── AI Chat via streaming ── */
  const handleAIChat = async (text: string) => {
    setAiLoading(true);
    const newHistory = [...aiMessages, { role: "user", content: text }];
    setAiMessages(newHistory);
    setMessages(prev => [...prev, { sender: "bot", text: "" }]);

    const endpoint = isDashboard ? "/api/chat/dashboard-message" : "/api/chat/message";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: newHistory.slice(-10).map(h => ({ role: h.role, content: h.content })),
          department,
          language: userLang,
          tone_preference: isDashboard ? tonePreference : undefined,
          context: leadData.context === "consultation" ? "consultation" : undefined,
        }),
      });

      if (!response.ok || !response.body) throw new Error("Stream failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              setMessages(prev => {
                const updated = [...prev];
                for (let i = updated.length - 1; i >= 0; i--) {
                  if (updated[i].sender === "bot" && !updated[i].buttons) { updated[i] = { ...updated[i], text: fullText }; break; }
                }
                return updated;
              });
            }
          } catch {}
        }
      }

      const answer = fullText || "Our team will answer that directly. Let me connect you.";
      setMessages(prev => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].sender === "bot" && !updated[i].buttons) { updated[i] = { ...updated[i], text: answer }; break; }
        }
        return updated;
      });
      setAiMessages(prev => [...prev, { role: "assistant", content: answer }]);

      // After every AI response, show contextual suggested next steps
      const userCount = newHistory.filter(m => m.role === "user").length;
      const lower = answer.toLowerCase();
      setTimeout(() => {
        // If AI is clearly ready to close, show closing buttons
        if (userCount >= 2 && (lower.includes("want me to") || lower.includes("ready to") || lower.includes("set this up") || lower.includes("get started") || lower.includes("proceed") || lower.includes("open a file"))) {
          addBotButtons([
            { label: t(userLang, "letsStart"), value: "AI_CLOSE_YES" },
            { label: t(userLang, "tellMore"), value: "AI_CLOSE_MORE" },
            { label: t(userLang, "bookCall"), value: "SCHEDULE" },
          ]);
        } else {
          // Show smart contextual suggestions (translated)
          const steps = getSuggestedSteps(answer, department, userCount);
          const translatedSteps = steps.map(s => {
            // Map known suggestion labels to translation keys
            const keyMap: Record<string, string> = {
              "How do I pay?": "howToPay", "Can it be faster?": "canBeFaster",
              "What do I need to start?": "whatDoINeed", "Can I see examples?": "seeExamples",
              "When does it start?": "whenStart", "Am I owing penalties?": "taxPenalties",
              "What does my business need?": "whatBusinessNeeds", "What systems do I need?": "whatSystems",
              "Which program fits me?": "whichProgram", "Tell me more": "tellMeMore",
              "Let's get started": "letsGetStarted",
            };
            const tKey = keyMap[s.label];
            return tKey ? { label: t(userLang, tKey), value: s.value } : s;
          });
          if (translatedSteps.length > 0) addBotButtons(translatedSteps);
        }
      }, 600);
    } catch {
      try {
        const result = await trpcUtils.ask.answer.fetch({ question: text });
        const answer = result.answer || "Our team will answer that directly.";
        setMessages(prev => {
          const updated = [...prev];
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].sender === "bot" && !updated[i].buttons) { updated[i] = { ...updated[i], text: answer }; break; }
          }
          return updated;
        });
        setAiMessages(prev => [...prev, { role: "assistant", content: answer }]);
      } catch {
        setMessages(prev => {
          const updated = [...prev];
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].sender === "bot" && !updated[i].buttons) { updated[i] = { ...updated[i], text: "Something went wrong. Please try again." }; break; }
          }
          return updated;
        });
      }
    } finally {
      setAiLoading(false);
    }
  };

  /* ── Input handler ── */
  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInputError("");
    addUserMsg(text);
    setInput("");

    if (chatState === "AI_CHAT" || chatState === "CONSULTATION") {
      handleAIChat(text);
      return;
    }
    processInput(text);
  };

  /* ── Button click ── */
  const handleButtonClick = (val: string, label: string) => {
    addUserMsg(label);
    processInput(val);
  };

  /* ── Core logic router ── */
  const processInput = useCallback((val: string) => {
    // Language selection
    if (chatState === "LANG_SELECT") {
      setUserLang(val);
      setTimeout(() => {
        addBotMsg("Great. Tell me what you need help with, and I will guide you to the right next step.");
        showMainMenu();
      }, 400);
      return;
    }

    // Main menu selections
    if (chatState === "MAIN_MENU") {
      // ── Our Services → if on a department page, show only that department's services directly
      if (val === "OUR_SERVICES") {
        if (department !== "general") {
          // Department-specific: go straight to that department's service list
          const dept = department;
          setLeadData(prev => ({ ...prev, department: dept, selectedServices: [] }));
          const catalog = SERVICES[dept] || [];
          setTimeout(() => {
            addBotMsg("Here is what we offer. Tap any service to learn more.");
            addBotButtons(catalog.map(s => ({ label: s.label, value: `SVC_${s.value}` })));
          }, 400);
          setChatState("SERVICES_LIST");
        } else {
          // General page: show all 3 departments
          setTimeout(() => {
            addBotMsg("We cover three areas. Which one fits what you need?");
            addBotButtons([
              { label: "Compliance & Registration (BizDoc)", value: "DEPT_BIZDOC" },
              { label: "Brand, Website & Systems (Systemise)", value: "DEPT_SYSTEMISE" },
              { label: "Training & Programs (Skills)", value: "DEPT_SKILLS" },
            ]);
          }, 400);
          setChatState("SERVICES_DEPT");
        }
        return;
      }
      // ── Talk to Us → sub-options
      if (val === "TALK_TO_US") {
        setTimeout(() => {
          addBotMsg("How would you like to connect with us?");
          addBotButtons([
            { label: "Drop a Message", value: "DROP_MESSAGE" },
            { label: "Schedule a Call", value: "SCHEDULE" },
          ]);
        }, 400);
        setChatState("TALK_OPTIONS");
        return;
      }
      // ── Track My Project
      if (val === "TRACK_MY_WORK") {
        setTimeout(() => addBotMsg("Enter your reference number to access your dashboard.\n\nExample: HMZ-26/3-1042"), 400);
        setChatState("TRACK_REF");
        return;
      }
      // ── Complete Checkup (deep consultation)
      if (val === "COMPLETE_CHECKUP") {
        setLeadData(prev => ({ ...prev, context: "consultation" }));
        setTimeout(() => addBotMsg("Welcome to your Complete Business Checkup. I will walk you through your business step by step, understand where you are, identify gaps, and show you exactly what to do next.\n\nLet us start. What is the name of your business and what do you do?"), 400);
        setChatState("CONSULTATION");
        return;
      }
      // Dashboard-specific
      if (val === "DASH_UPDATES" || val === "DASH_CONTINUE" || val === "DASH_UPSELL" || val === "DASH_UPLOAD") {
        setChatState("AI_CHAT");
        handleAIChat(val === "DASH_UPDATES" ? "Show me my latest updates" : val === "DASH_CONTINUE" ? "I want to continue my request" : val === "DASH_UPSELL" ? "What service should I consider next?" : "I need to upload something");
        return;
      }
      if (val === "TALK_SUPPORT") {
        window.open("https://wa.me/2349130700056", "_blank");
        return;
      }
      // Free text in main menu → AI chat
      setChatState("AI_CHAT");
      handleAIChat(val);
      return;
    }

    // ── Our Services: department selection
    if (chatState === "SERVICES_DEPT") {
      const deptMap: Record<string, string> = { DEPT_BIZDOC: "bizdoc", DEPT_SYSTEMISE: "systemise", DEPT_SKILLS: "skills" };
      const dept = deptMap[val];
      if (dept) {
        setLeadData(prev => ({ ...prev, department: dept, selectedServices: [] }));
        const catalog = SERVICES[dept] || [];
        setTimeout(() => {
          addBotMsg("Here is what we offer. Tap any service to learn more.");
          addBotButtons(catalog.map(s => ({ label: s.label, value: `SVC_${s.value}` })));
        }, 400);
        setChatState("SERVICES_LIST");
        return;
      }
      setChatState("AI_CHAT");
      handleAIChat(val);
      return;
    }

    // ── Services list: show pitch for selected service
    // ── Services list: tap a service → show checklist pitch
    if (chatState === "SERVICES_LIST") {
      if (val.startsWith("SVC_")) {
        const svcValue = val.slice(4);
        const dept = leadData.department || "bizdoc";
        const catalog = SERVICES[dept] || [];
        const item = catalog.find(s => s.value === svcValue);
        if (item) {
          setLeadData(prev => ({ ...prev, service: item.label, selectedServices: [svcValue] }));
          // Find a detailed pitch for this service
          const pitchKey = Object.keys(SERVICE_PITCH_MAP).find(k =>
            SERVICE_PITCH_MAP[k].items?.some((pi) => pi.name.toLowerCase().includes(item.label.toLowerCase().split(" ")[0])) ||
            k.toLowerCase().includes(item.label.toLowerCase().split(" ")[0])
          );
          const pitch = pitchKey ? SERVICE_PITCH_MAP[pitchKey] : null;
          setCurrentPitchKey(pitchKey || "");
          setCheckedPitchItems(new Set());
          checkedPitchRef.current = new Set();
          setTimeout(() => {
            if (pitch) {
              addBotMsg(pitch.pitch + "\n\nSelect what you need:");
              // Show checklist items as buttons
              addBotButtons([
                ...pitch.items.map(pi => ({ label: `☐ ${pi.name} — ${pi.price}`, value: `CHECK_${pi.name}` })),
                { label: "✓ Proceed to Pay", value: "PITCH_CHECKOUT" },
                { label: "← Back to Services", value: "PITCH_BACK" },
              ]);
            } else {
              // No detailed checklist — simple service
              addBotMsg(`${item.label} (${item.price}) — this service is designed to protect and grow your business.`);
              addBotButtons([
                { label: "Get Started", value: "PITCH_CHECKOUT" },
                { label: "Tell me more", value: "PITCH_MORE" },
                { label: "← Back to Services", value: "PITCH_BACK" },
              ]);
            }
          }, 400);
          setChatState("SERVICE_PITCH");
          return;
        }
      }
      setChatState("AI_CHAT");
      handleAIChat(val);
      return;
    }

    // ── Service pitch: checklist selection + checkout
    if (chatState === "SERVICE_PITCH") {
      // Checklist item toggled
      if (val.startsWith("CHECK_")) {
        const itemName = val.slice(6);
        const pitch = SERVICE_PITCH_MAP[currentPitchKey];
        if (!pitch) return;
        const newChecked = new Set(checkedPitchRef.current);
        if (newChecked.has(itemName)) newChecked.delete(itemName);
        else newChecked.add(itemName);
        checkedPitchRef.current = newChecked;
        setCheckedPitchItems(newChecked);
        // Calculate running total
        const total = pitch.items.filter(pi => newChecked.has(pi.name)).reduce((sum, pi) => sum + pi.amount, 0);
        const selectedNames = pitch.items.filter(pi => newChecked.has(pi.name)).map(pi => pi.name);
        // Re-show the checklist with updated checks
        addBotMsg(selectedNames.length > 0
          ? `Selected: ${selectedNames.join(", ")}\nRunning total: ₦${total.toLocaleString()}`
          : "No items selected yet. Tap to select.");
        addBotButtons([
          ...pitch.items.map(pi => ({ label: `${newChecked.has(pi.name) ? "☑" : "☐"} ${pi.name} — ${pi.price}`, value: `CHECK_${pi.name}` })),
          ...(newChecked.size > 0 ? [{ label: `✓ Proceed to Pay (₦${total.toLocaleString()})`, value: "PITCH_CHECKOUT" }] : []),
          { label: "← Back to Services", value: "PITCH_BACK" },
        ]);
        return;
      }
      // Proceed to checkout
      if (val === "PITCH_CHECKOUT") {
        const pitch = SERVICE_PITCH_MAP[currentPitchKey];
        const dept = leadData.department || "bizdoc";
        const acct = dept === "bizdoc" ? PAYMENT_ACCOUNTS.bizdoc : PAYMENT_ACCOUNTS.general;
        let total = 0;
        let summary = "";
        if (pitch && checkedPitchRef.current.size > 0) {
          const selectedItems = pitch.items.filter(pi => checkedPitchRef.current.has(pi.name));
          total = selectedItems.reduce((sum, pi) => sum + pi.amount, 0);
          summary = selectedItems.map(pi => `${pi.name}: ${pi.price}`).join("\n");
        } else {
          // Simple service without checklist
          const catalog = SERVICES[dept] || [];
          const svc = catalog.find(s => s.label === leadData.service);
          total = svc?.amount || 0;
          summary = `${leadData.service}: ${svc?.price || "Quote required"}`;
        }
        setLeadData(prev => ({ ...prev, context: `Selected: ${summary}. Total: ₦${total.toLocaleString()}` }));
        setTimeout(() => {
          addBotMsg(`Your selection:\n\n${summary}\n\nTotal: ₦${total.toLocaleString()}\n\nTo proceed, transfer to:\nBank: ${acct.bank}\nAccount: ${acct.number}\nName: ${acct.name}\n\nPay here and it will be faster. If you have a message for the team, type it and I will make sure they understand exactly what you need.`);
          addBotButtons([
            { label: "I've paid", value: "PAID" },
            { label: "Leave a message for the team", value: "TEAM_MESSAGE" },
            { label: "Talk to Us", value: "TALK_TO_US_CHECKOUT" },
          ]);
        }, 400);
        setChatState("SERVICE_CHECKOUT");
        return;
      }
      if (val === "PITCH_MORE") {
        setChatState("AI_CHAT");
        handleAIChat(`Tell me more about ${leadData.service}. What exactly is included, how long does it take, and what happens after I sign up?`);
        return;
      }
      if (val === "PITCH_BACK") {
        const dept = leadData.department || "bizdoc";
        const catalog = SERVICES[dept] || [];
        setTimeout(() => {
          addBotMsg("Here are our services. Tap any to learn more.");
          addBotButtons(catalog.map(s => ({ label: s.label, value: `SVC_${s.value}` })));
        }, 400);
        setChatState("SERVICES_LIST");
        return;
      }
      if (val === "PITCH_BACK_TO_CHAT") {
        setTimeout(() => addBotMsg("No problem. What else would you like to know?"), 400);
        setChatState("AI_CHAT");
        return;
      }
      setChatState("AI_CHAT");
      handleAIChat(val);
      return;
    }

    // ── Service checkout: payment + team message
    if (chatState === "SERVICE_CHECKOUT") {
      if (val === "PAID") {
        setLeadData(prev => ({ ...prev, context: (prev.context || "") + " [PAYMENT CLAIMED]" }));
        setTimeout(() => {
          addBotMsg("Thank you. Please share a screenshot of your debit alert or payment receipt so our finance team can verify.\n\nYou can send it via WhatsApp to +234 806 714 9356\n\nOnce confirmed, we will collect your details and requirements to begin work.");
          addBotButtons([
            { label: "I've sent the receipt", value: "RECEIPT_SENT" },
            { label: "Send via WhatsApp", value: "WHATSAPP_RECEIPT" },
          ]);
        }, 400);
        return; // Stay in SERVICE_CHECKOUT
      }
      if (val === "RECEIPT_SENT") {
        setLeadData(prev => ({ ...prev, context: (prev.context || "") + " [RECEIPT SENT]" }));
        setTimeout(() => addBotMsg("Receipt received. Our finance team will verify and update you shortly.\n\nIn the meantime, let me get your details. What is your full name?"), 400);
        setChatState("LEAD_NAME");
        return;
      }
      if (val === "WHATSAPP_RECEIPT") {
        window.open("https://wa.me/2348067149356?text=Hi%2C%20I%20just%20made%20a%20payment%20and%20want%20to%20share%20my%20receipt.", "_blank");
        setTimeout(() => {
          addBotMsg("WhatsApp opened. After sending your receipt, tap below to continue.");
          addBotButtons([{ label: "I've sent it", value: "RECEIPT_SENT" }]);
        }, 400);
        return;
      }
      if (val === "TEAM_MESSAGE") {
        setTimeout(() => addBotMsg("Type your message below. I will rephrase it to make sure the team understands exactly what you need."), 400);
        return; // Stay in SERVICE_CHECKOUT, next text input will be the message
      }
      if (val === "TALK_TO_US_CHECKOUT") {
        setTimeout(() => {
          addBotButtons([
            { label: "Drop a Message", value: "DROP_MESSAGE" },
            { label: "Schedule a Call", value: "SCHEDULE" },
          ]);
        }, 400);
        setChatState("TALK_OPTIONS");
        return;
      }
      // Free text = team message — AI rephrases
      if (val.trim().length > 2) {
        setLeadData(prev => ({ ...prev, context: (prev.context || "") + ` | Client message: ${val.trim()}` }));
        setChatState("AI_CHAT");
        handleAIChat(`The client wants to leave this message for the team: "${val.trim()}". Rephrase it professionally and confirm back to them what you understood. Then remind them to make payment to proceed. Keep it short and warm.`);
        return;
      }
      return;
    }

    // ── Talk to Us: sub-options
    if (chatState === "TALK_OPTIONS") {
      if (val === "DROP_MESSAGE") {
        setTimeout(() => addBotMsg("Write your message below. Our team will read it and get back to you."), 400);
        setChatState("TALK_MESSAGE");
        return;
      }
      if (val === "SCHEDULE") {
        setTimeout(() => addBotMsg("Let me schedule a call for you. What is your name?"), 400);
        setChatState("SCHEDULE_NAME");
        return;
      }
      setChatState("AI_CHAT");
      handleAIChat(val);
      return;
    }

    // ── Drop a Message
    if (chatState === "TALK_MESSAGE") {
      if (val.trim().length < 3) { addBotMsg("Please write a bit more so our team can understand your request."); return; }
      setTimeout(() => {
        addBotMsg("Message received. Our team will read it and get back to you shortly. Thank you for reaching out.");
        addBotButtons([
          { label: "Explore our services", value: "OUR_SERVICES" },
          { label: "Back to menu", value: "RESTART" },
        ]);
      }, 400);
      setChatState("MAIN_MENU");
      return;
    }

    // ── Consultation: handled by AI_CHAT (the CONSULTATION state routes to handleAIChat)
    if (chatState === "CONSULTATION") {
      handleAIChat(val);
      return;
    }

    // Track by reference only (v7 rule: no phone tracking)
    if (chatState === "TRACK_REF") {
      const trimmed = val.trim();
      if (trimmed.length < 4) { addBotMsg("Please enter a valid reference number. Example: HAM-XXXX-1234"); return; }
      addBotMsg("Looking up your reference...");
      // Verify ref exists before redirecting
      fetch(`/api/trpc/tracking.lookup?input=${encodeURIComponent(JSON.stringify({ json: { ref: trimmed } }))}`)
        .then(r => r.json())
        .then(res => {
          const data = res?.result?.data?.json;
          if (data?.found) {
            localStorage.setItem("hamzury-client-session", JSON.stringify({
              ref: data.ref, phone: "", name: data.clientName,
              businessName: data.businessName, service: data.service,
              status: data.status, expiresAt: Date.now() + 24 * 60 * 60 * 1000
            }));
            addBotMsg("Found. Opening your dashboard...");
            setTimeout(() => { window.location.href = "/client/dashboard"; }, 600);
          } else {
            addBotMsg("That reference was not found. Please check and try again, or explore our services.");
            addBotButtons([
              { label: "Try again", value: "RETRY_TRACK" },
              { label: "Our Services", value: "OUR_SERVICES" },
            ]);
          }
        })
        .catch(() => {
          addBotMsg("Could not verify your reference right now. Please try again.");
          addBotButtons([{ label: "Try again", value: "RETRY_TRACK" }]);
        });
      setChatState("SUCCESS");
      return;
    }
    if (val === "RETRY_TRACK") {
      setTimeout(() => addBotMsg("Enter your reference number."), 300);
      setChatState("TRACK_REF");
      return;
    }

    // Payment stage — after payment, offer upsell THEN collect details
    if (chatState === "PAYMENT_STAGE") {
      if (val === "PAID") {
        setLeadData(prev => ({ ...prev, context: (prev.context || "") + " [PAYMENT CLAIMED]" }));
        setTimeout(() => {
          addBotMsg("Thank you. Please share a screenshot of your debit alert or payment receipt so our finance team can verify.\n\nYou can send it via WhatsApp to +234 806 714 9356\n\nOnce confirmed, we will collect your details and requirements to begin work.");
          addBotButtons([
            { label: "I've sent the receipt", value: "RECEIPT_SENT_PAY" },
            { label: "Send via WhatsApp", value: "WHATSAPP_RECEIPT_PAY" },
          ]);
        }, 400);
        return;
      }
      if (val === "RECEIPT_SENT_PAY") {
        setLeadData(prev => ({ ...prev, context: (prev.context || "") + " [RECEIPT SENT]" }));
        setTimeout(() => addBotMsg("Receipt received. Our finance team will verify and update you shortly.\n\nLet me get your details. What is your full name?"), 400);
        setChatState("LEAD_NAME");
        return;
      }
      if (val === "WHATSAPP_RECEIPT_PAY") {
        window.open("https://wa.me/2348067149356?text=Hi%2C%20I%20just%20made%20a%20payment%20and%20want%20to%20share%20my%20receipt.", "_blank");
        setTimeout(() => {
          addBotMsg("WhatsApp opened. After sending your receipt, tap below to continue.");
          addBotButtons([{ label: "I've sent it", value: "RECEIPT_SENT_PAY" }]);
        }, 400);
        return;
      }
      if (val === "PAY_LATER" || val === "Continue after payment") {
        setTimeout(() => addBotMsg("No problem. Let me get your details so the team can follow up. What is your full name?"), 400);
        setChatState("LEAD_NAME");
        return;
      }
      if (val === "UPLOAD_RECEIPT") {
        setTimeout(() => {
          addBotMsg("Please send your payment receipt via WhatsApp to +234 806 714 9356. Once verified, would you like to add another service?");
          setLeadData(prev => ({ ...prev, context: (prev.context || "") + " [RECEIPT SENT]" }));
          addBotButtons([{ label: "Yes, add more", value: "PAID" }, { label: "No, open my file", value: "UPSELL_DONE" }]);
          setChatState("PAYMENT_STAGE");
        }, 400);
        return;
      }
      if (val === "TALK_FINANCE") {
        window.open("https://wa.me/2348067149356", "_blank");
        return;
      }
    }

    // Upsell stage — client picks more services or finishes
    if (chatState === "UPSELL_STAGE") {
      if (val === "UPSELL_DONE") {
        setTimeout(() => addBotMsg("Perfect. Let me get your details to open your file. What is your full name?"), 400);
        setChatState("LEAD_NAME");
        return;
      }
      if (val.startsWith("UPSELL_")) {
        const serviceName = val.replace("UPSELL_", "");
        const pitch = matchServicePitch(serviceName);
        if (pitch) {
          addBotMsg(pitch.pitch);
          setTimeout(() => {
            addBotButtons([
              ...pitch.items.map(item => ({ label: `${item.name} (${item.price})`, value: `Tell me about ${item.name}. What is included, timeline, and how to start?` })),
              { label: "Back to checkout", value: "UPSELL_DONE" },
            ]);
          }, 400);
          setChatState("AI_CHAT");
        } else {
          setChatState("AI_CHAT");
          handleAIChat(`I want to add ${serviceName} to my order. Tell me about it.`);
        }
        return;
      }
    }

    // ── AI → Show relevant service checklist
    if (val === "AI_SHOW_SERVICES") {
      const fullConversation = aiMessages.map(m => m.content).join(" ");
      const pitchKey = detectPitchFromResponse(fullConversation);
      if (pitchKey) {
        // Found specific service match → show checklist
        const pitch = SERVICE_PITCH_MAP[pitchKey];
        setLeadData(prev => ({ ...prev, service: pitchKey, department: pitch.dept, selectedServices: [] }));
        setCurrentPitchKey(pitchKey);
        setCheckedPitchItems(new Set());
        checkedPitchRef.current = new Set();
        setTimeout(() => {
          addBotMsg(pitch.pitch + "\n\nSelect what you need:");
          addBotButtons([
            ...pitch.items.map(pi => ({ label: `☐ ${pi.name} — ${pi.price}`, value: `CHECK_${pi.name}` })),
            { label: "✓ Proceed to Pay", value: "PITCH_CHECKOUT" },
            { label: "← Back", value: "PITCH_BACK_TO_CHAT" },
          ]);
        }, 400);
        setChatState("SERVICE_PITCH");
      } else {
        // No specific match → show department services list
        const dept = department !== "general" ? department : "bizdoc";
        setLeadData(prev => ({ ...prev, department: dept, selectedServices: [] }));
        const catalog = SERVICES[dept] || [];
        setTimeout(() => {
          addBotMsg("Here is what we offer. Tap any service to learn more.");
          addBotButtons(catalog.map(s => ({ label: s.label, value: `SVC_${s.value}` })));
        }, 400);
        setChatState("SERVICES_LIST");
      }
      return;
    }

    // ── AI → Renewal detected — route to team, no payment
    if (val === "AI_RENEWAL") {
      setLeadData(prev => ({ ...prev, context: (prev.context || "") + " [RENEWAL]" }));
      setTimeout(() => {
        addBotMsg("For renewals and upgrades, our team needs to review your current documents first. How would you like to connect?");
        addBotButtons([
          { label: "Drop a message with my details", value: "DROP_MESSAGE" },
          { label: "Schedule a call", value: "SCHEDULE" },
        ]);
      }, 400);
      setChatState("TALK_OPTIONS");
      return;
    }

    // AI close actions — NEW FLOW: price → pay → upsell → THEN details
    if (val === "AI_CLOSE_YES") {
      const lastAi = aiMessages.filter(m => m.role === "assistant").pop()?.content || "";
      const inferredService = lastAi.toLowerCase().includes("bizdoc") || lastAi.toLowerCase().includes("compliance") || lastAi.toLowerCase().includes("cac")
        ? "BizDoc Compliance"
        : lastAi.toLowerCase().includes("systemise") || lastAi.toLowerCase().includes("website") || lastAi.toLowerCase().includes("brand") || lastAi.toLowerCase().includes("automation") || lastAi.toLowerCase().includes("ai agent")
        ? "Systemise Systems"
        : lastAi.toLowerCase().includes("skills") || lastAi.toLowerCase().includes("training")
        ? "Skills Training"
        : "General Consultation";
      const dept = department === "bizdoc" ? "bizdoc" : "general";
      setLeadData(prev => ({ ...prev, service: inferredService, department: dept, context: aiMessages.map(m => `${m.role}: ${m.content}`).slice(-4).join("\n") }));
      // Go straight to payment — no details yet
      const acct = dept === "bizdoc" ? PAYMENT_ACCOUNTS.bizdoc : PAYMENT_ACCOUNTS.general;
      setTimeout(() => {
        addBotMsg(`Great. To proceed, transfer to:\n\nBank: ${acct.bank}\nAccount: ${acct.number}\nName: ${acct.name}\n\nOnce paid, tap below.`);
        addBotButtons([
          { label: "I've made payment", value: "PAID" },
          { label: "I will pay later", value: "PAY_LATER" },
          { label: "Upload receipt", value: "UPLOAD_RECEIPT" },
          { label: "Talk to finance", value: "TALK_FINANCE" },
        ]);
        setChatState("PAYMENT_STAGE");
      }, 400);
      return;
    }
    if (val === "AI_CLOSE_MORE") { setChatState("AI_CHAT"); return; }

    // Schedule flow
    if (val === "SCHEDULE") {
      setTimeout(() => addBotMsg("Let me get you scheduled. What is your name?"), 400);
      setChatState("SCHEDULE_NAME");
      return;
    }
    if (chatState === "SCHEDULE_NAME") {
      setLeadData(prev => ({ ...prev, name: val }));
      setTimeout(() => addBotMsg(`Nice to meet you, ${val.split(" ")[0]}. What date works best?`), 400);
      setChatState("SCHEDULE_DATE");
      return;
    }
    if (chatState === "SCHEDULE_DATE") {
      setLeadData(prev => ({ ...prev, schedDate: val }));
      setTimeout(() => {
        addBotMsg("And your preferred time?");
        addBotButtons([
          { label: "Morning (9am-12pm)", value: "9am-12pm" },
          { label: "Afternoon (12pm-4pm)", value: "12pm-4pm" },
          { label: "Evening (4pm-7pm)", value: "4pm-7pm" },
        ]);
      }, 400);
      setChatState("SCHEDULE_TIME");
      return;
    }
    if (chatState === "SCHEDULE_TIME") {
      setLeadData(prev => ({ ...prev, schedTime: val }));
      setTimeout(() => addBotMsg("Lastly, what is your WhatsApp number so we can confirm?"), 400);
      setChatState("SCHEDULE_PHONE");
      return;
    }
    if (chatState === "SCHEDULE_PHONE") {
      const finalData = { ...leadData, phone: val };
      submitAppointment.mutate(
        { clientName: finalData.name || "Client", phone: val, preferredDate: finalData.schedDate || "", preferredTime: finalData.schedTime || "" },
        {
          onSuccess: () => {
            addBotMsg(`Scheduled. A team member will call you on ${finalData.schedDate} during ${finalData.schedTime}.`);
            addBotButtons([{ label: "Back to Menu", value: "RESTART" }]);
            setChatState("SUCCESS");
          },
        }
      );
      return;
    }

    // Lead capture
    if (chatState === "LEAD_NAME") {
      if (val.trim().length < 2) { setInputError("Please enter your full name."); return; }
      setLeadData(prev => ({ ...prev, name: val }));
      setTimeout(() => addBotMsg(`Thanks, ${val.split(" ")[0]}. What is the name of your business?`), 400);
      setChatState("LEAD_BIZ");
      return;
    }
    if (chatState === "LEAD_BIZ") {
      setLeadData(prev => ({ ...prev, businessName: val }));
      setTimeout(() => addBotMsg("And your best WhatsApp or phone number?"), 400);
      setChatState("LEAD_PHONE");
      return;
    }
    if (chatState === "LEAD_PHONE") {
      const digits = val.replace(/\D/g, "");
      if (digits.length < 7) { setInputError("Please enter a valid phone number."); return; }
      const finalData = { ...leadData, phone: val };
      const allServices = [finalData.service || "General", ...(finalData.selectedServices || [])].join(", ");
      submitLead.mutate(
        {
          name: finalData.name || "", businessName: finalData.businessName, phone: val, service: allServices, context: finalData.context,
          referralCode: finalData.referralCode, referrerName: finalData.referrerName, referralSourceType: finalData.referralSourceType, notifyCso: finalData.notifyCso,
        },
        {
          onSuccess: (result) => {
            const hasPaid = (finalData.context || "").includes("[PAYMENT CLAIMED]");
            if (hasPaid) {
              addBotMsg(`Your file is created. Reference: ${result.ref}\n\nSave this reference to track your progress anytime.`);
            } else {
              addBotMsg("Your request has been received. Our team will review it and reach out to you shortly.");
            }
            try { localStorage.setItem("hamzury-chat-client", JSON.stringify({ name: finalData.name, ref: hasPaid ? result.ref : undefined, service: allServices })); } catch {}
            addBotButtons([
              { label: "Ask another question", value: "RESTART" },
              { label: "View my dashboard", value: "VIEW_DASHBOARD" },
            ]);
            setChatState("SUCCESS");
          },
        }
      );
      return;
    }

    // Navigation actions
    if (val === "VIEW_DASHBOARD") { window.location.href = "/client/dashboard"; return; }
    if (val === "RESTART") {
      setLeadData(prev => ({ referralCode: prev.referralCode, referrerName: prev.referrerName, referralSourceType: prev.referralSourceType, notifyCso: prev.notifyCso }));
      setAiMessages([]);
      addBotMsg("How else can I help you?");
      setTimeout(() => showMainMenu(), 300);
      return;
    }

    // Catch-all: go to AI chat
    setChatState("AI_CHAT");
    handleAIChat(val);
  }, [chatState, leadData, aiMessages, department, isDashboard, userLang, tonePreference]);

  const formatText = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${GOLD}">$1</strong>`)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${GOLD};text-decoration:underline;">$1</a>`)
      .replace(/\n/g, "<br/>");

  const inputDisabled = chatState === "SUCCESS" || chatState === "SCHEDULE_TIME" || chatState === "SERVICES_LIST" || chatState === "SERVICES_DEPT";
  const hasInteracted = messages.some(m => m.sender === "user");

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  const chatPanel = (
    <div
      className={
        isControlled
          ? "w-full h-full flex flex-col overflow-hidden"
          : "fixed z-50 flex flex-col overflow-hidden shadow-2xl rounded-2xl border border-[#1A1A1A]/10 inset-x-3 bottom-24 top-auto md:inset-auto md:bottom-24 md:right-4 md:w-[400px]"
      }
      style={isControlled ? {} : {
        backgroundColor: "white",
        maxHeight: "calc(100dvh - 110px)",
        transform: mounted ? "scale(1)" : "scale(0.95)",
        opacity: mounted ? 1 : 0,
        transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
      }}
    >
      {/* ── Header ── */}
      <div className="shrink-0 relative" style={{ backgroundColor: DEPT_BRAND[department].header }}>
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setMenuOpen(v => !v)} className="text-white/40 hover:text-white/80 p-0.5 transition-colors">
              <MoreVertical size={16} />
            </button>
            <h3 className="font-semibold text-[14px] text-white tracking-wide">
              {DEPT_BRAND[department].name} Advisor
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <select
              value={userLang}
              onChange={e => setUserLang(e.target.value)}
              className="bg-transparent text-[10px] text-white/50 hover:text-white/80 outline-none cursor-pointer appearance-none pr-1"
              style={{ maxWidth: 50 }}
              title="Language"
            >
              {["English", "Hausa", "Yoruba", "Igbo", "Arabic", "French", "Chinese"].map(l => (
                <option key={l} value={l} style={{ color: "#1A1A1A" }}>{l.slice(0, 3).toUpperCase()}</option>
              ))}
            </select>
            <button onClick={close} className="text-white/40 hover:text-white/80 p-1 transition-colors" title="Minimize">
              <Minus size={16} />
            </button>
          </div>
        </div>

        {/* Menu dropdown */}
        {menuOpen && (
          <div className="absolute left-3 top-14 bg-white rounded-xl shadow-lg border border-[#1A1A1A]/8 py-1 z-10 min-w-[180px]">
            {isDashboard && (
              <div className="px-4 py-2 border-b border-[#1A1A1A]/5">
                <p className="text-[11px] text-[#666] mb-1">Tone preference</p>
                {["Friendly", "Professional", "Executive"].map(t => (
                  <button
                    key={t}
                    onClick={() => { setTonePreference(t); setMenuOpen(false); }}
                    className={`block w-full text-left px-2 py-1.5 text-[12px] rounded transition-colors ${t === tonePreference ? "font-medium" : ""}`}
                    style={{ color: t === tonePreference ? GOLD : DARK }}
                  >
                    {t === tonePreference ? `● ${t}` : t}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => { setMenuOpen(false); window.open("https://wa.me/2349130700056", "_blank"); }}
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FFFAF6] transition-colors flex items-center gap-2"
              style={{ color: CHARCOAL }}
            >
              <Phone size={14} />
              Contact team
            </button>
            <button
              onClick={() => { setMenuOpen(false); reset(); if (isOpen) { addBotMsg(t(userLang, "newChat")); showMainMenu(); } }}
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FFFAF6] transition-colors"
              style={{ color: "#DC2626" }}
            >
              Clear conversation
            </button>
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: "#FAFAFA" }}>
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.text && (
              <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 text-[13px] leading-relaxed ${msg.sender === "user" ? "rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-tl-sm"}`}
                  style={{
                    backgroundColor: msg.sender === "user" ? CHARCOAL : "white",
                    color: msg.sender === "user" ? CREAM : DARK,
                    ...(msg.sender === "bot" ? { border: "1px solid rgba(10,31,28,0.06)" } : {}),
                  }}
                  dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                />
              </div>
            )}
            {msg.buttons && (
              <div className="flex flex-col gap-2 mt-2">
                {msg.buttons.map((btn, j) => (
                  <button
                    key={j}
                    onClick={() => handleButtonClick(btn.value, btn.label)}
                    className="w-full text-left px-4 py-2.5 text-[13px] border rounded-full hover:bg-[#FFFAF6] transition-all"
                    style={{ borderColor: "rgba(45,45,45,0.12)", color: CHARCOAL }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = GOLD)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(45,45,45,0.12)")}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {aiLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm bg-white border border-[#1A1A1A]/5"><TypingDots /></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      {!inputDisabled && (
        <div className="px-4 pt-2 pb-3 bg-white border-t border-[#1A1A1A]/5 shrink-0">
          {inputError && <p className="text-[11px] mb-1.5 px-1 text-red-500">{inputError}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); if (inputError) setInputError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={aiLoading ? "Responding..." : chatState === "TRACK_REF" ? "Enter reference (HMZ-26/3-XXXX)" : "Type a message"}
              className="flex-1 border rounded-full px-4 py-2.5 text-[13px] outline-none transition-colors"
              style={{ backgroundColor: CREAM, borderColor: inputError ? "#EF4444" : "rgba(45,45,45,0.08)" }}
            />
            <button
              onClick={handleSend}
              disabled={aiLoading}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 shrink-0 disabled:opacity-50"
              style={{ backgroundColor: CHARCOAL, color: GOLD }}
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-center mt-1.5 text-[10px]" style={{ color: "#9CA3AF" }}>
            By chatting, you agree to our{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">terms</a>.
          </p>
        </div>
      )}
    </div>
  );

  // Chat bubble notification popups
  const [bubbleNotes, setBubbleNotes] = useState<string[]>([]);
  useEffect(() => {
    if (isOpen || isControlled) return;
    const NOTES = [
      "Hi! Need help with anything? 👋",
      department === "bizdoc" ? "Ask about our compliance packages" :
      department === "systemise" ? "Ask about our digital packages" :
      department === "skills" ? "Browse our programs" : "We're here to help",
    ];
    const t1 = setTimeout(() => setBubbleNotes([NOTES[0]]), 2000);
    const t2 = setTimeout(() => setBubbleNotes([NOTES[0], NOTES[1]]), 3500);
    const t3 = setTimeout(() => setBubbleNotes([]), 6500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isOpen, isControlled, department]);

  // Feedback
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  return (
    <>
      {isOpen && chatPanel}

      {/* Notification popups above bubble */}
      {!isControlled && !isOpen && bubbleNotes.length > 0 && (
        <div className="fixed bottom-[88px] right-4 z-[60] flex flex-col items-end gap-1.5 animate-in fade-in slide-in-from-bottom-2">
          {bubbleNotes.map((note, i) => (
            <div
              key={i}
              className="px-4 py-2.5 rounded-2xl rounded-br-sm shadow-lg text-[13px] font-medium max-w-[220px]"
              style={{
                backgroundColor: DEPT_BRAND[department].header,
                color: "#fff",
                opacity: 1,
                animation: "fadeSlideIn 0.3s ease-out",
              }}
              onClick={() => { setBubbleNotes([]); setInternalOpen(true); setShowBadge(false); }}
            >
              {note}
            </div>
          ))}
        </div>
      )}

      {/* Floating buttons */}
      {!isControlled && (
        <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2">
          <button
            onClick={() => setFeedbackOpen(v => !v)}
            className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 border"
            style={{ backgroundColor: "white", borderColor: "rgba(45,45,45,0.1)", color: GOLD }}
            title="Rate us"
          >
            <Star size={18} />
          </button>
          <button
            data-chat-trigger
            onClick={() => {
              setBubbleNotes([]);
              if (isOpen) close();
              else { setInternalOpen(true); setShowBadge(false); }
            }}
            className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 relative"
            style={{ backgroundColor: DEPT_BRAND[department].header, color: DEPT_BRAND[department].accent }}
          >
            {isOpen ? <Minus size={22} /> : <MessageSquare size={22} />}
            {!isOpen && showBadge && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">1</span>
            )}
          </button>
        </div>
      )}

      {/* Feedback popup */}
      {feedbackOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-[#1A1A1A]/10 p-5 w-72">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[14px] font-semibold" style={{ color: CHARCOAL }}>Rate your experience</p>
            <button onClick={() => setFeedbackOpen(false)} className="opacity-40 hover:opacity-100"><X size={16} /></button>
          </div>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setFeedbackRating(n)} className="transition-transform hover:scale-110">
                <Star size={28} fill={n <= feedbackRating ? GOLD : "none"} stroke={n <= feedbackRating ? GOLD : "#D1D5DB"} strokeWidth={1.5} />
              </button>
            ))}
          </div>
          <textarea
            value={feedbackMsg}
            onChange={e => setFeedbackMsg(e.target.value)}
            placeholder="Tell us more (optional)"
            className="w-full border rounded-xl px-3 py-2 text-[13px] outline-none resize-none h-20 mb-3"
            style={{ borderColor: "rgba(45,45,45,0.1)", backgroundColor: "#FAFAFA" }}
          />
          <button
            onClick={() => { if (feedbackRating) { toast.success(`Thank you for your ${feedbackRating}-star feedback`); setFeedbackOpen(false); setFeedbackRating(0); setFeedbackMsg(""); } }}
            disabled={feedbackRating === 0}
            className="w-full py-2.5 rounded-full text-[13px] font-medium text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: CHARCOAL }}
          >
            Submit
          </button>
        </div>
      )}
    </>
  );
}
