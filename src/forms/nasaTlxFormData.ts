import { XFormData } from "./formData";

export const nasaTlxFormData: XFormData = {
  name: "NASA TLX Questionnaire",
  title: "NASA Task Load Index (TLX)",
  Description:
    "Rate the following aspects of the task from 0 (Very Low) to 100 (Very High).",
  fields: [
    {
      id: "mentalDemand",
      question: "How mentally demanding was the task?",
      type: "range",
      min: 0,
      max: 100,
      minLabel: "Very Low",
      maxLabel: "Very High",
      defaultValue: "0",
    },
    {
      id: "physicalDemand",
      question: "How physically demanding was the task?",
      type: "range",
      min: 0,
      max: 100,
      minLabel: "Very Low",
      maxLabel: "Very High",
      defaultValue: "0",
    },
    {
      id: "temporalDemand",
      question: "How hurried or rushed was the pace of the task?",
      type: "range",
      min: 0,
      max: 100,
      minLabel: "Very Low",
      maxLabel: "Very High",
      defaultValue: "0",
    },
    {
      id: "performance",
      question:
        "How successful were you in accomplishing what you were asked to do?",
      type: "range",
      min: 0,
      max: 100,
      minLabel: "Very Low",
      maxLabel: "Very High",
      defaultValue: "0",
    },
    {
      id: "effort",
      question:
        "How hard did you have to work to accomplish your level of performance?",
      type: "range",
      min: 0,
      max: 100,
      minLabel: "Very Low",
      maxLabel: "Very High",
      defaultValue: "0",
    },
    {
      id: "frustration",
      question:
        "How insecure, discouraged, irritated, stressed, and annoyed were you?",
      type: "range",
      min: 0,
      max: 100,
      minLabel: "Very Low",
      maxLabel: "Very High",
      defaultValue: "0",
    },
  ],
};
