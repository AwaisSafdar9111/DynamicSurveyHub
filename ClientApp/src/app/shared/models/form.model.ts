import { Section } from './section.model';

export interface Form {
  id: number;
  title: string;
  description: string;
  createdBy: string;
  createdDate: Date;
  modifiedDate: Date;
  isPublished: boolean;
  sections: Section[];
}

export interface FormAssignment {
  id: number;
  formId: number;
  userId: string;
  assignedDate: Date;
  dueDate?: Date;
  completedDate?: Date;
  status: 'Assigned' | 'InProgress' | 'Completed';
}
