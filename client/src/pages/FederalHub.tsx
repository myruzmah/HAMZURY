import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import { Link } from "wouter";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2, LogOut, ArrowLeft, Users, ShieldCheck, FileText,
  Plus, UserPlus, Loader2, Search, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle2, XCircle, Trash2,
} from "lucide-react";

// ─── Brand (Federal Hub = general → Apple grey) ─────────────────────────────
const GREEN = "#2D2D2D";   // Apple grey
const GOLD = "#B48C4C";
const MILK = "#FFFAF6";    // Milk white

type Section = "staff" | "audit";

const ROLES = [
  { value: "founder", label: "Founder" },
  { value: "ceo", label: "CEO" },
  { value: "cso", label: "CSO" },
  { value: "cso_assist", label: "CSO Assistant" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "HR" },
  { value: "bizdev", label: "BizDev" },
  { value: "department_lead", label: "Department Lead" },
  { value: "department_staff", label: "Department Staff" },
  { value: "media", label: "Media" },
  { value: "tech_lead", label: "Tech Lead" },
  { value: "compliance_staff", label: "Compliance Staff" },
  { value: "security_staff", label: "Security Staff" },
  { value: "skills_staff", label: "Skills Staff" },
  { value: "systemise_head", label: "Systemise Head" },
  { value: "bizdev_staff", label: "BizDev Staff" },
] as const;

const DEPARTMENTS = [
  { value: "general", label: "General" },
  { value: "bizdoc", label: "BizDoc" },
  { value: "systemise", label: "Systemise" },
  { value: "skills", label: "Skills" },
] as const;

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FederalHub() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [activeSection, setActiveSection] = useState<Section>("staff");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: MILK }}>
        <Loader2 className="animate-spin" size={28} style={{ color: GOLD }} />
      </div>
    );
  }
  if (!user) return null;

  const sidebarItems: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "staff", icon: Users, label: "Staff Management" },
    { key: "audit", icon: ShieldCheck, label: "Audit Log" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: MILK }}>
      <PageMeta title="Federal Hub — HAMZURY" description="HAMZURY institutional administration hub." />
      {/* ── Sidebar ── */}
      <div className="w-16 md:w-60 flex flex-col h-full shrink-0" style={{ backgroundColor: GREEN }}>
        <div className="h-16 flex items-center justify-center md:justify-start md:px-5 border-b shrink-0" style={{ borderColor: `${GOLD}20` }}>
          <Building2 size={18} style={{ color: GOLD }} />
          <span className="hidden md:block ml-2.5 font-medium text-sm" style={{ color: GOLD }}>Federal Hub</span>
        </div>
        <div className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {sidebarItems.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className="w-full flex items-center justify-center md:justify-start md:px-3 py-3 rounded-xl transition-all"
              style={{
                backgroundColor: activeSection === key ? `${GOLD}18` : "transparent",
                color: activeSection === key ? GOLD : `${GOLD}60`,
              }}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden md:block ml-3 text-sm font-normal">{label}</span>
            </button>
          ))}
        </div>
        <div className="p-3 border-t shrink-0" style={{ borderColor: `${GOLD}15` }}>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center md:justify-start md:px-3 py-2.5 rounded-xl transition-all text-sm"
            style={{ color: `${GOLD}50` }}
          >
            <LogOut size={16} className="shrink-0" />
            <span className="hidden md:block ml-3 font-normal">Sign Out</span>
          </button>
          <Link
            href="/"
            className="w-full flex items-center justify-center md:justify-start md:px-3 py-2.5 rounded-xl transition-all text-sm mt-1"
            style={{ color: `${GOLD}50` }}
          >
            <ArrowLeft size={16} className="shrink-0" />
            <span className="hidden md:block ml-3 font-normal">Back to HAMZURY</span>
          </Link>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-16 flex items-center justify-between px-6 border-b shrink-0 bg-white" style={{ borderColor: `${GREEN}10` }}>
          <div>
            <h1 className="text-base font-medium" style={{ color: GREEN }}>
              {sidebarItems.find(s => s.key === activeSection)?.label}
            </h1>
            <p className="text-xs opacity-40" style={{ color: GREEN }}>{user.name || "Admin"}</p>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8">
            {activeSection === "staff" && <StaffSection userRole={user.hamzuryRole ?? undefined} />}
            {activeSection === "audit" && <AuditSection />}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ─── Staff Management Section ─────────────────────────────────────────────────
function StaffSection({ userRole }: { userRole?: string }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formDept, setFormDept] = useState("general");

  const staffQuery = trpc.staff.listInternal.useQuery(undefined, { refetchInterval: 30000 });
  const createMutation = trpc.staff.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Staff account created for ${data.name}`);
      setShowForm(false);
      setFormName("");
      setFormEmail("");
      setFormRole("");
      setFormDept("general");
      staffQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });
  const seedMutation = trpc.staff.seed.useMutation({
    onSuccess: (data) => {
      toast.success(`Seed complete: ${data.staffCreated} staff created`);
      staffQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const clearClientMutation = (trpc.staff as any).clearClientData?.useMutation?.({
    onSuccess: () => toast.success("All client data cleared. Start fresh from CSO dashboard."),
    onError: (err: any) => toast.error(err?.message || "Failed to clear"),
  });

  const allStaff = staffQuery.data || [];
  const filtered = allStaff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.dept.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const isFounder = userRole === "founder";

  const handleCreate = () => {
    if (!formName.trim() || !formEmail.trim() || !formRole) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createMutation.mutate({
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      hamzuryRole: formRole as any,
      department: formDept as any,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: GREEN }}>Staff Directory</h2>
          <p className="text-xs mt-0.5" style={{ color: `${GREEN}60` }}>
            {allStaff.length} total staff members
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isFounder && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              style={{ borderColor: `${GOLD}40`, color: GREEN }}
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
            >
              {seedMutation.isPending ? <Loader2 className="animate-spin mr-1.5" size={14} /> : <Users size={14} className="mr-1.5" />}
              Seed All Staff
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              style={{ borderColor: "#EF444440", color: "#EF4444" }}
              onClick={() => { if (confirm("Clear ALL client data? This removes all leads, tasks, invoices, and activity logs.")) clearClientMutation?.mutate?.(); }}
              disabled={clearClientMutation?.isPending}
            >
              {clearClientMutation?.isPending ? <Loader2 className="animate-spin mr-1.5" size={14} /> : <Trash2 size={14} className="mr-1.5" />}
              Clear Client Data
            </Button>
          )}
          <Button
            size="sm"
            className="text-xs"
            style={{ backgroundColor: GREEN, color: GOLD }}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <XCircle size={14} className="mr-1.5" /> : <UserPlus size={14} className="mr-1.5" />}
            {showForm ? "Cancel" : "Add Staff"}
          </Button>
        </div>
      </div>

      {/* Add Staff Form */}
      {showForm && (
        <div className="rounded-2xl bg-white p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: GREEN }}>
            <Plus size={16} /> New Staff Account
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: `${GREEN}80` }}>Full Name *</label>
              <Input
                placeholder="e.g. John Doe"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: `${GREEN}80` }}>Email *</label>
              <Input
                type="email"
                placeholder="e.g. john@hamzury.com"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: `${GREEN}80` }}>Role *</label>
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: `${GREEN}80` }}>Department</label>
              <Select value={formDept} onValueChange={setFormDept}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs flex items-center gap-1.5" style={{ color: `${GREEN}50` }}>
              <AlertTriangle size={12} />
              Default password: <span className="font-mono font-semibold">Hamzury@2026</span> (staff must change on first login)
            </p>
            <Button
              size="sm"
              className="text-xs"
              style={{ backgroundColor: GREEN, color: GOLD }}
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="animate-spin mr-1.5" size={14} /> : <CheckCircle2 size={14} className="mr-1.5" />}
              Create Staff Account
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: `${GREEN}40` }} />
        <Input
          placeholder="Search by name, email, role, department..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="pl-9 text-sm"
        />
      </div>

      {/* Staff Table */}
      {staffQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin" size={24} style={{ color: GOLD }} />
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: `${GREEN}05` }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: `${GREEN}70` }}>Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: `${GREEN}70` }}>Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: `${GREEN}70` }}>Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: `${GREEN}70` }}>Department</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: `${GREEN}70` }}>Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: `${GREEN}70` }}>Hire Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: `${GREEN}70` }}>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-sm" style={{ color: `${GREEN}40` }}>
                      {search ? "No staff matching your search." : "No staff members found. Use \"Seed All Staff\" to create default accounts."}
                    </td>
                  </tr>
                ) : (
                  paged.map((s) => (
                    <tr key={s.id} className="border-t" style={{ borderColor: `${GREEN}06` }}>
                      <td className="px-4 py-3 font-medium" style={{ color: GREEN }}>{s.name}</td>
                      <td className="px-4 py-3" style={{ color: `${GREEN}70` }}>{s.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: `${GREEN}08`, color: GREEN }}
                        >
                          {s.role}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: `${GREEN}70` }}>{s.dept}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: s.status === "Active" ? "#16a34a12" : "#dc262612",
                            color: s.status === "Active" ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: `${GREEN}50` }}>{s.hireDate}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: `${GREEN}50` }}>{s.lastLogin || "Never"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: `${GREEN}08` }}>
              <p className="text-xs" style={{ color: `${GREEN}50` }}>
                Page {page} of {totalPages} ({filtered.length} results)
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Audit Log Section ────────────────────────────────────────────────────────
function AuditSection() {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const auditQuery = trpc.institutional.auditLog.useQuery(undefined, { refetchInterval: 30000 });

  const logs = auditQuery.data || [];
  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const paged = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: GREEN }}>Audit Log</h2>
        <p className="text-xs mt-0.5" style={{ color: `${GREEN}60` }}>
          System-wide activity log ({logs.length} entries)
        </p>
      </div>

      {auditQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin" size={24} style={{ color: GOLD }} />
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: `${GREEN}05` }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: `${GREEN}70` }}>Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: `${GREEN}70` }}>User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: `${GREEN}70` }}>Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: `${GREEN}70` }}>Resource</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: `${GREEN}70` }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-sm" style={{ color: `${GREEN}40` }}>
                      No audit log entries found.
                    </td>
                  </tr>
                ) : (
                  paged.map((log, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: `${GREEN}06` }}>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: `${GREEN}50` }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: GREEN }}>{log.userName || "System"}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: `${GOLD}18`, color: GREEN }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: `${GREEN}60` }}>{log.resource || "—"}</td>
                      <td className="px-4 py-3 text-xs max-w-xs truncate" style={{ color: `${GREEN}50` }}>{log.details || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: `${GREEN}08` }}>
              <p className="text-xs" style={{ color: `${GREEN}50` }}>
                Page {page} of {totalPages} ({logs.length} entries)
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
