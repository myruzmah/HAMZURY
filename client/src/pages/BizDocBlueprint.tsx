import { useState, useMemo } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckSquare, FileText, Shield, Award, Briefcase, ChevronDown, MessageCircle } from "lucide-react";

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
  "Contractor Business": [
    { name: "CAC Certificate (Ltd)", category: "Legal Document", pitch: "Proves your company legally exists in Nigeria — mandatory for every government tender.", useCase: "Bank accounts, contracts, tender applications, property acquisition", expiry: "Never (unless modified)", price: 150000, priceLabel: "₦150,000", required: true },
    { name: "TIN (Tax Identification Number)", category: "Tax Document", pitch: "Required for all tax filings and government dealings.", useCase: "Tax clearance, FIRS registration, invoicing", expiry: "Never", price: 35000, priceLabel: "₦35,000", required: true },
    { name: "Tax Clearance Certificate (3 years)", category: "Tax Document", pitch: "Shows 3 consecutive years of tax compliance — non-negotiable for government contracts.", useCase: "Government tenders, bank loans, contract eligibility", expiry: "Annual", price: 90000, priceLabel: "₦90,000/yr", required: true },
    { name: "PENCOM Compliance Certificate", category: "Compliance Certificate", pitch: "Proves you remit employee pensions legally — required for all federal tenders.", useCase: "Tender qualification, bank loans, regulatory compliance", expiry: "Annual", price: 75000, priceLabel: "₦75,000" },
    { name: "ITF Compliance Certificate", category: "Compliance Certificate", pitch: "Staff training fund compliance — mandatory for contracts above ₦50M.", useCase: "Tenders above ₦50M, regulatory compliance", expiry: "Annual", price: 60000, priceLabel: "₦60,000" },
    { name: "NSITF Compliance Certificate", category: "Compliance Certificate", pitch: "Employee compensation insurance — required alongside PENCOM for tenders.", useCase: "Federal tenders, worker protection compliance", expiry: "Annual", price: 50000, priceLabel: "₦50,000" },
    { name: "BPP Registration (Federal)", category: "Industry Licence", pitch: "Bureau of Public Procurement registration — opens the door to federal government contracts.", useCase: "Federal tender eligibility, procurement listing", expiry: "Renewable", price: 120000, priceLabel: "₦120,000" },
    { name: "Board Resolution", category: "Legal Agreement", pitch: "Authorizes signatory to bid and sign contracts on company's behalf.", useCase: "Tender submission, contract signing", expiry: "Per tender", price: 25000, priceLabel: "₦25,000" },
    { name: "Prequalification Documents Pack", category: "Legal Document", pitch: "Company profile, past project records, financial statements — the full tender package.", useCase: "Tender prequalification, due diligence response", expiry: "Updated per tender", price: 80000, priceLabel: "₦80,000" },
  ],
  "Export Business": [
    { name: "CAC Certificate (Ltd)", category: "Legal Document", pitch: "Legal existence for international transactions and customs registration.", useCase: "Bank accounts, export licences, customs registration", expiry: "Never", price: 150000, priceLabel: "₦150,000", required: true },
    { name: "TIN (Tax Identification Number)", category: "Tax Document", pitch: "Required for customs and FIRS — no TIN, no export clearance.", useCase: "Export documentation, tax filing, customs", expiry: "Never", price: 35000, priceLabel: "₦35,000", required: true },
    { name: "NEPC Registration", category: "Industry Licence", pitch: "Nigerian Export Promotion Council registration — unlocks export grants, trade missions, and incentives.", useCase: "Export grants, trade missions, EEG incentives", expiry: "Annual", price: 80000, priceLabel: "₦80,000", required: true },
    { name: "SON Certificate", category: "Industry Certificate", pitch: "Standards Organisation of Nigeria product compliance — required for goods leaving the country.", useCase: "Export clearance, quality assurance, buyer confidence", expiry: "Annual", price: 100000, priceLabel: "₦100,000" },
    { name: "Form M / Form NXP", category: "Trade Document", pitch: "Import/export transaction documentation for customs and forex.", useCase: "Customs clearance, forex transactions, trade finance", expiry: "Per transaction", price: 50000, priceLabel: "₦50,000" },
    { name: "Tax Clearance Certificate", category: "Tax Document", pitch: "Tax compliance proof for trade finance and government export tenders.", useCase: "Tenders, bank facilities, licence renewals", expiry: "Annual", price: 90000, priceLabel: "₦90,000/yr" },
    { name: "PENCOM Compliance Certificate", category: "Compliance Certificate", pitch: "Pension compliance — needed if bidding for government export contracts.", useCase: "Government export tenders, regulatory compliance", expiry: "Annual", price: 75000, priceLabel: "₦75,000" },
  ],
  "Mining Business": [
    { name: "CAC Certificate (Ltd)", category: "Legal Document", pitch: "Proves your company legally exists — required before any mining licence application.", useCase: "Mining licence applications, bank accounts, contracts", expiry: "Never (unless modified)", price: 150000, priceLabel: "₦150,000", required: true },
    { name: "TIN (Tax Identification Number)", category: "Tax Document", pitch: "Required for all tax filings and mineral royalty payments.", useCase: "Tax clearance, FIRS registration, royalty payments", expiry: "Never", price: 35000, priceLabel: "₦35,000", required: true },
    { name: "Mining Lease / Licence", category: "Industry Licence", pitch: "Legal authority to mine in your designated area — issued by the Mining Cadastre Office.", useCase: "Operating legally, environmental compliance, investor confidence", expiry: "5-25 years", price: 350000, priceLabel: "₦350,000+", required: true },
    { name: "Environmental Impact Assessment (EIA)", category: "Compliance Certificate", pitch: "Proves your operations meet environmental standards — mandatory before mining begins.", useCase: "Mining licence requirement, community relations, regulatory compliance", expiry: "Per project", price: 250000, priceLabel: "₦250,000" },
    { name: "Tax Clearance Certificate (3 years)", category: "Tax Document", pitch: "Shows 3 years of tax compliance for credibility in tenders and contracts.", useCase: "Tenders, contracts, bank facilities", expiry: "Annual", price: 90000, priceLabel: "₦90,000/yr" },
    { name: "PENCOM Compliance Certificate", category: "Compliance Certificate", pitch: "Proves you remit employee pensions — required for mining tenders.", useCase: "Tender qualification, bank loans, regulatory compliance", expiry: "Annual", price: 75000, priceLabel: "₦75,000" },
    { name: "Community Development Agreement (CDA)", category: "Legal Agreement", pitch: "Agreement with host community — legally required under the Nigerian Minerals Act.", useCase: "Mining licence condition, community relations, social licence to operate", expiry: "Renewable per lease term", price: 150000, priceLabel: "₦150,000" },
  ],
  "Travel Agency": [
    { name: "CAC Certificate (BN or Ltd)", category: "Legal Document", pitch: "Foundation of your travel business — BN for solo operators, Ltd for partnerships.", useCase: "Bank accounts, IATA registration, partnerships", expiry: "Never", price: 100000, priceLabel: "₦100,000", required: true },
    { name: "TIN (Tax Identification Number)", category: "Tax Document", pitch: "Tax identity for filings and invoicing.", useCase: "Tax clearance, invoicing, licence applications", expiry: "Never", price: 35000, priceLabel: "₦35,000", required: true },
    { name: "NANTA Membership", category: "Industry Licence", pitch: "Nigerian Association of Travel Agencies membership — the industry's credibility badge.", useCase: "Credibility, IATA access, airline partnerships, group deals", expiry: "Annual", price: 100000, priceLabel: "₦100,000", required: true },
    { name: "IATA Licence", category: "Industry Licence", pitch: "Authority to issue airline tickets directly — the key to real margins in travel.", useCase: "Direct airline booking, ticketing, higher commissions", expiry: "Annual", price: 200000, priceLabel: "₦200,000" },
    { name: "Tax Clearance Certificate", category: "Tax Document", pitch: "Tax compliance proof for renewals and partnerships.", useCase: "Licence renewals, bank facilities, corporate partnerships", expiry: "Annual", price: 90000, priceLabel: "₦90,000/yr" },
    { name: "State Tourism Board Registration", category: "Permit", pitch: "State-level tourism operator registration — required in most states.", useCase: "Legal operations, state tourism events, local credibility", expiry: "Annual", price: 50000, priceLabel: "₦50,000" },
  ],
  "Others": [],
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

        {/* "Others" special state */}
        {industry === "Others" && (
          <div className="text-center py-16 px-6">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${Au}15` }}>
                <MessageCircle size={28} style={{ color: Au }} />
              </div>
              <h2 className="text-xl font-semibold mb-3" style={{ color: G }}>Not sure what your business needs?</h2>
              <p className="text-sm opacity-70 mb-8 leading-relaxed" style={{ color: G }}>
                Tell us about your vision and goals, and we'll recommend the right business structure and documents.
              </p>
              <Button
                className="rounded-xl px-8 py-3 text-sm font-medium"
                style={{ backgroundColor: G, color: "#fff" }}
                onClick={() => {
                  const ctx = "I'm not sure what business structure I need. I want to discuss my vision and goals so you can recommend the right path.";
                  localStorage.setItem("hamzury-chat-context", ctx);
                  const btn = document.querySelector("[data-chat-trigger]") as HTMLElement;
                  if (btn) btn.click();
                }}
              >
                <MessageCircle size={16} className="mr-2 inline" />
                Talk to Us
              </Button>
            </div>
          </div>
        )}

        {/* Document Checklist */}
        {industry && industry !== "Others" && docs.length > 0 && (
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
