import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

/**
 * Validador personalizado para asegurar que dos campos coincidan.
 */
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  // Si los campos aún no existen, o si el de confirmación no ha sido tocado, no hacer nada.
  if (!password || !confirmPassword || !confirmPassword.value) {
    return null;
  }
  
  // Si no coinciden, establece un error en el campo de confirmación.
  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    // Si coinciden y el error estaba presente, lo limpia.
    if (confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
};
 
@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent {
  registerForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }
  
  onSubmit() {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;
      this.authService.register(name, email, password).subscribe({
        next: () => {
          alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.registerForm.get('email')?.setErrors({ emailInUse: true });
        }
      });
    }
  }
}
