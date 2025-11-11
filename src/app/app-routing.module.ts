import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaginaPrincipalComponent } from './components/pagina-principal/pagina-principal.component';
import { CarritoComponent } from './components/carrito/carrito.component';

<<<<<<< HEAD
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { ProductListComponent } from './components/admin/product-list/product-list.component';
import { ProductFormComponent } from './components/admin/product-form/product-form.component';
=======
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
>>>>>>> cliente-carrito

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pagina-principal' },
  {
    path: 'pagina-principal',
    component: PaginaPrincipalComponent
  },
    {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    children: [ 
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      { path: 'products', component: ProductListComponent },    // HDU5
      { path: 'products/new', component: ProductFormComponent }, // HDU4
      { path: 'products/:id/edit', component: ProductFormComponent }, // HDU7
    ]
  },
  { path: '**', redirectTo: 'admin/products' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // 'forRoot' para el módulo raíz
  exports: [RouterModule]
})
export class AppRoutingModule {}
