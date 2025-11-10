import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgForm } from '@angular/forms'; // <-- 1. IMPORTA NgForm

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

  /**
   * (Criterio HDU2: "presionará el botón 'Ingresar'").
   * Ahora recibe el formulario (form) desde el HTML.
   */
  onSubmit(form: NgForm): void { // <-- 2. AÑADE (form: NgForm)
    
    // 3. AÑADE ESTA VALIDACIÓN
    // Si el usuario hizo clic pero el formulario es inválido,
    // simplemente detenemos la función.
    // El HTML se encargará de mostrar los errores (porque 'submitted' es true).
    if (form.invalid) {
      return;
    }
    
    this.loginError = false;

    // Esta parte solo se ejecuta si el formulario es VÁLIDO
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

  onCancel(): void {
    this.router.navigate(['/']);
  }
}