import { csqFormData } from "./csqFormData";
import { usabilityQuestionsFormData } from "./usabilityQuestionsFormData";
import { XPage } from "./formData";

export const xPageData: XPage = {
  participantName: "John Doe",
  comment: "Overall session feedback.",
  forms: [
    {
      ...csqFormData,
      task: "Initial CSQ-VR",
    },
    {
      ...csqFormData,
      task: "CSQ-VR Before Auto",
    },
    {
      ...usabilityQuestionsFormData,
      task: "Usability Auto",
    },
    {
      ...csqFormData,
      task: "CSQ-VR After Auto",
    },
    {
      ...csqFormData,
      task: "CSQ-VR Before manual",
    },
    {
      ...csqFormData,
      task: "CSQ-VR After manual",
    },

    {
      ...usabilityQuestionsFormData,
      task: "Usability Manual",
    },
    {
      ...usabilityQuestionsFormData,
      task: "Usability Offset",
    },
    {
      ...usabilityQuestionsFormData,
      task: "Usability Constant",
    },
  ],
};
