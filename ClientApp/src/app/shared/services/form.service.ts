import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Form, FormAssignment } from '../models/form.model';
import { FormSubmission } from '../models/control.model';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private apiUrl = 'https://localhost:64708/api';

  constructor(private http: HttpClient) { }

  getForms(): Observable<Form[]> {
    return this.http.get<Form[]>(`${this.apiUrl}/forms`);
  }

  getForm(id: number): Observable<Form> {
    return this.http.get<Form>(`${this.apiUrl}/forms/${id}`);
  }

  createForm(form: Form): Observable<Form> {
    return this.http.post<Form>(`${this.apiUrl}/forms/CreateForm`, form);
  }

  updateForm(form: Form): Observable<Form> {
    return this.http.put<Form>(`${this.apiUrl}/forms/${form.id}`, form);
  }

  deleteForm(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/forms/${id}`);
  }

  publishForm(id: number): Observable<Form> {
    return this.http.post<Form>(`${this.apiUrl}/forms/${id}/publish`, {});
  }

  getSubmissions(formId?: number): Observable<FormSubmission[]> {
    let url = `${this.apiUrl}/submissions`;
    if (formId) {
      url += `?formId=${formId}`;
    }
    return this.http.get<FormSubmission[]>(url);
  }

  getSubmission(id: number): Observable<FormSubmission> {
    return this.http.get<FormSubmission>(`${this.apiUrl}/submissions/${id}`);
  }

  createSubmission(submission: FormSubmission): Observable<FormSubmission> {
    return this.http.post<FormSubmission>(`${this.apiUrl}/submissions`, submission);
  }

  updateSubmission(submission: FormSubmission): Observable<FormSubmission> {
    return this.http.put<FormSubmission>(`${this.apiUrl}/submissions/${submission.id}`, submission);
  }
}
