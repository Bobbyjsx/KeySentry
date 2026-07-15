;
import ScanHistoryList from "@/components/scan/ScanHistoryList";

export default function ScanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Scans</h1>
      </div>
      <ScanHistoryList />
    </div>
  );
}
