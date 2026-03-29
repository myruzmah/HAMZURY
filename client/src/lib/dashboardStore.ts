/**
 * dashboardStore.ts
 * Shared mock data store for all dashboards.
 * All tasks use consistent IDs across Founder, CEO, CSO, Finance, HR dashboards.
 * Finance profit calculation is shared across all dashboards.
 */

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type Department = "bizdoc" | "skills" | "systemise" | "hr" | "cso" | "finance" | "founder";

export interface SharedTask {
  id: string;           // e.g. "TSK-001"
  title: string;
  description: string;
  assignedTo: string;   // staff name
  assignedDept: Department;
  createdBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  tags: string[];
}

export interface FinanceSummary {
  totalRevenue: number;
  operationalCost: number;
  profit: number;          // totalRevenue - operationalCost
  commissionPool: number;  // profit * 0.1 (10% shared for commissions)
  retained: number;        // profit - commissionPool
  mtd: {                   // month-to-date
    revenue: number;
    cost: number;
    profit: number;
  };
}

// ─── Shared Tasks (visible across ALL dashboards) ─────────────────────────────
export const SHARED_TASKS: SharedTask[] = [
  {
    id: "TSK-001",
    title: "Review Q1 2026 Business Plan Submissions",
    description: "Review and approve Q1 business plan submissions from BizDoc clients",
    assignedTo: "Aisha Musa",
    assignedDept: "bizdoc",
    createdBy: "Idris Ibrahim",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-03-28",
    createdAt: "2026-03-15",
    tags: ["bizdoc", "review", "q1"],
  },
  {
    id: "TSK-002",
    title: "Onboard 3 New Affiliate Partners",
    description: "Process affiliate registration for 3 pending applications",
    assignedTo: "CSO Office",
    assignedDept: "cso",
    createdBy: "Muhammad Hamzury",
    status: "pending",
    priority: "medium",
    dueDate: "2026-03-30",
    createdAt: "2026-03-18",
    tags: ["affiliate", "cso"],
  },
  {
    id: "TSK-003",
    title: "Process April Commission Payouts",
    description: "Calculate and process commissions for CSO, BizDoc and Affiliate teams",
    assignedTo: "Finance Team",
    assignedDept: "finance",
    createdBy: "Idris Ibrahim",
    status: "pending",
    priority: "urgent",
    dueDate: "2026-04-05",
    createdAt: "2026-03-20",
    tags: ["finance", "commission", "payroll"],
  },
  {
    id: "TSK-004",
    title: "Launch Hamzury Skills Cohort 6",
    description: "Finalize curriculum, schedule sessions, notify enrolled students",
    assignedTo: "Skills Team",
    assignedDept: "skills",
    createdBy: "Muhammad Hamzury",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-04-01",
    createdAt: "2026-03-10",
    tags: ["skills", "cohort", "launch"],
  },
  {
    id: "TSK-005",
    title: "Update Employee Handbook 2026",
    description: "Revise HR handbook with new leave policy and remote work guidelines",
    assignedTo: "HR Lead",
    assignedDept: "hr",
    createdBy: "Idris Ibrahim",
    status: "pending",
    priority: "medium",
    dueDate: "2026-04-15",
    createdAt: "2026-03-22",
    tags: ["hr", "policy", "handbook"],
  },
  {
    id: "TSK-006",
    title: "Sistemis — Build Client CRM Template",
    description: "Design and deliver a CRM workflow template for 3 pending Sistemis clients",
    assignedTo: "Sistemis Team",
    assignedDept: "systemise",
    createdBy: "Idris Ibrahim",
    status: "completed",
    priority: "high",
    dueDate: "2026-03-20",
    createdAt: "2026-03-05",
    tags: ["sistemis", "crm", "template"],
  },
  {
    id: "TSK-007",
    title: "RIDI Q1 2026 Community Report",
    description: "Compile impact report for all 28 RIDI communities for Q1 2026",
    assignedTo: "Skills Team",
    assignedDept: "skills",
    createdBy: "Muhammad Hamzury",
    status: "in_progress",
    priority: "medium",
    dueDate: "2026-03-31",
    createdAt: "2026-03-12",
    tags: ["ridi", "report", "q1"],
  },
  {
    id: "TSK-008",
    title: "Founder Review: Strategic Goals 2027",
    description: "Present 2027 strategic roadmap to founder for approval",
    assignedTo: "Idris Ibrahim",
    assignedDept: "founder",
    createdBy: "Muhammad Hamzury",
    status: "pending",
    priority: "urgent",
    dueDate: "2026-04-10",
    createdAt: "2026-03-23",
    tags: ["strategy", "founder", "2027"],
  },
];

// ─── Finance Summary (shared across all dashboards) ───────────────────────────
export const FINANCE_SUMMARY: FinanceSummary = {
  totalRevenue:    0,
  operationalCost: 0,
  profit:          0,
  commissionPool:  0,
  retained:        0,
  mtd: {
    revenue: 0,
    cost:    0,
    profit:  0,
  },
};

// ─── Helper functions ──────────────────────────────────────────────────────────
export function getTasksByDept(dept: Department): SharedTask[] {
  return SHARED_TASKS.filter(t => t.assignedDept === dept || t.tags.includes(dept));
}

export function getTasksByStatus(status: TaskStatus): SharedTask[] {
  return SHARED_TASKS.filter(t => t.status === status);
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  pending:     "#F59E0B",
  in_progress: "#3B82F6",
  completed:   "#10B981",
  cancelled:   "#EF4444",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low:    "#6B7280",
  medium: "#3B82F6",
  high:   "#F59E0B",
  urgent: "#EF4444",
};
