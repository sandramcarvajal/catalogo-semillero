import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Categoria } from '../models/categoria';
import { CategoriaService } from '../services/categoria.service';
import { ProductoService } from '../services/producto.service';
import { noSoloEspacios } from '../validators/no-solo-espacios.validator';

@Component({
  selector: 'app-formulario-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-producto.component.html',
  styleUrl: './formulario-producto.component.css'
})
export class FormularioProductoComponent {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  categorias = signal<Categoria[]>([]);
  caracteresRestantes = signal(500);

  textoContador = computed(() => {
    const restantes = this.caracteresRestantes();

    return restantes < 0
      ? `Te pasaste por ${-restantes} caracteres`
      : `${restantes} caracteres restantes`;
  });

  formulario = this.fb.nonNullable.group({
    titulo: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        noSoloEspacios
      ]
    ],
    precio: [0, [Validators.required, Validators.min(1)]],
    descripcion: [
      '',
      [Validators.required, Validators.minLength(20), Validators.maxLength(500)]
    ],
    categoriaId: [0, [Validators.required, Validators.min(1)]],
    imagenes: this.fb.array([this.nuevaImagen()])
  });

  get imagenes(): FormArray<FormControl<string>> {
    return this.formulario.controls.imagenes;
  }

  get titulo(): FormControl<string> {
    return this.formulario.controls.titulo;
  }

  get precio(): FormControl<number> {
    return this.formulario.controls.precio;
  }

  get descripcion(): FormControl<string> {
    return this.formulario.controls.descripcion;
  }

  get categoriaId(): FormControl<number> {
    return this.formulario.controls.categoriaId;
  }

  constructor() {
    this.categoriaService.obtenerTodas().subscribe((categorias) => {
      this.categorias.set(categorias);
    });

    this.descripcion.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valor) => {
        this.caracteresRestantes.set(500 - valor.length);
      });
  }

  private nuevaImagen(): FormControl<string> {
    return this.fb.nonNullable.control('', [Validators.required]);
  }

  agregarImagen(): void {
    this.imagenes.push(this.nuevaImagen());
  }

  quitarImagen(indice: number): void {
    this.imagenes.removeAt(indice);
  }

  private irAlPrimerError(): void {
    const primerError = document.querySelector(
      '.formulario-producto input.ng-invalid, .formulario-producto select.ng-invalid, .formulario-producto textarea.ng-invalid'
    );

    primerError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.irAlPrimerError();
      return;
    }

    const datos = this.formulario.getRawValue();

    this.productoService
      .crear({
        title: datos.titulo,
        price: datos.precio,
        description: datos.descripcion,
        categoryId: datos.categoriaId,
        images: datos.imagenes
      })
      .subscribe(() => {
        this.router.navigate(['/admin/productos']);
      });
  }
}
