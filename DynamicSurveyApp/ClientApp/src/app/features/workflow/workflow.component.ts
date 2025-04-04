import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { WorkflowService } from '../../shared/services/workflow.service';
import { FormService } from '../../shared/services/form.service';
import { FormAssignment } from '../../shared/models/form.model';
import { Form } from '../../shared/models/form.model';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  standalone: false
})
export class WorkflowComponent implements OnInit {
  assignments: FormAssignment[] = [];
  forms: Form[] = [];
  users: { id: string, name: string }[] = [
    { id: 'user1', name: 'John Doe' },
    { id: 'user2', name: 'Jane Smith' },
    { id: 'user3', name: 'Bob Johnson' }
  ]; // In a real app, this would come from a user service
  loading = false;
  displayedColumns: string[] = ['formTitle', 'assignedTo', 'assignedDate', 'dueDate', 'status', 'actions'];
  
  newAssignmentForm: FormGroup;
  showNewAssignmentForm = false;

  constructor(
    private fb: FormBuilder,
    private workflowService: WorkflowService,
    private formService: FormService,
    private snackBar: MatSnackBar
  ) { 
    this.newAssignmentForm = this.fb.group({
      formId: ['', Validators.required],
      userId: ['', Validators.required],
      dueDate: [null]
    });
  }

  ngOnInit(): void {
    this.loadAssignments();
    this.loadForms();
  }

  loadAssignments(): void {
    this.loading = true;
    this.workflowService.getAssignments().subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Error loading assignments: ' + err.message, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadForms(): void {
    this.formService.getForms().subscribe({
      next: (forms) => {
        this.forms = forms.filter(f => f.isPublished);
      },
      error: (err) => {
        this.snackBar.open('Error loading forms: ' + err.message, 'Close', { duration: 3000 });
      }
    });
  }

  toggleNewAssignmentForm(): void {
    this.showNewAssignmentForm = !this.showNewAssignmentForm;
    if (!this.showNewAssignmentForm) {
      this.newAssignmentForm.reset();
    }
  }

  assignForm(): void {
    if (this.newAssignmentForm.invalid) {
      this.snackBar.open('Please complete all required fields', 'Close', { duration: 3000 });
      return;
    }
    
    const formValue = this.newAssignmentForm.value;
    
    const assignment: FormAssignment = {
      id: 0,
      formId: formValue.formId,
      userId: formValue.userId,
      assignedDate: new Date(),
      dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
      status: 'Assigned'
    };
    
    this.loading = true;
    
    this.workflowService.createAssignment(assignment).subscribe({
      next: (response) => {
        this.assignments.push(response);
        this.snackBar.open('Form assigned successfully', 'Close', { duration: 3000 });
        this.toggleNewAssignmentForm();
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Error assigning form: ' + err.message, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  completeAssignment(id: number): void {
    this.loading = true;
    
    this.workflowService.completeAssignment(id).subscribe({
      next: (response) => {
        const index = this.assignments.findIndex(a => a.id === id);
        if (index !== -1) {
          this.assignments[index] = response;
        }
        this.snackBar.open('Assignment marked as completed', 'Close', { duration: 3000 });
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Error completing assignment: ' + err.message, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  deleteAssignment(id: number): void {
    this.loading = true;
    
    this.workflowService.deleteAssignment(id).subscribe({
      next: () => {
        this.assignments = this.assignments.filter(a => a.id !== id);
        this.snackBar.open('Assignment deleted successfully', 'Close', { duration: 3000 });
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Error deleting assignment: ' + err.message, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  getFormTitle(formId: number): string {
    const form = this.forms.find(f => f.id === formId);
    return form ? form.title : `Form #${formId}`;
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : userId;
  }

  formatDate(date: Date | undefined): string {
    return date ? new Date(date).toLocaleDateString() : 'Not set';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Assigned': return 'badge-primary';
      case 'InProgress': return 'badge-warning';
      case 'Completed': return 'badge-success';
      default: return 'badge-secondary';
    }
  }
}
