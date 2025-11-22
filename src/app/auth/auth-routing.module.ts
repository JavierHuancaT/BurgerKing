import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

/**
 * "Seguridad: Routes"
 * Se define la constante 'routes' que Angular usará para
 * navegar DENTRO de este módulo de funcionalidad (AuthModule).
 * Este es el "mapa interno" de la sección 'auth'.
 */
const routes: Routes = [
 {
   /**
    * Define la ruta para el LoginComponent (HDU2).
    * Cuando el usuario navegue a '/auth/login', Angular
    * cargará el LoginComponent en el <router-outlet>.
    */
   path: 'login', // La ruta completa será 'auth/login'
   component: LoginComponent
 },
 
 /* (Aquí irá la ruta 'register') */
 
 {
   /**
    * "Manejo de excepciones" y "Control de rutas"
    * Esta es una ruta "catch-all" (comodín) para este módulo.
    * Si el usuario solo navega a '/auth' (sin especificar
    * /login o /register), lo redirige a 'login'.
    */
   path: '',
   redirectTo: 'login', // Redirige '/auth' a '/auth/login'
   pathMatch: 'full'
 }
];

@NgModule({
 /**
  * Se utiliza 'RouterModule.forChild(routes)'.
  * 'forChild' se usa en TODOS los módulos de funcionalidad (feature modules).
  * 'forRoot' (que está en app-routing.module.ts) solo se usa UNA VEZ
  * en el módulo raíz (AppModule).
  */
 imports: [RouterModule.forChild(routes)], // 'forChild' para módulos hijos
 exports: [RouterModule]
})
export class AuthRoutingModule { }