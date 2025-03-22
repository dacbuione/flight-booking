import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    // If not using standalone components
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgbAccordionModule,
    HomeComponent, // Import as a standalone component
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { } 