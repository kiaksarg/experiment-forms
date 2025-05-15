"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { XFormData } from "@/forms/formData";

export interface XFormSubmitData {
  task: string;
  responses: { [key: string]: { selected?: string; comment?: string } };
}

interface XFormProps {
  data: XFormData;
  onSubmit?: (data: XFormSubmitData) => void;
  onChange?: (data: XFormSubmitData) => void;
  initialData?: XFormSubmitData;
  participantName: string;
}

// Helper function to initialize default responses for range fields.
const initializeResponses = (data: XFormData) => {
  const initialResponses: {
    [key: string]: { selected?: string; comment?: string };
  } = {};
  data.fields.forEach((field) => {
    if (field.type === "range") {
      const defaultVal =
        field.defaultValue !== undefined
          ? field.defaultValue
          : field.min !== undefined
          ? String(field.min)
          : "0";
      initialResponses[field.id] = { selected: defaultVal };
    }
  });
  return initialResponses;
};

const XForm: React.FC<XFormProps> = ({
  data,
  onSubmit,
  onChange,
  initialData,
  participantName,
}) => {
  const [taskName, setTaskName] = useState(
    initialData?.task || data.task || ""
  );
  const [responses, setResponses] = useState<{
    [key: string]: { selected?: string; comment?: string };
  }>(initialData?.responses || initializeResponses(data));

  // Notify parent when internal state changes.
  useEffect(() => {
    if (onChange) {
      onChange({ task: taskName, responses });
    }
  }, [taskName, responses, onChange]);

  const handleRadioChange = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], selected: value },
    }));
  };

  const handleCommentChange = (questionId: string, comment: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], comment },
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const submitData: XFormSubmitData = {
      task: taskName,
      responses,
    };
    if (onSubmit) {
      onSubmit(submitData);
    } else {
      console.log("Submitted data:", submitData);
    }
  };

  // Reset this form's state after confirmation.
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset this form?")) {
      setTaskName(data.task || "");
      setResponses(initializeResponses(data));
    }
  };

  // JSON download helper.
  const downloadJSON = () => {
    const responsesToDownload = data.fields.reduce((acc, field) => {
      const res = responses[field.id] || {};
      acc[field.id] = {
        selected: res.selected && res.selected !== "" ? res.selected : null,
        comment: res.comment && res.comment !== "" ? res.comment : "",
      };
      return acc;
    }, {} as { [key: string]: { selected: string | null; comment: string } });

    const dataToDownload = {
      task: taskName && taskName !== "" ? taskName : null,
      responses: responsesToDownload,
    };

    const jsonStr = JSON.stringify(dataToDownload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const dateTimeStr = new Date().toISOString().replace(/[:.]/g, "-");

    a.download = `${participantName.replace(" ", "_")}_${data.title.replace(
      / /g,
      "_"
    )}_${taskName.replace(/ /g, "_")}_responses_${dateTimeStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV conversion helper.
  const convertResponsesToCSV = () => {
    const csvRows = [];
    csvRows.push("questionId,selected,comment");
    data.fields.forEach((field) => {
      const res = responses[field.id] || {};
      const selected =
        res.selected && res.selected !== "" ? res.selected : "null";
      const comment =
        res.comment && res.comment !== ""
          ? `"${res.comment.replace(/"/g, '""')}"`
          : "";
      csvRows.push(`${field.id},${selected},${comment}`);
    });
    return csvRows.join("\n");
  };

  // CSV download helper.
  const downloadCSV = () => {
    const csvStr = convertResponsesToCSV();
    const blob = new Blob([csvStr], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.title.replace(/ /g, "_")}_responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Editable task input */}
      <div className="mb-12">
        <label
          htmlFor="taskName"
          className="block text-lg font-bold text-black mb-2"
        >
          Task Name
        </label>
        <input
          id="taskName"
          type="text"
          className="w-full p-2 border border-gray-300 rounded text-lg text-black"
          value={taskName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTaskName(e.target.value)
          }
        />
      </div>

      {/* Render form title and description */}
      <h3 className="text-xl font-bold mb-2 text-black">{data.title}</h3>
      {data.Description && (
        <p className="mb-4 text-black">{data.Description}</p>
      )}

      <form onSubmit={handleSubmit}>
        {data.fields.map((item) => (
          <div key={item.id} className="mb-12">
            <p className="mb-4 text-lg font-bold text-black">{item.question}</p>

            {/* Radio type (default) */}
            {(!item.type || item.type === "radio") && item.options && (
              <div className="flex justify-between items-center">
                {item.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex flex-col items-center text-black flex-1"
                  >
                    <div className="flex items-center justify-center h-[10px] w-full">
                      <input
                        type="radio"
                        name={item.id}
                        value={option.value}
                        checked={
                          responses[item.id]?.selected === String(option.value)
                        }
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleRadioChange(item.id, e.target.value)
                        }
                        className="transform scale-150"
                      />
                    </div>
                    <span className="text-sm mt-2">{option.value}</span>
                    <div className="mt-2 text-sm text-gray-700 text-center max-w-[100px] h-[36px] flex items-center justify-center">
                      {option.label}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Input type */}
            {item.type === "input" && (
              <div className="w-full">
                <input
                  type="text"
                  placeholder={item.inputPlaceholder || "Enter value"}
                  value={responses[item.id]?.selected || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleRadioChange(item.id, e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded text-lg text-black"
                />
              </div>
            )}

            {/* Range type */}
            {item.type === "range" && (
              <div className="flex flex-col items-center">
                {/* Labels at the ends of the range */}
                <div className="w-85 flex justify-between">
                  <span className="text-sm text-black">
                    {item.minLabel || "Very Low"}
                  </span>
                  <span className="text-sm text-black">
                    {item.maxLabel || "Very High"}
                  </span>
                </div>
                {/* Range slider with a fixed, smaller width */}
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  value={
                    responses[item.id]?.selected !== undefined
                      ? responses[item.id]?.selected
                      : String(item.min)
                  }
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleRadioChange(item.id, e.target.value)
                  }
                  className="w-85 h-3"
                />
                <div className="text-center mt-2 text-black">
                  {responses[item.id]?.selected !== undefined
                    ? responses[item.id]?.selected
                    : item.min}
                </div>
              </div>
            )}

            {item.hasComment && (
              <textarea
                className="mt-4 w-full p-2 border border-gray-300 rounded text-black"
                placeholder={item.commentPlaceholder || "Enter your comments"}
                value={responses[item.id]?.comment || ""}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleCommentChange(item.id, e.target.value)
                }
              />
            )}
          </div>
        ))}
      </form>

      {/* Download buttons */}
      <div className="mt-6 flex space-x-4">
        <button
          onClick={downloadJSON}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Download JSON
        </button>
        <button
          onClick={downloadCSV}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Download CSV
        </button>
        <button
          onClick={handleReset}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Reset Form
        </button>
      </div>
    </div>
  );
};

export default XForm;
