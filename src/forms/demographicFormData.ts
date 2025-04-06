import { XFormData } from "./formData";

export const demographicFormData: XFormData = {
  name: "Demographic Questionnaire",
  title: "Demographic Questionnaire",
  fields: [
    {
      id: "age",
      question: "What is your age?",
      type: "input",
      inputPlaceholder: "Enter your age",
    },
    {
      id: "gender",
      question: "What is your gender?",
      type: "radio", // Explicitly set to radio; it's the default if not provided.
      options: [
        { value: 1, label: "Male" },
        { value: 2, label: "Female" },
        { value: 3, label: "Non-binary/Third gender" },
        { value: 4, label: "Prefer not to say" },
        { value: 5, label: "Other" },
      ],
      hasComment: true,
      commentPlaceholder: "If 'Other', please specify",
    },
    {
      id: "vrExperience",
      question:
        "How much prior experience do you have with Virtual Reality (VR)?",
      type: "radio",
      options: [
        { value: 1, label: "None" },
        { value: 2, label: "Limited (tried it a few times)" },
        { value: 3, label: "Moderate (regular user)" },
        { value: 4, label: "Extensive (expert)" },
      ],
      hasComment: true,
      commentPlaceholder:
        "Please specify more details for each VR motion you experienced",
    },
    {
      id: "gamingExperience",
      question: "How much experience do you have with 3D/Gaming?",
      type: "radio",
      options: [
        { value: 1, label: "None" },
        { value: 2, label: "Casual" },
        { value: 3, label: "Moderate" },
        { value: 4, label: "Extensive" },
      ],
      hasComment: true,
      commentPlaceholder: "Please specify your gaming or 3D experience",
    },
  ],
};
