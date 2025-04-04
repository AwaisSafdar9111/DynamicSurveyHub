import { Control } from './control.model';

export interface Section {
  id: number;
  formId: number;
  title: string;
  description?: string;
  orderIndex: number;
  controls: Control[];
}
