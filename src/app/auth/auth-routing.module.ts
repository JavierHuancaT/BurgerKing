import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

/**
 * Rutas específicas del Módulo de Autenticación.
 * Este es el "mapa interno" de la sección 'auth'.
 */
const routes: Routes = [
  {
    path: 'login', // La ruta completa será 'auth/login'
    component: LoginComponent
  },
  // (Aquí irá la ruta 'register' de la HDU1)
  {
    path: '',
    redirectTo: 'login', // Redirige '/auth' a '/auth/login'
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // 'forChild' para módulos hijos
  exports: [RouterModule]
})
export class AuthRoutingModule { }