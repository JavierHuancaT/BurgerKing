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

  // Variables para controlar el estado de Edición (Ya las tenías)
  isEditing: boolean = false;
  editingCartItemId: string | null = null;

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

    //LEER PARÁMETROS DE EDICIÓN
    // Nos suscribimos a queryParams para saber si venimos en modo 'edit' y capturar el ID del item
    this.route.queryParams.subscribe(params => {
      this.isEditing = params['mode'] === 'edit';
      this.editingCartItemId = params['cartItemId'];
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
    // Si estamos editando, usamos el ID viejo (editingCartItemId). Si es nuevo, generamos uno nuevo.
    const finalId = (this.isEditing && this.editingCartItemId) 
      ? this.editingCartItemId 
      : (crypto.randomUUID?.() ?? String(Date.now()));

    // Construimos el objeto. Usamos 'any' para poder inyectar 'cartItemId' explícitamente.
    const item: any = {
      id: finalId,           // ID principal
      cartItemId: finalId,   // <--- ID CRÍTICO: El servicio lo usará para encontrar qué actualizar
      productId: this.product.id,
      nombre: this.product.name,
      precio: this.totalPrice,
      cantidad: 1,
      personalizaciones: selectedOpciones,
      imagen: this.product.imageData ?? ''
    };

    // GUARDADO CONDICIONAL Y REDIRECCIÓN
    if (this.isEditing) {
      // Si es edición -> Actualizamos
      this.carritoService.actualizarProducto(item);
    } else {
      // Si es nuevo -> Agregamos
      this.carritoService.agregarProducto(item);
    }

    // Redirigimos al carrito para ver los cambios (antes iba a '/')
    this.router.navigate(['/catalogo']);
  }
}