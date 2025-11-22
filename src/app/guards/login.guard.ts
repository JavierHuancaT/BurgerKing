import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    // Si el usuario ya está logueado, no debe volver a la página de login.
    // Redirigirlo a la página principal.
    if (this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/pagina-principal']);
    }

    // Si no está logueado, puede acceder al login.
    return true;
  }
}
