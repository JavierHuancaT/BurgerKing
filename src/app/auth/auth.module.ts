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
 * (Rendimiento)
 * Se importa el archivo de rutas propio de este módulo.
 * Esto permite el "Lazy Loading" (carga diferida), una práctica
 * de arquitectura que mejora el rendimiento de la carga inicial.
 */
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component'; // <-- 2. IMPORTA El COMPONENTE

/**
 * Módulo de Autenticación (AuthModule). (HDU1, HDU2)
 * Este archivo define un "Feature Module". Agrupa toda la lógica
 * de autenticación (login, registro) en un solo lugar,
 * manteniéndolo separado y encapsulado del resto de la app.
 */
@NgModule({
 /**
  * 'declarations': Componentes que pertenecen a este módulo.
  * Aquí se declara 'LoginComponent', un componente SÓLO debe ser declarado en UN módulo.
  * (No debe estar en app.module.ts).
  */
 declarations: [
   LoginComponent 
 ],
 /**
  * 'imports': Módulos externos que este módulo necesita.
  */
 imports: [
   /**
    * Importa 'CommonModule', que es lo que da acceso a las
    * directivas estructurales como *ngIf (usada para los errores).
    */
   CommonModule,
   AuthRoutingModule,  // Para las rutas de este módulo
   FormsModule         // Para que [(ngModel)] funcione
 ]
})
export class AuthModule { }