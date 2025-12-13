import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.model';
import { CarritoService } from 'src/app/services/carrito/carrito.service';
import { ItemCarrito } from 'src/app/models/item-carrito';
import { OpcionPersonalizacion } from 'src/app/models/opcion-personalizacion.model';

@Component({
  selector: 'app-gestion-personalizacion-cliente',
  templateUrl: './gestion-personalizacion-cliente.component.html',
  styleUrls: ['./gestion-personalizacion-cliente.component.css']
})
export class GestionPersonalizacionClienteComponent implements OnInit {

  product: Product | undefined;
  personalizationForm: FormGroup;
  totalPrice: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private carritoService: CarritoService,
    private fb: FormBuilder
  ) {
    this.personalizationForm = this.fb.group({
      personalizaciones: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.product = this.productService.findById(productId);
      if (this.product) {
        this.totalPrice = this.product.basePrice;
        this.addPersonalizationControls();
      }
    }
  }

  private addPersonalizationControls(): void {
    if (this.product && this.product.personalizaciones) {
      const personalizacionesArray = this.personalizationForm.get('personalizaciones') as FormArray;
      this.product.personalizaciones.forEach(() => {
        personalizacionesArray.push(new FormControl(false));
      });
    }
  }

  onPersonalizationChange(): void {
    if (!this.product) return;
    let additionalPrice = 0;
    const selectedPersonalizaciones = this.personalizationForm.value.personalizaciones;
    if (this.product.personalizaciones) {
      selectedPersonalizaciones.forEach((isSelected: boolean, index: number) => {
        if (isSelected) {
          additionalPrice += this.product!.personalizaciones![index].precio;
        }
      });
    }
    this.totalPrice = this.product.basePrice + additionalPrice;
  }

  addToCart(): void {
    if (!this.product) return;

    const selectedOpciones: OpcionPersonalizacion[] = [];
    const selectedPersonalizaciones = this.personalizationForm.value.personalizaciones;
     if (this.product.personalizaciones) {
      selectedPersonalizaciones.forEach((isSelected: boolean, index: number) => {
        if (isSelected) {
          selectedOpciones.push(this.product!.personalizaciones![index]);
        }
      });
    }

    const item: ItemCarrito = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      nombre: this.product.name,
      precio: this.totalPrice,
      cantidad: 1,
      personalizaciones: selectedOpciones,
      imagen: this.product.imageData ?? ''
    };
    this.carritoService.agregarProducto(item);
    this.router.navigate(['/carrito']);
  }
}