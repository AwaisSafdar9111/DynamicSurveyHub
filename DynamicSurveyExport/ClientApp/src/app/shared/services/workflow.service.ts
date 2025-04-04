import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormAssignment } from '../models/form.model';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getAssignments(userId?: string, formId?: number): Observable<FormAssignment[]> {
    let url = `${this.apiUrl}/workflow/assignments`;
    const params: string[] = [];
    
    if (userId) {
      params.push(`userId=${userId}`);
    }
    
    if (formId) {
      params.push(`formId=${formId}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<FormAssignment[]>(url);
  }

  getAssignment(id: number): Observable<FormAssignment> {
    return this.http.get<FormAssignment>(`${this.apiUrl}/workflow/assignments/${id}`);
  }

  createAssignment(assignment: FormAssignment): Observable<FormAssignment> {
    return this.http.post<FormAssignment>(`${this.apiUrl}/workflow/assignments`, assignment);
  }

  updateAssignment(assignment: FormAssignment): Observable<FormAssignment> {
    return this.http.put<FormAssignment>(`${this.apiUrl}/workflow/assignments/${assignment.id}`, assignment);
  }

  deleteAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/workflow/assignments/${id}`);
  }

  completeAssignment(id: number): Observable<FormAssignment> {
    return this.http.post<FormAssignment>(`${this.apiUrl}/workflow/assignments/${id}/complete`, {});
  }
}
