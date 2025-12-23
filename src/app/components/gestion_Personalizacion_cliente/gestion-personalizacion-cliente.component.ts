import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.model';
import { CarritoService } from 'src/app/services/carrito/carrito.service';
import { OpcionPersonalizacion } from 'src/app/models/opcion-personalizacion.model';

@Component({
  selector: 'app-gestion-personalizacion-cliente',
  templateUrl: './gestion-personalizacion-cliente.component.html',
  styleUrls: ['./gestion-personalizacion-cliente.component.css']
})
export class GestionPersonalizacionClienteComponent implements OnInit {

  product: Product | undefined;
  personalizationForm: FormGroup;
  basePrice: number = 0; // Precio base del producto sin extras
  
  // Variables para controlar el estado de Edición
  isEditing: boolean = false;
  editingCartItemId: string | null = null;
  
  // === VARIABLES PARA EL MODO PASO A PASO (WIZARD) ===
  totalQuantity: number = 1;      // Cantidad total a configurar (ej: 3)
  currentIndex: number = 0;       // En cuál vamos (0 = primero, 1 = segundo...)
  
  // Aquí guardaremos la configuración individual de CADA producto
  productsConfiguration: any[] = [];

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

    // 1. LEER PARÁMETROS
    this.route.queryParams.subscribe(params => {
      this.isEditing = params['mode'] === 'edit';
      this.editingCartItemId = params['cartItemId'];
      
      // Capturamos la cantidad total (si viene del catálogo)
      if (params['quantity']) {
        this.totalQuantity = +params['quantity'];
      }
    });

    // 2. INICIALIZAR EL ARRAY DE CONFIGURACIONES
    // Creamos espacios vacíos según la cantidad seleccionada
    this.productsConfiguration = new Array(this.totalQuantity).fill(null).map(() => ({
      personalizaciones: [], // Guardará los checkboxes
      price: 0               // Guardará el precio final de esta unidad
    }));

    if (productId) {
      this.product = this.productService.findById(productId);
      if (this.product) {
        this.basePrice = this.product.basePrice;
        this.addPersonalizationControls();
        
        // Asignamos el precio base a todas las configuraciones por defecto
        this.productsConfiguration.forEach(c => c.price = this.basePrice);

        // 3. CARGAR DATOS SI ESTAMOS EDITANDO
        // Esto es vital para que al editar no aparezca el formulario en blanco
        if (this.isEditing && this.editingCartItemId) {
          this.cargarDatosSiEsEdicion();
        }
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

  // Método para recuperar la info del item si estamos editando
  private cargarDatosSiEsEdicion(): void {
    // Buscamos el ítem original en el servicio
    const itemExistente = this.carritoService.obtenerItemPorId(this.editingCartItemId!);
    
    if (itemExistente && this.product && this.product.personalizaciones) {
      // Reconstruimos el array de booleanos comparando nombres
      const checkboxesValues = this.product.personalizaciones.map(opcion => {
        return itemExistente.personalizaciones?.some((p: any) => p.nombre === opcion.nombre) ?? false;
      });

      // Llenamos la configuración del primer elemento (al editar una fila, quantity suele ser 1)
      this.productsConfiguration[0] = {
        personalizaciones: checkboxesValues,
        price: itemExistente.precio
      };

      // Cargamos visualmente en el formulario
      this.loadState(0);
    }
  }

  // === CÁLCULO DE PRECIO EN TIEMPO REAL (SOLO DEL ÍTEM ACTUAL) ===
  get currentPrice(): number {
    if (!this.product) return 0;
    let additionalPrice = 0;
    const selected = this.personalizationForm.value.personalizaciones;
    
    if (this.product.personalizaciones) {
      selected.forEach((isSelected: boolean, index: number) => {
        if (isSelected) {
          additionalPrice += this.product!.personalizaciones![index].precio;
        }
      });
    }
    return this.basePrice + additionalPrice;
  }

  // === LÓGICA DE NAVEGACIÓN ENTRE PRODUCTOS ===

  // Guardamos lo que el usuario marcó en la pantalla actual
  private saveCurrentState(): void {
    const formValue = this.personalizationForm.value.personalizaciones;
    this.productsConfiguration[this.currentIndex] = {
      personalizaciones: [...formValue], // Copia de los checkboxes
      price: this.currentPrice           // Precio calculado de esta unidad
    };
  }

  // Cargamos la configuración guardada (o reseteamos si es nuevo)
  private loadState(index: number): void {
    const config = this.productsConfiguration[index];
    const formArray = this.personalizationForm.get('personalizaciones') as FormArray;
    
    if (config && config.personalizaciones.length > 0) {
      // Si ya lo habíamos configurado antes, recuperamos los checks
      formArray.setValue(config.personalizaciones);
    } else {
      // Si es una unidad nueva que no hemos tocado, limpiar formulario
      formArray.reset(); 
    }
  }

  nextItem(): void {
    if (this.currentIndex < this.totalQuantity - 1) {
      this.saveCurrentState(); // Guardar actual
      this.currentIndex++;     // Avanzar índice
      this.loadState(this.currentIndex); // Cargar siguiente
    }
  }

  prevItem(): void {
    if (this.currentIndex > 0) {
      this.saveCurrentState(); // Guardar actual antes de salir
      this.currentIndex--;     // Retroceder índice
      this.loadState(this.currentIndex); // Cargar anterior
    }
  }

  // === MÉTODO FINAL: AGREGAR TODO AL CARRITO ===
  finishAndAddToCart(): void {
    if (!this.product) return;
    
    // 1. Guardamos el estado del último producto en pantalla
    this.saveCurrentState();

    // 2. Si estábamos EDITANDO, primero lo eliminamos del servicio para reemplazarlo
    if (this.isEditing && this.editingCartItemId) {
      this.carritoService.eliminarPorId(this.editingCartItemId);
    }

    // 3. Iteramos por cada configuración y creamos items INDIVIDUALES
    this.productsConfiguration.forEach((config, index) => {
      
      // Convertimos booleanos a objetos OpcionPersonalizacion
      const selectedOpciones: OpcionPersonalizacion[] = [];
      if (this.product!.personalizaciones) {
        config.personalizaciones.forEach((isSelected: boolean, i: number) => {
          if (isSelected) {
            selectedOpciones.push(this.product!.personalizaciones![i]);
          }
        });
      }

      // Generamos un ID único nuevo para cada unidad desglosada
      const newId = crypto.randomUUID?.() ?? `cart-${Date.now()}-${index}`;

      const item: any = {
        id: newId,
        cartItemId: newId,
        productId: this.product!.id,
        nombre: this.product!.name,
        precio: config.price, // Precio específico de esta unidad
        cantidad: 1,          // SIEMPRE 1, porque están desglosados
        personalizaciones: selectedOpciones,
        imagen: this.product!.imageData ?? ''
      };

      // Usamos agregarProducto para meter cada unidad por separado
      this.carritoService.agregarProducto(item);
    });

    // Redirigimos al catálogo
    this.router.navigate(['/catalogo']);
  }
}