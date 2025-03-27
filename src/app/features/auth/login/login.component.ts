import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    
    // Check if we have an error message from route params
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.errorMessage = params['error'];
      }
      
      // Check if we need to auto-login
      if (params['autoLogin'] === 'true') {
        this.autoLogin();
      }
    });
    
    // Check if token is expired or forced relogin is needed
    const needsRelogin = localStorage.getItem('force_relogin');
    if (needsRelogin === 'true') {
      localStorage.removeItem('force_relogin');
      this.errorMessage = 'Your session has expired. Please log in again.';
      this.autoLogin(); // Try auto login immediately
    }
  }
  
  initForm(): void {
    this.loginForm = this.fb.group({
      username: ['b2cfreelance', [Validators.required]],
      password: ['aV7@pR!q9X#2zLmT', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login(this.loginForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        }
      });
  }
  
  // Auto login with hardcoded credentials
  autoLogin(): void {
    console.log('Attempting auto-login with default credentials');
    this.isLoading = true;
    
    // Need to include clientId and clientSecret to match LoginCredentials type
    // These will be set by the authService.login method
    const credentials = {
      username: 'b2cfreelance',
      password: 'aV7@pR!q9X#2zLmT',
      rememberMe: true
    };
    
    this.authService.login(credentials as any)
      .subscribe({
        next: () => {
          console.log('Auto-login successful');
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Auto-login failed: ' + (error.message || 'Unknown error');
          console.error('Auto-login failed:', error);
        }
      });
  }
  
  // Phương thức để xóa thông báo lỗi
  clearErrorMessage(): void {
    this.errorMessage = '';
  }
} 