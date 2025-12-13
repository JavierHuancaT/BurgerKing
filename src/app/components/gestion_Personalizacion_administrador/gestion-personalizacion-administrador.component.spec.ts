import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionPersonalizacionAdministradorComponent } from './gestion-personalizacion-administrador.component';

describe('GestionPersonalizacionAdministradorComponent', () => {
  let component: GestionPersonalizacionAdministradorComponent;
  let fixture: ComponentFixture<GestionPersonalizacionAdministradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionPersonalizacionAdministradorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionPersonalizacionAdministradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
