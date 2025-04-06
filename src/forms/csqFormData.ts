// csqFormData.ts
import { XFormData } from "./formData";

export const csqFormData: XFormData = {
  name: "CSQ-VR",
  title: "CyberSickness in Virtual Reality Questionnaire (CSQ‑VR)",
  Description:
    "Please, from 1 to 7, circle the response that better corresponds to the presence and intensity of the symptom.",
  fields: [
    {
      id: "nauseaA",
      question:
        "Nausea A: Do you experience nausea (e.g., stomach pain, acid reflux, or tension to vomit)?",
      options: [
        { value: 1, label: "Absent" },
        { value: 2, label: "Very Mild" },
        { value: 3, label: "Mild" },
        { value: 4, label: "Moderate" },
        { value: 5, label: "Intense" },
        { value: 6, label: "Very Intense" },
        { value: 7, label: "Extreme" },
      ],
      hasComment: true,
      commentPlaceholder: "Please write any additional comments for Nausea A",
    },
    {
      id: "nauseaB",
      question:
        "Nausea B: Do you experience dizziness (e.g., light-headedness or spinning feeling)?",
      options: [
        { value: 1, label: "Absent" },
        { value: 2, label: "Very Mild" },
        { value: 3, label: "Mild" },
        { value: 4, label: "Moderate" },
        { value: 5, label: "Intense" },
        { value: 6, label: "Very Intense" },
        { value: 7, label: "Extreme" },
      ],
      hasComment: true,
      commentPlaceholder: "Please write any additional comments for Nausea B",
    },
    {
      id: "vestibularA",
      question:
        "Vestibular A: Do you experience disorientation (e.g., spatial confusion or vertigo)?",
      options: [
        { value: 1, label: "Absent" },
        { value: 2, label: "Very Mild" },
        { value: 3, label: "Mild" },
        { value: 4, label: "Moderate" },
        { value: 5, label: "Intense" },
        { value: 6, label: "Very Intense" },
        { value: 7, label: "Extreme" },
      ],
      hasComment: true,
      commentPlaceholder:
        "Please write any additional comments for Vestibular A",
    },
    {
      id: "vestibularB",
      question:
        "Vestibular B: Do you experience postural instability (i.e., imbalance)?",
      options: [
        { value: 1, label: "Absent" },
        { value: 2, label: "Very Mild" },
        { value: 3, label: "Mild" },
        { value: 4, label: "Moderate" },
        { value: 5, label: "Intense" },
        { value: 6, label: "Very Intense" },
        { value: 7, label: "Extreme" },
      ],
      hasComment: true,
      commentPlaceholder:
        "Please write any additional comments for Vestibular B",
    },
    {
      id: "oculomotorA",
      question:
        "Oculomotor A: Do you experience a visually induced fatigue (e.g., feeling of tiredness or sleepiness)?",
      options: [
        { value: 1, label: "Absent" },
        { value: 2, label: "Very Mild" },
        { value: 3, label: "Mild" },
        { value: 4, label: "Moderate" },
        { value: 5, label: "Intense" },
        { value: 6, label: "Very Intense" },
        { value: 7, label: "Extreme" },
      ],
      hasComment: true,
      commentPlaceholder:
        "Please write any additional comments for Oculomotor A",
    },
    {
      id: "oculomotorB",
      question:
        "Oculomotor B: Do you experience a visually induced discomfort (e.g., eyestrain, blurred vision, or headache)?",
      options: [
        { value: 1, label: "Absent" },
        { value: 2, label: "Very Mild" },
        { value: 3, label: "Mild" },
        { value: 4, label: "Moderate" },
        { value: 5, label: "Intense" },
        { value: 6, label: "Very Intense" },
        { value: 7, label: "Extreme" },
      ],
      hasComment: true,
      commentPlaceholder:
        "Please write any additional comments for Oculomotor B",
    },
  ],
};
