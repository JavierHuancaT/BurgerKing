import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // La ruta relativa es correcta según tu árbol

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    // Si el usuario YA está logueado...
    if (this.auth.isLoggedIn()) {
      
      // Si es Admin, lo mandamos al admin panel
      if (this.auth.isAdmin()) {
         return this.router.createUrlTree(['/admin']);
      }
      
      // Si es Cliente, lo mandamos al catálogo
      // (Asegúrate que '/catalogo' sea la ruta correcta en tu app)
      return this.router.createUrlTree(['/catalogo']);
    }

    // Si NO está logueado, dejamos que entre al Login
    return true;
  }
}