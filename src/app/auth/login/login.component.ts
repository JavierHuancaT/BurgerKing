import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

/**
 * "Control de errores, validación de datos"
 * Se importa 'NgForm'. Esto nos permite recibir el estado completo
 * del formulario desde el HTML (ej. form.invalid) y controlar
 * la validación "al enviar" (on submit).
 */
import { NgForm } from '@angular/forms'; 

/**
 * Componente de Login.
 * Gestiona el formulario de inicio de sesión y se comunica
 * con el AuthService para validar al usuario.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  /** (Two-way Binding)
   * Propiedad vinculada al input de Email (con [(ngModel)]).
   */
  email = '';
  /** Propiedad vinculada al input de Password (con [(ngModel)]). */
  password = '';
  
  /**
   * Flag para mostrar el error del *servidor* (credenciales incorrectas)
   * en el HTML usando *ngIf.
   */
  loginError = false;

  /**
   * Usamos el 'constructor' para la Inyección de Dependencias.
   * Pedimos a Angular que nos "inyecte" los servicios que necesitamos.
   *
   * @param authService (Servicio) El servicio que maneja la lógica de BD.
   * @param router (Servicio) El servicio de Angular para navegar.
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * (Event Binding)
   * Este método se vincula al evento (ngSubmit) del formulario en el HTML.
   * Recibe el estado del formulario (form) desde el HTML.
   * "presionará el botón 'Ingresar'").
   */
  onSubmit(form: NgForm): void { // RECIBE (form: NgForm)
    
    /**
     * Esta es la validación "amigable" (al enviar).
     * Si el usuario hizo clic pero el formulario es inválido,
     * detenemos la función. El HTML (gracias a 'form.submitted')
     * se encargará de mostrar los errores de validación (client-side).
     */
    if (form.invalid) {
      return;
    }
    
    this.loginError = false; // Reinicia el error del servidor

    /**
     * (Servicio) Llamamos al 'authService' para la lógica.
     * (el componente no sabe CÓMO se valida).
     * 2. (Observable) El método .login() devuelve un Observable,
     * al cual nos .subscribe() para recibir la respuesta ('user').
     */
    this.authService.login(this.email, this.password).subscribe(user => {
      if (user) {
        /**
         * "Seguridad en rutas" y "Control de accesos"
         * Verificamos el 'role' del usuario que nos devolvió el servicio
         * y redirigimos a la ruta correspondiente (control de roles).
         */
        if (user.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else {
          // (Ruta actualizada para el Cliente)
          this.router.navigate(['/catalogo']); 
        }
      } else {
        /**
         * El formulario era válido, pero el servicio (backend)
         * devolvió 'null' (credenciales incorrectas).
         * Activamos el flag para mostrar el error en el HTML.
         */
        this.loginError = true;
      }
    });
  }

  /**
   * (Event Binding)
   * Método vinculado al botón "Cancelar" ((click)="onCancel()").
   * Navega de vuelta a la página principal (Catálogo).
   */
  onCancel(): void {
    this.router.navigate(['/']);
  }
}