"use client";
import React from "react";
import XForm from "../../components/XForm";
import { csqFormData } from "@/forms/csqFormData";


const CSQFormPage: React.FC = () => {
  const handleCSQSubmit = (responses: {
    [key: string]: { selected?: string; comment?: string };
  }) => {
    console.log("CSQ‑VR Responses:", responses);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          CyberSickness in Virtual Reality Questionnaire (CSQ‑VR)
        </h1>
        <p className="mb-4 text-gray-600">
          Please, from 1 to 7, circle the response that better corresponds to
          the presence and intensity of the symptom.
        </p>
        <XForm data={csqFormData} onSubmit={handleCSQSubmit} />
      </div>
    </div>
  );
};

export default CSQFormPage;
