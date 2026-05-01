/**
 * Bizdoc services catalog — ported faithfully from
 * /Users/MAC/Downloads/bizdoc-services-v3-4.html (the source-of-truth mockup).
 *
 * Every fee, timeline, and `need` mirrors the HTML. Industry packages reuse
 * service IDs from `categories`.
 */
import type { DivisionServicesCatalog, ServiceItem } from "../division-services-types";

/* ─────────────────── CATEGORY 1: Certifications & Documentation ─────── */
const certifications: ServiceItem[] = [
  // === TIER 1: FOUNDATION ===
  { id: "cac_ltd", name: "CAC Limited Liability", use: "What every Nigerian company needs before it can open a bank account or sign a real contract.", fee: "₦35,000", timeline: "Around 7-10 working days.", need: "Director details, NIN, and a few proposed names.", note: "Standard ₦1M authorized share capital. Higher capital available for regulated industries." },
  { id: "cac_bn", name: "CAC Business Name", use: "The lighter option — register as a sole proprietor and start trading legally.", fee: "₦20,000", timeline: "About 3-5 working days.", need: "Your NIN, a passport photo, and your signature." },
  { id: "cac_ngo", name: "CAC Incorporated Trustees", use: "How NGOs and non-profits get registered properly — so funders take you seriously.", fee: "₦50,000", timeline: "Four to eight weeks.", need: "Trustee details, your constitution, and the newspaper publication.", note: "Requires 28-day public notice in two national newspapers." },
  { id: "tin", name: "TIN Registration & Activation", use: "Your tax identity — number plus TaxProMax activation. Without it, you can't file or remit.", fee: "₦25,000", timeline: "About 3-7 working days.", need: "CAC certificate, NIN, and a utility bill.", note: "Includes both TIN issuance and TaxProMax activation. The number alone is not enough." },
  { id: "scuml", name: "SCUML Certificate", use: "An anti-money-laundering tick that banks ask for before opening corporate accounts in many sectors.", fee: "₦60,000", timeline: "Two to four weeks.", need: "CAC, TIN, MEMART, and KYC docs.", note: "The SCUML certificate itself is issued free by EFCC. Our ₦60,000 covers application processing, document preparation, and follow-up." },

  // === TIER 2: OPERATIONS ===
  { id: "vat_reg", name: "VAT Registration", use: "So you can charge VAT properly — and FIRS doesn't penalise you for unfiled returns.", fee: "₦20,000", timeline: "About 3-5 working days.", need: "CAC, TIN, and your MEMART." },
  { id: "tcc", name: "Tax Clearance Certificate", use: "Proof you've paid your taxes — banks, contracts, and bids all ask for this.", fee: "₦35,000", timeline: "Five to ten working days.", need: "CAC, TIN, and your last three years of tax filings." },
  { id: "pencom", name: "PENCOM Compliance", use: "If you have three or more employees, this is the pension setup you need.", fee: "₦30,000", timeline: "Two to three weeks.", need: "CAC, TIN, your employee list, and a chosen PFA." },
  { id: "itf_compliance", name: "ITF Compliance", use: "Industrial Training Fund — kicks in once you have five or more staff.", fee: "₦20,000", timeline: "About two weeks.", need: "CAC, employee count, and payroll." },
  { id: "nsitf", name: "NSITF Registration", use: "Employee compensation cover — required the moment you put anyone on payroll.", fee: "₦25,000", timeline: "Two to three weeks.", need: "CAC, TIN, and employee payroll.", note: "Mandatory for any business with employees. 1% of payroll paid annually." },
  { id: "bpp_registration", name: "BPP Registration", use: "How you get on the list to bid for federal government contracts.", fee: "₦100,000", timeline: "Four to six weeks.", need: "CAC, TIN, audited accounts, and your TCC." },
  { id: "cac_annual_returns", name: "CAC Annual Returns", use: "Filed once a year. Miss it and you risk being struck off — quietly, by CAC.", fee: "₦15,000/year", timeline: "Three to five working days.", need: "Current officers and audited accounts (if a Ltd).", tag: "Renewal" },

  // === TIER 3: INDUSTRY-SPECIFIC ===
  { id: "nafdac", name: "NAFDAC Registration", use: "Non-negotiable if you sell food, pharma, or cosmetics in Nigeria.", fee: "Starts from ₦150,000", timeline: "Three to six months.", need: "CAC, TIN, product samples, and lab analysis.", note: "Final fee depends on product type, number of products, and lab analysis required." },
  { id: "pcn_premises", name: "PCN Premises Licence", use: "What you need on the wall before opening a pharmacy.", fee: "₦80,000", timeline: "Six to eight weeks.", need: "Premises and a registered pharmacist." },
  { id: "mdcn_registration", name: "MDCN Registration", use: "Medical & Dental Council registration — for clinics and practitioners.", fee: "₦50,000", timeline: "Four to six weeks.", need: "Medical credentials and your premises." },
  { id: "ntdc_registration", name: "NTDC Registration", use: "If you're in tourism or hospitality, this is your sector's entry pass.", fee: "₦60,000", timeline: "Three to four weeks.", need: "CAC, business plan, and premises." },
  { id: "iata", name: "IATA Accreditation", use: "Lets you issue flight tickets directly — without going through someone else.", fee: "Starts from ₦200,000", timeline: "Three to six months.", need: "CAC, financial bond, and premises.", note: "Requires financial bond. Final fee depends on agency type and bond amount." },
  { id: "nahcon", name: "NAHCON Licence", use: "What you need to legally organise Hajj or Umrah trips.", fee: "Starts from ₦150,000", timeline: "Eight to twelve weeks.", need: "CAC, financial proof, and premises." },
  { id: "nepc", name: "NEPC Registration", use: "If you ship anything outside Nigeria, this is non-negotiable.", fee: "₦80,000", timeline: "Two to three weeks.", need: "CAC, TIN, and your product list." },
  { id: "mining_exploration", name: "Mining Exploration Licence", use: "Search for minerals legally — the first formal step in mining.", fee: "Quote on request", timeline: "Eight to twelve weeks.", need: "Coordinates, technical proposal, and capital proof.", note: "Fee depends on area, mineral type, and operation scale." },
  { id: "mining_lease", name: "Mining Lease", use: "The right to actually extract minerals at scale — past exploration, into operation.", fee: "Quote on request", timeline: "Sixteen to twenty-four weeks.", need: "Full feasibility, EIA, and a community agreement.", note: "Full quote requires site analysis and feasibility review." },
  { id: "ncdmb", name: "NCDMB Registration", use: "Local content registration — required to bid on oil & gas contracts.", fee: "₦150,000", timeline: "Six to eight weeks.", need: "CAC and a capability statement." },
  { id: "son_certification", name: "SON MANCAP Certification", use: "The quality mark for Nigerian-manufactured products. Retailers ask for this.", fee: "Starts from ₦80,000", timeline: "Four to eight weeks.", need: "Product samples and a factory audit." },
  { id: "cbn_psp", name: "CBN Payment Service Licence", use: "What you need to legally issue or process payments. Heavy on capital, light on shortcuts.", fee: "Quote on request", timeline: "Six to twelve months.", need: "Capital, technical setup, and compliance officers in place.", note: "CBN fintech licences require minimum capital of ₦100M to ₦5B depending on tier." },
  { id: "sec_vasp", name: "SEC VASP Licence", use: "If you're running a virtual asset (crypto) service, this is the SEC route.", fee: "Quote on request", timeline: "Eight to sixteen weeks.", need: "Capital, a compliance officer, and your tech." },
  { id: "redan", name: "REDAN Membership", use: "Real Estate Developers Association — what serious developers carry.", fee: "₦80,000", timeline: "Four to six weeks.", need: "CAC and a project history." },

  // Documents
  { id: "cert_replace", name: "Replacement Certificate", use: "When the original CAC certificate is lost — we replace it cleanly.", fee: "₦20,000", timeline: "Five to seven working days.", need: "Police extract, an affidavit, and a newspaper publication." },
  { id: "ctc", name: "Certified True Copy", use: "Stamped CAC document copies — what banks and lawyers ask for.", fee: "₦15,000 each", timeline: "Three to five working days.", need: "An existing CAC reference." },
  { id: "status_report", name: "CAC Status Report", use: "Quick check on whether a company is actually live with CAC.", fee: "₦10,000", timeline: "One to two working days.", need: "The company name or RC number." },

  // IP
  { id: "trademark", name: "Trademark Registration", use: "Lock down your brand name and logo before someone else does.", fee: "₦80,000 per class", timeline: "Twelve to eighteen months.", need: "Your logo, a description, and applicant details.", note: "Fee is per Nice classification class. Protection covers 7 years, renewable." },
  { id: "patent", name: "Patent Filing", use: "Protect an invention so nobody can copy it without permission.", fee: "Quote on request", timeline: "Two to three years.", need: "A detailed description, drawings, and your claims.", note: "Fee depends on invention complexity, number of claims, and drawings required." },

  // Renewals
  { id: "tcc_renew", name: "TCC Renewal", use: "Filed once a year. Miss it and you'll struggle with bids and bank requests.", fee: "Starts from ₦35,000", timeline: "Five to ten working days.", need: "Your previous TCC and current year filings.", tag: "Renewal" },
  { id: "nafdac_renew", name: "NAFDAC Renewal", use: "Annual product renewal — let it lapse and you can't legally sell.", fee: "Starts from ₦80,000", timeline: "Four to eight weeks.", need: "Your existing NAFDAC certificate and current samples.", tag: "Renewal" },
  { id: "pencom_renew", name: "PENCOM Compliance Renewal", use: "Filed once a year — keeps your pension status active.", fee: "₦30,000", timeline: "Two to three weeks.", need: "Your previous certificate and current employee list.", tag: "Renewal" },
  { id: "nsitf_renew", name: "NSITF Renewal", use: "Filed once a year. Don't let it slip if you have employees.", fee: "₦25,000", timeline: "Two to three weeks.", need: "Your previous certificate and current payroll.", tag: "Renewal" },
  { id: "itf_renew", name: "ITF Renewal", use: "Annual ITF top-up — quick if your records are tidy.", fee: "₦20,000", timeline: "About two weeks.", need: "Your previous certificate and current payroll.", tag: "Renewal" },
  { id: "scuml_renew", name: "SCUML Renewal", use: "Annual renewal so your bank doesn't flag the account for AML status.", fee: "₦40,000", timeline: "Two to four weeks.", need: "Your previous SCUML certificate.", tag: "Renewal", note: "Renewal itself is free from EFCC. Our ₦40,000 covers processing and follow-up." },
  { id: "trademark_renew", name: "Trademark Renewal", use: "Renew every 7 years — otherwise your brand becomes fair game again.", fee: "₦60,000 per class", timeline: "Three to six months.", need: "Your existing trademark certificate.", tag: "Renewal" },

  // Modifications
  { id: "cac_change_name", name: "Change of Company Name", use: "Officially rename your company — and update everything that points back to it.", fee: "₦40,000", timeline: "Two to three weeks.", need: "A board resolution and a fresh name search.", tag: "Modification" },
  { id: "cac_change_directors", name: "Change of Directors", use: "Add or remove directors at CAC — cleanly, without breaking anything else.", fee: "₦30,000", timeline: "One to two weeks.", need: "A board resolution and KYC for the new director.", tag: "Modification" },
  { id: "cac_change_address", name: "Change of Registered Address", use: "When you move office, CAC needs to know — otherwise notices go nowhere.", fee: "₦25,000", timeline: "One to two weeks.", need: "A board resolution and proof of the new address.", tag: "Modification" },
  { id: "cac_increase_capital", name: "Increase Share Capital", use: "Raise authorized capital — usually because regulators or investors are asking.", fee: "Stamp duty + ₦35,000", timeline: "Two to three weeks.", need: "A special resolution and updated MEMART.", tag: "Modification", note: "Stamp duty calculated on the increase amount." },
  { id: "cac_bn_to_ltd", name: "Upgrade BN to LTD", use: "Convert from sole proprietor to a Limited company — usually because you're hiring or raising.", fee: "Quote on request", timeline: "Three to four weeks.", need: "Your BN certificate, new directors, and share structure.", tag: "Modification" },
  { id: "cac_restoration", name: "Restoration of Dissolved Company", use: "Bring back a company that's been struck off — possible, but requires patience.", fee: "Starts from ₦100,000", timeline: "Six to twelve weeks.", need: "A court affidavit, outstanding filings, and any penalties.", tag: "Modification", note: "Final fee depends on years missed and outstanding penalties." },
];

/* ─────────────────── CATEGORY 2: Compliance Management ─────────────── */
const compliance: ServiceItem[] = [
  { id: "compliance_starter", name: "Compliance Starter (annual)", use: "We watch your CAC, TIN, and VAT calendar — alerts and filings, so you stop missing dates.", fee: "₦150,000/year", timeline: "Live within 48 hours.", need: "Your existing CAC, TIN, and MEMART." },
  { id: "compliance_growth", name: "Compliance Growth (annual)", use: "Adds PENCOM, NSITF, ITF, and annual returns — for businesses with staff.", fee: "₦300,000/year", timeline: "Live within 48 hours.", need: "Your Compliance Starter pack plus an employee list." },
  { id: "compliance_full", name: "Full Compliance Suite (annual)", use: "Everything above, plus a dedicated officer and a monthly review call.", fee: "₦600,000/year", timeline: "Live within a week.", need: "Audited accounts, payroll, and your current certificates." },
  { id: "compliance_audit", name: "Compliance Health Check", use: "A one-off audit of your status with every regulator — what's expired, what's overdue, what's fine.", fee: "₦100,000", timeline: "Five to seven working days.", need: "Your existing certificates and recent filings." },
];

/* ─────────────────── CATEGORY 3: Legal Documents ───────────────────── */
const legal: ServiceItem[] = [
  // Custom-drafted
  { id: "business_plan", name: "Business Plan", use: "An investor-ready business plan — the kind banks and grants will read.", fee: "₦75,000", timeline: "One to two weeks.", need: "A brief on the idea and any financials you've sketched out." },
  { id: "employment_contract", name: "Employment Contract", use: "Protect your hires — and yourself — from day one.", fee: "₦15,000", timeline: "Two to three days.", need: "The role, salary, and how long the contract runs." },
  { id: "nda", name: "Non-Disclosure Agreement", use: "Stops information walking out the door before deals are signed.", fee: "₦10,000", timeline: "One to two days.", need: "Who's involved and what's being protected." },
  { id: "partnership", name: "Partnership Agreement", use: "Set roles and equity between co-founders — before the disagreements start.", fee: "₦50,000", timeline: "Three to five days.", need: "Partner details, equity split, and headline terms." },
  { id: "shareholders", name: "Shareholders Agreement", use: "Govern the relationship between owners — voting, dividends, exits.", fee: "₦60,000", timeline: "Five to seven days.", need: "Shareholders and your share structure." },
  { id: "service_agreement", name: "Service Agreement", use: "A standard contract for client work — the one that pays you on time.", fee: "₦12,000", timeline: "One to two days.", need: "Scope, terms, and payment milestones." },
  { id: "tenancy", name: "Tenancy Agreement", use: "For office or commercial property rentals — protects both sides.", fee: "₦15,000", timeline: "Two to three days.", need: "Property details, term, and rent." },
  { id: "board_resolution", name: "Board Resolution", use: "A formal record of board decisions — what banks and CAC ask for.", fee: "₦10,000", timeline: "One day.", need: "The decision and who voted." },
  { id: "founders_agreement", name: "Founders Agreement", use: "Lock equity, vesting, and IP between co-founders early — saves heartbreak later.", fee: "₦55,000", timeline: "Three to five days.", need: "Founder list, equity split, and vesting terms." },
  { id: "consultancy_agreement", name: "Consultancy Agreement", use: "Engage consultants without misclassifying them — stops tax problems later.", fee: "₦18,000", timeline: "Two to three days.", need: "Consultant details, scope, and fees." },

  // Pamphlets — free
  { id: "pamphlet_tax_basics", name: "Tax basics for new businesses", use: "An 8-page primer on every tax you need to know — written for humans, not accountants.", fee: "Free", timeline: "Instant download.", need: "Just an email address.", tag: "Free" },
  { id: "pamphlet_bank_account", name: "How to open a corporate bank account", use: "A step-by-step checklist that works at any Nigerian bank.", fee: "Free", timeline: "Instant download.", need: "Just an email address.", tag: "Free" },
  { id: "pamphlet_compliance_calendar", name: "Annual compliance calendar", use: "A one-page reference — every filing deadline you can't afford to miss.", fee: "Free", timeline: "Instant download.", need: "Just an email address.", tag: "Free" },
  { id: "pamphlet_hiring_basics", name: "Hiring your first employee — what is required", use: "A 6-page guide covering contracts, pension, and tax — what nobody tells first-time employers.", fee: "Free", timeline: "Instant download.", need: "Just an email address.", tag: "Free" },
  { id: "pamphlet_cac_guide", name: "Choosing the right CAC structure", use: "BN vs Ltd vs NGO — when to use each. Helps you avoid the ₦35K mistake.", fee: "Free", timeline: "Instant download.", need: "Just an email address.", tag: "Free" },

  // Setup Guides — paid
  { id: "guide_business_setup", name: "Complete business setup guide", use: "A full step-by-step playbook from idea to launch — written by people who've done it.", fee: "₦15,000", timeline: "Instant download.", need: "Payment confirmation.", tag: "Guide" },
  { id: "guide_compliance_audit", name: "DIY compliance audit template", use: "Audit your own business against every Nigerian compliance requirement.", fee: "₦10,000", timeline: "Instant download.", need: "Payment confirmation.", tag: "Guide" },
  { id: "guide_hire_first_team", name: "Hire your first 5 employees legally", use: "Templates, a checklist, and the tax setup — so your first team starts clean.", fee: "₦15,000", timeline: "Instant download.", need: "Payment confirmation.", tag: "Guide" },
  { id: "guide_investor_pack", name: "Investor-ready financial template pack", use: "Excel templates plus a pitch checklist — everything investors will ask for.", fee: "₦20,000", timeline: "Instant download.", need: "Payment confirmation.", tag: "Guide" },
  { id: "guide_trademark", name: "Trademark and IP protection guide", use: "How to protect your brand, content, and inventions — without spending six figures on lawyers first.", fee: "₦10,000", timeline: "Instant download.", need: "Payment confirmation.", tag: "Guide" },
  { id: "guide_negotiate_firs", name: "How to negotiate with tax authorities", use: "A practical playbook for waivers and reductions — what works, what doesn't.", fee: "₦15,000", timeline: "Instant download.", need: "Payment confirmation.", tag: "Guide" },
];

/* ─────────────────── CATEGORY 4: By industry — quick paths ──────────
 * Items that are referenced by industry packages but are not in the
 * Cert / Compliance / Legal lists above. Lifted from the HTML's ITEMS
 * dictionary so industry bundles can resolve every id.
 * --------------------------------------------------------------------*/
const industryItems: ServiceItem[] = [
  { id: "ntdc", name: "NTDC Registration", use: "What tourism businesses need to operate legally.", fee: "₦60,000", timeline: "Three to four weeks.", need: "CAC, business plan, and premises." },
  { id: "iata_lite", name: "IATA TIDS", use: "A travel ID for non-ticketing agents — lighter than full IATA.", fee: "₦40,000", timeline: "Four to six weeks.", need: "CAC and proof of business." },
  { id: "iata_full", name: "IATA Accreditation", use: "Lets you issue flight tickets directly — full accreditation.", fee: "₦200,000", timeline: "Three to six months.", need: "A bond, financial review, and premises." },
  { id: "tour_operator_licence", name: "Tour Operator Licence", use: "What you need to legally run organised tours.", fee: "₦80,000", timeline: "Four to six weeks.", need: "CAC, NTDC, and premises." },
  { id: "ncaa_approval", name: "NCAA Approval", use: "Required before you can sell airline tickets.", fee: "₦100,000", timeline: "Six to eight weeks.", need: "IATA and a business plan." },
  { id: "nahcon_licence", name: "NAHCON Licence", use: "What you need to legally run Hajj or Umrah operations.", fee: "₦150,000", timeline: "Eight to twelve weeks.", need: "CAC, financial proof, and premises." },
  { id: "website_disclaimer", name: "Website T&C and Disclaimers", use: "Legal protection for online business — limits what people can sue you for.", fee: "₦25,000", timeline: "Two to three days.", need: "Your site URL and the services listed." },
  { id: "annual_returns", name: "Annual Returns Filing", use: "Filed once a year. Miss it and you risk being struck off.", fee: "₦15,000/year", timeline: "Three to five days.", need: "Your current officers." },
  // Export
  { id: "nepc_registration", name: "NEPC Registration", use: "If you ship anything outside Nigeria, this is non-negotiable.", fee: "₦80,000", timeline: "Two to three weeks.", need: "CAC, TIN, and your product list." },
  { id: "phytosanitary_cert", name: "Phytosanitary Certificate", use: "For agro and crop exports — proves your produce is pest-free.", fee: "Varies", timeline: "One to two weeks.", need: "Product samples and inspection." },
  { id: "quarantine_cert", name: "Quarantine Certificate", use: "For plant or animal exports — clears them across the border.", fee: "Varies", timeline: "One to two weeks.", need: "Product details and inspection." },
  { id: "export_permit", name: "Export Permit", use: "Customs export authorization — every shipment moves with this.", fee: "₦40,000", timeline: "One to two weeks.", need: "NEPC and your product list." },
  { id: "c_of_o", name: "Certificate of Origin", use: "Proves your goods came from Nigeria — needed for tariff treatment abroad.", fee: "₦15,000", timeline: "About a week.", need: "Product details and your NEPC." },
  // Mining
  { id: "exploration_licence", name: "Exploration Licence", use: "Search for minerals legally — the first step in any mining venture.", fee: "₦200,000+", timeline: "Eight to twelve weeks.", need: "Coordinates and a technical proposal." },
  { id: "reconnaissance_permit", name: "Reconnaissance Permit", use: "An initial mineral survey before you commit to exploration.", fee: "₦100,000+", timeline: "Four to eight weeks.", need: "The area you'll cover and a technical plan." },
  { id: "small_scale_mining_licence", name: "Small Scale Mining Licence", use: "What you need to operate a small mining site legally.", fee: "₦300,000+", timeline: "Twelve to sixteen weeks.", need: "Coordinates, EIA, and a community agreement." },
  { id: "community_dev_agreement", name: "Community Development Agreement", use: "Required by the Mining Act — keeps the community on side.", fee: "Varies", timeline: "Four to eight weeks.", need: "Community consultation and a plan." },
  { id: "env_impact_assessment", name: "Environmental Impact Assessment", use: "Required for large operations — a full study of how you'll affect the area.", fee: "Varies", timeline: "Eight to sixteen weeks.", need: "A site study and an expert assessment." },
  { id: "env_permit", name: "Environmental Permit", use: "NESREA permit — for operations that affect the environment.", fee: "₦80,000", timeline: "Four to six weeks.", need: "An operations description and your site." },
  { id: "minerals_buying_licence", name: "Minerals Buying Licence", use: "Lets you legally trade in mined products.", fee: "₦150,000", timeline: "Six to eight weeks.", need: "CAC, premises, and capital proof." },
  { id: "nnra_licence", name: "NNRA Licence", use: "Required to mine, transport, or handle radioactive minerals — uranium, thorium, monazite.", fee: "Quote on request", timeline: "Twelve to sixteen weeks.", need: "Site assessment, a radiation officer, safety equipment, and an NNRA inspection." },
  { id: "radiation_safety_plan", name: "Radiation Safety Plan", use: "A written safety protocol — required for any radioactive operation.", fee: "Starts from ₦100,000", timeline: "Four to six weeks.", need: "Site details, mineral type, and a qualified radiation officer." },
  // Manufacturing
  { id: "factory_licence", name: "Factory Licence", use: "What every manufacturing facility needs before it can operate.", fee: "₦80,000", timeline: "Four to six weeks.", need: "Premises, machinery list, and a factory plan." },
  { id: "son_mancap", name: "SON MANCAP Certification", use: "The quality mark for Nigerian-manufactured goods. Retailers ask for it.", fee: "Starts from ₦80,000", timeline: "Four to eight weeks.", need: "Product samples and a factory audit." },
  // Logistics
  { id: "nipost_licence", name: "NIPOST Courier Licence", use: "What couriers and parcel operators need to run legally.", fee: "₦100,000", timeline: "Six to eight weeks.", need: "Premises, vehicle list, and an operations plan." },
  { id: "hauliers_permit", name: "Hauliers Permit", use: "For commercial freight and inter-state haulage operations.", fee: "₦60,000", timeline: "Three to four weeks.", need: "CAC, vehicle particulars, and driver records." },
  { id: "vehicle_road_worthiness", name: "Road Worthiness Certificates", use: "Per-vehicle certification for your fleet — the police check for these.", fee: "₦8,000 per vehicle", timeline: "About a week.", need: "Vehicle inspection." },
  // Agriculture
  { id: "nafdac_agro", name: "NAFDAC Agricultural Permit", use: "For agro inputs, fertilizers, and pesticides — the regulator everyone has to face.", fee: "Starts from ₦100,000", timeline: "Three to six months.", need: "Product samples and lab analysis." },
  { id: "fmard_registration", name: "FMARD Registration", use: "Federal Ministry of Agriculture registration — for serious agro businesses.", fee: "₦50,000", timeline: "Four to six weeks.", need: "CAC, farm location, and operations details." },
  { id: "ncan_membership", name: "NCAN Membership", use: "Membership of the relevant national association — opens up buyer networks.", fee: "₦40,000", timeline: "Two to four weeks.", need: "CAC and your area of operation." },
  { id: "livestock_permit", name: "Livestock Operations Permit", use: "What you need to legally farm or process livestock.", fee: "₦60,000", timeline: "Four to six weeks.", need: "Site and veterinary clearance." },
  // Oil & Gas
  { id: "npdc_licence", name: "NUPRC / NPDC Operating Licence", use: "For upstream petroleum operations — capital-heavy and slow, but real.", fee: "Quote on request", timeline: "Six to twelve months.", need: "Capital proof, technical capacity, and partnerships." },
  { id: "oml_acquisition", name: "OML / OPL Acquisition Support", use: "For acquiring an Oil Mining or Prospecting Lease — multi-year, multi-party.", fee: "Quote on request", timeline: "Twelve months or more.", need: "Bid documents, capital, and JV partners." },
  // Beauty
  { id: "cpan_membership", name: "CPAN Membership", use: "Cosmetic Practitioners Association — for credibility in the beauty industry.", fee: "₦30,000", timeline: "About two weeks.", need: "CAC, premises, and operator credentials." },
  { id: "spa_premises", name: "Spa Premises Permit", use: "What you need on the wall before opening a spa.", fee: "₦40,000", timeline: "Two to three weeks.", need: "Premises and a health inspection." },
  // Fashion
  { id: "fdcn_membership", name: "FDCN Membership", use: "Fashion Designers Council of Nigeria — gets you into showcases and networks.", fee: "₦25,000", timeline: "About two weeks.", need: "CAC and a portfolio." },
  { id: "fashion_export_permit", name: "Fashion Export Permit", use: "Required if you're exporting fashion products outside Nigeria.", fee: "₦40,000", timeline: "Two to three weeks.", need: "Your NEPC and product list." },
  // Media
  { id: "nbc_licence", name: "NBC Broadcast Licence", use: "Required to legally run TV, radio, or online streaming services.", fee: "Quote on request", timeline: "Six to twelve months.", need: "Capital, technical setup, and a programming plan." },
  { id: "ncc_film_permit", name: "NFVCB Permit", use: "Film & Video Censors Board approval — for cinema or distribution.", fee: "₦60,000", timeline: "Four to six weeks.", need: "Your films and content list, plus a screening." },
  { id: "copyright_registration", name: "Copyright Registration", use: "Protects creative works — music, film, books, software — from being copied.", fee: "₦20,000 per work", timeline: "Six to eight weeks.", need: "Work samples and applicant details." },
  { id: "prsn_membership", name: "PRSN Membership", use: "Performing Rights Society of Nigeria — for music, this is how royalties flow.", fee: "₦30,000", timeline: "About four weeks.", need: "Your works catalogue and CAC." },
  // Print
  { id: "printers_permit", name: "Printers' Permit", use: "Government permit for commercial printing operations.", fee: "₦40,000", timeline: "Three to four weeks.", need: "Premises and a machinery list." },
  { id: "isbn_registration", name: "ISBN Registration", use: "For published books and journals — every legitimate book needs one.", fee: "₦15,000 per title", timeline: "About two weeks.", need: "Book details and publisher info." },
  // Security
  { id: "nscdc_security_licence", name: "NSCDC Private Guard Licence", use: "What private security companies need to operate legally.", fee: "Starts from ₦200,000", timeline: "Eight to twelve weeks.", need: "Capital proof, an operations plan, and personnel records." },
  { id: "cctv_installer_permit", name: "CCTV Installer Permit", use: "For CCTV and electronic security installations — increasingly required.", fee: "₦40,000", timeline: "Three to four weeks.", need: "CAC and proof of technical capability." },
  // Cleaning
  { id: "fumigation_permit", name: "Fumigation / Pest Control Permit", use: "Required to operate fumigation services legally.", fee: "₦40,000", timeline: "Three to four weeks.", need: "Premises, chemicals list, and technician certificates." },
  // Auto
  { id: "motor_dealer_licence", name: "Motor Dealer Licence", use: "What you need to legally sell new or used vehicles.", fee: "₦80,000", timeline: "Four to six weeks.", need: "Premises, capital proof, and an inventory plan." },
  { id: "motor_workshop_permit", name: "Motor Workshop Permit", use: "For auto repair garages — the official sign-off.", fee: "₦40,000", timeline: "Three to four weeks.", need: "Premises and technician credentials." },
  // Fitness
  { id: "fitness_premises_permit", name: "Fitness Premises Permit", use: "A health-cleared permit — what gyms and fitness studios need.", fee: "₦40,000", timeline: "Three to four weeks.", need: "Premises, equipment list, and a health inspection." },
  // Childcare
  { id: "daycare_approval", name: "Daycare Centre Approval", use: "State-level approval for childcare facilities — protects you and the kids.", fee: "Varies by state", timeline: "Eight to twelve weeks.", need: "Premises, staff credentials, and a child safety plan." },
  // Insurance
  { id: "naicom_brokerage", name: "NAICOM Brokerage Licence", use: "What you need to legally operate as an insurance broker.", fee: "Quote on request", timeline: "Six to twelve months.", need: "Capital proof, professional indemnity, and a principal officer." },
  { id: "niib_membership", name: "NIIB Membership", use: "Nigerian Council of Registered Insurance Brokers — required alongside NAICOM.", fee: "₦80,000", timeline: "Four to six weeks.", need: "Your NAICOM licence and qualified brokers." },
  // Legal
  { id: "scn_chamber_registration", name: "SCN Chamber Registration", use: "Supreme Court of Nigeria chambers registration — for law firms going formal.", fee: "₦60,000", timeline: "Four to six weeks.", need: "Lead counsel, premises, and a partnership deed." },
  { id: "nba_branch_membership", name: "NBA Branch Membership", use: "Nigerian Bar Association membership for the firm.", fee: "₦40,000", timeline: "Two to four weeks.", need: "Lead counsel call to bar and your branch jurisdiction." },
  // Accounting
  { id: "ican_firm_registration", name: "ICAN Firm Registration", use: "What you need to run a chartered accounting practice.", fee: "₦60,000", timeline: "Four to six weeks.", need: "Lead practitioner ICAN certificate." },
  { id: "frc_registration", name: "FRC Registration", use: "Financial Reporting Council registration — required for auditors.", fee: "₦50,000", timeline: "Three to four weeks.", need: "Practising certificate and firm details." },
  // Import
  { id: "customs_agent_licence", name: "Customs Agent Licence", use: "What clearing agents and serious importers need.", fee: "Starts from ₦150,000", timeline: "Eight to ten weeks.", need: "A bond, capital proof, and premises." },
  { id: "ncs_importer_code", name: "NCS Importer Code", use: "Your unique importer ID with Nigerian Customs.", fee: "₦30,000", timeline: "About two weeks.", need: "CAC, TIN, and BVN." },
  { id: "product_specific_permits", name: "Product-specific Import Permits", use: "Permits for regulated goods — food, pharma, chemicals — on top of NAFDAC.", fee: "Starts from ₦40,000", timeline: "Three to six weeks.", need: "NAFDAC clearance and your product invoice." },
  // Microfinance
  { id: "cbn_microfinance_licence", name: "CBN Microfinance Licence", use: "What you need to operate a micro-finance bank.", fee: "Quote on request", timeline: "Six to twelve months.", need: "Capital proof (₦50M-₦5B by tier) and your structure." },
  { id: "cooperative_registration", name: "Cooperative Society Registration", use: "What cooperatives and SACCOs need to operate legally.", fee: "₦40,000", timeline: "Six to eight weeks.", need: "Members register, by-laws, and AGM minutes." },
  // Consulting
  { id: "professional_indemnity", name: "Professional Indemnity Setup", use: "Insurance and structure for consulting firms — protects you when advice goes sideways.", fee: "₦80,000", timeline: "Three to four weeks.", need: "Your scope of practice and partner list." },
  // Construction
  { id: "son_block_certification", name: "SON Block / Cement Certification", use: "Quality certification for construction materials — what big buyers ask for.", fee: "₦60,000", timeline: "Four to six weeks.", need: "Product samples and a factory audit." },
  // ICT
  { id: "nitda_registration", name: "NITDA Registration", use: "National Information Technology Development Agency — for tech vendors selling to government.", fee: "₦40,000", timeline: "Three to four weeks.", need: "CAC and a technical capability statement." },
  { id: "ndpr_basic", name: "NDPR Compliance", use: "Nigeria Data Protection Regulation — required if you collect personal data.", fee: "₦50,000", timeline: "Three to four weeks.", need: "A data audit and a DPO appointment." },
  // Solar
  { id: "rea_partnership", name: "REA Partnership Registration", use: "Rural Electrification Agency partnership — opens up rural electrification contracts.", fee: "₦80,000", timeline: "Six to eight weeks.", need: "Technical capacity and a project portfolio." },
  { id: "nerc_solar_permit", name: "NERC Solar Permit", use: "Nigerian Electricity Regulatory Commission permit for off-grid solar operations.", fee: "Quote on request", timeline: "Eight to twelve weeks.", need: "Project details and your technical setup." },
  // Foreign investor
  { id: "niopa_clearance", name: "NIPC Investor Pioneer Status", use: "Pioneer status — a tax holiday application for qualifying foreign investors.", fee: "Quote on request", timeline: "Six to twelve months.", need: "Business plan and proof of capital deployment." },
  { id: "expatriate_quota", name: "Expatriate Quota Approval", use: "Authorisation to hire foreign staff — without this, work permits won't follow.", fee: "Starts from ₦150,000", timeline: "Six to twelve weeks.", need: "Justification, a local capacity report, and a salary structure." },
  { id: "business_permit", name: "Business Permit (Foreign Investors)", use: "Required for any company with foreign shareholding.", fee: "Starts from ₦200,000", timeline: "Eight to twelve weeks.", need: "CAC, foreign capital importation certificate, and MEMART." },
  { id: "cci_certificate", name: "CCI — Capital Importation Certificate", use: "Issued by your bank when foreign investment lands — required to repatriate later.", fee: "₦50,000", timeline: "Two to three weeks.", need: "Inflow proof, beneficiary, and source bank." },
  { id: "mining_titles", name: "Mining Titles Verification", use: "Confirms the legal source of minerals — buyers will ask for this.", fee: "₦50,000", timeline: "One to two weeks.", need: "The title reference number." },
  { id: "dpr_licence", name: "DPR Licence", use: "For petroleum products — operations and distribution.", fee: "Varies", timeline: "Eight to twelve weeks.", need: "CAC and proof of technical capacity." },
  // Contractor
  { id: "coren", name: "COREN Registration", use: "The engineering professional body — needed if engineers sign off on work.", fee: "₦60,000", timeline: "Four to six weeks.", need: "Engineer credentials." },
  { id: "ncdmb_registration", name: "NCDMB Registration", use: "Local content registration — required to bid on oil & gas contracts.", fee: "₦150,000", timeline: "Six to eight weeks.", need: "CAC and a capability statement." },
  { id: "dpr_permit", name: "DPR Permit", use: "For oil sector operations — what regulators check for.", fee: "Varies", timeline: "Eight to twelve weeks.", need: "An operations plan and technical setup." },
  { id: "council_for_regulation", name: "CRBC Registration", use: "Council for engineering registration — for civil engineering practice.", fee: "₦40,000", timeline: "About four weeks.", need: "Credentials." },
  { id: "nse_membership", name: "NSE Membership", use: "Nigerian Society of Engineers membership.", fee: "₦35,000", timeline: "Three to four weeks.", need: "Engineer credentials." },
  { id: "niee_registration", name: "NIEE Registration", use: "Nigerian Institute of Electrical Engineers — for electrical practice.", fee: "₦40,000", timeline: "Three to four weeks.", need: "Credentials." },
  // Restaurant / Food
  { id: "nafdac_food", name: "NAFDAC Food Premises", use: "What every food business needs — restaurant, kitchen, factory.", fee: "₦80,000", timeline: "Four to six weeks.", need: "Premises inspection and product samples." },
  { id: "nafdac_full", name: "NAFDAC Product Registration", use: "For packaged food products — the sticker on the bottle.", fee: "₦150,000+", timeline: "Three to six months.", need: "Samples, lab analysis, and your packaging." },
  { id: "food_handlers_cert", name: "Food Handlers Medical", use: "What every kitchen staff member needs — health authorities check for it.", fee: "₦5,000/person", timeline: "About a week.", need: "Staff medical screening." },
  { id: "env_health_permit", name: "Environmental Health Permit", use: "Required by your local government — without it, they can shut you down.", fee: "₦25,000", timeline: "About two weeks.", need: "Premises inspection." },
  { id: "fire_safety", name: "Fire Safety Certificate", use: "Required for all premises — and your insurance company will ask for it.", fee: "₦30,000", timeline: "About two weeks.", need: "Fire system inspection." },
  { id: "signage_permit", name: "Signage Permit", use: "For your business sign — yes, even that needs paperwork.", fee: "₦15,000", timeline: "One to two weeks.", need: "Sign design and location." },
  { id: "factory_permit", name: "Factory Permit", use: "What manufacturing facilities need before they can run.", fee: "₦60,000", timeline: "Four to six weeks.", need: "Site and a machinery list." },
  // Pharmacy / Medical
  { id: "pcn_premises_licence", name: "PCN Premises Licence", use: "What you need on the wall before opening a pharmacy.", fee: "₦80,000", timeline: "Six to eight weeks.", need: "Premises and a registered pharmacist." },
  { id: "pcn_practice_licence", name: "PCN Practice Licence", use: "The pharmacist's personal licence — required to dispense.", fee: "₦40,000", timeline: "About four weeks.", need: "Pharmacy degree and internship completion." },
  { id: "pharmacist_registration", name: "Pharmacist Registration", use: "Personal professional registration with PCN.", fee: "₦25,000", timeline: "Three to four weeks.", need: "Degree and registration with PCN." },
  { id: "clinic_facility_licence", name: "Clinic Facility Licence", use: "What you need to legally run a clinic.", fee: "₦100,000", timeline: "Six to eight weeks.", need: "Premises, medical staff, and equipment." },
  { id: "env_health", name: "Environmental Health Permit", use: "LGA-level health permit — small in fee, large in consequence if missing.", fee: "₦25,000", timeline: "About two weeks.", need: "Premises inspection." },
  { id: "nafdac_pharma", name: "NAFDAC Pharmaceutical", use: "For pharma distribution — heavy oversight, but unavoidable.", fee: "₦200,000", timeline: "Three to six months.", need: "Premises, samples, and GMP setup." },
  { id: "pcn_distributor", name: "PCN Distributor Licence", use: "What wholesale pharma distributors need.", fee: "₦150,000", timeline: "Six to eight weeks.", need: "Premises and a pharmacist on staff." },
  { id: "warehouse_inspection", name: "Warehouse Inspection", use: "For distribution operations — proves your storage is up to standard.", fee: "₦60,000", timeline: "Two to three weeks.", need: "Warehouse premises ready for inspection." },
  { id: "mlscn_registration", name: "MLSCN Registration", use: "Medical Lab Sciences Council — required for diagnostic labs.", fee: "₦80,000", timeline: "About six weeks.", need: "Lab scientist credentials." },
  { id: "radiation_permit", name: "Radiation Permit", use: "For X-ray and imaging equipment — protects staff and patients.", fee: "₦100,000", timeline: "About eight weeks.", need: "Equipment specs and operator certification." },
  // School
  { id: "state_moe_approval", name: "State Ministry of Education Approval", use: "What you need before you can open a school.", fee: "Varies", timeline: "Eight to sixteen weeks.", need: "Premises, curriculum, and staff list." },
  { id: "site_inspection", name: "Site Inspection", use: "School premises must be inspected before approval — non-negotiable.", fee: "₦40,000", timeline: "Two to four weeks.", need: "Premises ready and accessible." },
  { id: "nuc_approval", name: "NUC Approval", use: "National Universities Commission — required to register a tertiary institution.", fee: "Varies", timeline: "Six to twelve months.", need: "A full academic plan and premises." },
  { id: "academic_planning", name: "Academic Planning Document", use: "Required for tertiary registration — what NUC reviews first.", fee: "₦100,000", timeline: "Three to four weeks.", need: "Programs, faculty, and resources." },
  { id: "data_protection", name: "NDPR Compliance", use: "Data protection regulation — required if you handle personal data.", fee: "₦50,000", timeline: "Three to four weeks.", need: "A data audit and policies." },
  { id: "content_licensing", name: "Content Licensing", use: "Rights for course materials — so you're not pirating someone's curriculum.", fee: "Varies", timeline: "Two to four weeks.", need: "Content list and the source." },
  // Real estate
  { id: "redan_membership", name: "REDAN Membership", use: "Real Estate Developers Association — what serious developers carry.", fee: "₦80,000", timeline: "Four to six weeks.", need: "CAC and a project history." },
  { id: "agent_licence", name: "Agent Licence", use: "State-level real estate agent licence — what brokers need.", fee: "₦40,000", timeline: "Three to four weeks.", need: "Training certificate and premises." },
  { id: "site_approval", name: "Site Approval", use: "State or LGA approval — what every site needs before construction starts.", fee: "Varies", timeline: "Six to eight weeks.", need: "Site plans and proof of ownership." },
  { id: "env_impact", name: "Environmental Impact Study", use: "Required for new developments — a study of how the build affects the area.", fee: "Varies", timeline: "Eight to twelve weeks.", need: "A site study and an expert assessment." },
  { id: "building_permit", name: "Building Permit", use: "What you need before construction can start — without it, expect a stop-work notice.", fee: "Varies", timeline: "Four to eight weeks.", need: "Building plans and site approval." },
  { id: "sec_registration", name: "SEC Registration", use: "For collective investment vehicles — like REITs and funds.", fee: "Varies", timeline: "Eight to twelve weeks.", need: "Capital and structure." },
  // Fintech
  { id: "cbn_psp_licence", name: "CBN Payment Service Licence", use: "What you need to legally issue or process payments.", fee: "Varies", timeline: "Six to twelve months.", need: "Capital, technical setup, and compliance officers." },
  { id: "ndpr_compliance", name: "NDPR Compliance", use: "Data protection for users — non-negotiable for any consumer fintech.", fee: "₦50,000", timeline: "Three to four weeks.", need: "A data audit and DPO." },
  { id: "cbn_money_lender", name: "Money Lenders Licence", use: "What digital lenders need — without it, you're operating illegally.", fee: "Varies", timeline: "Eight to twelve weeks.", need: "Capital and structure." },
  { id: "consumer_protection", name: "FCCPC Compliance", use: "Consumer protection setup — increasingly enforced in fintech and ecommerce.", fee: "₦60,000", timeline: "About four weeks.", need: "Policies and terms of service." },
  { id: "cbn_micro_finance", name: "CBN Micro Finance Licence", use: "For stored-value wallets — the lighter end of CBN licensing.", fee: "Varies", timeline: "Six to twelve months.", need: "Capital and technical setup." },
  { id: "aml_compliance", name: "AML/CFT Compliance", use: "Anti-money-laundering setup — required for any regulated financial business.", fee: "₦80,000", timeline: "Four to six weeks.", need: "Policies and a compliance officer." },
  { id: "sec_vasp_licence", name: "SEC VASP Licence", use: "If you're running a virtual asset (crypto) service, this is the SEC route.", fee: "Varies", timeline: "Eight to sixteen weeks.", need: "Capital, tech, and compliance." },
  // NGO
  { id: "state_ministry_registration", name: "State Ministry Registration", use: "State-level NGO listing — opens up state grants and partnerships.", fee: "₦40,000", timeline: "Four to six weeks.", need: "CAC NGO certificate and your activities list." },
  { id: "national_planning", name: "National Planning Registration", use: "What international NGOs need to operate at scale.", fee: "Varies", timeline: "Eight to twelve weeks.", need: "CAC, donor details, and your scope." },
  { id: "donor_compliance", name: "Donor Compliance Setup", use: "What you need to legally receive foreign donations.", fee: "₦80,000", timeline: "Four to six weeks.", need: "A bank account and AML setup." },
  // Hotel
  { id: "ntdc_licence", name: "NTDC Hotel Registration", use: "What hotels and resorts need — your tourism authority sign-off.", fee: "₦100,000", timeline: "Four to six weeks.", need: "Premises and a business plan." },
  { id: "liquor_licence", name: "Liquor Licence", use: "What premises serving alcohol need — bars, hotels, event venues.", fee: "₦40,000", timeline: "Three to four weeks.", need: "Premises and your business details." },
  { id: "ntdc_short_let", name: "NTDC Short-let Listing", use: "What you need to legally operate a short-let — increasingly enforced in Lagos.", fee: "₦40,000", timeline: "Three to four weeks.", need: "Property details and owner info." },
  { id: "event_licence", name: "Event Centre Licence", use: "What event venues need to run legally.", fee: "₦80,000", timeline: "Four to six weeks.", need: "Premises, capacity, and safety setup." },
];

/* ─────────────────── INDUSTRY PATHS ────────────────────────────────── */
const industries = [
  { id: "travel_tourism", name: "Travel — Tourism", emoji: "✈️", intro: "Documents to legally operate a tourism business and open a corporate bank account.", itemIds: ["cac_ltd","tin","vat_reg","ntdc","iata_lite","tour_operator_licence","website_disclaimer"] },
  { id: "travel_pilgrimage", name: "Travel — Pilgrimage", emoji: "🕋", intro: "Documents to legally organize Hajj, Umrah and pilgrimage trips.", itemIds: ["cac_ltd","tin","vat_reg","nahcon_licence","tour_operator_licence","iata_lite"] },
  { id: "travel_corporate", name: "Travel — Corporate", emoji: "✈️", intro: "Documents for a full-service corporate travel agency that issues tickets directly.", itemIds: ["cac_ltd","tin","vat_reg","iata_full","ncaa_approval","tour_operator_licence","tcc"] },
  { id: "travel_ticketing", name: "Travel — Ticketing only", emoji: "🎫", intro: "Documents to operate a ticketing-only travel agency.", itemIds: ["cac_ltd","tin","vat_reg","iata_full","ncaa_approval"] },

  { id: "export_agro", name: "Export — Agro / Crop", emoji: "🌾", intro: "Documents to legally export crops, food products and agricultural goods.", itemIds: ["cac_ltd","tin","vat_reg","nepc_registration","phytosanitary_cert","quarantine_cert","export_permit","tcc"] },
  { id: "export_manufactured", name: "Export — Manufactured Goods", emoji: "🚢", intro: "Documents to legally export manufactured products.", itemIds: ["cac_ltd","tin","vat_reg","nepc_registration","son_certification","export_permit","c_of_o","tcc"] },
  { id: "export_oil_gas", name: "Export — Oil & Gas", emoji: "🛢", intro: "Documents to legally export petroleum products.", itemIds: ["cac_ltd","tin","vat_reg","dpr_licence","nepc_registration","export_permit","tcc"] },
  { id: "export_minerals", name: "Export — Solid Minerals", emoji: "⛏️", intro: "Documents to legally export mined and processed minerals.", itemIds: ["cac_ltd","tin","vat_reg","mining_titles","nepc_registration","export_permit","c_of_o"] },

  { id: "mining_exploration", name: "Mining — Exploration", emoji: "⛏️", intro: "Documents for mineral exploration and reconnaissance operations.", itemIds: ["cac_ltd","tin","exploration_licence","reconnaissance_permit","tcc"] },
  { id: "mining_small", name: "Mining — Small Scale", emoji: "⛏️", intro: "Documents for small-scale mining operations.", itemIds: ["cac_ltd","tin","vat_reg","small_scale_mining_licence","community_dev_agreement","env_permit","tcc"] },
  { id: "mining_large", name: "Mining — Large Scale", emoji: "⛏️", intro: "Documents for full-scale mining operations.", itemIds: ["cac_ltd","tin","vat_reg","mining_lease","env_impact_assessment","community_dev_agreement","export_permit","tcc"] },
  { id: "mining_dealer", name: "Mining — Mineral Dealing", emoji: "💎", intro: "Documents for mineral buying and trading operations.", itemIds: ["cac_ltd","tin","vat_reg","minerals_buying_licence","export_permit","tcc"] },
  { id: "mining_radioactive", name: "Mining — Radioactive Minerals", emoji: "☢️", intro: "Documents for mining or handling radioactive minerals (uranium, thorium, monazite). Requires NNRA approval.", itemIds: ["cac_ltd","tin","vat_reg","nnra_licence","mining_lease","env_impact_assessment","community_dev_agreement","radiation_safety_plan","export_permit","tcc"] },

  { id: "contractor_general", name: "Contractor — General", emoji: "🏗", intro: "Documents to legally bid for and execute construction contracts.", itemIds: ["cac_ltd","tin","vat_reg","tcc","bpp_registration","coren","itf_compliance","pencom"] },
  { id: "contractor_oil_gas", name: "Contractor — Oil & Gas", emoji: "🛢", intro: "Documents for contractors in the oil and gas sector.", itemIds: ["cac_ltd","tin","vat_reg","tcc","bpp_registration","ncdmb_registration","dpr_permit","itf_compliance"] },
  { id: "contractor_civil", name: "Contractor — Civil", emoji: "🏗", intro: "Documents for civil engineering contractors.", itemIds: ["cac_ltd","tin","vat_reg","tcc","coren","council_for_regulation","itf_compliance","pencom"] },
  { id: "contractor_electrical", name: "Contractor — Electrical", emoji: "⚡", intro: "Documents for electrical engineering contractors.", itemIds: ["cac_ltd","tin","vat_reg","tcc","nse_membership","niee_registration","itf_compliance"] },

  { id: "restaurant_sitdown", name: "Restaurant — Sit-down", emoji: "🍽", intro: "Documents to legally open and operate a restaurant.", itemIds: ["cac_ltd","tin","vat_reg","nafdac_food","food_handlers_cert","env_health_permit","fire_safety","signage_permit"] },
  { id: "restaurant_qsr", name: "Restaurant — QSR / Fast Food", emoji: "🍔", intro: "Documents to legally operate a quick-service food business.", itemIds: ["cac_ltd","tin","vat_reg","nafdac_food","food_handlers_cert","env_health_permit","fire_safety"] },
  { id: "restaurant_cloud", name: "Restaurant — Cloud Kitchen", emoji: "🛵", intro: "Documents to legally operate a delivery-only food business.", itemIds: ["cac_ltd","tin","vat_reg","nafdac_food","food_handlers_cert","env_health_permit"] },
  { id: "restaurant_manufacturer", name: "Restaurant — Food Manufacturer", emoji: "🏭", intro: "Documents to legally manufacture and distribute packaged food.", itemIds: ["cac_ltd","tin","vat_reg","nafdac_full","son_certification","env_permit","factory_permit","tcc"] },

  { id: "pharmacy_community", name: "Pharmacy — Community", emoji: "💊", intro: "Documents to legally open and operate a retail pharmacy.", itemIds: ["cac_ltd","tin","pcn_premises_licence","pcn_practice_licence","pharmacist_registration","env_permit"] },
  { id: "pharmacy_clinic", name: "Pharmacy — Private Clinic", emoji: "🏥", intro: "Documents to legally open and run a private clinic.", itemIds: ["cac_ltd","tin","vat_reg","mdcn_registration","clinic_facility_licence","env_health","fire_safety"] },
  { id: "pharmacy_distribution", name: "Pharmacy — Distribution", emoji: "📦", intro: "Documents to legally distribute pharmaceutical products.", itemIds: ["cac_ltd","tin","vat_reg","nafdac_pharma","pcn_distributor","warehouse_inspection","tcc"] },
  { id: "pharmacy_lab", name: "Pharmacy — Diagnostic Lab", emoji: "🧪", intro: "Documents to legally operate a diagnostic laboratory.", itemIds: ["cac_ltd","tin","vat_reg","mlscn_registration","clinic_facility_licence","radiation_permit"] },

  { id: "school_nursery", name: "School — Nursery / Primary", emoji: "🏫", intro: "Documents to legally open a nursery or primary school.", itemIds: ["cac_ngo","tin","state_moe_approval","env_health_permit","fire_safety","site_inspection"] },
  { id: "school_secondary", name: "School — Secondary", emoji: "🏫", intro: "Documents to legally open a secondary school.", itemIds: ["cac_ngo","tin","state_moe_approval","env_health_permit","fire_safety","site_inspection"] },
  { id: "school_tertiary", name: "School — Tertiary / University", emoji: "🎓", intro: "Documents to legally establish a tertiary institution.", itemIds: ["cac_ngo","tin","nuc_approval","env_permit","fire_safety","site_inspection","academic_planning"] },
  { id: "school_edutech", name: "School — EdTech / Online", emoji: "💻", intro: "Documents for an online education business.", itemIds: ["cac_ltd","tin","vat_reg","data_protection","content_licensing","tcc"] },

  { id: "realestate_agency", name: "Real Estate — Agency", emoji: "🏢", intro: "Documents to legally operate a real estate agency.", itemIds: ["cac_ltd","tin","vat_reg","redan_membership","agent_licence","tcc"] },
  { id: "realestate_developer", name: "Real Estate — Developer", emoji: "🏗", intro: "Documents to legally develop and sell properties.", itemIds: ["cac_ltd","tin","vat_reg","redan_membership","site_approval","env_impact","building_permit","tcc"] },
  { id: "realestate_management", name: "Real Estate — Property Mgmt", emoji: "🏘", intro: "Documents to legally manage properties for owners.", itemIds: ["cac_ltd","tin","vat_reg","redan_membership","agent_licence"] },
  { id: "realestate_investment", name: "Real Estate — Investment", emoji: "📈", intro: "Documents for a real estate investment vehicle.", itemIds: ["cac_ltd","tin","vat_reg","sec_registration","redan_membership","tcc"] },

  { id: "fintech_payment", name: "Fintech — Payment Service", emoji: "💳", intro: "Documents to legally operate a payment service business.", itemIds: ["cac_ltd","tin","vat_reg","cbn_psp_licence","data_protection","ndpr_compliance","tcc"] },
  { id: "fintech_lending", name: "Fintech — Digital Lending", emoji: "💸", intro: "Documents to legally operate a digital lending business.", itemIds: ["cac_ltd","tin","vat_reg","cbn_money_lender","data_protection","consumer_protection","tcc"] },
  { id: "fintech_wallet", name: "Fintech — Wallet", emoji: "👛", intro: "Documents for a digital wallet or stored-value business.", itemIds: ["cac_ltd","tin","vat_reg","cbn_micro_finance","data_protection","aml_compliance","tcc"] },
  { id: "fintech_crypto", name: "Fintech — Crypto / VASP", emoji: "🪙", intro: "Documents for a virtual asset service provider business.", itemIds: ["cac_ltd","tin","vat_reg","sec_vasp_licence","aml_compliance","data_protection","tcc"] },

  { id: "ngo_local", name: "NGO — Local", emoji: "🤝", intro: "Documents for a locally-focused NGO.", itemIds: ["cac_ngo","tin","state_ministry_registration","tcc","annual_returns"] },
  { id: "ngo_international", name: "NGO — International", emoji: "🌍", intro: "Documents for international or donor-funded NGOs.", itemIds: ["cac_ngo","tin","national_planning","scuml","tcc","donor_compliance"] },
  { id: "ngo_religious", name: "NGO — Religious", emoji: "🕊", intro: "Documents for a faith-based organization.", itemIds: ["cac_ngo","tin","state_ministry_registration","tcc"] },
  { id: "ngo_foundation", name: "NGO — Private Foundation", emoji: "💝", intro: "Documents for a private foundation.", itemIds: ["cac_ngo","tin","state_ministry_registration","tcc","donor_compliance"] },

  { id: "hotel", name: "Hotel / Resort", emoji: "🏨", intro: "Documents to legally operate a hotel or resort.", itemIds: ["cac_ltd","tin","vat_reg","ntdc_licence","fire_safety","env_health","liquor_licence","tcc"] },
  { id: "short_let", name: "Short-let / Airbnb", emoji: "🏡", intro: "Documents to legally operate a short-let business.", itemIds: ["cac_ltd","tin","vat_reg","ntdc_short_let","env_health","tcc"] },
  { id: "event_venue", name: "Event Venue", emoji: "🎉", intro: "Documents to legally operate an event venue.", itemIds: ["cac_ltd","tin","vat_reg","event_licence","fire_safety","env_health","liquor_licence"] },

  { id: "general_starter", name: "General — Starter Pack", emoji: "🌱", intro: "Essential documents to launch a new business and open a corporate bank account.", itemIds: ["cac_ltd","tin","scuml","annual_returns"] },
  { id: "general_growing", name: "General — Growing Business", emoji: "🌿", intro: "Documents for a growing business hiring its first team.", itemIds: ["cac_ltd","tin","vat_reg","scuml","tcc","pencom","itf_compliance","nsitf","annual_returns"] },
  { id: "general_established", name: "General — Established", emoji: "🌳", intro: "Full compliance for an established business with employees and contracts.", itemIds: ["cac_ltd","tin","vat_reg","scuml","tcc","pencom","itf_compliance","nsitf","bpp_registration","annual_returns","trademark"] },
  { id: "general_foreign", name: "General — Foreign Investor", emoji: "🌐", intro: "For foreign investors entering Nigeria. Covers entity setup, capital importation, expatriate quota, pioneer status.", itemIds: ["cac_ltd","tin","business_permit","cci_certificate","expatriate_quota","niopa_clearance","vat_reg","tcc","scuml","annual_returns"] },

  { id: "manufacturing_fmcg", name: "Manufacturing — FMCG", emoji: "🏭", intro: "Documents for fast-moving consumer goods manufacturers.", itemIds: ["cac_ltd","tin","vat_reg","factory_licence","nafdac_full","son_mancap","env_permit","tcc"] },
  { id: "manufacturing_industrial", name: "Manufacturing — Industrial", emoji: "🏗", intro: "Documents for industrial and heavy manufacturing operations.", itemIds: ["cac_ltd","tin","vat_reg","factory_licence","son_mancap","env_permit","env_impact_assessment","tcc"] },
  { id: "manufacturing_cottage", name: "Manufacturing — Cottage", emoji: "🧴", intro: "For small-scale producers — cosmetics, sachets, packaged foods.", itemIds: ["cac_ltd","tin","vat_reg","nafdac_food","env_health_permit","tcc"] },
  { id: "manufacturing_export", name: "Manufacturing — Export Oriented", emoji: "🚢", intro: "For manufacturers producing primarily for export markets.", itemIds: ["cac_ltd","tin","vat_reg","factory_licence","son_mancap","nepc","export_permit","tcc"] },

  { id: "logistics_haulage", name: "Logistics — Haulage", emoji: "🚚", intro: "For commercial freight and inter-state haulage businesses.", itemIds: ["cac_ltd","tin","vat_reg","hauliers_permit","vehicle_road_worthiness","tcc","nsitf"] },
  { id: "logistics_courier", name: "Logistics — Courier", emoji: "📦", intro: "For courier and parcel delivery operators.", itemIds: ["cac_ltd","tin","vat_reg","nipost_licence","tcc","nsitf"] },
  { id: "logistics_lastmile", name: "Logistics — Last-Mile", emoji: "🛵", intro: "For e-commerce delivery and last-mile logistics.", itemIds: ["cac_ltd","tin","vat_reg","vehicle_road_worthiness","tcc","nsitf"] },
  { id: "logistics_shipping", name: "Logistics — Shipping", emoji: "🚢", intro: "For shipping agents and freight forwarders.", itemIds: ["cac_ltd","tin","vat_reg","customs_agent_licence","tcc","export_permit"] },

  { id: "agro_crop", name: "Agriculture — Crop Farming", emoji: "🌾", intro: "Documents for commercial crop farming operations.", itemIds: ["cac_ltd","tin","fmard_registration","env_permit","tcc"] },
  { id: "agro_livestock", name: "Agriculture — Livestock", emoji: "🐄", intro: "Documents for livestock and poultry farming.", itemIds: ["cac_ltd","tin","fmard_registration","livestock_permit","env_permit","tcc"] },
  { id: "agro_processing", name: "Agriculture — Agro Processing", emoji: "🥫", intro: "For businesses processing agricultural products.", itemIds: ["cac_ltd","tin","vat_reg","factory_licence","nafdac_food","son_mancap","tcc"] },
  { id: "agro_inputs", name: "Agriculture — Agro Inputs", emoji: "🧪", intro: "For fertilizer, seed, and agro-chemical businesses.", itemIds: ["cac_ltd","tin","vat_reg","nafdac_agro","fmard_registration","tcc"] },

  { id: "oil_exploration", name: "Oil & Gas — Exploration", emoji: "🛢", intro: "For exploration and prospecting operators.", itemIds: ["cac_ltd","tin","vat_reg","npdc_licence","env_impact_assessment","tcc"] },
  { id: "oil_production", name: "Oil & Gas — Production", emoji: "🛢", intro: "For full upstream production operators.", itemIds: ["cac_ltd","tin","vat_reg","npdc_licence","oml_acquisition","env_impact_assessment","community_dev_agreement","tcc"] },
  { id: "oil_gas_distribution", name: "Oil & Gas — Gas Distribution", emoji: "🔥", intro: "For gas distribution and marketing operators.", itemIds: ["cac_ltd","tin","vat_reg","dpr_licence","env_permit","tcc"] },

  { id: "beauty_salon", name: "Beauty — Hair Salon", emoji: "💇", intro: "Documents to legally operate a salon.", itemIds: ["cac_bn","tin","env_health_permit","tcc"] },
  { id: "beauty_spa", name: "Beauty — Spa / Wellness", emoji: "💆", intro: "Documents for spa and wellness operations.", itemIds: ["cac_ltd","tin","spa_premises","env_health_permit","fire_safety","tcc"] },
  { id: "beauty_retail", name: "Beauty — Cosmetics Retail", emoji: "💄", intro: "For cosmetics retailers selling NAFDAC-registered products.", itemIds: ["cac_ltd","tin","vat_reg","env_health_permit","tcc"] },
  { id: "beauty_brand", name: "Beauty — Cosmetics Brand", emoji: "🧴", intro: "For brands manufacturing their own cosmetics.", itemIds: ["cac_ltd","tin","vat_reg","factory_licence","nafdac_full","cpan_membership","tcc"] },

  { id: "fashion_tailor", name: "Fashion — Tailoring", emoji: "🪡", intro: "For independent tailoring and bespoke clothing businesses.", itemIds: ["cac_bn","tin","tcc"] },
  { id: "fashion_brand", name: "Fashion — Brand", emoji: "👗", intro: "For fashion brands selling under their own label.", itemIds: ["cac_ltd","tin","vat_reg","trademark","fdcn_membership","tcc"] },
  { id: "fashion_export", name: "Fashion — Export", emoji: "🌍", intro: "For fashion brands exporting to international markets.", itemIds: ["cac_ltd","tin","vat_reg","trademark","fdcn_membership","nepc","fashion_export_permit","tcc"] },

  { id: "media_film", name: "Media — Film Production", emoji: "🎬", intro: "For film and video production houses.", itemIds: ["cac_ltd","tin","vat_reg","ncc_film_permit","copyright_registration","tcc"] },
  { id: "media_music", name: "Media — Music Label", emoji: "🎵", intro: "For music labels and recording studios.", itemIds: ["cac_ltd","tin","vat_reg","copyright_registration","prsn_membership","tcc"] },
  { id: "media_broadcast", name: "Media — Broadcast", emoji: "📺", intro: "For TV, radio, and online streaming services.", itemIds: ["cac_ltd","tin","vat_reg","nbc_licence","copyright_registration","tcc"] },
  { id: "media_event", name: "Media — Events Co", emoji: "🎉", intro: "For event planning and management companies.", itemIds: ["cac_ltd","tin","vat_reg","tcc"] },

  { id: "print_commercial", name: "Print — Commercial", emoji: "🖨", intro: "For commercial printing presses.", itemIds: ["cac_ltd","tin","vat_reg","printers_permit","env_permit","tcc"] },
  { id: "print_book", name: "Print — Book Publishing", emoji: "📚", intro: "For book and journal publishing houses.", itemIds: ["cac_ltd","tin","vat_reg","isbn_registration","copyright_registration","tcc"] },
  { id: "print_periodical", name: "Print — Periodical", emoji: "📰", intro: "For periodical and magazine publishers.", itemIds: ["cac_ltd","tin","vat_reg","nbc_licence","copyright_registration","tcc"] },

  { id: "security_guard", name: "Security — Private Guard", emoji: "🛡", intro: "For private security companies providing manned guarding.", itemIds: ["cac_ltd","tin","vat_reg","nscdc_security_licence","tcc","nsitf","pencom"] },
  { id: "security_cctv", name: "Security — CCTV / Electronic", emoji: "📹", intro: "For CCTV, alarm, and electronic security installers.", itemIds: ["cac_ltd","tin","vat_reg","cctv_installer_permit","tcc"] },
  { id: "security_cit", name: "Security — Cash-in-Transit", emoji: "🚐", intro: "For armored car and cash-in-transit operators.", itemIds: ["cac_ltd","tin","vat_reg","nscdc_security_licence","tcc","nsitf"] },

  { id: "cleaning_commercial", name: "Cleaning — Commercial", emoji: "🧼", intro: "For commercial cleaning service providers.", itemIds: ["cac_ltd","tin","vat_reg","env_health_permit","tcc","nsitf"] },
  { id: "cleaning_fumigation", name: "Cleaning — Fumigation", emoji: "🐀", intro: "For fumigation and pest control operators.", itemIds: ["cac_ltd","tin","vat_reg","fumigation_permit","env_permit","tcc","nsitf"] },

  { id: "auto_dealership", name: "Auto — Dealership", emoji: "🚗", intro: "For new and used vehicle dealerships.", itemIds: ["cac_ltd","tin","vat_reg","motor_dealer_licence","tcc"] },
  { id: "auto_garage", name: "Auto — Garage", emoji: "🔧", intro: "For auto repair garages and workshops.", itemIds: ["cac_ltd","tin","vat_reg","motor_workshop_permit","env_permit","tcc"] },
  { id: "auto_parts", name: "Auto — Parts Dealer", emoji: "⚙️", intro: "For auto parts and accessories dealers.", itemIds: ["cac_ltd","tin","vat_reg","tcc"] },

  { id: "fitness_gym", name: "Fitness — Gym", emoji: "💪", intro: "For full-service gyms and fitness centers.", itemIds: ["cac_ltd","tin","vat_reg","fitness_premises_permit","env_health_permit","fire_safety","tcc"] },
  { id: "fitness_studio", name: "Fitness — Studio", emoji: "🧘", intro: "For boutique fitness studios — yoga, pilates, dance.", itemIds: ["cac_ltd","tin","fitness_premises_permit","env_health_permit","tcc"] },
  { id: "fitness_sports", name: "Fitness — Sports Club", emoji: "⚽", intro: "For sports clubs and youth academies.", itemIds: ["cac_ngo","tin","fitness_premises_permit","env_health_permit","tcc"] },

  { id: "childcare_daycare", name: "Childcare — Daycare", emoji: "🧒", intro: "For full-time childcare facilities.", itemIds: ["cac_ltd","tin","daycare_approval","env_health_permit","fire_safety","tcc"] },
  { id: "childcare_afterschool", name: "Childcare — After-School", emoji: "📒", intro: "For after-school programs and learning centers.", itemIds: ["cac_ltd","tin","daycare_approval","env_health_permit","tcc"] },

  { id: "insurance_brokerage", name: "Insurance Brokerage", emoji: "🛟", intro: "Documents to legally operate as an insurance broker.", itemIds: ["cac_ltd","tin","vat_reg","naicom_brokerage","niib_membership","tcc"] },

  { id: "legal_chambers", name: "Legal — Law Chambers", emoji: "⚖️", intro: "For law chambers and partnerships.", itemIds: ["cac_bn","tin","scn_chamber_registration","nba_branch_membership","tcc"] },
  { id: "legal_consultancy", name: "Legal — Consultancy", emoji: "📑", intro: "For legal consultancy firms (non-litigation).", itemIds: ["cac_ltd","tin","vat_reg","professional_indemnity","tcc"] },

  { id: "accounting_audit", name: "Accounting — Audit", emoji: "📊", intro: "For full-service audit firms.", itemIds: ["cac_ltd","tin","vat_reg","ican_firm_registration","frc_registration","tcc"] },
  { id: "accounting_tax", name: "Accounting — Tax Consultancy", emoji: "📋", intro: "For tax consultancy and advisory firms.", itemIds: ["cac_ltd","tin","vat_reg","ican_firm_registration","tcc"] },
  { id: "accounting_bookkeeping", name: "Accounting — Bookkeeping", emoji: "📓", intro: "For bookkeeping and accounting services.", itemIds: ["cac_bn","tin","tcc"] },

  { id: "import_general", name: "Import — General Trading", emoji: "📦", intro: "For general importers and trading companies.", itemIds: ["cac_ltd","tin","vat_reg","ncs_importer_code","tcc"] },
  { id: "import_customs", name: "Import — Customs Agent", emoji: "🛃", intro: "For licensed customs clearing agents.", itemIds: ["cac_ltd","tin","vat_reg","customs_agent_licence","ncs_importer_code","tcc"] },
  { id: "import_regulated", name: "Import — Regulated Goods", emoji: "⚠️", intro: "For importers of regulated goods (food, pharma, chemicals).", itemIds: ["cac_ltd","tin","vat_reg","ncs_importer_code","product_specific_permits","tcc"] },

  { id: "microfinance_bank", name: "Microfinance — Bank", emoji: "🏦", intro: "For licensed microfinance banks.", itemIds: ["cac_ltd","tin","vat_reg","cbn_microfinance_licence","aml_compliance","data_protection","tcc"] },
  { id: "microfinance_coop", name: "Microfinance — Cooperative", emoji: "💰", intro: "For cooperative societies and savings groups.", itemIds: ["cooperative_registration","tin","tcc","annual_returns"] },

  { id: "consulting_management", name: "Consulting — Management", emoji: "💼", intro: "For general management consulting firms.", itemIds: ["cac_ltd","tin","vat_reg","professional_indemnity","tcc"] },
  { id: "consulting_hr", name: "Consulting — HR / Recruitment", emoji: "👥", intro: "For HR consulting and recruitment firms.", itemIds: ["cac_ltd","tin","vat_reg","professional_indemnity","tcc"] },
  { id: "consulting_training", name: "Consulting — Training", emoji: "🎯", intro: "For training, coaching, and capability development firms.", itemIds: ["cac_ltd","tin","vat_reg","tcc"] },

  { id: "construction_block", name: "Construction Supply — Block Factory", emoji: "🧱", intro: "For block-making factories and concrete suppliers.", itemIds: ["cac_ltd","tin","vat_reg","factory_licence","son_block_certification","env_permit","tcc"] },
  { id: "construction_cement", name: "Construction Supply — Cement Dealer", emoji: "🏗", intro: "For cement and building materials dealers.", itemIds: ["cac_ltd","tin","vat_reg","tcc"] },
  { id: "construction_steel", name: "Construction Supply — Steel", emoji: "🔩", intro: "For steel, iron, and metal suppliers.", itemIds: ["cac_ltd","tin","vat_reg","son_mancap","tcc"] },

  { id: "ict_software", name: "ICT — Software / SaaS", emoji: "💻", intro: "For software development houses and SaaS companies.", itemIds: ["cac_ltd","tin","vat_reg","nitda_registration","ndpr_basic","tcc"] },
  { id: "ict_services", name: "ICT — Services / Hardware", emoji: "🖥", intro: "For ICT service providers and hardware vendors.", itemIds: ["cac_ltd","tin","vat_reg","nitda_registration","tcc"] },
  { id: "ict_data", name: "ICT — Data / Analytics", emoji: "📊", intro: "For data analytics, AI, and machine learning companies.", itemIds: ["cac_ltd","tin","vat_reg","nitda_registration","ndpr_basic","tcc"] },

  { id: "renewable_solar", name: "Renewable — Solar Installer", emoji: "☀️", intro: "For solar panel installers and EPC contractors.", itemIds: ["cac_ltd","tin","vat_reg","rea_partnership","tcc"] },
  { id: "renewable_minigrid", name: "Renewable — Mini-Grid", emoji: "🔋", intro: "For off-grid and mini-grid energy operators.", itemIds: ["cac_ltd","tin","vat_reg","nerc_solar_permit","env_permit","rea_partnership","tcc"] },
  { id: "renewable_trading", name: "Renewable — Energy Trading", emoji: "⚡", intro: "For energy trading and aggregation businesses.", itemIds: ["cac_ltd","tin","vat_reg","nerc_solar_permit","tcc"] },
];

export const bizdocServicesCatalog: DivisionServicesCatalog = {
  categories: [
    {
      id: "certifications",
      name: "Certifications & Documentation",
      intro: "Single certificates, renewals, modifications and annual returns — organized by what your business needs first.",
      items: certifications,
    },
    {
      id: "compliance",
      name: "Compliance Management",
      intro: "Annual subscriptions where we watch your dashboards, file on time, and keep your status active.",
      items: compliance,
    },
    {
      id: "legal",
      name: "Legal Documents",
      intro: "Custom-drafted contracts, plus pamphlets and setup guides — written by lawyers, priced for SMEs.",
      items: legal,
    },
    {
      id: "industry_specific",
      name: "By industry — quick paths",
      intro: "Sector-specific permits and registrations referenced by the industry packages.",
      items: industryItems,
    },
  ],
  industries,
};
