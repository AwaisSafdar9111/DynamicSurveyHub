import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FormService } from '../../../shared/services/form.service';
import { Form } from '../../../shared/models/form.model';
import { Control, ControlResponse, FormSubmission } from '../../../shared/models/control.model';

@Component({
  selector: 'app-form-preview',
  templateUrl: './form-preview.component.html',
  standalone: false
})
export class FormPreviewComponent implements OnInit {
  formId: number;
  form: Form | null = null;
  formGroup: FormGroup;
  loading = false;
  previewMode = true;
  
  // For tracking conditional display
  controlVisibility: { [controlId: number]: boolean } = {};
  controlEnabled: { [controlId: number]: boolean } = {};
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private formService: FormService,
    private snackBar: MatSnackBar
  ) {
    this.formId = 0;
    this.formGroup = this.fb.group({});
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.formId = +idParam;
        this.loadForm(this.formId);
      } else {
        this.router.navigate(['/forms']);
      }
    });
  }

  loadForm(id: number): void {
    this.loading = true;
    this.formService.getForm(id).subscribe({
      next: (form) => {
        this.form = form;
        this.initFormControls();
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Error loading form: ' + err.message, 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/forms']);
      }
    });
  }

  initFormControls(): void {
    if (!this.form) return;
    
    // Create a new form group
    const formGroup = this.fb.group({});
    
    // Initialize control visibility
    this.controlVisibility = {};
    this.controlEnabled = {};
    
    // Process each section and its controls
    this.form.sections.forEach(section => {
      section.controls.forEach(control => {
        // Skip note controls as they don't have input
        if (control.type === 'Note') {
          this.controlVisibility[control.id] = true;
          this.controlEnabled[control.id] = true;
          return;
        }
        
        // Create form control based on type
        let validators = control.isRequired ? [Validators.required] : [];
        let defaultValue: any = null;
        
        switch (control.type) {
          case 'Text':
            defaultValue = '';
            if (control.configuration.inputType === 'Number') {
              validators = [
                ...validators,
                control.configuration.minValue !== null ? Validators.min(control.configuration.minValue) : null,
                control.configuration.maxValue !== null ? Validators.max(control.configuration.maxValue) : null
              ].filter(Boolean);
            }
            break;
          case 'Textarea':
            defaultValue = '';
            if (control.configuration.maxLength) {
              validators.push(Validators.maxLength(control.configuration.maxLength));
            }
            break;
          case 'RadioGroup':
            defaultValue = null;
            break;
          case 'CheckboxGroup':
          case 'Dropdown':
            defaultValue = control.configuration.selectionType === 'Multiple' ? [] : null;
            break;
          case 'FileUpload':
            defaultValue = null;
            break;
          case 'Signature':
            defaultValue = null;
            break;
          case 'LocationPicker':
            defaultValue = null;
            break;
        }
        
        formGroup.addControl(
          `control_${control.id}`,
          new FormControl(defaultValue, validators)
        );
        
        // Initialize visibility based on conditions
        this.controlVisibility[control.id] = this.evaluateControlVisibility(control);
        this.controlEnabled[control.id] = this.evaluateControlEnabled(control);
      });
    });
    
    // Register value changes to handle conditional logic
    formGroup.valueChanges.subscribe(() => {
      this.evaluateAllConditions();
    });
    
    this.formGroup = formGroup;
  }

  evaluateAllConditions(): void {
    if (!this.form) return;
    
    this.form.sections.forEach(section => {
      section.controls.forEach(control => {
        this.controlVisibility[control.id] = this.evaluateControlVisibility(control);
        this.controlEnabled[control.id] = this.evaluateControlEnabled(control);
      });
    });
  }

  evaluateControlVisibility(control: Control): boolean {
    if (!control.conditions || control.conditions.length === 0) {
      return true;
    }
    
    // Check hide conditions first
    const hideConditions = control.conditions.filter(c => c.action === 'Hide');
    for (const condition of hideConditions) {
      if (this.evaluateCondition(condition)) {
        return false;
      }
    }
    
    // Then check show conditions
    const showConditions = control.conditions.filter(c => c.action === 'Show');
    if (showConditions.length === 0) {
      return true;
    }
    
    for (const condition of showConditions) {
      if (this.evaluateCondition(condition)) {
        return true;
      }
    }
    
    return false;
  }

  evaluateControlEnabled(control: Control): boolean {
    if (!control.conditions || control.conditions.length === 0) {
      return true;
    }
    
    // Check disable conditions first
    const disableConditions = control.conditions.filter(c => c.action === 'Disable');
    for (const condition of disableConditions) {
      if (this.evaluateCondition(condition)) {
        return false;
      }
    }
    
    // Then check enable conditions
    const enableConditions = control.conditions.filter(c => c.action === 'Enable');
    if (enableConditions.length === 0) {
      return true;
    }
    
    for (const condition of enableConditions) {
      if (this.evaluateCondition(condition)) {
        return true;
      }
    }
    
    return false;
  }

  evaluateCondition(condition: any): boolean {
    const sourceControlValue = this.formGroup.get(`control_${condition.sourceControlId}`)?.value;
    
    if (sourceControlValue === null || sourceControlValue === undefined) {
      return false;
    }
    
    switch (condition.operator) {
      case 'Equals':
        return sourceControlValue === condition.value;
      case 'NotEquals':
        return sourceControlValue !== condition.value;
      case 'Contains':
        if (Array.isArray(sourceControlValue)) {
          return sourceControlValue.includes(condition.value);
        }
        return String(sourceControlValue).includes(condition.value);
      case 'GreaterThan':
        return Number(sourceControlValue) > Number(condition.value);
      case 'LessThan':
        return Number(sourceControlValue) < Number(condition.value);
      default:
        return false;
    }
  }

  onSubmit(): void {
    if (this.formGroup.invalid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      return;
    }
    
    if (!this.form) return;
    
    // In preview mode, just show success message
    if (this.previewMode) {
      this.snackBar.open('Form is valid! In a real submission, this would be saved.', 'Close', { duration: 3000 });
      return;
    }
    
    // Prepare submission data
    const formValues = this.formGroup.value;
    const responses: ControlResponse[] = [];
    
    this.form.sections.forEach(section => {
      section.controls.forEach(control => {
        // Skip note controls and hidden controls
        if (control.type === 'Note' || !this.controlVisibility[control.id]) {
          return;
        }
        
        const controlValue = formValues[`control_${control.id}`];
        if (controlValue !== null && controlValue !== undefined) {
          const response: ControlResponse = {
            id: 0,
            submissionId: 0,
            controlId: control.id,
            value: ''
          };
          
          switch (control.type) {
            case 'CheckboxGroup':
            case 'Dropdown':
              if (control.configuration.selectionType === 'Multiple' && Array.isArray(controlValue)) {
                response.optionIds = controlValue;
                response.value = controlValue.join(',');
              } else {
                response.optionIds = [controlValue];
                response.value = controlValue;
              }
              break;
            case 'LocationPicker':
              // In a real app, we would get lat/long from a map component
              response.latitude = 0;
              response.longitude = 0;
              response.value = '0,0';
              break;
            case 'FileUpload':
              // In a real app, we would have file URLs
              response.fileUrls = ['example.com/file1.pdf'];
              response.value = 'example.com/file1.pdf';
              break;
            case 'Signature':
              // In a real app, we would have signature image URL
              response.signatureUrl = 'example.com/signature.svg';
              response.value = 'example.com/signature.svg';
              break;
            default:
              response.value = controlValue;
          }
          
          responses.push(response);
        }
      });
    });
    
    const submission: FormSubmission = {
      id: 0,
      formId: this.form.id,
      submittedBy: 'current-user', // In a real app, get from auth service
      submittedDate: new Date(),
      responses
    };
    
    this.loading = true;
    
    this.formService.createSubmission(submission).subscribe({
      next: () => {
        this.snackBar.open('Form submitted successfully', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/submissions']);
      },
      error: (err) => {
        this.snackBar.open('Error submitting form: ' + err.message, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  togglePreviewMode(): void {
    this.previewMode = !this.previewMode;
  }

  backToBuilder(): void {
    this.router.navigate(['/forms', this.formId]);
  }
}
