import { Component } from '@angular/core';

@Component({
  selector: 'app-personalizacion',
  templateUrl: './personalizacion.component.html',
  styleUrls: ['./personalizacion.component.css']
})
export class PersonalizacionComponent {

  // Datos temporales para poder diseñar la vista
  producto = {
    nombre: 'Whopper Clásico',
    descripcion: 'Hamburguesa de ejemplo para personalización.',
    imagen: 'assets/whopper.png',
    precio: '$0'
  };

}
