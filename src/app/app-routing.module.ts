import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { FrequentFlyerComponent } from './features/frequent-flyer/frequent-flyer.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'frequent-flyer', component: FrequentFlyerComponent },
  // Add other routes as they are implemented
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 