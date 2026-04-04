import { useState, useMemo } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckSquare, FileText, Shield, Award, Briefcase, ChevronDown } from "lucide-react";

const G = "#1B4D3E";
const Au = "#B48C4C";
const Cr = "#FFFAF6";

type DocItem = {
  name: string;
  category: string;
  pitch: string;
  useCase: string;
  expiry: string;
  price: number;
  priceLabel: string;
  required?: boolean;
};

const INDUSTRIES: Record<string, DocItem[]> = {
  "Mining & Solid Minerals": [
    { name: "CAC Certificate", category: "Legal Document", pitch: "Proves your company legally exists in Nigeria.", useCase: "Bank accounts, contracts, tender applications", expiry: "Never (unless modified)", price: 150000, priceLabel: "₦150,000", required: true },
    { name: "TIN (Tax Identification Number)", category: "Tax Document", pitch: "Required for all tax filings and government dealings.", useCase: "Tax clearance, FIRS registration, invoicing", expiry: "Never", price: 35000, priceLabel: "₦35,000", required: true },
    { name: "Mining Lease / Licence", category: "Industry Licence", pitch: "Legal authority to mine in your designated area.", useCase: "Operating legally, environmental compliance", expiry: "5-25 years", price: 350000, priceLabel: "₦350,000+" },
    { name: "Environmental Impact Assessment", category: "Compliance Certificate", pitch: "Proves your operations meet environmental standards.", useCase: "Mining licence requirement, community relations", expiry: "Per project", price: 250000, priceLabel: "₦250,000" },
    { name: "Tax Clearance Certificate (3 years)", category: "Tax Document", pitch: "Shows 3 years of tax compliance for credibility.", useCase: "Tenders, contracts, bank facilities", expiry: "Annual", price: 90000, priceLabel: "₦90,000/yr" },
    { name: "PENCOM Clearance", category: "Compliance Certificate", pitch: "Proves you remit employee pensions legally.", useCase: "Tender qualification, bank loans", expiry: "Annual", price: 75000, priceLabel: "₦75,000" },
    { name: "Board Resolution", category: "Legal Agreement", pitch: "Authorizes signatory to bid on company's behalf.", useCase: "Tender submission, contract signing", expiry: "Per tender", price: 25000, priceLabel: "₦25,000" },
  ],
  "Oil & Gas": [
    { name: "CAC Certificate", category: "Legal Document", pitch: "Proves your company legally exists in Nigeria.", useCase: "Bank accounts, contracts, tender applications", expiry: "Never (unless modified)", price: 150000, priceLabel: "₦150,000", required: true },
    { name: "TIN (Tax Identification Number)", category: "Tax Document", pitch: "Required for all tax filings and government dealings.", useCase: "Tax clearance, FIRS registration, invoicing", expiry: "Never", price: 35000, priceLabel: "₦35,000", required: true },
    { name: "DPR/NUPRC Licence", category: "Industry Licence", pitch: "Legal authority to operate in oil & gas sector.", useCase: "Operating legally, tender eligibility", expiry: "1-3 years", price: 250000, priceLabel: "₦250,000+" },
    { name: "Tax Clearance Certificate (3 years)", category: "Tax Document", pitch: "Shows 3 years of tax compliance for credibility.", useCase: "Tenders, contracts, bank facilities", expiry: "Annual", price: 90000, priceLabel: "₦90,000/yr" },
    { name: "Local Content Certificate", category: "Industry Certificate", pitch: "Proves Nigerian ownership for oil & gas contracts.", useCase: "NOC requirements, tender scoring", expiry: "Annual", price: 150000, priceLabel: "₦150,000" },
    { name: "PENCOM Clearance", category: "Compliance Certificate", pitch: "Proves you remit employee pensions legally.", useCase: "Tender qualification, bank loans", expiry: "Annual", price: 75000, priceLabel: "₦75,000" },
    { name: "Board Resolution (Tender-Specific)", category: "Legal Agreement", pitch: "Authorizes signatory to bid on company's behalf.", useCase: "Tender submission, contract signing", expiry: "Per tender", price: 25000, priceLabel: "₦25,000" },
  ],
  "Real Estate & Construction": [
    { name: "CAC Certificate", category: "Legal Document", pitch: "Proves your company legally exists in Nigeria.", useCase: "Bank accounts, contracts, property acquisition", expiry: "Never", price: 150000, priceLabel: "₦150,000", required: true },
    { name: "TIN", category: "Tax Document", pitch: "Required for all tax filings.", useCase: "Tax clearance, property transactions", expiry: "Never", price: 35000, priceLabel: "₦35,000", required: true },
    { name: "COREN Registration", category: "Professional Licence", pitch: "Engineering practice certification.", useCase: "Construction contracts, regulatory compliance", expiry: "Annual", price: 120000, priceLabel: "₦120,000" },
    { name: "Building Plan Approval", category: "Permit", pitch: "Government authorization for construction.", useCase: "Before breaking ground", expiry: "Per project", price: 80000, priceLabel: "₦80,000" },
    { name: "Tax Clearance Certificate", category: "Tax Document", pitch: "Shows tax compliance for tenders.", useCase: "Tenders, government contracts", expiry: "Annual", price: 90000, priceLabel: "₦90,000/yr" },
    { name: "PENCOM Clearance", category: "Compliance Certificate", pitch: "Employee pension compliance.", useCase: "Tender qualification", expiry: "Annual", price: 75000, priceLabel: "₦75,000" },
  ],
  "Travel Agency & Tourism": [
    { name: "CAC Certificate", category: "Legal Document", pitch: "Foundation of your business.", useCase: "Bank accounts, IATA registration", expiry: "Never", price: 150000, priceLabel: "₦150,000", required: true },
    { name: "TIN", category: "Tax Document", pitch: "Tax identity for filings.", useCase: "Tax clearance, invoicing", expiry: "Never", price: 35000, priceLabel: "₦35,000", required: true },
    { name: "NANTA Membership", category: "Industry Licence", pitch: "Travel industry association membership.", useCase: "Credibility, IATA access, partnerships", expiry: "Annual", price: 100000, priceLabel: "₦100,000" },
    { name: "IATA Licence", category: "Industry Licence", pitch: "Authority to issue airline tickets.", useCase: "Direct airline booking, ticketing", expiry: "Annual", price: 200000, priceLabel: "₦200,000" },
    { name: "Tax Clearance Certificate", category: "Tax Document", pitch: "Tax compliance proof.", useCase: "Renewals, bank facilities", expiry: "Annual", price: 90000, priceLabel: "₦90,000/yr" },
  ],
  "Export & International Trade": [
    { name: "CAC Certificate", category: "Legal Document", pitch: "Legal existence for international transactions.", useCase: "Bank accounts, export licences", expiry: "Never", price: 150000, priceLabel: "₦150,000", required: true },
    { name: "TIN", category: "Tax Document", pitch: "Required for customs and FIRS.", useCase: "Export documentation, tax filing", expiry: "Never", price: 35000, priceLabel: "₦35,000", required: true },
    { name: "NEPC Registration", category: "Industry Licence", pitch: "Export council registration for incentives.", useCase: "Export grants, trade missions", expiry: "Annual", price: 80000, priceLabel: "₦80,000" },
    { name: "SON Certificate", category: "Industry Certificate", pitch: "Product standards compliance.", useCase: "Export clearance, quality assurance", expiry: "Annual", price: 100000, priceLabel: "₦100,000" },
    { name: "Form M / Form NXP", category: "Trade Document", pitch: "Import/export transaction documentation.", useCase: "Customs clearance, forex transactions", expiry: "Per transaction", price: 50000, priceLabel: "₦50,000" },
    { name: "Tax Clearance Certificate", category: "Tax Document", pitch: "Tax compliance for trade.", useCase: "Tenders, bank facilities, licences", expiry: "Annual", price: 90000, priceLabel: "₦90,000/yr" },
  ],
  "Manufacturing": [
    { name: "CAC Certificate", category: "Legal Document", pitch: "Legal foundation.", useCase: "Bank accounts, contracts", expiry: "Never", price: 150000, priceLabel: "₦150,000", required: true },
    { name: "TIN", category: "Tax Document", pitch: "Tax registration.", useCase: "FIRS, invoicing", expiry: "Never", price: 35000, priceLabel: "₦35,000", required: true },
    { name: "NAFDAC Registration", category: "Industry Licence", pitch: "Product safety certification for food/drugs/cosmetics.", useCase: "Market access, consumer trust", expiry: "5 years", price: 200000, priceLabel: "₦200,000" },
    { name: "SON Certificate", category: "Industry Certificate", pitch: "Product standards compliance.", useCase: "Quality assurance, export", expiry: "Annual", price: 100000, priceLabel: "₦100,000" },
    { name: "Tax Clearance Certificate", category: "Tax Document", pitch: "Tax compliance.", useCase: "Tenders, contracts", expiry: "Annual", price: 90000, priceLabel: "₦90,000/yr" },
    { name: "PENCOM Clearance", category: "Compliance Certificate", pitch: "Pension compliance.", useCase: "Tender qualification", expiry: "Annual", price: 75000, priceLabel: "₦75,000" },
  ],
  "General Contracting": [
    { name: "CAC Certificate", category: "Legal Document", pitch: "Legal foundation.", useCase: "Tenders, contracts", expiry: "Never", price: 150000, priceLabel: "₦150,000", required: true },
    { name: "TIN", category: "Tax Document", pitch: "Tax registration.", useCase: "Tax clearance, filing", expiry: "Never", price: 35000, priceLabel: "₦35,000", required: true },
    { name: "Tax Clearance Certificate (3 years)", category: "Tax Document", pitch: "3 years tax compliance.", useCase: "Government tenders, bank loans", expiry: "Annual", price: 90000, priceLabel: "₦90,000/yr" },
    { name: "PENCOM Clearance", category: "Compliance Certificate", pitch: "Pension compliance.", useCase: "Tenders, regulatory compliance", expiry: "Annual", price: 75000, priceLabel: "₦75,000" },
    { name: "ITF Compliance Certificate", category: "Compliance Certificate", pitch: "Staff training fund compliance.", useCase: "Tenders above ₦50M", expiry: "Annual", price: 60000, priceLabel: "₦60,000" },
    { name: "Board Resolution", category: "Legal Agreement", pitch: "Authorizes tender signatory.", useCase: "Tender submission", expiry: "Per tender", price: 25000, priceLabel: "₦25,000" },
  ],
  "Restaurant / Food & Beverage": [
    { name: "CAC Certificate", category: "Legal Document", pitch: "Legal foundation.", useCase: "Bank, permits", expiry: "Never", price: 50000, priceLabel: "₦50,000 (BN)", required: true },
    { name: "TIN", category: "Tax Document", pitch: "Tax registration.", useCase: "Filing, invoicing", expiry: "Never", price: 35000, priceLabel: "₦35,000" },
    { name: "NAFDAC Registration", category: "Industry Licence", pitch: "Food safety certification.", useCase: "Legal operations, trust", expiry: "5 years", price: 150000, priceLabel: "₦150,000" },
    { name: "State Health Permit", category: "Permit", pitch: "Environmental health clearance.", useCase: "Operating legally", expiry: "Annual", price: 40000, priceLabel: "₦40,000" },
    { name: "Fire Safety Certificate", category: "Permit", pitch: "Fire prevention compliance.", useCase: "Insurance, operations", expiry: "Annual", price: 30000, priceLabel: "₦30,000" },
  ],
  "Tech / Software": [
    { name: "CAC Certificate", category: "Legal Document", pitch: "Legal entity registration.", useCase: "Contracts, funding, hiring", expiry: "Never", price: 150000, priceLabel: "₦150,000", required: true },
    { name: "TIN", category: "Tax Document", pitch: "Tax registration.", useCase: "Filing, invoicing", expiry: "Never", price: 35000, priceLabel: "₦35,000", required: true },
    { name: "NITDA Compliance", category: "Industry Certificate", pitch: "IT regulation compliance.", useCase: "Government contracts, data handling", expiry: "Annual", price: 100000, priceLabel: "₦100,000" },
    { name: "Data Protection Registration (NDPR)", category: "Compliance Certificate", pitch: "Data privacy compliance.", useCase: "User data handling, trust", expiry: "Annual", price: 80000, priceLabel: "₦80,000" },
    { name: "Tax Clearance Certificate", category: "Tax Document", pitch: "Tax compliance.", useCase: "Contracts, tenders", expiry: "Annual", price: 90000, priceLabel: "₦90,000/yr" },
  ],
  "Healthcare": [
    { name: "CAC Certificate", category: "Legal Document", pitch: "Legal foundation.", useCase: "Licences, contracts", expiry: "Never", price: 150000, priceLabel: "₦150,000", required: true },
    { name: "TIN", category: "Tax Document", pitch: "Tax registration.", useCase: "Filing, invoicing", expiry: "Never", price: 35000, priceLabel: "₦35,000", required: true },
    { name: "MDCN / PCN / Nursing Council Licence", category: "Professional Licence", pitch: "Professional practice licence.", useCase: "Legal medical practice", expiry: "Annual", price: 120000, priceLabel: "₦120,000" },
    { name: "State Health Facility Registration", category: "Permit", pitch: "State authorization to operate.", useCase: "Opening a clinic/pharmacy", expiry: "Annual", price: 80000, priceLabel: "₦80,000" },
    { name: "NAFDAC Registration", category: "Industry Licence", pitch: "Drug/product safety.", useCase: "Selling pharmaceuticals", expiry: "5 years", price: 200000, priceLabel: "₦200,000" },
    { name: "Tax Clearance Certificate", category: "Tax Document", pitch: "Tax compliance.", useCase: "Contracts, tenders", expiry: "Annual", price: 90000, priceLabel: "₦90,000/yr" },
  ],
  "Education": [
    { name: "CAC Certificate", category: "Legal Document", pitch: "Legal foundation.", useCase: "Registration, contracts", expiry: "Never", price: 150000, priceLabel: "₦150,000", required: true },
    { name: "TIN", category: "Tax Document", pitch: "Tax registration.", useCase: "Filing, tax exemption", expiry: "Never", price: 35000, priceLabel: "₦35,000", required: true },
    { name: "State Ministry of Education Approval", category: "Permit", pitch: "Government authorization to teach.", useCase: "Operating legally", expiry: "Varies", price: 100000, priceLabel: "₦100,000" },
    { name: "TRCN Certification", category: "Professional Licence", pitch: "Teacher registration.", useCase: "Hiring qualified teachers", expiry: "Annual", price: 50000, priceLabel: "₦50,000" },
    { name: "Tax Clearance Certificate", category: "Tax Document", pitch: "Tax compliance.", useCase: "Grants, partnerships", expiry: "Annual", price: 90000, priceLabel: "₦90,000/yr" },
  ],
};

const CATEGORY_COLORS: Record<string, string> = {
  "Legal Document": "#1B4D3E",
  "Tax Document": "#3B82F6",
  "Industry Licence": "#8B5CF6",
  "Industry Certificate": "#8B5CF6",
  "Professional Licence": "#8B5CF6",
  "Compliance Certificate": "#F59E0B",
  "Permit": "#EF4444",
  "Legal Agreement": "#6366F1",
  "Trade Document": "#14B8A6",
};

export default function BizDocBlueprint() {
  const [industry, setIndustry] = useState<string>("");
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const docs = industry ? INDUSTRIES[industry] || [] : [];

  const total = useMemo(() => {
    let sum = 0;
    checked.forEach(idx => { if (docs[idx]) sum += docs[idx].price; });
    return sum;
  }, [checked, docs]);

  const toggle = (idx: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const handleProceed = () => {
    const selected = Array.from(checked).map(i => docs[i]?.name).filter(Boolean);
    const ctx = `I need help with: ${selected.join(", ")}. Industry: ${industry}. Estimated total: ₦${total.toLocaleString()}.`;
    localStorage.setItem("hamzury-chat-context", ctx);
    const btn = document.querySelector("[data-chat-trigger]") as HTMLElement;
    if (btn) btn.click();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: Cr }}>
      <PageMeta title="Business Positioning Blueprint — HAMZURY BizDoc" description="Select your industry and identify every document your business needs." />

      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md border-b" style={{ backgroundColor: `${Cr}ee`, borderColor: `${G}10` }}>
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center gap-3">
          <Link href="/bizdoc" className="flex items-center gap-2 text-sm" style={{ color: G }}>
            <ArrowLeft size={16} /> Back to BizDoc
          </Link>
          <div className="flex-1" />
          <span className="text-xs font-medium tracking-wider uppercase" style={{ color: Au }}>Blueprint Tool</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-10">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-semibold mb-2" style={{ color: G }}>Business Positioning Blueprint</h1>
        <p className="text-sm opacity-60 mb-8" style={{ color: G }}>
          Select your industry below. We'll show every document your business type may need — tick what you want, and we'll handle the rest.
        </p>

        {/* Industry Selector */}
        <div className="mb-8">
          <label className="text-xs uppercase tracking-wider font-medium mb-2 block" style={{ color: Au }}>Your Industry</label>
          <Select value={industry} onValueChange={(v) => { setIndustry(v); setChecked(new Set()); }}>
            <SelectTrigger className="w-full md:w-96 h-12 text-sm rounded-xl border" style={{ borderColor: `${G}20`, color: G }}>
              <SelectValue placeholder="Select your industry..." />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(INDUSTRIES).map(ind => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Document Checklist */}
        {industry && docs.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium" style={{ color: G }}>
                {docs.length} documents for <span style={{ color: Au }}>{industry}</span>
              </p>
              <p className="text-xs opacity-40" style={{ color: G }}>Tick what you need</p>
            </div>

            <div className="space-y-3 mb-8">
              {docs.map((doc, idx) => {
                const isChecked = checked.has(idx);
                const catColor = CATEGORY_COLORS[doc.category] || G;
                return (
                  <button
                    key={idx}
                    onClick={() => toggle(idx)}
                    className="w-full text-left rounded-2xl border p-4 md:p-5 transition-all"
                    style={{
                      backgroundColor: isChecked ? `${G}06` : "#fff",
                      borderColor: isChecked ? `${G}30` : `${G}08`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                        style={{
                          borderColor: isChecked ? G : `${G}25`,
                          backgroundColor: isChecked ? G : "transparent",
                        }}
                      >
                        {isChecked && <CheckSquare size={12} color="#fff" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium" style={{ color: G }}>{doc.name}</span>
                          {doc.required && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${Au}15`, color: Au }}>ESSENTIAL</span>
                          )}
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${catColor}12`, color: catColor }}>{doc.category}</span>
                        </div>
                        <p className="text-xs opacity-70 mb-1" style={{ color: G }}>{doc.pitch}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] opacity-40" style={{ color: G }}>
                          <span>Use: {doc.useCase}</span>
                          <span>Expiry: {doc.expiry}</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium shrink-0" style={{ color: Au }}>{doc.priceLabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Total + CTA */}
            <div className="sticky bottom-0 py-4 border-t backdrop-blur-md" style={{ backgroundColor: `${Cr}ee`, borderColor: `${G}10` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-40" style={{ color: G }}>Selected: {checked.size} of {docs.length} documents</p>
                  <p className="text-xl font-semibold" style={{ color: G }}>
                    Total Estimate: <span style={{ color: Au }}>₦{total.toLocaleString()}</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    style={{ borderColor: `${G}20`, color: G }}
                    onClick={() => setChecked(new Set())}
                  >
                    Clear
                  </Button>
                  <Button
                    className="rounded-xl px-6"
                    style={{ backgroundColor: G, color: "#fff" }}
                    disabled={checked.size === 0}
                    onClick={handleProceed}
                  >
                    Proceed to Chat
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!industry && (
          <div className="text-center py-20 opacity-30">
            <FileText size={48} style={{ color: G }} className="mx-auto mb-4" />
            <p className="text-sm" style={{ color: G }}>Select an industry above to see your document checklist</p>
          </div>
        )}
      </div>
    </div>
  );
}
