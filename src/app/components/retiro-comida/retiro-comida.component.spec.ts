import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetiroComidaComponent } from './retiro-comida.component';

describe('RetiroComidaComponent', () => {
  let component: RetiroComidaComponent;
  let fixture: ComponentFixture<RetiroComidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetiroComidaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetiroComidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
