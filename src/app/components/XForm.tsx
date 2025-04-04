"use client";
import { FormItem } from "@/forms/formData";
import React, { useState, ChangeEvent, FormEvent } from "react";

interface DynamicFormProps {
  data: FormItem[];
  onSubmit?: (responses: {
    [key: string]: { selected?: string; comment?: string };
  }) => void;
}

const XForm: React.FC<DynamicFormProps> = ({ data, onSubmit }) => {
  // Store responses: each key corresponds to a question's id with an object for "selected" and "comment".
  const [responses, setResponses] = useState<{
    [key: string]: { selected?: string; comment?: string };
  }>({});

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
    if (onSubmit) {
      onSubmit(responses);
    } else {
      console.log("Submitted responses:", responses);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {data.map((item) => (
        <div key={item.id} className="mb-12">
          <p className="mb-4 text-lg font-bold text-black ">{item.question}</p>
          {/* Render radio buttons with both numeric value and descriptive label */}
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

          {/* Render comment textarea if applicable */}
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
  );
};

export default XForm;
