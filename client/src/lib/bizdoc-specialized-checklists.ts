/* ══════════════════════════════════════════════════════════════════════════
   BIZDOC — Specialized Business Checklists (Phase 2, v15)
   --------------------------------------------------------------------------
   Static reference data for the Bizdoc chat's "Specialized Business Setup"
   menu. Each entry corresponds to one of the 25 specialized business types
   spelled out in MASTER-CHAT-FLOW.md (SITE 2 → GROUP 4).

   When a visitor picks a specialized business in the chat, the bot renders
   `checklist` as tickable items inside a single bot bubble. Each item has a
   short title and a one-sentence "Why" line explaining what the requirement
   is for. Lists are intentionally comprehensive (8-15 items) so the visitor
   sees the full scope of work and Bizdoc looks like the expert.

   ⚠ EVERY checklist on this page is marked DRAFT 2026-04. The Hamzury team
     must verify each list with the relevant Nigerian regulator before the
     bot starts producing real quotes from these items. Regulatory rules
     (capital floors, licence categories, agency renames) change.
   ══════════════════════════════════════════════════════════════════════════ */

export type ChecklistItem = {
  title: string;
  why: string;
};

export type SpecializedBusiness = {
  id: string;          // stable slug used by the chat menu + lead capture
  label: string;       // visible menu label (matches MASTER-CHAT-FLOW.md verbatim)
  checklist: ChecklistItem[]; // 8-15 items
  notes?: string;      // optional follow-up bot message (used for catch-all #25)
  /* Phase 3 (v16) — legal minimum share capital for a Ltd/PLC in this
   * regulated category. Used by the pre-payment questionnaire to grey out
   * options below the floor. Defaults to ₦1,000,000 (the standard Nigerian
   * Ltd minimum) when omitted. Source: MASTER-CHAT-FLOW.md "SHARE CAPITAL
   * LOOKUP TABLE". */
  minShareCapital?: number;
};

export const BIZDOC_SPECIALIZED: SpecializedBusiness[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Export & International Trade
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "export_international_trade",
    label: "Export & International Trade",
    checklist: [
      { title: "CAC Business Registration", why: "Without this, your business doesn't legally exist. You can't open a bank account, sign export contracts, or pay tax." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS to file taxes, open corporate accounts, and clear goods through customs." },
      { title: "NEPC Exporter Registration", why: "The Nigerian Export Promotion Council issues the export licence every Nigerian exporter is legally required to hold." },
      { title: "Nigeria Customs Service (NCS) registration", why: "Required to file customs entries, get release of goods, and access the export pipeline." },
      { title: "Form NXP (Nigerian Export Proceeds form)", why: "Mandatory CBN form filed for every shipment to repatriate export proceeds through the official window." },
      { title: "Pre-shipment Inspection Agent (PIA) appointment", why: "Required for inspection, valuation, and reconciliation of export consignments before shipment." },
      { title: "Product-specific certifications (NAFDAC / SON / Cocoa Board / NSC)", why: "Each commodity class needs its own quality certificate before customs will release it for export." },
      { title: "Certificate of Origin", why: "Required by buyer countries to confirm goods are Nigerian-made and to claim AfCFTA / ECOWAS preferential tariffs." },
      { title: "Phytosanitary / Sanitary certificate (for agro/food exports)", why: "Issued by NAQS or Federal Ministry of Agriculture; required for any plant or animal product." },
      { title: "Domiciliary account (USD/EUR/GBP)", why: "Lets you receive payment from foreign buyers in the original currency through a Nigerian bank." },
      { title: "VAT registration", why: "Exports are zero-rated for VAT but you must be registered to claim back input VAT on local purchases." },
      { title: "Trademark registration", why: "Recommended — protects your brand name in Nigeria and is the basis for international registrations under the Madrid Protocol." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Import Business
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "import_business",
    label: "Import Business",
    checklist: [
      { title: "CAC Business Registration", why: "Required to legally trade, open accounts, and register with customs as an importer." },
      { title: "TIN — Tax Identification Number", why: "FIRS-issued; without it you cannot clear goods, claim VAT, or pay corporate tax." },
      { title: "Nigeria Customs Service (NCS) Importer Registration", why: "Every importer needs a customs profile and a Tax Identification Number linked to it before goods can be cleared." },
      { title: "Form M (CBN)", why: "The mandatory CBN application form opened before any import; without an approved Form M your shipment will not be cleared." },
      { title: "PAAR (Pre-Arrival Assessment Report)", why: "Issued by Customs after Form M approval; used as the basis for duty assessment at the port." },
      { title: "Product-specific permits (NAFDAC / SON / DPR / NCC)", why: "Each regulated category — food, drugs, cosmetics, electronics, fuel, telecoms equipment — needs its own import permit." },
      { title: "SONCAP Certificate (for regulated goods)", why: "Standards Organisation of Nigeria Conformity Assessment Programme certificate required before regulated goods leave the source country." },
      { title: "Licensed Customs Agent appointment", why: "Required to file declarations and process clearance on your behalf at the port." },
      { title: "Domiciliary account (USD/EUR/GBP)", why: "Used to pay foreign suppliers and to handle Form M settlement through your bank." },
      { title: "VAT registration", why: "Imports attract VAT at the point of clearance; you need to be VAT-registered to recover input VAT." },
      { title: "Insurance certificate (marine/cargo)", why: "Mandatory for every Form M; protects your shipment in transit and is required for clearance." },
      { title: "Trademark registration", why: "Recommended to protect your imported brand against parallel importers and counterfeiters in Nigeria." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Mining & Solid Minerals
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "mining_solid_minerals",
    label: "Mining & Solid Minerals",
    minShareCapital: 10_000_000, // Phase 3 — Mining Cadastre Office floor
    checklist: [
      { title: "CAC Limited Liability Company", why: "Mining titles are issued only to companies; sole traders and BNs cannot hold a mineral title." },
      { title: "TIN — Tax Identification Number", why: "Required for tax filings and for issuance of mineral titles by the Mining Cadastre Office." },
      { title: "Minimum share capital of ₦10,000,000", why: "Industry-specific CAC requirement for any company applying for a mineral title." },
      { title: "Mining Cadastre Office (MCO) Title — Exploration / Mining Lease / Quarry / Small-Scale", why: "The legal right to explore or mine a defined area; without a title from MCO, mining is illegal." },
      { title: "Federal Ministry of Mines and Steel Development permit", why: "Policy-level approval for the project, separate from the title issued by MCO." },
      { title: "Environmental Impact Assessment (EIA) certificate", why: "Issued by Federal Ministry of Environment; mining cannot start until EIA is approved." },
      { title: "Community Development Agreement (CDA)", why: "Mandatory written agreement with the host community signed before operations begin — protects social licence to operate." },
      { title: "Explosives Licence (where blasting is involved)", why: "Issued by Office of the Mines Inspectorate; required for any rock-blasting or use of detonators." },
      { title: "Annual Service Fees + Surface Rent", why: "Continuous payments to keep your mineral title alive — non-payment leads to revocation." },
      { title: "NEPC Exporter Registration (if exporting minerals)", why: "Required for any export of solid minerals or their concentrates." },
      { title: "Certificate of Origin (for mineral exports)", why: "Required by buyer countries to confirm Nigerian source and to satisfy conflict-mineral due diligence." },
      { title: "State / LGA business premises permit", why: "Required for the office and for the mine site at local government level." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Oil & Gas
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "oil_and_gas",
    label: "Oil & Gas",
    minShareCapital: 20_000_000, // Phase 3 — Oil & Gas (Marketing) NMDPRA floor
    checklist: [
      { title: "CAC Limited Liability Company", why: "Oil & gas licences are issued only to incorporated companies, never to BNs or individuals." },
      { title: "TIN — Tax Identification Number", why: "Required by NUPRC, NMDPRA, and FIRS for any registration or licence application." },
      { title: "Minimum share capital of ₦20,000,000 (marketing) or higher (other licences)", why: "CAC and sector regulators require a substantial paid-up capital before issuing any operating licence." },
      { title: "NUPRC Registration (upstream — exploration / production)", why: "Nigerian Upstream Petroleum Regulatory Commission; required for any upstream operator or service provider." },
      { title: "NMDPRA Licence (downstream — refining, distribution, retail)", why: "Nigerian Midstream and Downstream Petroleum Regulatory Authority; required for retail outlets, depots, LPG, and gas processing." },
      { title: "NCDMB Registration & Nigerian Content Plan", why: "Nigerian Content Development and Monitoring Board; required to bid for any oil & gas contract in Nigeria." },
      { title: "DPR / NMDPRA category-specific permits (LPG, retail, depot, lubricant blending)", why: "Each line of business has its own permit category with its own technical and capital requirements." },
      { title: "Department of State Services (DSS) clearance", why: "Required for directors of companies operating in oil & gas because of national security implications." },
      { title: "Environmental Impact Assessment (EIA)", why: "Mandatory before construction or operation of any facility — refinery, depot, retail station, processing plant." },
      { title: "Fire Safety Certificate", why: "Required for any premises handling hydrocarbons; renewable annually." },
      { title: "Standards Organisation of Nigeria (SON) certification", why: "Required for tanks, dispensers, and equipment to meet Nigerian Industrial Standards." },
      { title: "State / LGA premises permit + signage permit", why: "Required at every retail or storage location." },
      { title: "Insurance: public liability + product liability + employer's liability", why: "Sector regulators require evidence of insurance covering third parties, product, and staff." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Agriculture & Agribusiness
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "agriculture_agribusiness",
    label: "Agriculture & Agribusiness",
    checklist: [
      { title: "CAC Business Registration", why: "Required to legally trade, access government grants, and open corporate accounts." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS even though primary agriculture income is largely tax-exempt." },
      { title: "Federal Ministry of Agriculture registration", why: "Lets you access subsidies, extension services, and government schemes (e.g. CBN Anchor Borrowers Programme)." },
      { title: "NAQS — Nigeria Agricultural Quarantine Service permit", why: "Required for any movement of plant or animal products across state or international borders." },
      { title: "NAFDAC Registration (for processed/packaged agro-products)", why: "Required for any food, beverage, or processed agro-product sold to the public." },
      { title: "SON certification (for packaged or branded products)", why: "Required for any product carrying a Nigerian Industrial Standard mark." },
      { title: "Land documentation — Certificate of Occupancy or registered lease", why: "Required to prove land tenure for any farm or plant; needed for grants and bank loans." },
      { title: "Environmental Impact Assessment (for medium/large farms or processing plants)", why: "Federal Ministry of Environment requires EIA for projects above defined thresholds." },
      { title: "State Ministry of Agriculture registration", why: "Each state runs its own farmer registration scheme that unlocks state-level inputs and grants." },
      { title: "Cooperative society registration (optional, recommended)", why: "Lets you access funds, training, and pooled inputs available only to registered cooperatives." },
      { title: "Phytosanitary / veterinary certificates (for export)", why: "Required by importing countries for any plant or animal product crossing borders." },
      { title: "VAT registration", why: "Even though most agro-products are zero-rated, registration lets you reclaim input VAT on inputs and packaging." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Manufacturing
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "manufacturing",
    label: "Manufacturing",
    checklist: [
      { title: "CAC Limited Liability Company", why: "Manufacturers face heavy regulatory exposure; an Ltd protects personal assets and is required by most institutional buyers." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS for company income tax, VAT, withholding tax, and PAYE filings." },
      { title: "Standards Organisation of Nigeria (SON) — MANCAP certificate", why: "The Mandatory Conformity Assessment Programme is required for any locally-manufactured product sold to the public." },
      { title: "NAFDAC registration (for food, drug, cosmetics, water, packaged consumables)", why: "Mandatory before any regulated consumable product can be sold or distributed." },
      { title: "Manufacturers Association of Nigeria (MAN) membership", why: "Industry membership that unlocks grants, advocacy, and access to government incentives." },
      { title: "Environmental Impact Assessment (EIA)", why: "Required by Federal Ministry of Environment for any factory above a defined emissions / footprint threshold." },
      { title: "Factory Licence — Federal Ministry of Labour (Inspectorate Division)", why: "The legal authority to operate a factory; covers occupational safety inspections." },
      { title: "Fire Safety Certificate", why: "Mandatory for any factory premises; renewable annually." },
      { title: "State urban planning / building permit", why: "Required to construct or convert any building used as a factory." },
      { title: "ITF — Industrial Training Fund (employer with 5+ staff)", why: "Mandatory 1% of payroll contribution; non-compliance triggers fines and blocks government tenders." },
      { title: "PENCOM compliance certificate (employer with 3+ staff)", why: "Required by law and is a precondition for federal tenders and many corporate contracts." },
      { title: "NSITF — Employees Compensation Scheme", why: "1% of payroll contribution; covers staff for workplace accidents and is a tender precondition." },
      { title: "VAT registration", why: "Manufactured goods attract VAT; registration is mandatory and lets you recover input VAT on raw materials." },
      { title: "Trademark registration", why: "Protects your brand against copycats — essential for any consumer-facing manufacturer." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Construction & Real Estate
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "construction_real_estate",
    label: "Construction & Real Estate",
    checklist: [
      { title: "CAC Limited Liability Company", why: "Required to bid for any sizeable construction or real-estate project; protects directors' personal assets." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS and a precondition for every public-sector contract." },
      { title: "COREN registration (Council for the Regulation of Engineering in Nigeria)", why: "Engineering work must be supervised by COREN-registered engineers; the firm needs to be COREN-recognised." },
      { title: "ARCON registration (Architects Registration Council of Nigeria)", why: "Required for any architectural design service; firms employing architects must be registered." },
      { title: "QSRBN registration (Quantity Surveyors Registration Board)", why: "Required for any QS-led valuation, BoQ, or project management service." },
      { title: "BPP / IRR Registration", why: "Bureau of Public Procurement Interim Registration is mandatory to bid for any federal government construction contract." },
      { title: "State urban planning / building permit", why: "Required for every project before any structure is erected; obtained from state Ministry of Physical Planning." },
      { title: "Environmental Impact Assessment (EIA)", why: "Required for projects above defined thresholds; required by lenders and most public-sector clients." },
      { title: "ITF / PENCOM / NSITF compliance (employer obligations)", why: "Required for any contractor with 3+ staff and for every government tender." },
      { title: "Builders' All-Risk + Public Liability Insurance", why: "Required by clients, lenders, and most building permits; covers site accidents and third-party damage." },
      { title: "Estate Surveyors and Valuers Registration Board (ESVARBON)", why: "Required for any firm offering valuation or property management services." },
      { title: "VAT registration", why: "Construction services attract VAT at 7.5%; registration is mandatory." },
      { title: "LGA business premises permit", why: "Required for the head office and each project site." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. Hospitality (Hotels, Restaurants, Catering)
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "hospitality",
    label: "Hospitality (Hotels, Restaurants, Catering)",
    checklist: [
      { title: "CAC Business Registration", why: "Required to legally trade, sign supplier contracts, and open corporate accounts." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS for company income tax, consumption tax, and PAYE." },
      { title: "NTDC Registration (Nigerian Tourism Development Corporation)", why: "Mandatory federal registration for hotels, restaurants, and tour operators; renewable annually." },
      { title: "State Tourism Board licence (e.g. LSTPB, KSTB)", why: "Each state requires its own tourism licence and grading; sets your category and consumption-tax rate." },
      { title: "NAFDAC registration (for any in-house bottled or packaged products)", why: "Required if you bottle water, juice, or sell packaged food products under your brand." },
      { title: "Fire Safety Certificate", why: "Required for every guest-receiving premises; renewable annually by the state Fire Service." },
      { title: "State Consumption Tax registration", why: "Most states levy 5% consumption tax on hotel and restaurant bills; you must collect and remit it." },
      { title: "Environmental Health Certificate (food handlers + premises)", why: "Required for every food-handling staff member and for the kitchen premises; LGA-issued." },
      { title: "LGA business premises permit + signage permit", why: "Required at each branch; signage permit is a separate fee at LGA level." },
      { title: "NCC / Music & Performance Licence (where music is played)", why: "Required to legally play recorded or live music in the venue; collected by COSON / MCSN." },
      { title: "Liquor licence (if alcohol is served)", why: "Issued by state board; required separately from the food/restaurant licence." },
      { title: "ITF + PENCOM + NSITF (employer with 3-5+ staff)", why: "Mandatory for any sizeable hospitality operation; tender preconditions for corporate accounts." },
      { title: "VAT registration", why: "Hospitality services attract VAT at 7.5% in addition to state consumption tax." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9. Healthcare & Medical
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "healthcare_medical",
    label: "Healthcare & Medical",
    checklist: [
      { title: "CAC Business Registration", why: "Without this, your business doesn't legally exist. You can't open a bank account, sign contracts, or pay tax." },
      { title: "TIN — Tax Identification Number", why: "Required to file taxes, open corporate accounts, and bid for contracts. Issued by FIRS." },
      { title: "Federal Ministry of Health Approval", why: "Required to operate hospitals, clinics, diagnostic centers, or any specialized health service." },
      { title: "NAFDAC Registration", why: "Required for any medical product, drug, or device you sell, import, or distribute." },
      { title: "Pharmacists Council of Nigeria Licence", why: "Required for any pharmacy or pharmaceutical sales." },
      { title: "Hospital / Medical Facility Licence", why: "State-level licence to operate any patient-facing facility." },
      { title: "Professional Indemnity Insurance", why: "Mandatory for medical practitioners. Protects against malpractice claims." },
      { title: "Medical Waste Disposal Permit", why: "Required if your facility generates biohazard waste." },
      { title: "Fire Safety Certificate", why: "Required for any premises receiving patients." },
      { title: "Premises Registration with NMA / MDCN", why: "Required where doctors are practicing." },
      { title: "ITF / PENCOM / NSITF compliance (employer with 3+ staff)", why: "Mandatory for any hospital, clinic, or pharmacy that employs nurses, technicians, or admin staff." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 10. Education & Training
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "education_training",
    label: "Education & Training",
    checklist: [
      { title: "CAC Registration (Ltd, BN, or Incorporated Trustees)", why: "Required to legally operate; many regulators issue licences only to companies or registered trustees." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS even though most educational services are VAT-exempt." },
      { title: "State Ministry of Education approval", why: "Required for any pre-school, primary, secondary, or vocational school; sets curriculum and inspection terms." },
      { title: "Federal Ministry of Education approval (for higher institutions)", why: "Required for tertiary, degree-awarding, or specialised national institutes." },
      { title: "NUC / NBTE / NCCE accreditation (where applicable)", why: "Universities, polytechnics, and colleges of education must be accredited by the right council before operating." },
      { title: "NABTEB / WAEC / NECO recognition (for exam-prep schools)", why: "Schools preparing students for these exams need to be recognised as registered centres." },
      { title: "ITF certification (vocational/training providers)", why: "Industrial Training Fund accredits providers and lets clients claim ITF reimbursement on training fees." },
      { title: "Premises licence + Fire Safety Certificate", why: "Required for every campus or training centre; child-facing facilities are inspected closely." },
      { title: "Land documentation / building approval", why: "Schools usually need clear land title and an approved building plan as part of MoE inspection." },
      { title: "Child Safeguarding Policy + DBS-style staff vetting", why: "State MoE inspections increasingly require documented safeguarding policy and vetted staff records." },
      { title: "PENCOM + NSITF + ITF (employer obligations)", why: "Schools with 3+ staff must comply; non-compliance blocks government grants and corporate contracts." },
      { title: "Trademark registration", why: "Protects the school name and brand against copycats — common in education." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 11. Financial Services & Fintech
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "financial_services_fintech",
    label: "Financial Services & Fintech",
    minShareCapital: 100_000_000, // Phase 3 — Fintech (PSP licence) CBN floor; microfinance is even higher (₦200M)
    checklist: [
      { title: "CAC Limited Liability Company", why: "CBN, SEC, and NAICOM only license incorporated companies for any financial-services activity." },
      { title: "TIN — Tax Identification Number", why: "Required for company income tax, VAT, and as a precondition for any CBN licence." },
      { title: "Minimum share capital (varies by licence — ₦100m PSP, ₦500m MMO, ₦200m MfB, etc.)", why: "Each CBN licence has a hard paid-up capital floor; the application is dead on arrival without it." },
      { title: "CBN Licence (PSSP / PSP / MMO / Switching / Microfinance Bank)", why: "Mandatory before you can hold customer funds, process payments, or call yourself a fintech." },
      { title: "SCUML Certificate", why: "Special Control Unit Against Money Laundering registration; required for every financial-services firm regardless of size." },
      { title: "AML/CFT Policy Manual + Compliance Officer", why: "CBN and EFCC require a written AML/CFT policy and a designated Compliance Officer before licence is issued." },
      { title: "NDPR / NDPC Data Protection Compliance (DPCO)", why: "Required for any business handling personal financial data; annual audit by an NDPC-licensed DPCO." },
      { title: "PCI-DSS certification (where card data is handled)", why: "Required by card schemes (Visa, Mastercard) for any business storing or transmitting card data." },
      { title: "ISO 27001 / ISO 22301 (recommended for licensing)", why: "CBN reviews information-security and business-continuity certifications during fit-and-proper assessment." },
      { title: "Directors' fit-and-proper clearance", why: "CBN runs background checks on every director; criminal history or prior regulatory sanctions block the licence." },
      { title: "EFCC / NFIU registration", why: "Required for financial-services firms to file Suspicious Transaction and Currency Transaction Reports." },
      { title: "Bankers' Bond / Fidelity Insurance", why: "Required by CBN for staff handling customer funds." },
      { title: "Trademark registration", why: "Critical in fintech — protects your brand against copycats and clears the path to international expansion." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 12. Logistics & Transportation
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "logistics_transportation",
    label: "Logistics & Transportation",
    checklist: [
      { title: "CAC Business Registration", why: "Required to operate as a fleet, courier, or freight-forwarding company." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS for VAT, withholding tax, and corporate income tax." },
      { title: "NIPOST Courier Licence (Class A / B / C / D)", why: "Mandatory for any courier or last-mile delivery business; the class depends on your geographic scope." },
      { title: "Council for the Regulation of Freight Forwarding in Nigeria (CRFFN)", why: "Required for any freight-forwarding or customs-clearance business." },
      { title: "Federal / State Road Transport Permit", why: "Required for inter-state passenger or commercial transport; issued by Federal Road Safety / State Ministry of Transport." },
      { title: "VIO Vehicle Documentation (Roadworthiness, Hackney, Insurance)", why: "Every commercial vehicle in the fleet needs current papers; failure = impoundment and fines." },
      { title: "NCAA Certification (for air freight/cargo)", why: "Nigerian Civil Aviation Authority approval is mandatory for any air-cargo or aviation-services activity." },
      { title: "NIMASA Registration (for sea/inland-water freight)", why: "Required for any maritime or inland-water freight company." },
      { title: "GIT (Goods-in-Transit) Insurance + Motor Insurance + Public Liability", why: "Required to protect cargo, vehicles, and third parties; clients and lenders demand evidence." },
      { title: "State / LGA business premises permit + signage permit", why: "Required at each depot or hub." },
      { title: "PENCOM + ITF + NSITF (employer obligations)", why: "Logistics firms typically employ many drivers and ops staff; mandatory once you cross 3-5 staff." },
      { title: "Trademark registration", why: "Recommended — protects the courier brand and is needed for cross-border expansion." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 13. Telecommunications
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "telecommunications",
    label: "Telecommunications",
    checklist: [
      { title: "CAC Limited Liability Company", why: "NCC issues telecom licences only to incorporated companies." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS and as a precondition for any NCC application." },
      { title: "NCC Licence (ISP, VAS, Tower, Sales & Installation, etc.)", why: "Mandatory licence from the Nigerian Communications Commission; the class depends on the service offered." },
      { title: "NCC Type-Approval for any equipment sold or deployed", why: "Every telecom device or terminal must carry NCC type-approval before it can be sold or operated in Nigeria." },
      { title: "Right-of-Way (RoW) permits from each state crossed", why: "Required for any fibre-laying or duct installation; each state charges separately." },
      { title: "Environmental Impact Assessment (EIA) for tower / mast deployment", why: "Federal Ministry of Environment requires EIA before any tower above defined height." },
      { title: "Aviation clearance (for towers above defined height)", why: "Nigerian Civil Aviation Authority must clear any structure that could interfere with flight paths." },
      { title: "NDPR / NDPC Data Protection Compliance", why: "Telecom firms handle vast personal data; annual NDPC audit is mandatory." },
      { title: "SCUML Certificate (for VAS handling subscriber funds)", why: "Required where the VAS handles customer wallets, recharge, or money-related services." },
      { title: "Spectrum licence fees (for any radio-spectrum use)", why: "Annual NCC spectrum fees apply for any use of the radio spectrum." },
      { title: "Public Liability + Equipment Insurance", why: "Required for tower operators and field-service providers." },
      { title: "PENCOM + ITF + NSITF (employer obligations)", why: "Mandatory once headcount crosses the statutory threshold; tender precondition." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 14. Media & Entertainment
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "media_entertainment",
    label: "Media & Entertainment",
    checklist: [
      { title: "CAC Business Registration", why: "Required to legally trade, sign artist/talent contracts, and open corporate accounts." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS for VAT, withholding tax, and corporate income tax." },
      { title: "NBC Licence (broadcast — TV, radio, satellite, cable)", why: "Nigerian Broadcasting Commission licence is mandatory for any broadcaster, including online streamers carrying live programming." },
      { title: "National Film and Video Censors Board (NFVCB) registration", why: "Required for film producers, marketers, distributors, and any cinema or VOD platform." },
      { title: "Nigerian Copyright Commission (NCC) registration", why: "Recommended for every original work — film, music, book, software — to evidence ownership in court." },
      { title: "Music Performance Licences (MCSN / COSON)", why: "Required for any business publicly performing or broadcasting recorded music." },
      { title: "Advertising Practitioners Council of Nigeria (APCON) registration", why: "Required for any advertising or PR agency; ad creatives also need APCON vetting." },
      { title: "ARCON / NIPR registration (where applicable)", why: "Reform Council and Public Relations registration required for related practitioners." },
      { title: "Premises Licence + Fire Safety Certificate", why: "Required for studios, cinemas, and any venue receiving the public." },
      { title: "Public Liability + Equipment Insurance", why: "Required for any production company moving expensive gear and shooting on third-party premises." },
      { title: "Trademark registration", why: "Critical for any media brand — show name, label, podcast, channel — to prevent copycats." },
      { title: "PENCOM + ITF + NSITF (employer obligations)", why: "Mandatory once staff headcount crosses 3-5; preconditions for ad-agency tenders." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 15. Pharmaceutical
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "pharmaceutical",
    label: "Pharmaceutical",
    minShareCapital: 20_000_000, // Phase 3 — Pharmaceutical Manufacturing PCN floor
    checklist: [
      { title: "CAC Limited Liability Company", why: "Pharmaceutical licences are issued only to incorporated companies." },
      { title: "TIN — Tax Identification Number", why: "Required for FIRS and as a precondition for NAFDAC and PCN registration." },
      { title: "Minimum share capital of ₦20,000,000 (manufacturing)", why: "Industry-specific CAC requirement for any pharmaceutical manufacturer." },
      { title: "Pharmacists Council of Nigeria (PCN) Premises Licence", why: "Mandatory for any pharmaceutical premises — manufacturing, wholesale, retail; renewable annually." },
      { title: "PCN Superintendent Pharmacist appointment", why: "Every pharmaceutical premises must be under the supervision of a registered pharmacist." },
      { title: "NAFDAC Manufacturer / Importer / Distributor registration", why: "Mandatory before any drug can be made, imported, or sold; NAFDAC numbers must appear on every product." },
      { title: "NAFDAC Product Registration (per SKU)", why: "Each individual drug or formulation needs its own NAFDAC registration with full dossier." },
      { title: "WHO-GMP (Good Manufacturing Practice) certification", why: "Required by NAFDAC and by export markets; without it you cannot manufacture or export drugs." },
      { title: "SCUML Certificate", why: "Pharmaceutical companies fall in EFCC's regulated category and must register with SCUML." },
      { title: "Environmental Impact Assessment (EIA)", why: "Required for any manufacturing plant; effluent and waste-disposal compliance is monitored." },
      { title: "Fire Safety Certificate", why: "Mandatory for warehouses and factories holding flammable solvents and APIs." },
      { title: "ITF / PENCOM / NSITF (employer obligations)", why: "Mandatory; preconditions for federal procurement contracts and FMOH tenders." },
      { title: "Trademark registration", why: "Essential for brand protection — counterfeit drugs are a serious risk in this sector." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 16. Cosmetics & Personal Care
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "cosmetics_personal_care",
    label: "Cosmetics & Personal Care",
    checklist: [
      { title: "CAC Business Registration", why: "Required to legally trade, register products, and sign distributor contracts." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS for VAT, WHT, and as a precondition for NAFDAC registration." },
      { title: "NAFDAC Premises Registration", why: "Mandatory before any cosmetic can be sold; covers your factory, warehouse, or repackaging facility." },
      { title: "NAFDAC Product Registration (per SKU)", why: "Each cosmetic product needs its own NAFDAC number based on its formulation, stability tests, and labelling." },
      { title: "NAFDAC GMP Inspection", why: "Your factory or contract manufacturer must pass NAFDAC's Good Manufacturing Practice inspection." },
      { title: "Standards Organisation of Nigeria (SON) MANCAP", why: "Required for locally-manufactured cosmetics to meet Nigerian Industrial Standards." },
      { title: "SONCAP Certificate (for imported cosmetics)", why: "Required before regulated imported cosmetics can clear customs." },
      { title: "Trademark Registration", why: "Cosmetics brands are highly copied; trademark is your only legal weapon against copycats." },
      { title: "Environmental & Effluent Permit", why: "Required for any factory discharging wastewater; state environmental agency issues this." },
      { title: "Fire Safety Certificate", why: "Required for warehouses and manufacturing premises holding flammable ingredients." },
      { title: "ITF + PENCOM + NSITF (employer obligations)", why: "Mandatory once you cross 3-5 staff; precondition for selling to large retailers." },
      { title: "VAT registration", why: "Cosmetics attract VAT at 7.5%; registration is mandatory for taxable activity." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 17. Food & Beverage Production
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "food_beverage_production",
    label: "Food & Beverage Production",
    checklist: [
      { title: "CAC Business Registration", why: "Required to legally trade, register products with NAFDAC, and supply retailers." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS and as a precondition for NAFDAC registration." },
      { title: "NAFDAC Premises Registration", why: "Mandatory for any food or beverage production facility before products can be sold." },
      { title: "NAFDAC Product Registration (per SKU)", why: "Each product needs its own NAFDAC number based on lab tests, label review, and shelf-life data." },
      { title: "NAFDAC GMP / HACCP audit", why: "Good Manufacturing Practice and Hazard Analysis Critical Control Point audits are mandatory before licence." },
      { title: "SON MANCAP certification", why: "Required for locally-made food and beverage products to meet Nigerian Industrial Standards." },
      { title: "Federal Ministry of Health / Environmental Health certification", why: "Required for premises and food handlers." },
      { title: "Water analysis certificate (for any water-based product)", why: "Required by NAFDAC for products using process water — pure water, soft drinks, juice." },
      { title: "Fire Safety Certificate", why: "Required for any food-production facility; renewable annually." },
      { title: "ISO 22000 / HACCP certification (recommended for export)", why: "Required by international buyers and gives you a quality edge in the local market." },
      { title: "Trademark Registration", why: "Critical for FMCG brands — protects against copycats which are common in this sector." },
      { title: "ITF + PENCOM + NSITF (employer obligations)", why: "Mandatory once headcount crosses 3-5; precondition for retailer onboarding." },
      { title: "VAT registration", why: "Most processed F&B products attract VAT; registration is mandatory." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 18. Government Contract Registration
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "government_contract",
    label: "Government Contract Registration",
    checklist: [
      { title: "CAC Limited Liability Company", why: "Most government tenders are restricted to incorporated companies; BNs cannot bid for serious contracts." },
      { title: "TIN — Tax Identification Number", why: "FIRS-issued; mandatory on every bid document." },
      { title: "Tax Clearance Certificate (TCC) — last 3 years", why: "Every public-sector tender requires three years of clean TCC; missing years disqualify the bid." },
      { title: "BPP Interim Registration Report (IRR)", why: "Bureau of Public Procurement IRR is mandatory for any federal government tender." },
      { title: "PENCOM Compliance Certificate", why: "Required by every federal tender — the bid is rejected without it." },
      { title: "ITF Compliance Certificate", why: "Required by every federal tender — separate certificate from PENCOM." },
      { title: "NSITF Compliance Certificate", why: "Required by every federal tender alongside PENCOM and ITF." },
      { title: "VAT registration + last 3 years' VAT returns", why: "FIRS evidence of regular VAT filing is required for tenders above defined thresholds." },
      { title: "Industrial-Training-Fund Compliance (ITF)", why: "Required for any contractor with 5+ staff." },
      { title: "Audited Financial Statements (last 3 years)", why: "Most tenders require three years of audited accounts; CAC annual returns alone are not sufficient." },
      { title: "CAC Annual Returns up to date", why: "Tenders are checked against CAC; companies in default of annual returns are disqualified." },
      { title: "Bank Reference Letter + Bank Statement", why: "Tenders require evidence of cash backing for the contract size you're bidding on." },
      { title: "MDA-specific registrations (e.g. NPA, BPE, NDDC, FERMA, NIMASA)", why: "Each ministry / parastatal runs its own contractor registration with separate fees." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 19. NGO / Non-Profit
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "ngo_non_profit",
    label: "NGO / Non-Profit",
    checklist: [
      { title: "CAC Incorporated Trustees registration", why: "The right CAC structure for any NGO, foundation, religious or community body — gives the body legal personality." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS even though most NGO income is tax-exempt; you still need to file." },
      { title: "Constitution / Trust Deed", why: "CAC requires a trust deed signed by the trustees; sets out objectives, governance, and dissolution rules." },
      { title: "Special Control Unit Against Money Laundering (SCUML) Certificate", why: "Mandatory for every NGO regardless of size; precondition for opening corporate bank accounts." },
      { title: "NGO Coordination — Federal Ministry registration (where applicable)", why: "Some sectors (humanitarian, women, youth) require additional ministry registration." },
      { title: "State NGO Board / Coordinating Office registration", why: "Most states (Lagos, Kano, Borno) require NGOs operating in the state to register with a coordinating body." },
      { title: "Tax Exempt Status (FIRS letter)", why: "Without an explicit FIRS exemption letter, donor-funded income may be assessed for tax." },
      { title: "Donor-specific registrations (USAID, EU, FCDO, UN)", why: "Any major international donor requires separate vetting and registration before funds flow." },
      { title: "Audited Financial Statements (annual)", why: "Required by SCUML, donors, and CAC; non-compliance triggers regulatory action." },
      { title: "Annual Returns to CAC (Form CAC/IT 4)", why: "Mandatory annual filing for incorporated trustees; non-filing leads to deregistration." },
      { title: "PENCOM + NSITF + ITF (employer obligations once 3+ staff)", why: "NGOs often forget these; non-compliance blocks government and corporate funding." },
      { title: "Anti-money-laundering (AML) policy + designated Compliance Officer", why: "Required by SCUML and by virtually every donor; written policy must exist." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 20. Cooperative Society
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "cooperative_society",
    label: "Cooperative Society",
    checklist: [
      { title: "Pre-registration meeting with State Director of Cooperatives", why: "Each state's Cooperative Department guides applicants through approval and inspects the proposed society." },
      { title: "Minimum membership (state-dependent — usually 10 adults)", why: "Cooperatives are member-owned; the state minimum must be met before registration." },
      { title: "Cooperative By-laws / Constitution", why: "Mandatory document setting out objectives, share structure, leadership, and dissolution; submitted with the application." },
      { title: "Application to State Director of Cooperatives", why: "The formal registration application; without registration the society has no legal status." },
      { title: "Certificate of Registration (state-issued)", why: "The official document that recognises the society as a legal entity in Nigeria." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS for any society with taxable income or planning to access loans." },
      { title: "Dedicated bank account in the society's name", why: "Required by the Cooperative Department; member contributions cannot legally sit in a personal account." },
      { title: "Members' register + share register + minutes book", why: "Mandatory cooperative records; inspectors can request to see them at any time." },
      { title: "Annual audited accounts", why: "Cooperative law requires annual independent audit; required for ongoing recognition." },
      { title: "Annual returns to State Director of Cooperatives", why: "Mandatory annual filing; non-filing leads to suspension or deregistration." },
      { title: "SCUML Certificate (for cooperatives lending or holding member funds)", why: "Required where the society effectively operates as a savings/credit body." },
      { title: "CBN approval (only for SACCOs / financial cooperatives above CBN threshold)", why: "Large financial cooperatives may require CBN supervision; check with regulator." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 21. Trustee / Board of Trustees
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "trustee_board",
    label: "Trustee / Board of Trustees",
    checklist: [
      { title: "CAC Incorporated Trustees application", why: "Standard route for boards holding assets on behalf of an association, club, religious body, foundation, or estate." },
      { title: "Trust Deed signed by all trustees", why: "Mandatory CAC document setting out objectives, trustee powers, governance, and dissolution." },
      { title: "Newspaper publication of trustee notice (28 days)", why: "CAC requires the proposed trustees and objectives to be publicly advertised before registration." },
      { title: "Constitution / Rules of the body", why: "Required alongside the trust deed to spell out membership, meetings, and operational rules." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS for any incorporated trustee body, regardless of tax-exempt status." },
      { title: "SCUML Certificate", why: "Required for incorporated trustees handling cash, donations, or member funds." },
      { title: "Tax Exempt Status (FIRS letter)", why: "Required to confirm that grants and donations are not assessed for company income tax." },
      { title: "Annual Returns to CAC (Form CAC/IT 4)", why: "Mandatory annual filing for every incorporated trustee body." },
      { title: "Audited Financial Statements (annual)", why: "Required by CAC, SCUML, donors, and any membership body; mandatory for transparency." },
      { title: "Bank Account in the Trustees' name", why: "Required so that funds are held by the body, not by individual trustees." },
      { title: "Minutes of trustees' meetings + register of trustees", why: "Mandatory cooperative records; CAC inspectors can request them." },
      { title: "AML Policy + Compliance Officer (where the body holds funds)", why: "Required by SCUML; written policy must exist before account opening." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 22. Tech Startup Incorporation
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "tech_startup",
    label: "Tech Startup Incorporation",
    minShareCapital: 1_000_000, // Phase 3 — explicit per spec; same as default Nigerian Ltd
    checklist: [
      { title: "CAC Limited Liability Company", why: "Investors only fund Ltds; share structure, equity dilution, and SAFEs all require Ltd structure." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS, by every investor's diligence pack, and to open corporate accounts." },
      { title: "Cap Table + Shareholders' Agreement", why: "Spells out who owns what, vesting, drag/tag rights, transfers; investors require this before funding." },
      { title: "Founder Vesting Agreements", why: "Standard 4-year vesting with 1-year cliff is the global norm and is investor-required." },
      { title: "Employment / Consultant agreements with IP-assignment clauses", why: "Without a written assignment, IP created by staff may belong to them, not the company." },
      { title: "NDPR / NDPC Data Protection Compliance", why: "Required for any startup handling personal data — practically every B2C product." },
      { title: "NITDA Startup Label (Nigeria Startup Act)", why: "Optional but recommended — unlocks tax breaks, grants, and government recognition under the Startup Act." },
      { title: "Trademark Registration", why: "Cheap insurance against name disputes; investors check this before term sheets." },
      { title: "ESOP (Employee Stock Option Plan)", why: "Standard practice; needs board resolution, option pool, and vesting schedule documented." },
      { title: "Sector-specific licences (NCC for telecom, CBN for fintech, NAFDAC for healthtech)", why: "If your product touches a regulated industry, the relevant licence is required before launch." },
      { title: "VAT registration (once revenue starts)", why: "Mandatory once you have taxable revenue; non-registration triggers retroactive penalties." },
      { title: "PENCOM + ITF + NSITF (once you cross 3-5 staff)", why: "Mandatory employer obligations; investors flag non-compliance during due diligence." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 23. E-commerce & Online Business
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "ecommerce_online",
    label: "E-commerce & Online Business",
    checklist: [
      { title: "CAC Business Registration", why: "Required to open a business bank account, integrate Paystack/Flutterwave, and sign supplier contracts." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS for VAT, withholding tax, and corporate income tax." },
      { title: "Domain registration + SSL", why: "Required for trust signals; many payment processors won't activate without HTTPS." },
      { title: "Payment Gateway integration (Paystack / Flutterwave / Monnify)", why: "Each gateway runs KYC and requires CAC, TIN, and proof of address before going live." },
      { title: "NDPR / NDPC Data Protection Compliance", why: "Mandatory for any business storing customer personal data — names, emails, addresses, payment info." },
      { title: "FCCPC Registration / Compliance", why: "Federal Competition and Consumer Protection Commission requires e-commerce platforms to comply with consumer-protection rules." },
      { title: "NAFDAC / SON / NCC type-approval (per product category)", why: "If you sell food, drugs, cosmetics, electronics, or telecom equipment, the product category needs its own permit." },
      { title: "Terms of Service + Privacy Policy + Refund Policy (legal pages)", why: "Required by FCCPC and by virtually every payment gateway's KYC pack." },
      { title: "Logistics / NIPOST courier integration agreement", why: "Last-mile delivery providers need a written contract; some require courier licence themselves." },
      { title: "Trademark Registration", why: "Critical online — trademark prevents copycats and is required to enforce takedowns on social platforms and marketplaces." },
      { title: "VAT registration", why: "Online sales attract VAT at 7.5%; registration is mandatory once you start invoicing." },
      { title: "Cyber-liability + GIT Insurance", why: "Recommended — protects against data breaches and lost shipments." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 24. Professional Services (Law, Accounting, Consulting)
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "professional_services",
    label: "Professional Services (Law, Accounting, Consulting)",
    checklist: [
      { title: "CAC Registration (Ltd or Business Name, depending on profession)", why: "Some regulators (e.g. NBA for law) require partnerships not Ltds; check with your professional body." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS for VAT, WHT, and PAYE." },
      { title: "Professional Body Membership + Practising Licence (annual)", why: "NBA (lawyers), ICAN/ANAN (accountants), CIPM (HR), NIM (managers) — annual renewal required to practise legally." },
      { title: "Firm registration with the professional body", why: "In addition to individual practising licence, the firm itself usually needs to be registered with the regulator." },
      { title: "SCUML Certificate", why: "Required for law, accounting, and consulting firms — they fall in the EFCC's regulated category." },
      { title: "Professional Indemnity Insurance", why: "Mandatory for many professions; protects against negligence claims and is a tender precondition." },
      { title: "Tax Clearance Certificate (TCC)", why: "Required for tenders, immigration assignments, and many corporate engagements." },
      { title: "VAT registration", why: "Professional services are VAT-able at 7.5%; registration is mandatory." },
      { title: "Audited Financial Statements", why: "Required by professional bodies for annual returns and by clients for due diligence." },
      { title: "PENCOM + ITF + NSITF (once 3+ staff)", why: "Mandatory employer obligations; preconditions for corporate retainers." },
      { title: "NDPR / NDPC Data Protection Compliance", why: "Professional firms hold sensitive client data and need annual NDPC audit." },
      { title: "Continuing Professional Development (CPD) records", why: "Required by every professional body; non-completion blocks practising-licence renewal." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 25. Other specialized business (catch-all)
  // DRAFT 2026-04 — verify with regulator before launch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "other_specialized",
    label: "Other specialized business",
    checklist: [
      { title: "CAC Business Registration", why: "Required for almost every kind of legal business activity in Nigeria." },
      { title: "TIN — Tax Identification Number", why: "Required by FIRS to file taxes and to open corporate bank accounts." },
      { title: "VAT registration", why: "Mandatory for any business with taxable activity above the FIRS threshold." },
      { title: "SCUML Certificate (if in a regulated category)", why: "Check whether your sector falls under EFCC's Designated Non-Financial Institutions list." },
      { title: "Sector regulator licence (NAFDAC / SON / NCC / CBN / DPR / etc.)", why: "Each industry has its own regulator; tell us your sector and we'll tell you which licence applies." },
      { title: "State / LGA business premises permit", why: "Required for any physical premises, regardless of sector." },
      { title: "Fire Safety Certificate", why: "Required for any premises receiving the public or staff." },
      { title: "Trademark Registration", why: "Recommended — protects your brand against copycats and is the foundation for international expansion." },
      { title: "PENCOM + ITF + NSITF (once 3+ staff)", why: "Mandatory employer obligations once staff headcount crosses the statutory threshold." },
      { title: "Insurance (public liability / professional indemnity / GIT, as applicable)", why: "Most regulators and large clients require evidence of insurance covering staff and third parties." },
    ],
    notes:
      "Tell us your specific business type and we'll send you the right checklist within 24 hours.",
  },
];
