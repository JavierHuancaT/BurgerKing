import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent implements OnInit {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      phonenumber: [''],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
  }

  register() {
    if (this.registerForm.valid) {
      console.log('Formulario de registro enviado', this.registerForm.value);
      // Aquí iría la lógica para enviar los datos al servidor
      this.router.navigate(['/pagina-principal']);
    } else {
      console.log('El formulario no es válido');
      this.registerForm.markAllAsTouched();
    }
  }
}
