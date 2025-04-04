import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FormService } from '../../shared/services/form.service';
import { ControlService } from '../../shared/services/control.service';
import { Form } from '../../shared/models/form.model';
import { Section } from '../../shared/models/section.model';
import { Control, ControlType } from '../../shared/models/control.model';
import { ControlConfigComponent } from './control-config/control-config.component';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  standalone: false
})
export class FormBuilderComponent implements OnInit {
  formId: number | null = null;
  form: Form | null = null;
  formGroup: FormGroup;
  loading = false;
  
  availableControls: { type: ControlType, label: string, icon: string }[] = [
    { type: 'Text', label: 'Text Field', icon: 'text_fields' },
    { type: 'Textarea', label: 'Text Area', icon: 'notes' },
    { type: 'RadioGroup', label: 'Radio Group', icon: 'radio_button_checked' },
    { type: 'CheckboxGroup', label: 'Checkbox Group', icon: 'check_box' },
    { type: 'Dropdown', label: 'Dropdown', icon: 'arrow_drop_down_circle' },
    { type: 'FileUpload', label: 'File Upload', icon: 'cloud_upload' },
    { type: 'Signature', label: 'Signature', icon: 'draw' },
    { type: 'LocationPicker', label: 'Location Picker', icon: 'location_on' },
    { type: 'Note', label: 'Note', icon: 'info' }
  ];
  
  isNewSection: boolean = false;
  sectionForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private formService: FormService,
    private controlService: ControlService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { 
    this.formGroup = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });
    
    this.sectionForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.formId = +idParam;
        this.loadForm(this.formId);
      } else {
        this.initNewForm();
      }
    });
  }

  loadForm(id: number): void {
    this.loading = true;
    this.formService.getForm(id).subscribe({
      next: (form) => {
        this.form = form;
        this.formGroup.patchValue({
          title: form.title,
          description: form.description
        });
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Error loading form: ' + err.message, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  initNewForm(): void {
    this.form = {
      id: 0,
      title: '',
      description: '',
      createdBy: 'current-user', // In a real app, get from auth service
      createdDate: new Date(),
      modifiedDate: new Date(),
      isPublished: false,
      sections: [
        {
          id: 0,
          formId: 0,
          title: 'Section 1',
          description: '',
          orderIndex: 0,
          controls: []
        }
      ]
    };
  }

  saveForm(): void {
    if (this.formGroup.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    const formData = {
      ...this.form,
      title: this.formGroup.value.title,
      description: this.formGroup.value.description,
      modifiedDate: new Date()
    };

    this.loading = true;
    
    if (this.formId) {
      this.formService.updateForm(formData as Form).subscribe({
        next: (response) => {
          this.form = response;
          this.snackBar.open('Form updated successfully', 'Close', { duration: 3000 });
          this.loading = false;
        },
        error: (err) => {
          this.snackBar.open('Error updating form: ' + err.message, 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.formService.createForm(formData as Form).subscribe({
        next: (response) => {
          this.form = response;
          this.formId = response.id;
          this.router.navigate(['/forms', this.formId]);
          this.snackBar.open('Form created successfully', 'Close', { duration: 3000 });
          this.loading = false;
        },
        error: (err) => {
          this.snackBar.open('Error creating form: ' + err.message, 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  publishForm(): void {
    if (!this.formId) {
      this.snackBar.open('Please save the form before publishing', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.formService.publishForm(this.formId).subscribe({
      next: (response) => {
        this.form = response;
        this.snackBar.open('Form published successfully', 'Close', { duration: 3000 });
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Error publishing form: ' + err.message, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  addSection(): void {
    if (!this.form) return;

    const newSection: Section = {
      id: 0, // Will be set by the backend
      formId: this.form.id,
      title: `Section ${this.form.sections.length + 1}`,
      description: '',
      orderIndex: this.form.sections.length,
      controls: []
    };

    this.form.sections.push(newSection);
  }

  deleteSection(index: number): void {
    if (!this.form) return;
    
    this.form.sections.splice(index, 1);
    
    // Update the orderIndex for the remaining sections
    this.form.sections.forEach((section, idx) => {
      section.orderIndex = idx;
    });
  }

  dropControl(event: CdkDragDrop<Control[]>, sectionIndex: number): void {
    if (!this.form) return;
    
    if (event.previousContainer === event.container) {
      // Reordering within the same section
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
      // Update the orderIndex for the controls
      event.container.data.forEach((control, idx) => {
        control.orderIndex = idx;
      });
      
      if (this.formId) {
        this.controlService.updateControlOrder(
          this.form.sections[sectionIndex].id, 
          event.container.data.map(control => control.id)
        ).subscribe();
      }
    } else {
      // Adding a new control from the available controls panel
      const controlType = this.availableControls[event.previousIndex].type;
      
      // Open configuration dialog
      this.openControlConfig(null, controlType, sectionIndex, event.currentIndex);
    }
  }

  openControlConfig(control: Control | null, type: ControlType | null, sectionIndex: number, orderIndex: number): void {
    const dialogRef = this.dialog.open(ControlConfigComponent, {
      width: '600px',
      data: {
        control,
        type,
        sectionId: this.form?.sections[sectionIndex].id,
        availableControls: this.form?.sections.flatMap(s => s.controls) || []
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (control) {
          // Update existing control
          const sectionControls = this.form?.sections[sectionIndex].controls || [];
          const controlIndex = sectionControls.findIndex(c => c.id === control.id);
          if (controlIndex !== -1 && this.form) {
            this.form.sections[sectionIndex].controls[controlIndex] = result;
          }
        } else {
          // Add new control
          const newControl: Control = {
            ...result,
            orderIndex,
            sectionId: this.form?.sections[sectionIndex].id || 0
          };
          
          if (this.form) {
            this.form.sections[sectionIndex].controls.splice(orderIndex, 0, newControl);
            
            // Update the orderIndex for the controls
            this.form.sections[sectionIndex].controls.forEach((control, idx) => {
              control.orderIndex = idx;
            });
          }
        }
      }
    });
  }

  editControl(control: Control, sectionIndex: number): void {
    this.openControlConfig(control, null, sectionIndex, control.orderIndex);
  }

  deleteControl(controlIndex: number, sectionIndex: number): void {
    if (!this.form) return;
    
    const control = this.form.sections[sectionIndex].controls[controlIndex];
    
    if (control.id && this.formId) {
      this.controlService.deleteControl(control.id).subscribe({
        next: () => {
          this.form?.sections[sectionIndex].controls.splice(controlIndex, 1);
          
          // Update the orderIndex for the remaining controls
          this.form?.sections[sectionIndex].controls.forEach((c, idx) => {
            c.orderIndex = idx;
          });
          
          this.snackBar.open('Control deleted successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open('Error deleting control: ' + err.message, 'Close', { duration: 3000 });
        }
      });
    } else {
      this.form.sections[sectionIndex].controls.splice(controlIndex, 1);
      
      // Update the orderIndex for the remaining controls
      this.form.sections[sectionIndex].controls.forEach((c, idx) => {
        c.orderIndex = idx;
      });
    }
  }

  previewForm(): void {
    if (this.formId) {
      this.router.navigate(['/forms', this.formId, 'preview']);
    } else {
      this.snackBar.open('Please save the form before previewing', 'Close', { duration: 3000 });
    }
  }
  
  getControlIcon(type: string): string {
    const control = this.availableControls.find(c => c.type === type);
    return control ? control.icon : 'help_outline';
  }
  
  saveSectionDialog(): void {
    if (this.sectionForm.invalid) {
      return;
    }
    
    // Dialog data would be handled here
    // This is a placeholder for the actual implementation
    this.snackBar.open('Section saved successfully', 'Close', { duration: 3000 });
  }
}
