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
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    // 1) Usuario NO logueado -> a Login
    if (!this.authService.isLoggedIn()) {
      // OJO: login es /auth/login
      return this.router.createUrlTree(['/auth/login']);
    }

    // 2) Usuario logueado pero NO es Admin -> a catálogo
    if (!this.authService.isAdmin()) {
      // Tu catálogo está en 'pagina-principal'
      return this.router.createUrlTree(['/pagina-principal']);
    }

    // 3) Es Admin -> puede entrar
    return true;
  }
}
