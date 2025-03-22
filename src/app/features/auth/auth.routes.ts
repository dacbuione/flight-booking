import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const AUTH_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { 
    path: 'login', 
    component: LoginComponent,
    title: 'Đăng nhập - Flight Booking'
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    title: 'Đăng ký - Flight Booking'
  }
]; 