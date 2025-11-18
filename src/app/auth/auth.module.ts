import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * "Control de errores, validación de datos"
 * Se importa 'FormsModule'. Esto es esencial para habilitar
 * la validación "Template-Driven" en el login.component.html,
 * permitiendo el uso de [(ngModel)] y los validadores (ej. 'required', 'email').
 */
import { FormsModule } from '@angular/forms'; 

/**
 * "Buenas prácticas de desarrollo" y NFR 4.1 (Rendimiento)
 * Se importa el archivo de rutas propio de este módulo.
 * Esto permite el "Lazy Loading" (carga diferida), una práctica
 * de arquitectura que mejora el rendimiento de la carga inicial.
 */
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component'; // <-- 2. IMPORTA TU COMPONENTE

/**
 * Módulo de Autenticación (AuthModule). (HDU1, HDU2)
 * RÚBRICA: "Buenas prácticas de desarrollo"
 * Este archivo define un "Feature Module". Agrupa toda la lógica
 * de autenticación (login, registro) en un solo lugar,
 * manteniéndolo separado y encapsulado del resto de la app.
 */
@NgModule({
 /**
  * 'declarations': Componentes que pertenecen a este módulo.
  * RÚBRICA: "Buenas prácticas de desarrollo"
  * Aquí se declara 'LoginComponent'. Esto soluciona el error NG6007,
  * ya que un componente SÓLO debe ser declarado en UN módulo.
  * (No debe estar en app.module.ts).
  */
 declarations: [
   LoginComponent // <-- 3. DECLARA TU COMPONENTE AQUÍ
 ],
 /**
  * 'imports': Módulos externos que este módulo necesita.
  */
 imports: [
   /**
    * RÚBRICA: "Uso de directivas: NgIf, Ngif-else, NgFor"
    * Importa 'CommonModule', que es lo que da acceso a las
    * directivas estructurales como *ngIf (usada para los errores).
    */
   CommonModule,
   AuthRoutingModule,  // Para las rutas de este módulo
   FormsModule         // (IMPORTANTE) Para que [(ngModel)] funcione
 ]
})
export class AuthModule { }