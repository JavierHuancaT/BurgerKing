import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaginaPrincipalComponent } from './components/pagina-principal/pagina-principal.component';
import { CarritoComponent } from './components/carrito/carrito.component';

import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { ProductListComponent } from './components/admin/product-list/product-list.component';
import { ProductFormComponent } from './components/admin/product-form/product-form.component';
import { AdminGuard } from './guards/admin.guard'; // 👈 importa el guard

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pagina-principal' },

  { path: 'pagina-principal', component: PaginaPrincipalComponent },
  { path: 'carrito', component: CarritoComponent },

  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },

  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],          // protegemos todo el panel
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      { path: 'products', component: ProductListComponent },        // HDU5
      { path: 'products/new', component: ProductFormComponent },    // HDU4
      { path: 'products/:id/edit', component: ProductFormComponent } // HDU7
    ]
  },

  // Yo cambiaría este wildcard para que NO te redirija siempre a admin
  { path: '**', redirectTo: 'pagina-principal' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
