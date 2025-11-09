import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { ProductListComponent } from './components/admin/product-list/product-list.component';
import { ProductFormComponent } from './components/admin/product-form/product-form.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'admin/products' },
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
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
