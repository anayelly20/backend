import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../utilidades/prisma.js";

const rutas = Router();
const esquemaInicio = z.object({
  correo: z.string().email(),
  contrasena: z.string().min(1)
});

rutas.post("/iniciar-sesion", async (solicitud, respuesta) => {
  const resultado = esquemaInicio.safeParse(solicitud.body);
  if (!resultado.success) {
    respuesta.status(400).json({ exito: false, mensaje: "Datos de inicio invalidos" });
    return;
  }

  const usuario = await prisma.usuario.findUnique({ where: { correo: resultado.data.correo } });
  if (!usuario || !(await bcrypt.compare(resultado.data.contrasena, usuario.contrasena))) {
    respuesta.status(401).json({ exito: false, mensaje: "Credenciales invalidas" });
    return;
  }

  // Emite el token firmado con id y rol tras validar credenciales con hash bcrypt
  const token = jwt.sign(
    { idUsuario: usuario.idUsuario, rol: usuario.rol },
    process.env.JWT_SECRETO ?? "",
    { expiresIn: "1h" }
  );

  respuesta.json({
    exito: true,
    token,
    usuario: {
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol
    }
  });
});

export default rutas;
