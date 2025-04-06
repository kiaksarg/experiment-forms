"use client";

import React, { useState, useCallback, useMemo } from "react";
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
  // Reset counter to force remount of each XForm component.
  const [resetCounter, setResetCounter] = useState(0);

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

  // Memoize the form change handler to keep its reference stable.
  const handleFormChange = useCallback(
    (index: number, data: XFormSubmitData) => {
      setFormResponses((prev) => ({ ...prev, [index]: data }));
    },
    []
  );

  // Create memoized callbacks for each form.
  const formCallbacks = useMemo(() => {
    return xPageData.forms.map((_, index) => ({
      onSubmit: (data: XFormSubmitData) => handleFormChange(index, data),
      onChange: (data: XFormSubmitData) => handleFormChange(index, data),
    }));
  }, [xPageData.forms, handleFormChange]);

  // Global reset: prompts the user; if confirmed, resets participant details and forces all forms to remount.
  const handleGlobalReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all forms? This will clear all responses."
      )
    ) {
      setParticipantName(xPageData.participantName || "");
      setOverallComment(xPageData.comment || "");
      setFormResponses({});
      setResetCounter((prev) => prev + 1);
    }
  };

  // Download aggregated JSON
  const downloadAggregatedJSON = () => {
    const aggregatedData = {
      participantName,
      overallComment,
      forms: xPageData.forms.map((form, index) => ({
        title: form.title,
        task: form.task,
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
    const csvRows = [
      "participantName,overallComment,formTitle,task,questionId,selected,comment",
    ];
    xPageData.forms.forEach((form, index) => {
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
          <div
            key={`${index}-${resetCounter}`}
            className="bg-white shadow-lg rounded-lg p-8"
          >
            <XForm
              data={form}
              onSubmit={formCallbacks[index].onSubmit}
              onChange={formCallbacks[index].onChange}
            />
          </div>
        ))}

        {/* Global aggregated download and reset buttons */}
        <div className="flex flex-wrap gap-4">
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
          <button
            onClick={handleGlobalReset}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Reset All Forms
          </button>
        </div>
      </div>
    </div>
  );
}
