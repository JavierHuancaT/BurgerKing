import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/**
 * Rutas principales de la aplicación (AppRoutingModule).
 * Este es el "mapa principal" que usa "Lazy Loading".
 */
const routes: Routes = [
  // ... (otras rutas, ej: catálogo en '/')

  /**
   * (Lazy Loading)
   * Cuando un usuario vaya a '/auth', Angular cargará
   * el AuthModule dinámicamente.
   */
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  }

  // ... (otras rutas, ej: '/admin' para HDU3)
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // 'forRoot' para el módulo raíz
  exports: [RouterModule]
})
export class AppRoutingModule { }