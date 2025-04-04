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
  