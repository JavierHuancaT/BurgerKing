import { TestBed } from '@angular/core/testing';

import { IngredienteService } from './ingrediente.service';

describe('IngredienteService', () => {
  let service: IngredienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IngredienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
