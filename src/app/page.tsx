"use client";

import { useState } from "react";
import { xPageData } from "@/forms/PageData";
import XForm, { XFormSubmitData } from "./components/XForm";

export default function Home() {
  // Participant details
  const [participantName, setParticipantName] = useState(
    xPageData.participantName || ""
  );
  const [overallComment, setOverallComment] = useState(xPageData.comment || "");
  // Aggregated responses for each form (key is form index)
  const [formResponses, setFormResponses] = useState<{
    [key: number]: XFormSubmitData;
  }>({});

  const handleParticipantNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setParticipantName(e.target.value);
  };

  const handleOverallCommentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setOverallComment(e.target.value);
  };

  // Called when an individual form's state changes (or is submitted)
  const handleFormChange = (index: number, data: XFormSubmitData) => {
    setFormResponses((prev) => ({ ...prev, [index]: data }));
  };

  // Download aggregated JSON
  const downloadAggregatedJSON = () => {
    const aggregatedData = {
      participantName,
      overallComment,
      forms: xPageData.forms.map((form, index) => ({
        title: form.title,
        task: form.task,
        // If a form hasn't been changed/submitted, include all fields with null/empty defaults.
        responses: formResponses[index]
          ? formResponses[index].responses
          : form.fields.reduce((acc, field) => {
              acc[field.id] = { selected: null, comment: "" };
              return acc;
            }, {} as { [key: string]: { selected: string | null; comment: string } }),
      })),
    };

    const jsonStr = JSON.stringify(aggregatedData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aggregated_responses.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download aggregated CSV
  const downloadAggregatedCSV = () => {
    // CSV header: participantName, overallComment, formTitle, task, questionId, selected, comment
    const csvRows = [
      "participantName,overallComment,formTitle,task,questionId,selected,comment",
    ];
    xPageData.forms.forEach((form, index) => {
      // Use the parent's stored data; if not available, generate defaults.
      const responses =
        formResponses[index]?.responses ||
        form.fields.reduce((acc, field) => {
          acc[field.id] = { selected: null, comment: "" };
          return acc;
        }, {} as { [key: string]: { selected: string | null; comment: string } });
      Object.entries(responses).forEach(([questionId, response]) => {
        const selected =
          response.selected && response.selected !== ""
            ? response.selected
            : "null";
        const comment =
          response.comment && response.comment !== ""
            ? `"${response.comment.replace(/"/g, '""')}"`
            : "";
        csvRows.push(
          `"${participantName}","${overallComment}","${form.title}","${
            form.task || ""
          }",${questionId},${selected},${comment}`
        );
      });
    });
    const csvStr = csvRows.join("\n");
    const blob = new Blob([csvStr], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aggregated_responses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Main container */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Participant details card */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-6">
            <label
              htmlFor="participantName"
              className="block text-lg font-bold text-black mb-2"
            >
              Participant Name
            </label>
            <input
              id="participantName"
              type="text"
              className="w-full p-2 border border-gray-300 rounded text-lg text-black"
              value={participantName}
              onChange={handleParticipantNameChange}
            />
          </div>
          <div>
            <label
              htmlFor="overallComment"
              className="block text-lg font-bold text-black mb-2"
            >
              Overall Comment
            </label>
            <textarea
              id="overallComment"
              className="w-full p-2 border border-gray-300 rounded text-black"
              value={overallComment}
              onChange={handleOverallCommentChange}
            />
          </div>
        </div>

        {/* Render each form in its own card */}
        {xPageData.forms.map((form, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg p-8">
            {/* XForm now renders its own title, description, task input, and individual download buttons.
                The onChange prop lifts its state into Home. */}
            <XForm
              data={form}
              onSubmit={(data) => handleFormChange(index, data)}
              onChange={(data) => handleFormChange(index, data)}
            />
          </div>
        ))}

        {/* Global aggregated download buttons */}
        <div className="flex space-x-4">
          <button
            onClick={downloadAggregatedJSON}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Download Aggregated JSON
          </button>
          <button
            onClick={downloadAggregatedCSV}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Download Aggregated CSV
          </button>
        </div>
      </div>
    </div>
  );
}
