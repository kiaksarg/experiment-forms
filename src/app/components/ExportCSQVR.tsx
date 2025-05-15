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

interface ExportCSQVRProps {
  activeState: SavedState | null;
  allFormsInDisplayOrder: XFormData[];
}

const ExportCSQVR: React.FC<ExportCSQVRProps> = ({
  activeState,
  allFormsInDisplayOrder,
}) => {
  const handleExport = () => {
    if (!activeState) {
      alert("No active state to export.");
      return;
    }

    // 1) Extract all CSQ-VR entries
    const csqEntries = allFormsInDisplayOrder
      .map((form, idx) => ({ form, idx }))
      .filter(({ form }) => form.name === "CSQ-VR");

    if (csqEntries.length === 0) {
      alert("No CSQ-VR forms found in active state.");
      return;
    }

    // 2) Identify the baseline (On Arrival) entry
    const baselineEntry = csqEntries.find(
      ({ form }) => form.groupId === "On Arrival"
    );
    if (!baselineEntry) {
      alert("No 'On Arrival' baseline CSQ-VR form found.");
      return;
    }
    const baseResp =
      activeState.formResponses[baselineEntry.idx]?.responses || {};
    const baselineNausea =
      (Number(baseResp.nauseaA?.selected) || 0) +
      (Number(baseResp.nauseaB?.selected) || 0);
    const baselineVest =
      (Number(baseResp.vestibularA?.selected) || 0) +
      (Number(baseResp.vestibularB?.selected) || 0);
    const baselineOculo =
      (Number(baseResp.oculomotorA?.selected) || 0) +
      (Number(baseResp.oculomotorB?.selected) || 0);
    const baselineTotal = baselineNausea + baselineVest + baselineOculo;

    // 3) Filter out baseline and offset, group remaining by technique
    type Row = {
      subject: string;
      technique: string;
      time: string;
      total: number;
      nausea: number;
      vestibular: number;
      oculomotor: number;
    };
    const grouped: Record<string, Row[]> = {};

    csqEntries
      .filter(
        ({ form }) =>
          form.groupId !== "On Arrival" && form.groupId !== "Offset"
      )
      .forEach(({ form, idx }) => {
        const technique = form.groupId || "";
        const resp = activeState.formResponses[idx]?.responses || {};

        const nausea =
          (Number(resp.nauseaA?.selected) || 0) +
          (Number(resp.nauseaB?.selected) || 0);
        const vestibular =
          (Number(resp.vestibularA?.selected) || 0) +
          (Number(resp.vestibularB?.selected) || 0);
        const oculomotor =
          (Number(resp.oculomotorA?.selected) || 0) +
          (Number(resp.oculomotorB?.selected) || 0);
        const total = nausea + vestibular + oculomotor;

        let time = form.task || "";
        if (time.includes("Before")) time = "Pre";
        else if (time.includes("After")) time = "Post";

        if (!grouped[technique]) grouped[technique] = [];
        grouped[technique].push({
          subject: activeState.participantName,
          technique,
          time,
          total,
          nausea,
          vestibular,
          oculomotor,
        });
      });

    // 4) Build CSV rows with baseline columns at the end
    const csvRows: string[] = [];
    csvRows.push(
      [
        "Subject",
        "Technique",
        "Time",
        "Total",
        "Nausea",
        "Vest",
        "Oculo",
        "BaselineTotal",
        "BaselineNausea",
        "BaselineVest",
        "BaselineOculo",
      ].join(",")
    );

    Object.values(grouped).forEach((rows) => {
      rows.forEach((r) => {
        const cols = [
          r.subject,
          r.technique,
          r.time,
          r.total.toString(),
          r.nausea.toString(),
          r.vestibular.toString(),
          r.oculomotor.toString(),
          baselineTotal.toString(),
          baselineNausea.toString(),
          baselineVest.toString(),
          baselineOculo.toString(),
        ];
        const line = cols.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");
        csvRows.push(line);
      });
    });

    // 5) Download CSV
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = `${activeState.participantName.replace(/\s+/g, "_")}_CSQVR_summary.csv`;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-blue-500 text-white mb-4 py-2 rounded hover:bg-blue-600 transition w-full"
    >
      CSQ-VR Report
    </button>
  );
};

export default ExportCSQVR;
