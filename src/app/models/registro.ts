export interface CrearUsuario {
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: string;
}

export interface UsuarioRegistrado {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface DisponibilidadCorreo {
  isAvailable: boolean;
}
