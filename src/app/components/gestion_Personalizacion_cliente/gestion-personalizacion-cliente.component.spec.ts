import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionPersonalizacionClienteComponent } from './gestion-personalizacion-cliente.component';

describe('GestionPersonalizacionClienteComponent', () => {
  let component: GestionPersonalizacionClienteComponent;
  let fixture: ComponentFixture<GestionPersonalizacionClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionPersonalizacionClienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionPersonalizacionClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
