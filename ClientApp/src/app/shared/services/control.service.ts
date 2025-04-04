import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Control, ControlOption, ControlCondition } from '../models/control.model';

@Injectable({
  providedIn: 'root'
})
export class ControlService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getControls(sectionId: number): Observable<Control[]> {
    return this.http.get<Control[]>(`${this.apiUrl}/sections/${sectionId}/controls`);
  }

  getControl(id: number): Observable<Control> {
    return this.http.get<Control>(`${this.apiUrl}/controls/${id}`);
  }

  createControl(control: Control): Observable<Control> {
    return this.http.post<Control>(`${this.apiUrl}/sections/${control.sectionId}/controls`, control);
  }

  updateControl(control: Control): Observable<Control> {
    return this.http.put<Control>(`${this.apiUrl}/controls/${control.id}`, control);
  }

  deleteControl(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/controls/${id}`);
  }

  updateControlOrder(sectionId: number, controlIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/sections/${sectionId}/controls/order`, { controlIds });
  }

  // Control Options
  getControlOptions(controlId: number): Observable<ControlOption[]> {
    return this.http.get<ControlOption[]>(`${this.apiUrl}/controls/${controlId}/options`);
  }

  createControlOption(option: ControlOption): Observable<ControlOption> {
    return this.http.post<ControlOption>(`${this.apiUrl}/controls/${option.controlId}/options`, option);
  }

  updateControlOption(option: ControlOption): Observable<ControlOption> {
    return this.http.put<ControlOption>(`${this.apiUrl}/controloptions/${option.id}`, option);
  }

  deleteControlOption(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/controloptions/${id}`);
  }

  // Control Conditions
  getControlConditions(controlId: number): Observable<ControlCondition[]> {
    return this.http.get<ControlCondition[]>(`${this.apiUrl}/controls/${controlId}/conditions`);
  }

  createControlCondition(condition: ControlCondition): Observable<ControlCondition> {
    return this.http.post<ControlCondition>(`${this.apiUrl}/controls/${condition.controlId}/conditions`, condition);
  }

  updateControlCondition(condition: ControlCondition): Observable<ControlCondition> {
    return this.http.put<ControlCondition>(`${this.apiUrl}/controlconditions/${condition.id}`, condition);
  }

  deleteControlCondition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/controlconditions/${id}`);
  }
}
