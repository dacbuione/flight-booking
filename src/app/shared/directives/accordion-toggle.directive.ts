import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appAccordionToggle]'
})
export class AccordionToggleDirective implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    const button = this.el.nativeElement;
    
    button.addEventListener('click', function(event: Event) {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        // When already expanded, we want to allow the collapse
        event.stopPropagation();
        
        // Find and toggle the collapse element
        const target = this.getAttribute('data-bs-target') || 
                       this.getAttribute('href');
        const collapseEl = document.querySelector(target);
        
        // Use Bootstrap's API to toggle the collapse
        // @ts-ignore
        if (window.bootstrap && window.bootstrap.Collapse) {
          // @ts-ignore
          const bsCollapse = window.bootstrap.Collapse.getInstance(collapseEl);
          if (bsCollapse) {
            bsCollapse.toggle();
          }
        }
      }
    });
  }
} 