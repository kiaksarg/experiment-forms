import { csqFormData } from "./csqFormData";
import { usabilityQuestionsFormData } from "./usabilityQuestionsFormData";
import { XPage } from "./formData";

export const xPageData: XPage = {
  participantName: "John Doe",
  comment: "Overall session feedback.",
  forms: [
    {
      ...csqFormData,
      task: "Complete Pre-CSQ Task",
    },
    {
      ...usabilityQuestionsFormData,
      task: "Evaluate Usability Before Task",
    },
  ],
};
