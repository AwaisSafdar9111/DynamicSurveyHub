import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormBuilderComponent } from './features/form-builder/form-builder.component';
import { FormPreviewComponent as FormBuilderPreviewComponent } from './features/form-builder/form-preview/form-preview.component';
import { FormSubmissionComponent } from './features/form-submission/form-submission.component';
import { WorkflowComponent } from './features/workflow/workflow.component';

const routes: Routes = [
  { path: '', redirectTo: '/forms', pathMatch: 'full' },
  { path: 'forms', component: FormBuilderComponent },
  { path: 'forms/:id', component: FormBuilderComponent },
  { path: 'forms/:id/preview', component: FormBuilderPreviewComponent },
  { path: 'forms/:id/dynamic-preview', loadChildren: () => import('./features/form-preview/form-preview.module').then(m => m.FormPreviewModule) },
  { path: 'submissions', component: FormSubmissionComponent },
  { path: 'submissions/:id', component: FormSubmissionComponent },
  { path: 'workflow', component: WorkflowComponent },
  { path: '**', redirectTo: '/forms' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
