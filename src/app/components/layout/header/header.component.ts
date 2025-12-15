import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../models/user';
import { CarritoService } from 'src/app/services/carrito/carrito.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  contadorCarrito = 0;
  totalCarrito = 0;
  currentUser: User | null = null;
  private subs: Subscription[] = [];

  // Observable del usuario actual (para usar con async en el template)
  currentUser$: Observable<User | null> = this.authService.currentUser$;

  constructor(
    private authService: AuthService,
    private router: Router,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    // Suscripción al contador del carrito
    this.subs.push(
      this.carritoService.contador$.subscribe(c => this.contadorCarrito = c)
    );

    // Suscripción a los productos para calcular el total
    this.subs.push(
      this.carritoService.productos$.subscribe(productos => {
        this.totalCarrito = productos.reduce((total, p) => 
          total + ((p.precio || 0) * (p.cantidad || 1)), 0
        );
      })
    );

    // Suscripción al usuario actual
    this.subs.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  toggleCarrito(): void {
    this.carritoService.toggleVisible();
  }

  logout(): void {
    // 1) cerrar sesión
    this.authService.logout();

    // 2) redirigir a la página principal (elige la que uses)
    // Si tu home es "/":
    this.router.navigate(['/']);

    // Si tu home es "/pagina-principal":
    // this.router.navigate(['/pagina-principal']);

    // Si estabas usando "/app-pagina-principal" (no usual):
    // this.router.navigate(['/app-pagina-principal']);
  }
}
