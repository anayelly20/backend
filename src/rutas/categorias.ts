import { Router } from "express";
import { prisma } from "../utilidades/prisma.js";

const rutas = Router();

rutas.get("/", async (_solicitud, respuesta) => {
  const categorias = await prisma.categoria.findMany({ orderBy: { nombreCategoria: "asc" } });
  respuesta.json({ exito: true, datos: categorias });
});

export default rutas;
