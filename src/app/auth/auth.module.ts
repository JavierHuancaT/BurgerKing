import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- 1. IMPORTA ESTO

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component'; // <-- 2. IMPORTA TU COMPONENTE

/**
 * Módulo de Autenticación (AuthModule).
 * Agrupa todos los componentes y servicios relacionados con
 * el login (HDU2) y el registro (HDU1).
 */
@NgModule({
  /**
   * 'declarations': Componentes que pertenecen a este módulo.
   */
  declarations: [
    LoginComponent // <-- 3. DECLARA TU COMPONENTE AQUÍ
  ],
  /**
   * 'imports': Módulos externos que este módulo necesita.
   */
  imports: [
    CommonModule,       // Para directivas como *ngIf
    AuthRoutingModule,  // Para las rutas de este módulo
    FormsModule         // (IMPORTANTE) Para que [(ngModel)] funcione
  ]
})
export class AuthModule { }