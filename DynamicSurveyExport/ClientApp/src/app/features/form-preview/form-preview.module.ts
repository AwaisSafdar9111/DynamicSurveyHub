import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormPreviewComponent } from './form-preview.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: ':id', component: FormPreviewComponent }
    ])
  ]
})
export class FormPreviewModule { }