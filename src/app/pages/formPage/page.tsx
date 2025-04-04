"use client";

import React from "react";
import XForm from "../../components/XForm";
import { usabilityQuestionsFormData } from "@/forms/usabilityQuestionsFormData";

const FormPage: React.FC = () => {
  const handleFormSubmit = (responses: {
    [key: string]: { selected?: string; comment?: string };
  }) => {
    console.log("Basic Form Responses:", responses);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-6">Questionnaire</h1>
        <XForm data={usabilityQuestionsFormData} onSubmit={handleFormSubmit} />
      </div>
    </div>
  );
};

export default FormPage;
