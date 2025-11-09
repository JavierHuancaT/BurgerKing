import { Component } from '@angular/core';

@Component({
  selector: 'app-pagina-principal',
  templateUrl: './pagina-principal.component.html',
  styleUrls: ['./pagina-principal.component.css']
})
export class PaginaPrincipalComponent {
  combos = [
  {
    nombre: 'Whopper',
    imagen: 'assets/whopper.png',
    descripcion: 'Hamburguesa con carne a la parrilla, lechuga y tomate.',
    precio: '$6.000'
  },
  {
    nombre: 'Cheeseburger Doble',
    imagen: 'assets/cheeseburger_doble.webp',
    descripcion: 'Doble carne, doble queso, tomate, lechuga con papas fritas y bebida.',
    precio: '$9.000'
  },
  {
    nombre: 'Chicken Burger',
    imagen: 'assets/chickenburger.webp',
    descripcion: 'Filete de pollo, pepinillo, mayonesa, con papas fritas y bebida.',
    precio: '$8.500'
  },
  {
    nombre: 'Veggie Burger',
    imagen: 'assets/veggieburger.webp',
    descripcion: 'Hamburguesa vegetariana, queso, tomate con papas fritas y bebida.',
    precio: '$8.000'
  },
    {
    nombre: 'Nuggets',
    imagen: 'assets/nuggets.png',
    descripcion: 'Nuggets de pollo, salsa BBQ con papas fritas y bebida.',
    precio: '$7.500'
  },
  {
    nombre: 'Megastacker',
    imagen: 'assets/megastacker.png',
    descripcion: 'Hamburguesa con tocino, queso con papas fritas y bebida.',
    precio: '$9.000'
    }
  ];
}