import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utilidades/prisma.js";

const rutas = Router();
const esquemaVenta = z.object({
  detalles: z.array(z.object({ idProducto: z.number().int().positive(), cantidad: z.number().int().positive() })).min(1)
});
const numero = (valor: unknown, defecto: number, maximo = 100) => Math.min(maximo, Math.max(1, Number(valor) || defecto));

rutas.post("/", async (solicitud, respuesta) => {
  const resultado = esquemaVenta.safeParse(solicitud.body);
  if (!resultado.success || !solicitud.usuario) {
    respuesta.status(400).json({ exito: false, mensaje: "Detalles de venta invalidos" });
    return;
  }
  const idUsuario = solicitud.usuario.idUsuario;

  try {
    // Ejecuta venta, detalles y descuento de stock en una misma transaccion para evitar inconsistencias o registros parciales
    const venta = await prisma.$transaction(async (transaccion) => {
      const detalles = [];
      for (const entrada of resultado.data.detalles) {
        const producto = await transaccion.producto.findUnique({ where: { idProducto: entrada.idProducto } });
        if (!producto || producto.stock < entrada.cantidad) {
          throw new Error("STOCK_INSUFICIENTE");
        }
        // Calcula subtotales y total en el backend usando los precios reales de base de datos para impedir manipulaciones en el cliente
        const subtotal = Math.round(Number(producto.precio) * entrada.cantidad * 100) / 100;
        detalles.push({ idProducto: producto.idProducto, cantidad: entrada.cantidad, subtotal });
      }
      const total = detalles.reduce((suma, detalle) => suma + detalle.subtotal, 0);
      const creada = await transaccion.venta.create({
        data: {
          idUsuario,
          total,
          detalles: { create: detalles }
        },
        include: { detalles: true }
      });
      for (const detalle of detalles) {
        await transaccion.producto.update({ where: { idProducto: detalle.idProducto }, data: { stock: { decrement: detalle.cantidad } } });
      }
      return creada;
    });
    respuesta.status(201).json({ exito: true, datos: { ...venta, total: Number(venta.total), detalles: venta.detalles.map((detalle) => ({ ...detalle, subtotal: Number(detalle.subtotal) })) } });
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK_INSUFICIENTE") {
      respuesta.status(409).json({ exito: false, mensaje: "Stock insuficiente" });
      return;
    }
    respuesta.status(500).json({ exito: false, mensaje: "No se pudo registrar la venta" });
  }
});

rutas.get("/", async (solicitud, respuesta) => {
  const pagina = numero(solicitud.query.pagina, 1);
  const limite = numero(solicitud.query.limite, 10);
  const [datos, total] = await Promise.all([
    prisma.venta.findMany({ skip: (pagina - 1) * limite, take: limite, include: { detalles: true }, orderBy: { idVenta: "desc" } }),
    prisma.venta.count()
  ]);
  respuesta.json({ exito: true, datos, paginacion: { pagina, limite, total } });
});

rutas.get("/:id", async (solicitud, respuesta) => {
  const venta = await prisma.venta.findUnique({ where: { idVenta: Number(solicitud.params.id) }, include: { detalles: { include: { producto: true } }, usuario: true } });
  if (!venta) {
    respuesta.status(404).json({ exito: false, mensaje: "Venta no encontrada" });
    return;
  }
  respuesta.json({ exito: true, datos: venta });
});

export default rutas;
