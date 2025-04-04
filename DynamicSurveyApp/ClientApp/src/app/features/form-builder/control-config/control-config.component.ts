import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Control, ControlType, ControlOption, ControlCondition } from '../../../shared/models/control.model';

interface DialogData {
  control: Control | null;
  type: ControlType | null;
  sectionId: number;
  availableControls: Control[];
}

@Component({
  selector: 'app-control-config',
  templateUrl: './control-config.component.html',
  standalone: false
})
export class ControlConfigComponent implements OnInit {
  form: FormGroup;
  controlType: ControlType;
  availableSourceControls: Control[] = [];
  conditionOperators = [
    { value: 'Equals', label: 'Equals' },
    { value: 'NotEquals', label: 'Not Equals' },
    { value: 'Contains', label: 'Contains' },
    { value: 'GreaterThan', label: 'Greater Than' },
    { value: 'LessThan', label: 'Less Than' }
  ];
  conditionActions = [
    { value: 'Show', label: 'Show' },
    { value: 'Hide', label: 'Hide' },
    { value: 'Enable', label: 'Enable' },
    { value: 'Disable', label: 'Disable' }
  ];
  inputTypes = [
    { value: 'Text', label: 'Text' },
    { value: 'Number', label: 'Number' },
    { value: 'Email', label: 'Email' },
    { value: 'Phone', label: 'Phone' }
  ];
  selectionTypes = [
    { value: 'Single', label: 'Single Selection' },
    { value: 'Multiple', label: 'Multiple Selection' }
  ];
  acceptedFileTypes = [
    { value: '.pdf', label: 'PDF' },
    { value: '.doc,.docx', label: 'Word Document' },
    { value: '.jpg,.jpeg,.png', label: 'Images' },
    { value: '.csv', label: 'CSV' },
    { value: '.xls,.xlsx', label: 'Excel' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ControlConfigComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.controlType = data.control?.type || data.type || 'Text';
    this.form = this.createForm();
    
    // Filter out the current control from available source controls
    this.availableSourceControls = data.availableControls.filter(c => 
      !data.control || c.id !== data.control.id
    );
  }

  ngOnInit(): void {
    this.updateFormBasedOnType();
    
    if (this.data.control) {
      this.patchFormWithControlData();
    }
    
    // Listen for control type changes
    this.form.get('type')?.valueChanges.subscribe((type: ControlType) => {
      this.controlType = type;
      this.updateFormBasedOnType();
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [0],
      sectionId: [this.data.sectionId],
      label: ['', Validators.required],
      type: [this.controlType, Validators.required],
      isRequired: [false],
      orderIndex: [0],
      configuration: this.fb.group({
        id: [0],
        controlId: [0],
        inputType: ['Text'],
        minValue: [null],
        maxValue: [null],
        enableCountryCode: [false],
        maxLength: [null],
        selectionType: ['Single'],
        searchable: [false],
        acceptedFileTypes: [[]],
        showMap: [true],
        noteText: [''],
        htmlContent: ['']
      }),
      options: this.fb.array([]),
      conditions: this.fb.array([])
    });
  }

  updateFormBasedOnType(): void {
    // Reset configuration values
    const configForm = this.form.get('configuration') as FormGroup;
    configForm.reset({
      id: 0,
      controlId: 0
    });
    
    // Clear options if not applicable
    const optionsArray = this.form.get('options') as FormArray;
    optionsArray.clear();
    
    // Add default option for select controls
    if (['RadioGroup', 'CheckboxGroup', 'Dropdown'].includes(this.controlType)) {
      this.addOption();
    }
    
    // Set default values based on type
    switch (this.controlType) {
      case 'Text':
        configForm.patchValue({ inputType: 'Text' });
        break;
      case 'Textarea':
        configForm.patchValue({ maxLength: 1000 });
        break;
      case 'RadioGroup':
      case 'CheckboxGroup':
        configForm.patchValue({ 
          selectionType: this.controlType === 'RadioGroup' ? 'Single' : 'Multiple' 
        });
        break;
      case 'Dropdown':
        configForm.patchValue({ 
          selectionType: 'Single',
          searchable: false
        });
        break;
      case 'FileUpload':
        configForm.patchValue({ 
          acceptedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
          selectionType: 'Single'
        });
        break;
      case 'LocationPicker':
        configForm.patchValue({ showMap: true });
        break;
      case 'Note':
        configForm.patchValue({ noteText: '' });
        break;
    }
  }

  patchFormWithControlData(): void {
    if (!this.data.control) return;
    
    const control = this.data.control;
    
    // Patch main form fields
    this.form.patchValue({
      id: control.id,
      sectionId: control.sectionId,
      label: control.label,
      type: control.type,
      isRequired: control.isRequired,
      orderIndex: control.orderIndex,
      configuration: control.configuration
    });
    
    // Patch options if any
    if (control.options && control.options.length > 0) {
      const optionsArray = this.form.get('options') as FormArray;
      optionsArray.clear();
      
      control.options.forEach(option => {
        optionsArray.push(this.fb.group({
          id: [option.id],
          controlId: [option.controlId],
          value: [option.value, Validators.required],
          text: [option.text, Validators.required],
          score: [option.score],
          orderIndex: [option.orderIndex]
        }));
      });
    }
    
    // Patch conditions if any
    if (control.conditions && control.conditions.length > 0) {
      const conditionsArray = this.form.get('conditions') as FormArray;
      conditionsArray.clear();
      
      control.conditions.forEach(condition => {
        conditionsArray.push(this.fb.group({
          id: [condition.id],
          controlId: [condition.controlId],
          sourceControlId: [condition.sourceControlId, Validators.required],
          operator: [condition.operator, Validators.required],
          value: [condition.value, Validators.required],
          action: [condition.action, Validators.required]
        }));
      });
    }
  }

  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }
  
  get conditions(): FormArray {
    return this.form.get('conditions') as FormArray;
  }
  
  addOption(): void {
    const optionsArray = this.form.get('options') as FormArray;
    optionsArray.push(this.fb.group({
      id: [0],
      controlId: [0],
      value: ['', Validators.required],
      text: ['', Validators.required],
      score: [0],
      orderIndex: [optionsArray.length]
    }));
  }
  
  removeOption(index: number): void {
    const optionsArray = this.form.get('options') as FormArray;
    optionsArray.removeAt(index);
    
    // Update orderIndex for remaining options
    optionsArray.controls.forEach((control, idx) => {
      control.get('orderIndex')?.setValue(idx);
    });
  }
  
  addCondition(): void {
    const conditionsArray = this.form.get('conditions') as FormArray;
    conditionsArray.push(this.fb.group({
      id: [0],
      controlId: [0],
      sourceControlId: ['', Validators.required],
      operator: ['Equals', Validators.required],
      value: ['', Validators.required],
      action: ['Show', Validators.required]
    }));
  }
  
  removeCondition(index: number): void {
    const conditionsArray = this.form.get('conditions') as FormArray;
    conditionsArray.removeAt(index);
  }
  
  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    
    const formValue = this.form.value;
    
    // Prepare control data
    const controlData: Control = {
      id: formValue.id,
      sectionId: formValue.sectionId,
      label: formValue.label,
      type: formValue.type,
      isRequired: formValue.isRequired,
      orderIndex: formValue.orderIndex,
      configuration: formValue.configuration,
      options: formValue.options,
      conditions: formValue.conditions
    };
    
    this.dialogRef.close(controlData);
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
}
