import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { clavesIguales } from '../validators/claves-iguales.validator';
import { correoDisponible } from '../validators/correo-disponible.validator';
import { noSoloEspacios } from '../validators/no-solo-espacios.validator';

@Component({
  selector: 'app-registro-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro-page.component.html',
  styleUrl: './registro-page.component.css'
})
export class RegistroPageComponent {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);

  guardando = signal(false);
  errorEnvio = signal<string | null>(null);
  registrado = signal(false);

  formulario = this.fb.nonNullable.group(
    {
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(60),
          noSoloEspacios
        ]
      ],
      correo: [
        '',
        [Validators.required, Validators.email],
        [correoDisponible()]
      ],
      clave: ['', [Validators.required, Validators.minLength(8)]],
      confirmacion: ['', [Validators.required]]
    },
    // La comparación de claves mira los dos campos: va en el grupo, no en uno solo.
    { validators: clavesIguales }
  );

  get nombre(): FormControl<string> {
    return this.formulario.controls.nombre;
  }

  get correo(): FormControl<string> {
    return this.formulario.controls.correo;
  }

  get clave(): FormControl<string> {
    return this.formulario.controls.clave;
  }

  get confirmacion(): FormControl<string> {
    return this.formulario.controls.confirmacion;
  }

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.irAlPrimerError();
      return;
    }

    const datos = this.formulario.getRawValue();

    this.guardando.set(true);
    this.errorEnvio.set(null);

    this.usuarioService
      .crear({
        name: datos.nombre,
        email: datos.correo,
        password: datos.clave,
        avatar: 'https://placehold.co/150',
        role: 'customer'
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.registrado.set(true);
          this.formulario.reset();
        },
        error: () => {
          this.guardando.set(false);
          this.errorEnvio.set(
            'No se pudo completar el registro. Intentá de nuevo.'
          );
        }
      });
  }

  private irAlPrimerError(): void {
    const primerError = document.querySelector(
      '.registro input.ng-invalid, .registro select.ng-invalid, .registro textarea.ng-invalid'
    );

    primerError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
