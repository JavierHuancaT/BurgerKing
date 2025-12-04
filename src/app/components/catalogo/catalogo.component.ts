import { Component } from '@angular/core';
import { CarritoService } from 'src/app/services/carrito/carrito.service';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent {
  constructor(private carritoService: CarritoService) {}
  categorias = ['Combos de Carne', 'Combos de Pollo', 'Snacks', 'Postres', 'Bebidas'];
  categoriaSeleccionada = 'Combos de Carne';

  productos: any = {
    'Combos de Carne': [
      {
        nombre: 'Whopper',
        imagen: 'assets/whopper_combo.png',
        descripcion: 'Hamburguesa con carne a la parrilla, lechuga y tomate.',
        precio: 6000,
        cantidad: 1
      },
      {
        nombre: 'Bacon King',
        imagen: 'assets/baconking_combo.png',
        descripcion: 'Doble carne, doble queso y tocino.',
        precio: 7500,
        cantidad: 1
      },
      {
        nombre: 'Mega Stacker',
        imagen: 'assets/megastacker.png',
        descripcion: 'Tres carnes a la parrilla con queso cheddar, tocino y salsa Stacker.',
        precio: 9000,
        cantidad: 1
      }
    ],
    'Combos de Pollo': [
      {
        nombre: 'Chicken Burger',
        imagen: 'assets/chickenburger.webp',
        descripcion: 'Filete de pollo crujiente con pepinillos y mayonesa.',
        precio: 8500,
        cantidad: 1
      },
      {
        nombre: 'King Pollo',
        imagen: 'assets/king_pollo_combo.png',
        descripcion: 'Hamburguesa de pollo empanizado.',
        precio: 8000,
        cantidad: 1
      }
    ],
    'Snacks': [
      {
        nombre: 'Papas Fritas',
        imagen: 'assets/papas_fritas.png',
        descripcion: 'Papas fritas doradas y crujientes.',
        precio: 2000,
        cantidad: 1
      },
      {
        nombre: 'Aros de Cebolla',
        imagen: 'assets/aros_cebolla.png',
        descripcion: 'Aros de cebolla empanizados y crocantes.',
        precio: 2500,
        cantidad: 1
      },
      {
        nombre: 'Nuggets',
        imagen: 'assets/nuggets_unidades.png',
        descripcion: 'Nuggets de pollo crocantes.',
        precio: 2000,
        cantidad: 1
      }
    ],
    'Postres': [
      {
        nombre: 'King Fusion Galleta Chocolate',
        imagen: 'assets/king_fusion_chocolate.png',
        descripcion: 'Helado con chocolate y trozos de galleta.',
        precio: 2500,
        cantidad: 1
      },
      {
        nombre: 'King Fusion Galleta Manjar',
        imagen: 'assets/king_fusion_manjar.png',
        descripcion: 'Helado con manjar y trozos de galleta.',
        precio: 2500,
        cantidad: 1
      },
      {
        nombre: 'Cono Simple',
        imagen: 'assets/cono_simple.png',
        descripcion: 'Clásico helado de vainilla.',
        precio: 2500,
        cantidad: 1
      }
    ],
    'Bebidas': [
      {
        nombre: 'Coca-Cola',
        imagen: 'assets/coca_cola.png',
        descripcion: 'Bebida gaseosa bien fría.',
        precio: 2000,
        cantidad: 1
      },
      {
        nombre: 'Pepsi',
        imagen: 'assets/pepsi.png',
        descripcion: 'Bebida con sabor cola.',
        precio: 2000,
        cantidad: 1
      },
      {
        nombre: 'Bilz',
        imagen: 'assets/bilz.png',
        descripcion: 'Bebida dulce sabor frutilla.',
        precio: 2000,
        cantidad: 1
      }
    ]
  };

  productoSeleccionado: any = null;

  // Cambia la categoria activa cuando el usuario selecciona una
  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
  }

  // Aumenta o reduce la cantidad del producto, sin permitir bajar de 1
  cambiarCantidad(prod: any, delta: number) {
    prod.cantidad = Math.max(1, prod.cantidad + delta);
  }
  // Agrega el producto al carrito con su cantidad actual
  agregarAlCarrito(prod: any) {

    this.carritoService.agregarProducto({
      nombre: prod.nombre,
      imagen: prod.imagen,
      precio: prod.precio,           
      cantidad: prod.cantidad
    });

    // Reinicia la cantidad a 1 despues de agregarlo
    prod.cantidad = 1
    
    // Abre el panel del carrito
    this.carritoService.abrirCarrito();
  }
}