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

  // Variables para controlar el estado de Edición
  isEditing: boolean = false;
  editingCartItemId: string | null = null;
  
  //Variable para almacenar la cantidad (Por defecto 1)
  currentQuantity: number = 1;

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

    // LEER PARÁMETROS DE EDICIÓN Y CANTIDAD
    this.route.queryParams.subscribe(params => {
      this.isEditing = params['mode'] === 'edit';
      this.editingCartItemId = params['cartItemId'];
      
      //Capturamos la cantidad si viene en la URL
      if (params['quantity']) {
        this.currentQuantity = +params['quantity']; // El "+" convierte string a número
      }
    });

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

    // DECISIÓN DE ID
    const finalId = (this.isEditing && this.editingCartItemId) 
      ? this.editingCartItemId 
      : (crypto.randomUUID?.() ?? String(Date.now()));

    // Construimos el objeto.
    const item: any = {
      id: finalId,
      cartItemId: finalId,
      productId: this.product.id,
      nombre: this.product.name,
      precio: this.totalPrice,
      
      //Usamos la cantidad dinámica en lugar del "1" fijo
      cantidad: this.currentQuantity, 
      
      personalizaciones: selectedOpciones,
      imagen: this.product.imageData ?? ''
    };

    // GUARDADO CONDICIONAL
    if (this.isEditing) {
      this.carritoService.actualizarProducto(item);
    } else {
      this.carritoService.agregarProducto(item);
    }

    // Redirigimos al catálogo
    this.router.navigate(['/catalogo']);
  }
}