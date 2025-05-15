import React from "react";
import { XFormData } from "@/forms/formData";
import { XFormSubmitData } from "./XForm";

// Mirror the SavedState type from Home.tsx
export type SavedState = {
  id: string;
  participantName: string;
  overallComment: string;
  formResponses: { [index: number]: XFormSubmitData };
  timestamp: number;
};

interface ExportNasaTLXProps {
  activeState: SavedState | null;
  allFormsInDisplayOrder: XFormData[];
}

const ExportNasaTLX: React.FC<ExportNasaTLXProps> = ({ activeState, allFormsInDisplayOrder }) => {
  const handleExport = () => {
    if (!activeState) {
      alert("No active state to export.");
      return;
    }

    // 1) Extract all NASA TLX entries
    // 1) Extract all NASA TLX entries, skipping Offset group
    const tlxEntries = allFormsInDisplayOrder
      .map((form, idx) => ({ form, idx }))
      .filter(
        ({ form }) =>
          (form.task?.startsWith("Nasa TLX") || form.task?.startsWith("NASA TLX")) &&
          form.groupId !== "Offset"
      );

    if (tlxEntries.length === 0) {
      alert("No NASA TLX forms found in active state.");
      return;
    }

    // 2) Compute metrics and raw TLX score for each entry
    type Row = {
      subject: string;
      technique: string;
      mental: number;
      physical: number;
      temporal: number;
      performance: number;
      effort: number;
      frustration: number;
      rawTLX: number;
    };

    const rows: Row[] = tlxEntries.map(({ form, idx }) => {
      const technique = form.groupId || "";
      const resp = activeState.formResponses[idx]?.responses || {};

      const mental = Number(resp.mentalDemand?.selected) || 0;
      const physical = Number(resp.physicalDemand?.selected) || 0;
      const temporal = Number(resp.temporalDemand?.selected) || 0;
      const perfRaw = Number(resp.performance?.selected) || 0;
      // reverse performance: higher original -> lower score
      const performance = 100 - perfRaw;
      const effort = Number(resp.effort?.selected) || 0;
      const frustration = Number(resp.frustration?.selected) || 0;

      const rawTLX =
        (mental + physical + temporal + performance + effort + frustration) / 6;

      return {
        subject: activeState.participantName,
        technique,
        mental,
        physical,
        temporal,
        performance,
        effort,
        frustration,
        rawTLX,
      };
    });

    // 3) Build CSV rows
    const csvRows: string[] = [];
    csvRows.push(
      [
        "Subject",
        "Technique",
        "Mental",
        "Physical",
        "Temporal",
        "Performance",
        "Effort",
        "Frustration",
        "RawTLX"
      ].join(",")
    );

    rows.forEach(r => {
      const cols = [
        r.subject,
        r.technique,
        r.mental.toString(),
        r.physical.toString(),
        r.temporal.toString(),
        r.performance.toString(),
        r.effort.toString(),
        r.frustration.toString(),
        r.rawTLX.toFixed(2)
      ];
      const line = cols.map(v => `"${v.replace(/"/g, '""')}"`).join(",");
      csvRows.push(line);
    });

    // 4) Download CSV
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = `${activeState.participantName.replace(/\s+/g, "_")}_NASA_TLX_summary.csv`;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-blue-500 text-white mb-4 py-2 rounded hover:bg-blue-600 transition w-full"
    >
      NASA TLX Report
    </button>
  );
};

export default ExportNasaTLX;
