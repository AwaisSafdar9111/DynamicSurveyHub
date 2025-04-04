export type ControlType = 'Text' | 'Textarea' | 'RadioGroup' | 'CheckboxGroup' | 'Dropdown' | 'FileUpload' | 'Signature' | 'LocationPicker' | 'Note';

export interface Control {
  id: number;
  sectionId: number;
  label: string;
  type: ControlType;
  isRequired: boolean;
  orderIndex: number;
  configuration: ControlConfiguration;
  options?: ControlOption[];
  conditions?: ControlCondition[];
}

export interface ControlOption {
  id: number;
  controlId: number;
  value: string;
  text: string;
  score?: number;
  orderIndex: number;
}

export interface ControlCondition {
  id: number;
  controlId: number;
  sourceControlId: number;
  operator: 'Equals' | 'NotEquals' | 'Contains' | 'GreaterThan' | 'LessThan';
  value: string;
  action: 'Show' | 'Hide' | 'Enable' | 'Disable';
}

export interface ControlConfiguration {
  id: number;
  controlId: number;
  
  // Text Configuration
  inputType?: 'Text' | 'Number' | 'Email' | 'Phone';
  minValue?: number;
  maxValue?: number;
  enableCountryCode?: boolean;
  
  // Textarea Configuration
  maxLength?: number;
  
  // Radio/Checkbox/Dropdown Configuration
  selectionType?: 'Single' | 'Multiple';
  searchable?: boolean;
  
  // File Upload Configuration
  acceptedFileTypes?: string[];
  
  // Location Picker Configuration
  showMap?: boolean;
  
  // Note Configuration
  noteText?: string;
  htmlContent?: string;
}

export interface ControlResponse {
  id: number;
  submissionId: number;
  controlId: number;
  value: string;
  optionIds?: number[];
  latitude?: number;
  longitude?: number;
  fileUrls?: string[];
  signatureUrl?: string;
}

export interface FormSubmission {
  id: number;
  formId: number;
  submittedBy: string;
  submittedDate: Date;
  responses: ControlResponse[];
}
