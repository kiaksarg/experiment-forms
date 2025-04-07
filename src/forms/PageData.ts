import { v4 as uuidv4 } from "uuid";
import { csqFormData } from "./csqFormData";
import { usabilityQuestionsFormData } from "./usabilityQuestionsFormData";
import { XPage } from "./formData";
import { demographicFormData } from "./demographicFormData";
import { nasaTlxFormData } from "./nasaTlxFormData";

const rawForms = [
  { ...demographicFormData, task: "Demographic", groupId: "On Arrival" },
  { ...csqFormData, task: "Initial CSQ-VR", groupId: "On Arrival" },
  { ...csqFormData, task: "CSQ-VR Before Auto", groupId: "Auto" },
  { ...csqFormData, task: "CSQ-VR After Auto", groupId: "Auto" },
  { ...nasaTlxFormData, task: "Nasa TLX Auto", groupId: "Auto" },
  { ...usabilityQuestionsFormData, task: "Usability Auto", groupId: "Auto" },
  { ...csqFormData, task: "CSQ-VR Before Manual", groupId: "Manual" },
  { ...csqFormData, task: "CSQ-VR After Manual", groupId: "Manual" },
  { ...nasaTlxFormData, task: "Nasa TLX Manual", groupId: "Manual" },
  { ...usabilityQuestionsFormData, task: "Usability Manual", groupId: "Manual" },
  { ...csqFormData, task: "CSQ-VR Before Offset", groupId: "Offset" },
  { ...csqFormData, task: "CSQ-VR After Offset", groupId: "Offset" },
  { ...nasaTlxFormData, task: "Nasa TLX Offset", groupId: "Offset" },
  { ...usabilityQuestionsFormData, task: "Usability Offset", groupId: "Offset" },
  { ...csqFormData, task: "CSQ-VR Before Constant", groupId: "Constant" },
  { ...csqFormData, task: "CSQ-VR After Constant", groupId: "Constant" },
  { ...nasaTlxFormData, task: "Nasa TLX Constant", groupId: "Constant" },
  { ...usabilityQuestionsFormData, task: "Usability Constant", groupId: "Constant" },
];

export const xPageData: XPage = {
  participantName: "",
  comment: "",
  forms: rawForms.map((form) => ({
    ...form,
    // unique stable ID for each form
    id: uuidv4(),
  })),
};
