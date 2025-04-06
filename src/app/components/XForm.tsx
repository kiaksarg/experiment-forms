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
}

const XForm: React.FC<XFormProps> = ({ data, onSubmit, onChange }) => {
  const [taskName, setTaskName] = useState(data.task || "");
  const [responses, setResponses] = useState<{
    [key: string]: { selected?: string; comment?: string };
  }>({});

  // Whenever taskName or responses change, call onChange so that the parent stays updated.
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

  // Individual download: JSON export
  const downloadJSON = () => {
    // Ensure every field is included.
    const responsesToDownload = data.fields.reduce((acc, field) => {
      const res = responses[field.id] || {};
      acc[field.id] = {
        selected: res.selected && res.selected !== "" ? res.selected : null,
        // For text fields, export as an empty string if not entered.
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
    a.download = `${data.title.replace(/ /g, "_")}_responses.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Individual download: Convert responses to CSV format
  const convertResponsesToCSV = () => {
    const csvRows = [];
    // header row
    csvRows.push("questionId,selected,comment");
    // Iterate over all fields to include missing ones.
    data.fields.forEach((field) => {
      const res = responses[field.id] || {};
      const selected =
        res.selected && res.selected !== "" ? res.selected : "null";
      // For text fields like comment, output empty string if not entered.
      const comment =
        res.comment && res.comment !== ""
          ? `"${res.comment.replace(/"/g, '""')}"`
          : "";
      csvRows.push(`${field.id},${selected},${comment}`);
    });
    return csvRows.join("\n");
  };

  // Individual download: CSV export
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
      {/* Render form title and description */}
      <h3 className="text-xl font-bold mb-2 text-black">{data.title}</h3>
      {data.Description && (
        <p className="mb-4 text-black">{data.Description}</p>
      )}

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

      <form onSubmit={handleSubmit}>
        {data.fields.map((item) => (
          <div key={item.id} className="mb-12">
            <p className="mb-4 text-lg font-bold text-black">{item.question}</p>
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
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </form>

      {/* Individual download buttons */}
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
      </div>
    </div>
  );
};

export default XForm;
