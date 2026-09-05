import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utilidades/prisma.js";

const rutas = Router();
const esquemaMovimiento = z.object({
  tipoMovimiento: z.enum(["ingreso", "gasto"]),
  descripcion: z.string().max(200).optional().nullable(),
  monto: z.number().positive(),
  fecha: z.string().datetime()
});

rutas.post("/", async (solicitud, respuesta) => {
  const resultado = esquemaMovimiento.safeParse(solicitud.body);
  if (!resultado.success) {
    respuesta.status(400).json({ exito: false, mensaje: "Datos de movimiento invalidos" });
    return;
  }
  const movimiento = await prisma.movimientoFinanciero.create({ data: { ...resultado.data, fecha: new Date(resultado.data.fecha) } });
  respuesta.status(201).json({ exito: true, datos: { ...movimiento, monto: Number(movimiento.monto) } });
});

rutas.get("/", async (solicitud, respuesta) => {
  const pagina = Math.max(1, Number(solicitud.query.pagina) || 1);
  const limite = Math.min(100, Math.max(1, Number(solicitud.query.limite) || 10));
  const [datos, total] = await Promise.all([
    prisma.movimientoFinanciero.findMany({ skip: (pagina - 1) * limite, take: limite, orderBy: { fecha: "desc" } }),
    prisma.movimientoFinanciero.count()
  ]);
  respuesta.json({ exito: true, datos: datos.map((movimiento) => ({ ...movimiento, monto: Number(movimiento.monto) })), paginacion: { pagina, limite, total } });
});

export default rutas;
