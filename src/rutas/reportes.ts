import { Router } from "express";
import { Worker } from "node:worker_threads";
import { prisma } from "../utilidades/prisma.js";

const rutas = Router();

rutas.get("/resumen", async (_solicitud, respuesta) => {
  const [ventas, ingresos, gastos, productos] = await Promise.all([
    prisma.venta.aggregate({ _sum: { total: true }, _count: { _all: true } }),
    prisma.movimientoFinanciero.aggregate({ where: { tipoMovimiento: "ingreso" }, _sum: { monto: true } }),
    prisma.movimientoFinanciero.aggregate({ where: { tipoMovimiento: "gasto" }, _sum: { monto: true } }),
    prisma.producto.count()
  ]);
  respuesta.json({
    exito: true,
    datos: {
      cantidadVentas: ventas._count._all,
      totalVentas: Number(ventas._sum.total ?? 0),
      ingresos: Number(ingresos._sum.monto ?? 0),
      gastos: Number(gastos._sum.monto ?? 0),
      cantidadProductos: productos
    }
  });
});

rutas.post("/generar", async (_solicitud, respuesta) => {
  const [ventas, ingresos, gastos] = await Promise.all([
    prisma.venta.aggregate({ _sum: { total: true } }),
    prisma.movimientoFinanciero.aggregate({ where: { tipoMovimiento: "ingreso" }, _sum: { monto: true } }),
    prisma.movimientoFinanciero.aggregate({ where: { tipoMovimiento: "gasto" }, _sum: { monto: true } })
  ]);
  // Delega el procesamiento del reporte a un worker thread para no bloquear el bucle de eventos principal
  const trabajador = new Worker(new URL("../utilidades/reporte.worker.js", import.meta.url));
  trabajador.postMessage({
    ventas: Number(ventas._sum.total ?? 0),
    ingresos: Number(ingresos._sum.monto ?? 0),
    gastos: Number(gastos._sum.monto ?? 0)
  });
  trabajador.on("message", (resultado) => console.log("Reporte generado", resultado));
  trabajador.on("error", (error) => console.error("Error del worker de reportes", error));
  respuesta.status(202).json({ exito: true, mensaje: "Reporte en proceso" });
});

export default rutas;
