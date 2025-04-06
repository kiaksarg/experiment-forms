export interface FormOption {
    value: number;
    label: string;
  }
  
  export interface FormItem {
    id: string;
    question: string;
    options: FormOption[];
    hasComment?: boolean;
    commentPlaceholder?: string;
  }
  
  export interface XFormData {
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