import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

/**
 * Componente de Login (HDU2).
 * Gestiona el formulario de inicio de sesión y se comunica
 * con el AuthService para validar al usuario.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  // --- Propiedades del Componente ---

  /** Propiedad vinculada al input de Email (con [(ngModel)]) */
  email = '';
  /** Propiedad vinculada al input de Password (con [(ngModel)]) */
  password = '';
  
  /**
   * Flag para mostrar/ocultar el mensaje de error en el HTML.
   * (Criterio HDU2: "mensaje de error").
   */
  loginError = false;

  /**
   * Inyecta los servicios necesarios (Inyección de Dependencias).
   * @param authService El servicio que maneja la lógica de login.
   * @param router El servicio de Angular para la navegación.
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Método que se ejecuta al enviar el formulario (ngSubmit).
   * (Criterio HDU2: "presionará el botón 'Ingresar'").
   */
  onSubmit(): void {
    this.loginError = false; // Reinicia el error en cada intento

    // Llama al servicio (el componente no sabe CÓMO se valida)
    this.authService.login(this.email, this.password).subscribe(user => {
      
      if (user) {
        // ÉXITO: Redirige según el rol (Habilita HDU3)
        if (user.role === 'Admin') {
          this.router.navigate(['/admin']); // Ruta del Admin
        } else {
          this.router.navigate(['/']); // Ruta del Cliente (Catálogo)
        }
      } else {
        // FALLO: Activa el mensaje de error en la vista
        this.loginError = true;
      }
    });
  }
  /**
   * Se llama cuando el usuario presiona el botón "Cancelar".
   * Navega de vuelta a la página principal (Catálogo).
   */
  onCancel(): void {
    this.router.navigate(['/']);
  }
}