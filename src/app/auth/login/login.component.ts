import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgForm } from '@angular/forms'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';
  loginError = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    
    this.loginError = false;

    this.authService.login(this.email, this.password).subscribe(user => {
      if (user) {
        // Redirección basada en Rol
        if (user.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/catalogo']); 
        }
      } else {
        this.loginError = true;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/']); // O a home
  }
}