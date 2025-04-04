import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FormService } from '../../shared/services/form.service';
import { FormSubmission } from '../../shared/models/control.model';
import { Form } from '../../shared/models/form.model';

@Component({
  selector: 'app-form-submission',
  templateUrl: './form-submission.component.html'
})
export class FormSubmissionComponent implements OnInit {
  submissionId: number | null = null;
  submission: FormSubmission | null = null;
  form: Form | null = null;
  submissions: FormSubmission[] = [];
  loading = false;
  displayedColumns: string[] = ['id', 'formTitle', 'submittedBy', 'submittedDate', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formService: FormService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.submissionId = +idParam;
        this.loadSubmission(this.submissionId);
      } else {
        this.loadSubmissions();
      }
    });
  }

  loadSubmissions(): void {
    this.loading = true;
    this.formService.getSubmissions().subscribe({
      next: (submissions) => {
        this.submissions = submissions;
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Error loading submissions: ' + err.message, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadSubmission(id: number): void {
    this.loading = true;
    this.formService.getSubmission(id).subscribe({
      next: (submission) => {
        this.submission = submission;
        this.loadForm(submission.formId);
      },
      error: (err) => {
        this.snackBar.open('Error loading submission: ' + err.message, 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/submissions']);
      }
    });
  }

  loadForm(formId: number): void {
    this.formService.getForm(formId).subscribe({
      next: (form) => {
        this.form = form;
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Error loading form: ' + err.message, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  viewSubmission(id: number): void {
    this.router.navigate(['/submissions', id]);
  }

  backToList(): void {
    this.router.navigate(['/submissions']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  getControlLabel(controlId: number): string {
    if (!this.form) return '';
    
    for (const section of this.form.sections) {
      const control = section.controls.find(c => c.id === controlId);
      if (control) {
        return control.label;
      }
    }
    
    return 'Unknown Control';
  }

  getControlType(controlId: number): string {
    if (!this.form) return '';
    
    for (const section of this.form.sections) {
      const control = section.controls.find(c => c.id === controlId);
      if (control) {
        return control.type;
      }
    }
    
    return '';
  }

  getControlOptions(controlId: number): any[] {
    if (!this.form) return [];
    
    for (const section of this.form.sections) {
      const control = section.controls.find(c => c.id === controlId);
      if (control && control.options) {
        return control.options;
      }
    }
    
    return [];
  }

  getOptionText(controlId: number, optionValue: string): string {
    const options = this.getControlOptions(controlId);
    const option = options.find(o => o.value === optionValue);
    return option ? option.text : optionValue;
  }

  getDisplayValue(response: any): string {
    const controlType = this.getControlType(response.controlId);
    
    switch (controlType) {
      case 'RadioGroup':
      case 'Dropdown':
        return this.getOptionText(response.controlId, response.value);
      case 'CheckboxGroup':
        if (response.optionIds && response.optionIds.length > 0) {
          return response.optionIds.map((value: string) => 
            this.getOptionText(response.controlId, value)
          ).join(', ');
        }
        return '';
      case 'LocationPicker':
        if (response.latitude !== undefined && response.longitude !== undefined) {
          return `Latitude: ${response.latitude}, Longitude: ${response.longitude}`;
        }
        return response.value;
      case 'FileUpload':
        if (response.fileUrls && response.fileUrls.length > 0) {
          return response.fileUrls.map((url: string) => {
            const fileName = url.split('/').pop();
            return `<a href="${url}" target="_blank">${fileName}</a>`;
          }).join(', ');
        }
        return 'No files';
      case 'Signature':
        if (response.signatureUrl) {
          return `<a href="${response.signatureUrl}" target="_blank">View Signature</a>`;
        }
        return 'No signature';
      default:
        return response.value;
    }
  }
}
