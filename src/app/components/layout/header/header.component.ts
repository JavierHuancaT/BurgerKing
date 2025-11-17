import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../models/user';
import { Subscription } from 'rxjs';
import { CarritoService } from 'src/app/services/carrito/carrito.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  contadorCarrito: number = 0;
  private subs: Subscription[] = [];
  currentUser$: Observable<User | null> = this.authService.currentUser$;

  constructor(
    private authService: AuthService,
    private router: Router,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.subs.push(this.carritoService.contador$.subscribe(c => this.contadorCarrito = c));
  }

  toggleCarrito(): void {
    this.carritoService.toggleVisible();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/pagina-principal']);
  }
}
