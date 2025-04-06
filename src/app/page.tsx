"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  createRef,
  useEffect,
} from "react";
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
  // Active form index for highlighting navigation
  const [activeFormIndex, setActiveFormIndex] = useState(0);

  // Create refs for each form container to allow navigation.
  const formRefs = useMemo(
    () => xPageData.forms.map(() => createRef<HTMLDivElement>()),
    [xPageData.forms]
  );

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
  const handleFormChange = useCallback(
    (index: number, data: XFormSubmitData) => {
      setFormResponses((prev) => ({ ...prev, [index]: data }));
    },
    []
  );

  // Memoize callbacks for each form.
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

  // Set up IntersectionObserver to track which form is active.
  React.useEffect(() => {
    const observerOptions = {
      root: null,
      threshold: 0.5,
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute("data-index"));
          setActiveFormIndex(index);
        }
      });
    }, observerOptions);

    formRefs.forEach((ref, index) => {
      if (ref.current) {
        // Set data-index on each observed element.
        ref.current.setAttribute("data-index", index.toString());
        observer.observe(ref.current);
      }
    });
    return () => {
      observer.disconnect();
    };
  }, [formRefs]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Outer container with a 5-column grid:
          Left panel: navigation,
          Middle: forms,
          Right panel: side panel */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left navigation panel (fixed) */}
        <div className="md:col-span-1">
          <div className="sticky top-4 bg-white shadow-lg rounded-lg p-6 space-y-4">
            <h4 className="text-lg font-bold text-gray-900">
              Forms Navigation
            </h4>
            <ul className="space-y-2">
              {xPageData.forms.map((form, index) => (
                <li key={index}>
                  <button
                    onClick={() =>
                      formRefs[index].current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    }
                    className={`w-full text-left font-medium px-3 py-2 rounded transition-colors ${
                      activeFormIndex === index
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    <span>{}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded mx-1 text-center">
                        {form?.id}
                      </span>
                      <span className="mx-1">{`${index + 1}- ${
                        form?.task
                      }`}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Middle column: forms (spanning 3 columns) */}
        <div className="md:col-span-3 space-y-8">
          {xPageData.forms.map((form, index) => (
            <div
              key={`${index}-${resetCounter}`}
              ref={formRefs[index]}
              className="bg-white shadow-lg rounded-lg p-8"
            >
              <XForm
                data={form}
                onSubmit={formCallbacks[index].onSubmit}
                onChange={formCallbacks[index].onChange}
              />
            </div>
          ))}
        </div>

        {/* Right column: side panel (sticky) */}
        <div className="md:col-span-1">
          <div className="sticky top-4 space-y-8">
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

            {/* Global download and reset buttons */}
            <div className="bg-white shadow-lg rounded-lg p-8">
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
        </div>
      </div>
    </div>
  );
}
