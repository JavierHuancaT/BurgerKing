import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaginaPrincipalComponent } from './components/pagina-principal/pagina-principal.component';
import { CarritoComponent } from './components/carrito/carrito.component';

/**
 * Rutas principales de la aplicación (AppRoutingModule).
 * Este es el "mapa principal" que usa "Lazy Loading".
 */
const routes: Routes = [
  { path: '', component: PaginaPrincipalComponent },
  { path: 'carrito', component: CarritoComponent },
  // ... (otras rutas, ej: catálogo en '/')
  {
    path: '', // La ruta raíz (http://localhost:4200/)
    component: PaginaPrincipalComponent
  },

  // (Opcional) Si también quieres que funcione con /pagina-principal
  {
    path: 'pagina-principal',
    component: PaginaPrincipalComponent
  },

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