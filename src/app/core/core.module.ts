import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ApiInterceptor } from './interceptors/api.interceptor';

import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';
import { FrequentFlyerService } from './services/frequent-flyer.service';
import { ApiService } from './services/api.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule
  ],
  providers: [
    // Interceptors in order of execution
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    // Services
    ApiService,
    AuthService,
    StorageService,
    FrequentFlyerService
  ]
})
export class CoreModule { } 