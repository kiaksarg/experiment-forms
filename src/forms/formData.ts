// formData.ts

export type FormFieldType = "radio" | "input" | "range";

export interface FormOption {
  value: number;
  label: string;
}

export interface FormItem {
  id: string;
  question: string;
  // New type field – defaults to "radio" if not provided.
  type?: FormFieldType;
  // For "radio" fields.
  options?: FormOption[];
  // For "input" type.
  inputPlaceholder?: string;
  // For "range" type.
  min?: number;
  max?: number;
  hasComment?: boolean;
  commentPlaceholder?: string;
  minLabel?: string;
  maxLabel?: string;
  defaultValue?: string;
}

export interface XFormData {
  id?: string;
  groupId?: string;
  name: string;
  task?: string;
  title: string;
  Description?: string;
  fields: FormItem[];
}

export interface XPage {
  participantName: string;
  comment?: string;
  forms: XFormData[];
}
