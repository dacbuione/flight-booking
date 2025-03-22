import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class ProfileComponent implements OnInit {
  currentUser$: Observable<User | null>;
  
  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }
  
  ngOnInit(): void {
  }
} 