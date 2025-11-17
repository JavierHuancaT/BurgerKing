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
export class ClienteGuard implements CanActivate {

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
      return this.router.createUrlTree(['/auth/login']);
    }

    // 2) Usuario logueado pero NO es Cliente -> a página principal
    if (!this.authService.isClient()) {
      return this.router.createUrlTree(['/pagina-principal']);
    }

    // 3) Es Cliente -> puede entrar
    return true;
  }
}
