import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaginaPrincipalComponent } from './components/pagina-principal/pagina-principal.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { ProductListComponent } from './components/admin/product-list/product-list.component';
import { ProductFormComponent } from './components/admin/product-form/product-form.component';
import { AdminGuard } from './guards/admin.guard';
import { CatalogoComponent } from './components/catalogo/catalogo.component';

import { PersonalizacionComponent } from './components/personalizacion/personalizacion.component';
import { PromocionesComponent } from './components/admin/promociones/promociones.component';
import { GestionStockComponent } from './components/admin/gestion-stock/gestion-stock.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pagina-principal' },

  { path: 'app-pagina-principal',
    component: PaginaPrincipalComponent
  },

  // (Opcional) Si también quieres que funcione con /pagina-principal
  {
    path: '',
    component: PaginaPrincipalComponent
  },
  
  // --- NUEVA RUTA PARA EL REGISTRO ---
  {
    path: 'registro', // Cuando la URL sea /registro...
    component: RegisterUserComponent // ...mostrará el componente de registro.
  },
  { path: 'carrito', component: CarritoComponent },
  { path: 'personalizacion/:id', component: PersonalizacionComponent },

  { path: 'catalogo', component: CatalogoComponent },
  
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },

  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      { path: 'products', component: ProductListComponent },
      { path: 'products/new', component: ProductFormComponent },
      { path: 'products/:id/edit', component: ProductFormComponent },
      { path: 'promotions', component: PromocionesComponent },
      { path: 'stock', component: GestionStockComponent },
    ]
  },

  { path: '**', redirectTo: 'pagina-principal' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
