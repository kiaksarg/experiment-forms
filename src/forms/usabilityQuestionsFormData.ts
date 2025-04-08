import { XFormData } from "./formData";

export const usabilityQuestionsFormData: XFormData = {
  name: "Usability Questions",
  title: "Usability Questions",
  fields: [
    {
      id: "control",
      question: "I felt in control of the head rotation.",
      options: [
        { value: 1, label: "Strongly disagree" },
        { value: 2, label: "Disagree" },
        { value: 3, label: "Somewhat disagree" },
        { value: 4, label: "Neither agree or disagree" },
        { value: 5, label: "Somewhat agree" },
        { value: 6, label: "Agree" },
        { value: 7, label: "Strongly agree" },
      ],
    },
    {
      id: "comfort",
      question: "I felt comfortable using the technique.",
      options: [
        { value: 1, label: "Strongly disagree" },
        { value: 2, label: "Disagree" },
        { value: 3, label: "Somewhat disagree" },
        { value: 4, label: "Neither agree or disagree" },
        { value: 5, label: "Somewhat agree" },
        { value: 6, label: "Agree" },
        { value: 7, label: "Strongly agree" },
      ],
    },
    {
      id: "ease",
      question: "It was easy to select targets.",
      options: [
        { value: 1, label: "Strongly disagree" },
        { value: 2, label: "Disagree" },
        { value: 3, label: "Somewhat disagree" },
        { value: 4, label: "Neither agree or disagree" },
        { value: 5, label: "Somewhat agree" },
        { value: 6, label: "Agree" },
        { value: 7, label: "Strongly agree" },
      ],
    },
    {
      id: "precision",
      question: "I could select targets precisely.",
      options: [
        { value: 1, label: "Strongly disagree" },
        { value: 2, label: "Disagree" },
        { value: 3, label: "Somewhat disagree" },
        { value: 4, label: "Neither agree or disagree" },
        { value: 5, label: "Somewhat agree" },
        { value: 6, label: "Agree" },
        { value: 7, label: "Strongly agree" },
      ],
    },
    {
      id: "perceived offset",
      question:
        "I did not experience an uncomfortable mismatch between my physical head movement and the resulting virtual rotation.",
      options: [
        { value: 1, label: "Strongly disagree" },
        { value: 2, label: "Disagree" },
        { value: 3, label: "Somewhat disagree" },
        { value: 4, label: "Neither agree or disagree" },
        { value: 5, label: "Somewhat agree" },
        { value: 6, label: "Agree" },
        { value: 7, label: "Strongly agree" },
      ],
    },
    {
      id: "applicability",
      question:
        "The technique of rotating my head like this in a VR environment is applicable.",
      options: [
        { value: 1, label: "Strongly disagree" },
        { value: 2, label: "Disagree" },
        { value: 3, label: "Somewhat disagree" },
        { value: 4, label: "Neither agree or disagree" },
        { value: 5, label: "Somewhat agree" },
        { value: 6, label: "Agree" },
        { value: 7, label: "Strongly agree" },
      ],
    },
    {
      id: "naturalness",
      question: "Rotating the head with the technique is natural.",
      options: [
        { value: 1, label: "Strongly disagree" },
        { value: 2, label: "Disagree" },
        { value: 3, label: "Somewhat disagree" },
        { value: 4, label: "Neither agree or disagree" },
        { value: 5, label: "Somewhat agree" },
        { value: 6, label: "Agree" },
        { value: 7, label: "Strongly agree" },
      ],
    },
  ],
};
