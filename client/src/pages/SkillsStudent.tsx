import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  BookOpen, Calendar, Users, Award, CheckCircle,
  PlayCircle, MessageSquare, Settings, ArrowLeft, Clock, Loader2,
  AlertCircle,
} from "lucide-react";

const GOLD = "#C9A97E";
const NAVY = "#1B2A4A";  // Skills primary — dark navy blue

export default function SkillsStudent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"modules" | "calendar" | "peers" | "profile">("modules");

  const portalQuery = trpc.skills.myPortal.useQuery(undefined, {
    enabled: !loading && !!user,
    refetchOnWindowFocus: false,
  });

  const submitMutation = trpc.skills.submitAssignment.useMutation({
    onSuccess: () => {
      toast.success("Assignment submitted!");
      portalQuery.refetch();
    },
    onError: () => toast.error("Submission failed. Try again."),
  });

  if (loading || portalQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xl mx-auto mb-4 animate-pulse" style={{ backgroundColor: GOLD }}>H</div>
          <p className="text-gray-500">Loading your portal...</p>
        </div>
      </div>
    );
  }

  const portal = portalQuery.data;

  // No accepted enrollment found — show a clear state
  if (!portal) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
            <Link href="/skills" className="text-gray-400 hover:text-[#C9A97E] transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-bold text-sm">STUDENT PORTAL</span>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertCircle className="mx-auto mb-4 text-gray-400" size={40} />
            <h2 className="text-xl font-bold mb-2" style={{ color: NAVY }}>No active enrollment found</h2>
            <p className="text-sm text-gray-500 mb-6">
              Your application may still be under review, or you may not have an accepted enrollment linked to this account.
            </p>
            <Link href="/skills">
              <Button style={{ backgroundColor: NAVY, color: "#FAFAF8" }}>Browse Programs</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { application, cohort, modules, assignments, sessions } = portal;

  const totalModules = modules.length;
  const completedAssignments = assignments.filter(a => a.status === "submitted" || a.status === "graded").length;
  const totalAssignments = assignments.length;
  const progressPct = totalModules > 0 ? Math.round((completedAssignments / Math.max(totalAssignments, 1)) * 100) : 0;

  const today = new Date().toISOString().split("T")[0];
  const upcomingSessions = sessions.filter(s => s.sessionDate >= today);
  const currentModule = modules[0] ?? null;

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <PageMeta title="Student Portal — HAMZURY Skills" description="Access your HAMZURY Skills training modules and progress." />
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/skills" className="text-gray-400 hover:text-[#C9A97E] transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-white text-sm mr-2" style={{ backgroundColor: GOLD }}>H</div>
              <div>
                <span className="font-bold text-sm leading-none block">STUDENT PORTAL</span>
                <span className="text-xs text-gray-500 leading-none">{cohort?.title || application.program}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 hidden sm:block">{application.fullName}</span>
            <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
              {application.fullName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">
            {completedAssignments}/{totalAssignments} assignments
          </span>
          <Progress value={progressPct} className="flex-1 h-2" />
          <span className="text-sm font-bold" style={{ color: GOLD }}>{progressPct}% Complete</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Modules & Assignments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Module Card */}
            {currentModule ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center"><PlayCircle className="mr-2 text-yellow-500" size={20} /> Current Module</CardTitle>
                    <Badge className="text-xs" style={{ backgroundColor: GOLD + "20", color: NAVY }}>Week {currentModule.weekNumber}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{currentModule.title}</h3>
                    {currentModule.description && <p className="text-sm text-gray-600">{currentModule.description}</p>}
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1 text-white" style={{ backgroundColor: "#333" }} onClick={() => toast("Video content will be available here once uploaded by your facilitator.")}>
                      View Module
                    </Button>
                    <Button variant="outline" onClick={() => toast("Resources will appear here once your facilitator uploads them.")}>
                      Resources
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-gray-400">
                  <BookOpen className="mx-auto mb-2" size={32} />
                  <p className="text-sm">Modules will appear here once your cohort begins.</p>
                </CardContent>
              </Card>
            )}

            {/* All Modules */}
            {modules.length > 1 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center"><BookOpen className="mr-2" style={{ color: GOLD }} size={20} /> All Modules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {modules.map((m, i) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: i === 0 ? GOLD : "#D1D5DB" }}>
                        {m.weekNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{m.title}</p>
                      </div>
                      {i === 0 && <Badge className="text-[10px]" style={{ backgroundColor: GOLD + "20", color: NAVY }}>Current</Badge>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Assignments Tracker */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center"><CheckCircle className="mr-2 text-green-500" size={20} /> Assignments Tracker</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignments.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No assignments yet. Check back when your cohort starts.</p>
                ) : assignments.map(a => (
                  <div key={a.id} className={`flex items-center justify-between p-3 rounded-lg ${a.status === "submitted" || a.status === "graded" ? "bg-green-50 border border-green-100" : "border border-gray-200 hover:border-yellow-400 transition-colors"}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      {a.status === "submitted" || a.status === "graded" ? (
                        <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                      )}
                      <div className="min-w-0">
                        <span className={`font-medium text-sm truncate block ${a.status === "submitted" || a.status === "graded" ? "text-green-900" : "text-gray-900"}`}>{a.title}</span>
                        {a.dueDate && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> Due {a.dueDate}</span>}
                      </div>
                    </div>
                    {a.status === "submitted" || a.status === "graded" ? (
                      <span className="text-xs text-green-600 font-medium whitespace-nowrap ml-2">
                        {a.status === "graded" ? `Graded: ${a.grade ?? "–"}` : "Submitted"}
                      </span>
                    ) : (
                      <Button
                        variant="ghost" size="sm" className="text-xs font-bold ml-2"
                        disabled={submitMutation.isPending}
                        onClick={() => submitMutation.mutate({ assignmentId: a.id })}>
                        {submitMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : "Submit"}
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Business Wins */}
            <Card className="bg-[#FFF9E6] border-yellow-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center text-yellow-900"><Award className="mr-2 text-yellow-600" size={20} /> Business Wins</CardTitle>
                  <Button size="sm" className="text-xs font-bold text-white shadow-sm" style={{ backgroundColor: GOLD }} onClick={() => toast("Share Win feature coming soon — log your business outcomes here.")}>Share Win</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white/60 p-4 rounded-lg text-sm text-yellow-900 font-medium">
                  "What are you building?"
                  <span className="font-normal mt-1 block">Log your tangible outcomes here. Share wins with your cohort.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Col: Sessions & Stats */}
          <div className="space-y-6">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center"><Calendar className="mr-2 text-blue-500" size={20} /> Live Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingSessions.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-2">No upcoming sessions scheduled.</p>
                ) : upcomingSessions.slice(0, 4).map(s => {
                  const isToday = s.sessionDate === today;
                  return (
                    <div key={s.id} className={`border-l-4 pl-3 py-1 ${isToday ? "border-[#C9A97E]" : "border-gray-200"}`}>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                        {isToday ? "Today" : s.sessionDate} • {s.sessionTime}
                      </p>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{s.title}</p>
                      {s.meetingUrl && (
                        <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer"
                          className="mt-2 text-xs font-bold hover:underline block" style={{ color: GOLD }}>
                          Join Session →
                        </a>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Application Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center"><MessageSquare className="mr-2 text-purple-500" size={20} /> Enrollment Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-bold font-mono text-xs">{application.ref}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Program</span>
                  <span className="font-semibold">{application.program}</span>
                </div>
                {application.pathway && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pathway</span>
                    <span className="font-semibold capitalize">{application.pathway}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <Badge className="text-xs capitalize" style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}>
                    {application.status}
                  </Badge>
                </div>
                {cohort?.startDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Start Date</span>
                    <span className="font-semibold">{cohort.startDate}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center"><BookOpen className="mr-2" style={{ color: GOLD }} size={20} /> Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-extrabold" style={{ color: GOLD }}>{totalModules}</p>
                    <p className="text-xs text-gray-500">Total Modules</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-extrabold" style={{ color: GOLD }}>{completedAssignments}/{totalAssignments}</p>
                    <p className="text-xs text-gray-500">Assignments</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-extrabold" style={{ color: GOLD }}>{upcomingSessions.length}</p>
                    <p className="text-xs text-gray-500">Upcoming Sessions</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-extrabold" style={{ color: GOLD }}>{progressPct}%</p>
                    <p className="text-xs text-gray-500">Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden bg-white border-t border-gray-200 flex items-center justify-around h-16 sticky bottom-0">
        <button onClick={() => setActiveTab("modules")} className={`flex flex-col items-center justify-center w-full h-full ${activeTab === "modules" ? "text-[#C9A97E]" : "text-gray-500"}`}>
          <BookOpen size={20} className="mb-1" />
          <span className="text-[10px] font-bold">Modules</span>
        </button>
        <button onClick={() => setActiveTab("calendar")} className={`flex flex-col items-center justify-center w-full h-full ${activeTab === "calendar" ? "text-[#C9A97E]" : "text-gray-500"}`}>
          <Calendar size={20} className="mb-1" />
          <span className="text-[10px] font-medium">Sessions</span>
        </button>
        <button onClick={() => setActiveTab("peers")} className={`flex flex-col items-center justify-center w-full h-full ${activeTab === "peers" ? "text-[#C9A97E]" : "text-gray-500"}`}>
          <Users size={20} className="mb-1" />
          <span className="text-[10px] font-medium">Cohort</span>
        </button>
        <button onClick={() => setActiveTab("profile")} className={`flex flex-col items-center justify-center w-full h-full ${activeTab === "profile" ? "text-[#C9A97E]" : "text-gray-500"}`}>
          <Settings size={20} className="mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
}
