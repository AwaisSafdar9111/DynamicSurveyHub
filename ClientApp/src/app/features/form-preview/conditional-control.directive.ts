import { Directive, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { ConditionalLogicService } from '../../shared/services/conditional-logic.service';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appConditionalControl]',
  standalone: true
})
export class ConditionalControlDirective implements OnInit, OnDestroy {
  @Input() controlId: number;
  
  private destroy$ = new Subject<void>();

  constructor(
    private el: ElementRef,
    private conditionalLogicService: ConditionalLogicService
  ) { }

  ngOnInit(): void {
    if (!this.controlId) {
      console.warn('No control ID provided to conditional control directive');
      return;
    }

    // Subscribe to active conditions
    this.conditionalLogicService.getActiveConditions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(conditions => {
        // Check if this control has conditions
        if (this.controlId in conditions) {
          const isVisible = conditions[this.controlId];
          
          // Apply visibility
          if (isVisible) {
            this.el.nativeElement.style.display = '';
            // Enable form control if it exists
            const formControl = this.el.nativeElement.querySelector('input, select, textarea');
            if (formControl) {
              formControl.disabled = false;
            }
          } else {
            this.el.nativeElement.style.display = 'none';
            // Disable form control if it exists to prevent it from being included in form submission
            const formControl = this.el.nativeElement.querySelector('input, select, textarea');
            if (formControl) {
              formControl.disabled = true;
            }
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}