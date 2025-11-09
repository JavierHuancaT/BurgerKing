import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

// --- CAMBIOS STANDALONE ---
import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms';    // Para [(ngModel)]

@Component({
  selector: 'app-login',
  standalone: true, // <-- 1. MODO STANDALONE ACTIVADO
  imports: [
    CommonModule,     // <-- 2. IMPORTAS CommonModule (para *ngIf)
    FormsModule       // <-- 3. IMPORTAS FormsModule (para [(ngModel)])
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  // --- El resto de tu lógica es idéntica ---
  email = '';
  password = '';
  loginError = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loginError = false;
    this.authService.login(this.email, this.password).subscribe(user => {
      if (user) {
        if (user.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      } else {
        this.loginError = true;
      }
    });
  }
}