import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/client/client.js";

const adaptador = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: adaptador });

async function demostrar() {
  // Demuestra el caso N+1 ejecutando consultas individuales sucesivas por cada venta y detalle
  console.log("ANTES - caso N+1: consultas repetidas Venta -> DetalleVenta -> Producto");
  const ventas = await prisma.venta.findMany();
  for (const venta of ventas) {
    const detalles = await prisma.detalleVenta.findMany({ where: { idVenta: venta.idVenta } });
    for (const detalle of detalles) {
      await prisma.producto.findUnique({ where: { idProducto: detalle.idProducto } });
    }
  }

  // Resuelve el caso N+1 mediante eager loading para consolidar todas las relaciones en una sola consulta
  console.log("DESPUES - eager loading: una consulta Prisma con Venta + DetalleVenta + Producto");
  const ventasOptimizadas = await prisma.venta.findMany({
    include: { detalles: { include: { producto: true } } }
  });

  console.log(JSON.stringify({ ventasAntes: ventas.length, ventasDespues: ventasOptimizadas.length }));
}

demostrar().finally(() => prisma.$disconnect());
