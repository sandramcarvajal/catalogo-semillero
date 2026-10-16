import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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

  categorias = signal<Categoria[]>([]);

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

  constructor() {
    this.categoriaService.obtenerTodas().subscribe((categorias) => {
      this.categorias.set(categorias);
    });
  }

  private nuevaImagen(): FormControl<string> {
    return this.fb.nonNullable.control('', [Validators.required]);
  }

  enviar(): void {
    if (this.formulario.invalid) {
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
