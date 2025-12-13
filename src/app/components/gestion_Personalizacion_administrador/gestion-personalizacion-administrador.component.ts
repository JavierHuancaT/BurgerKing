import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OpcionPersonalizacion } from '../../models/opcion-personalizacion.model';

@Component({
  selector: 'app-gestion-personalizacion-administrador',
  templateUrl: './gestion-personalizacion-administrador.component.html',
  styleUrls: ['./gestion-personalizacion-administrador.component.css']
})
export class GestionPersonalizacionAdministradorComponent implements OnInit {

  @Input() form!: FormGroup;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    if (!this.form.contains('personalizaciones')) {
      this.form.addControl('personalizaciones', this.fb.array([]));
    }
  }

  get personalizaciones(): FormArray {
    return this.form.get('personalizaciones') as FormArray;
  }

  nuevaPersonalizacion(): FormGroup {
    return this.fb.group({
      nombre: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]]
    });
  }

  agregarPersonalizacion(personalizacion?: OpcionPersonalizacion): void {
    const personalizacionForm = this.nuevaPersonalizacion();
    if (personalizacion) {
      personalizacionForm.patchValue(personalizacion);
    }
    this.personalizaciones.push(personalizacionForm);
  }

  quitarPersonalizacion(i: number): void {
    this.personalizaciones.removeAt(i);
  }
}