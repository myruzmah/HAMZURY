import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { FileSearch, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";

type TrackingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function TrackingDialog({ open, onOpenChange }: TrackingDialogProps) {
  const [ref, setRef] = useState("");
  const [searched, setSearched] = useState(false);

  const trackingQuery = trpc.tracking.lookup.useQuery(
    { ref: ref.trim().toUpperCase() },
    { enabled: searched && ref.trim().length > 0, retry: false }
  );

  const handleSearch = () => {
    if (!ref.trim()) return;
    setSearched(true);
  };

  const handleReset = () => {
    setRef("");
    setSearched(false);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 size={20} className="text-green-600" />;
      case "Submitted":
        return <Clock size={20} className="text-purple-600" />;
      case "In Progress":
        return <Clock size={20} className="text-blue-600" />;
      case "Waiting on Client":
        return <AlertCircle size={20} className="text-yellow-600" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-50 text-green-700 border-green-200";
      case "Submitted": return "bg-purple-50 text-purple-700 border-purple-200";
      case "In Progress": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Waiting on Client": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) handleReset(); }}>
      <DialogContent className="sm:max-w-md" style={{ backgroundColor: "#FAFAF8" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg" style={{ color: "#86868B" }}>
            <FileSearch size={20} style={{ color: "#C9A97E" }} />
            Track Your File
          </DialogTitle>
          <DialogDescription style={{ color: "#1D1D1F", opacity: 0.7 }}>
            Enter your reference number to check the status of your compliance file.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mt-4">
          <Input
            value={ref}
            onChange={(e) => { setRef(e.target.value); setSearched(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="HAM-XXXX-1234"
            className="flex-1 bg-white border-[#86868B]/10 focus:border-[#C9A97E]"
            style={{ color: "#86868B" }}
          />
          <Button
            onClick={handleSearch}
            disabled={!ref.trim() || trackingQuery.isLoading}
            style={{ backgroundColor: "#86868B", color: "#C9A97E" }}
          >
            {trackingQuery.isLoading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
          </Button>
        </div>

        {/* Results */}
        {searched && trackingQuery.data && (
          <div className="mt-6">
            {trackingQuery.data.found ? (
              <div className="bg-white rounded-xl border border-[#86868B]/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold tracking-wider px-3 py-1 rounded-full bg-[#86868B]/5" style={{ color: "#86868B" }}>
                    {trackingQuery.data.ref}
                  </span>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${statusColor(trackingQuery.data.status!)}`}>
                    {trackingQuery.data.status}
                  </span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold mb-1" style={{ color: "#86868B" }}>Service</p>
                  <p className="text-[14px]" style={{ color: "#1D1D1F" }}>{trackingQuery.data.service}</p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: "#FAFAF8" }}>
                  {statusIcon(trackingQuery.data.status!)}
                  <p className="text-[14px] leading-relaxed" style={{ color: "#1D1D1F" }}>
                    {trackingQuery.data.statusMessage}
                  </p>
                </div>
                <p className="text-[11px] opacity-50 text-right">
                  Last updated: {new Date(trackingQuery.data.lastUpdated!).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-red-200 p-6 text-center">
                <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
                <p className="text-[15px] font-semibold mb-2" style={{ color: "#86868B" }}>Reference Not Found</p>
                <p className="text-[13px] opacity-70" style={{ color: "#1D1D1F" }}>
                  No file was found with this reference number. Please check the number and try again, or contact us directly.
                </p>
              </div>
            )}
          </div>
        )}

        {searched && trackingQuery.isError && (
          <div className="mt-6 bg-white rounded-xl border border-red-200 p-6 text-center">
            <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-[15px] font-semibold mb-2" style={{ color: "#86868B" }}>Error</p>
            <p className="text-[13px] opacity-70" style={{ color: "#1D1D1F" }}>
              An error occurred while looking up your reference. Please try again.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
