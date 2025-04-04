import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ConditionalLogic {
  id: number;
  form_id: number;
  source_control_id: number;
  target_control_id: number;
  condition: any;
  action: string;
  created_at: string;
  updated_at: string;
  source_control_name?: string;
  target_control_name?: string;
  source_control_type?: string;
  target_control_type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConditionalLogicService {
  private apiUrl = `${environment.apiUrl}/api/forms`;
  private conditionalLogicCache = new Map<number, ConditionalLogic[]>();
  private activeConditions = new BehaviorSubject<{ [controlId: number]: boolean }>({});

  constructor(private http: HttpClient) { }

  /**
   * Get all conditional logic rules for a form
   * @param formId The ID of the form
   */
  getConditionalLogic(formId: number): Observable<ConditionalLogic[]> {
    // Check if we have it in cache first
    if (this.conditionalLogicCache.has(formId)) {
      return of(this.conditionalLogicCache.get(formId));
    }

    // Otherwise fetch from API
    return this.http.get<ConditionalLogic[]>(`${this.apiUrl}/${formId}/conditional-logic`)
      .pipe(
        tap(rules => this.conditionalLogicCache.set(formId, rules)),
        catchError(error => {
          console.error('Error fetching conditional logic:', error);
          return of([]);
        })
      );
  }

  /**
   * Get all conditional logic rules that have the given control as their source
   * @param formId The ID of the form
   * @param controlId The ID of the source control
   */
  getConditionalLogicForSourceControl(formId: number, controlId: number): Observable<ConditionalLogic[]> {
    return this.getConditionalLogic(formId).pipe(
      map(rules => rules.filter(rule => rule.source_control_id === controlId))
    );
  }

  /**
   * Get active conditions subject as observable
   */
  getActiveConditions(): Observable<{ [controlId: number]: boolean }> {
    return this.activeConditions.asObservable();
  }

  /**
   * Evaluate a condition against a control value
   * @param condition The condition to evaluate
   * @param value The value of the control
   */
  evaluateCondition(condition: any, value: any): boolean {
    if (!condition || condition.operator === undefined) {
      return true;
    }

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'notEquals':
        return value !== condition.value;
      case 'contains':
        return typeof value === 'string' && value.includes(condition.value);
      case 'notContains':
        return typeof value === 'string' && !value.includes(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'notIn':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      case 'greaterThan':
        return value > condition.value;
      case 'lessThan':
        return value < condition.value;
      case 'empty':
        return value === null || value === undefined || value === '';
      case 'notEmpty':
        return value !== null && value !== undefined && value !== '';
      default:
        console.warn(`Unknown operator: ${condition.operator}`);
        return true;
    }
  }

  /**
   * Update the condition status for a target control
   * @param targetControlId The ID of the target control
   * @param isActive Whether the condition is active
   */
  updateConditionStatus(targetControlId: number, isActive: boolean): void {
    const currentConditions = this.activeConditions.value;
    this.activeConditions.next({
      ...currentConditions,
      [targetControlId]: isActive
    });
  }

  /**
   * Evaluate conditions for a form based on control values
   * @param formId The ID of the form
   * @param controlValues An object mapping control IDs to their values
   */
  evaluateFormConditions(formId: number, controlValues: { [controlId: number]: any }): void {
    this.getConditionalLogic(formId).subscribe(rules => {
      const activeConditions = { ...this.activeConditions.value };

      rules.forEach(rule => {
        const sourceValue = controlValues[rule.source_control_id];
        const isConditionMet = this.evaluateCondition(rule.condition, sourceValue);
        
        // For "show" action, we want the control to be visible when condition is met
        // For "hide" action, we want the control to be visible when condition is NOT met
        const isActive = rule.action === 'show' ? isConditionMet : !isConditionMet;
        
        activeConditions[rule.target_control_id] = isActive;
      });

      this.activeConditions.next(activeConditions);
    });
  }

  /**
   * Clear the cached conditional logic for a form
   * @param formId The ID of the form
   */
  clearCache(formId?: number): void {
    if (formId) {
      this.conditionalLogicCache.delete(formId);
    } else {
      this.conditionalLogicCache.clear();
    }
  }
}