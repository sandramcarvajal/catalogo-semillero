import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Categoria } from '../models/categoria';
import { CategoriaService } from '../services/categoria.service';
import { ProductoService } from '../services/producto.service';
import { PuedeSalir } from '../guards/cambios-sin-guardar.guard';
import { noSoloEspacios } from '../validators/no-solo-espacios.validator';

@Component({
  selector: 'app-formulario-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-producto.component.html',
  styleUrl: './formulario-producto.component.css'
})
export class FormularioProductoComponent implements PuedeSalir {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  categorias = signal<Categoria[]>([]);
  caracteresRestantes = signal(500);
  guardando = signal(false);
  errorEnvio = signal<string | null>(null);

  productoId = signal<number | null>(null);
  esEdicion = computed(() => this.productoId() !== null);

  textoContador = computed(() => {
    const restantes = this.caracteresRestantes();

    return restantes < 0
      ? `Te pasaste por ${-restantes} caracteres`
      : `${restantes} caracteres restantes`;
  });

  formulario = this.fb.nonNullable.group({
    // El código es el id del producto: lo mostramos deshabilitado y viaja al
    // backend con getRawValue(), porque value ignora los campos deshabilitados.
    codigo: this.fb.nonNullable.control({ value: 0, disabled: true }),
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

    const idParam = this.ruta.snapshot.paramMap.get('id');

    if (idParam !== null) {
      const id = Number(idParam);
      this.productoId.set(id);
      this.cargarProducto(id);
    }
  }

  private cargarProducto(id: number): void {
    this.productoService.obtenerPorId(id).subscribe({
      next: (producto) => {
        this.formulario.patchValue({
          codigo: producto.id,
          titulo: producto.title,
          precio: producto.price,
          descripcion: producto.description,
          categoriaId: producto.category.id
        });

        this.imagenes.clear();

        producto.images.forEach((url) => {
          this.imagenes.push(this.nuevaImagen(url));
        });

        // El formulario siempre necesita al menos una fila de imagen.
        if (producto.images.length === 0) {
          this.imagenes.push(this.nuevaImagen());
        }
      },
      error: () => {
        this.errorEnvio.set('No se pudo cargar el producto.');
      }
    });
  }

  private nuevaImagen(url = ''): FormControl<string> {
    return this.fb.nonNullable.control(url, [Validators.required]);
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
    const id = this.productoId();

    this.guardando.set(true);
    this.errorEnvio.set(null);

    const peticion$ =
      id === null
        ? this.productoService.crear({
            title: datos.titulo,
            price: datos.precio,
            description: datos.descripcion,
            categoryId: datos.categoriaId,
            images: datos.imagenes
          })
        : this.productoService.actualizar(id, {
            // getRawValue() incluye el código aunque esté deshabilitado.
            id: datos.codigo,
            title: datos.titulo,
            price: datos.precio,
            description: datos.descripcion,
            categoryId: datos.categoriaId,
            images: datos.imagenes
          });

    peticion$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.formulario.markAsPristine();
        this.router.navigate(['/admin/productos']);
      },
      error: () => {
        this.guardando.set(false);
        this.errorEnvio.set('No se pudo guardar el producto. Intentá de nuevo.');
      }
    });
  }

  puedeSalir(): boolean {
    return !this.formulario.dirty;
  }
}
