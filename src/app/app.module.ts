import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductListComponent } from './components/admin/product-list/product-list.component';
import { ProductFormComponent } from './components/admin/product-form/product-form.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginaPrincipalComponent } from './components/pagina-principal/pagina-principal.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { PersonalizacionComponent } from './components/personalizacion/personalizacion.component';


@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    ProductFormComponent,
    AdminDashboardComponent,
    CarritoComponent,
    PaginaPrincipalComponent,
    HeaderComponent,
    FooterComponent,
    RegisterUserComponent,
    PersonalizacionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
