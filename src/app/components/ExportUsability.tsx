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

interface ExportUsabilityProps {
  activeState: SavedState | null;
  allFormsInDisplayOrder: XFormData[];
}

const ExportUsability: React.FC<ExportUsabilityProps> = ({
  activeState,
  allFormsInDisplayOrder,
}) => {
  const handleExport = () => {
    if (!activeState) {
      alert("No active state to export.");
      return;
    }

    // 1) Extract all Usability forms, skipping Offset if desired
    const usabilityEntries = allFormsInDisplayOrder
      .map((form, idx) => ({ form, idx }))
      .filter(
        ({ form }) =>
          form.task?.startsWith("Usability") && form.groupId !== "Offset"
      );

    if (usabilityEntries.length === 0) {
      alert("No Usability forms found in active state.");
      return;
    }

    // 2) Build rows of metrics
    type Row = {
      subject: string;
      technique: string;
      control: number;
      comfort: number;
      ease: number;
      precision: number;
      offset: number;
      applicability: number;
      naturalness: number;
    };

    const rows: Row[] = usabilityEntries.map(({ form, idx }) => {
      const technique = form.groupId || "";
      const resp = activeState.formResponses[idx]?.responses || {};

      const control = Number(resp.control?.selected) || 0;
      const comfort = Number(resp.comfort?.selected) || 0;
      const ease = Number(resp.ease?.selected) || 0;
      const precision = Number(resp.precision?.selected) || 0;
      const offsetVal = Number(resp["perceived offset"]?.selected) || 0;
      const applicability = Number(resp.applicability?.selected) || 0;
      const naturalness = Number(resp.naturalness?.selected) || 0;

      return {
        subject: activeState.participantName,
        technique,
        control,
        comfort,
        ease,
        precision,
        offset: offsetVal,
        applicability,
        naturalness,
      };
    });

    // 3) Build CSV
    const csvRows: string[] = [];
    csvRows.push(
      [
        "Subject",
        "Technique",
        "Control",
        "Comfort",
        "Ease",
        "Precision",
        "PerceivedOffset",
        "Applicability",
        "Naturalness",
      ].join(",")
    );

    rows.forEach((r) => {
      const cols = [
        r.subject,
        r.technique,
        r.control.toString(),
        r.comfort.toString(),
        r.ease.toString(),
        r.precision.toString(),
        r.offset.toString(),
        r.applicability.toString(),
        r.naturalness.toString(),
      ];
      const line = cols.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");
      csvRows.push(line);
    });

    // 4) Download CSV file
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = `${activeState.participantName.replace(
      /\s+/g,
      "_"
    )}_Usability_summary.csv`;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-blue-500 text-white mb-4 py-2 rounded hover:bg-blue-600 transition w-full"
    >
      Usability Report
    </button>
  );
};

export default ExportUsability;
