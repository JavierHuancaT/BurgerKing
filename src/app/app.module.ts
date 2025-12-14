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
import { RetiroComidaComponent } from './components/retiro-comida/retiro-comida.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { PromocionesComponent } from './components/admin/promociones/promociones.component';
import { GestionStockComponent } from './components/admin/gestion-stock/gestion-stock.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { GestionPedidosComponent } from './components/admin/gestion-pedidos/gestion-pedidos.component';
import { PedidoCardComponent } from './components/admin/pedido-card/pedido-card.component';
import { GestionPersonalizacionClienteComponent } from './components/gestion_Personalizacion_cliente/gestion-personalizacion-cliente.component';
import { GestionPersonalizacionAdministradorComponent } from './components/gestion_Personalizacion_administrador/gestion-personalizacion-administrador.component';
import { RestaurantesComponent } from './components/restaurantes/restaurantes.component';

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
    PersonalizacionComponent,
    RetiroComidaComponent,
    CatalogoComponent,
    PromocionesComponent,
    GestionStockComponent,
    PerfilComponent,
    GestionPedidosComponent,
    PedidoCardComponent,
    GestionPersonalizacionClienteComponent,
    GestionPersonalizacionAdministradorComponent,
    RestaurantesComponent
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
