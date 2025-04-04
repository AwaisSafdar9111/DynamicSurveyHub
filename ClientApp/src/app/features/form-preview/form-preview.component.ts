import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { ConditionalLogicService } from '../../shared/services/conditional-logic.service';
import { environment } from '../../../environments/environment';
import { CommonModule, NgIf, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConditionalControlDirective } from './conditional-control.directive';

interface Control {
  id: number;
  name: string;
  label: string;
  control_type: string;
  properties: any;
  required: boolean;
  section_id: number;
  validation?: any;
  options?: { label: string; value: string }[];
}

interface Section {
  id: number;
  name: string;
  title: string;
  description?: string;
  form_id: number;
  display_order: number;
  controls: Control[];
}

interface Form {
  id: number;
  name: string;
  title: string;
  description?: string;
  status: string;
  user_id: number;
  sections: Section[];
  conditionalLogic: any[];
}

@Component({
  selector: 'app-form-preview',
  templateUrl: './form-preview.component.html',
  styleUrls: ['./form-preview.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ConditionalControlDirective,
    NgIf,
    NgFor,
    NgSwitch,
    NgSwitchCase
  ]
})
export class FormPreviewComponent implements OnInit, OnDestroy {
  form: Form;
  formGroup: FormGroup;
  loading = true;
  error: string = null;
  
  private apiUrl = `${environment.apiUrl}/api/forms`;
  private destroy$ = new Subject<void>();
  private controlValues: { [controlId: number]: any } = {};
  
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    private conditionalLogicService: ConditionalLogicService
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const formId = +params['id'];
      if (formId) {
        this.loadForm(formId);
      } else {
        this.error = 'No form ID provided';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadForm(formId: number): void {
    this.loading = true;
    this.http.get<Form>(`${this.apiUrl}/${formId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (form) => {
          this.form = form;
          this.initFormGroup();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading form:', err);
          this.error = 'Failed to load form. Please try again later.';
          this.loading = false;
        }
      });
  }

  private initFormGroup(): void {
    const group = {};
    
    // Create form controls for each control in each section
    this.form.sections.forEach(section => {
      section.controls.forEach(control => {
        // Initialize with default value if any
        const defaultValue = control.properties?.defaultValue || '';
        group[`control_${control.id}`] = this.fb.control(defaultValue);
      });
    });
    
    this.formGroup = this.fb.group(group);
    
    // Subscribe to value changes to evaluate conditional logic
    this.formGroup.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(values => {
        // Convert the form values to a map of control IDs to values
        const controlValues = {};
        Object.keys(values).forEach(key => {
          if (key.startsWith('control_')) {
            const controlId = parseInt(key.replace('control_', ''));
            controlValues[controlId] = values[key];
          }
        });
        
        this.controlValues = controlValues;
        // Evaluate conditional logic based on the current values
        this.conditionalLogicService.evaluateFormConditions(this.form.id, controlValues);
      });
    
    // Trigger initial evaluation
    this.conditionalLogicService.evaluateFormConditions(this.form.id, this.controlValues);
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      const formValues = this.formGroup.value;
      const submission = {
        formId: this.form.id,
        data: {}
      };
      
      // Process form values
      Object.keys(formValues).forEach(key => {
        if (key.startsWith('control_')) {
          const controlId = parseInt(key.replace('control_', ''));
          submission.data[controlId] = formValues[key];
        }
      });
      
      // Submit form data
      this.http.post(`${this.apiUrl}/${this.form.id}/submissions`, submission)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Form submitted successfully:', response);
            // Reset form
            this.formGroup.reset();
            // TODO: Show success message
          },
          error: (err) => {
            console.error('Error submitting form:', err);
            // TODO: Show error message
          }
        });
    }
  }

  // Helper method to get control type
  getControlType(type: string): string {
    switch (type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
      case 'tel':
      case 'url':
        return 'input';
      case 'textarea':
        return 'textarea';
      case 'radio':
        return 'radio';
      case 'checkbox':
        return 'checkbox';
      case 'select':
        return 'select';
      default:
        return 'input';
    }
  }
}