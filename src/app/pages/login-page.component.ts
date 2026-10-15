import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);

  usuario = signal('');
  clave = signal('');
  error = signal<string | null>(null);

  iniciarSesion(): void {
    this.error.set(null);

    if (!this.auth.iniciarSesion(this.usuario(), this.clave())) {
      this.error.set('Usuario o clave incorrectos.');
      return;
    }

    // Vuelve a la ruta que el guard bloqueó, o al catálogo.
    const volverA =
      this.ruta.snapshot.queryParamMap.get('volverA') ?? '/productos';

    this.router.navigateByUrl(volverA);
  }
}
