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
        descripcion: 'Hamburguesa con carne a la parrilla, lechuga y tomate.'
      },
      {
        nombre: 'Bacon King',
        imagen: 'assets/baconking_combo.png',
        descripcion: 'Doble carne, doble queso y tocino.'
      },
      {
        nombre: 'Mega Stacker',
        imagen: 'assets/megastacker.png',
        descripcion: 'Tres carnes a la parrilla con queso cheddar, tocino y salsa Stacker.'
      }
    ],
    'Combos de Pollo': [
      {
        nombre: 'Chicken Burger',
        imagen: 'assets/chickenburger.webp',
        descripcion: 'Filete de pollo crujiente con pepinillos y mayonesa.'
      },
      {
        nombre: 'King Pollo',
        imagen: 'assets/king_pollo_combo.png',
        descripcion: 'Hamburguesa de pollo empanizado.'
      }
    ],
    'Snacks': [
      {
        nombre: 'Papas Fritas',
        imagen: 'assets/papas_fritas.png',
        descripcion: 'Papas fritas doradas y crujientes.'
      },
      {
        nombre: 'Aros de Cebolla',
        imagen: 'assets/aros_cebolla.png',
        descripcion: 'Aros de cebolla empanizados y crocantes.'
      },
      {
        nombre: 'Nuggets',
        imagen: 'assets/nuggets_unidades.png',
        descripcion: 'Nuggets de pollo crocantes.'
      }
    ],
    'Postres': [
      {
        nombre: 'King Fusion Galleta Chocolate',
        imagen: 'assets/king_fusion_chocolate.png',
        descripcion: 'Helado con chocolate y trozos de galleta.'
      },
      {
        nombre: 'King Fusion Galleta Manjar',
        imagen: 'assets/king_fusion_manjar.png',
        descripcion: 'Helado con manjar y trozos de galleta.'
      },
      {
        nombre: 'Cono Simple',
        imagen: 'assets/cono_simple.png',
        descripcion: 'Clásico helado de vainilla.'
      }
    ],
    'Bebidas': [
      {
        nombre: 'Coca-Cola',
        imagen: 'assets/coca_cola.png',
        descripcion: 'Bebida gaseosa bien fría.'
      },
      {
        nombre: 'Pepsi',
        imagen: 'assets/pepsi.png',
        descripcion: 'Bebida con sabor cola.'
      },
      {
        nombre: 'Bilz',
        imagen: 'assets/bilz.png',
        descripcion: 'Bebida dulce sabor frutilla.'
      }
    ]
  };

  productoSeleccionado: any = null;

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
  }

  abrirDetalle(producto: any) {
    this.productoSeleccionado = producto;
  }

  cerrarDetalle() {
    this.productoSeleccionado = null;
  }
  agregarAlCarrito(prod: any) {

    this.carritoService.agregarProducto({
      nombre: prod.nombre,
      imagen: prod.imagen,
      precio: 3500,           
      cantidad: 1
    });

    this.carritoService.abrirCarrito();
  }
}