import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type UsuarioAutenticado = {
  idUsuario: number;
  rol: string;
};

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioAutenticado;
    }
  }
}

export function requiereAutenticacion(
  solicitud: Request,
  respuesta: Response,
  siguiente: NextFunction
) {
  const encabezado = solicitud.headers.authorization;
  const [tipo, token] = encabezado?.split(" ") ?? [];

  if (tipo !== "Bearer" || !token) {
    respuesta.status(401).json({ exito: false, mensaje: "Token requerido" });
    return;
  }

  try {
    const carga = jwt.verify(token, process.env.JWT_SECRETO ?? "") as jwt.JwtPayload;
    const idUsuario = Number(carga.idUsuario);
    const rol = typeof carga.rol === "string" ? carga.rol : "";

    if (!Number.isInteger(idUsuario) || !rol) {
      respuesta.status(401).json({ exito: false, mensaje: "Token invalido" });
      return;
    }

    // Usa los datos firmados en el JWT para evitar consultar la base de datos en cada peticion cuando el id y rol son suficientes
    solicitud.usuario = { idUsuario, rol };
    siguiente();
  } catch {
    respuesta.status(401).json({ exito: false, mensaje: "Token invalido o expirado" });
  }
}
