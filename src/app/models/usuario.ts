export type Rol = 'admin' | 'usuario';

export interface Usuario {
  usuario: string;
  rol: Rol;
}
