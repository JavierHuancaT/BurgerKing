import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-retiro-comida',
  templateUrl: './retiro-comida.component.html',
  styleUrls: ['./retiro-comida.component.css']
})
export class RetiroComidaComponent {
  @Output() opcionSeleccionada = new EventEmitter<string>();

  opciones = ['Retiro en Tienda', 'Delivery'];
  opcionElegida: string = '';

  seleccionarOpcion(opcion: string): void {
    this.opcionElegida = opcion;
    this.opcionSeleccionada.emit(opcion);
  }

  //Permite limpiar la selección desde fuera
  reset(): void {
    this.opcionElegida = '';
  }
}