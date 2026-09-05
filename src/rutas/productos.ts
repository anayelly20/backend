import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utilidades/prisma.js";
import { cacheProductos } from "../utilidades/cache.js";

const rutas = Router();
const esquemaProducto = z.object({
  idCategoria: z.number().int().positive(),
  nombre: z.string().min(1).max(150),
  descripcion: z.string().optional().nullable(),
  talla: z.string().min(1).max(20),
  color: z.string().min(1).max(50),
  precio: z.number().positive(),
  stock: z.number().int().nonnegative()
});
const pagina = (valor: unknown) => Math.max(1, Number(valor) || 1);
const limite = (valor: unknown) => Math.min(100, Math.max(1, Number(valor) || 10));

function presentar(producto: any) {
  return { ...producto, precio: Number(producto.precio) };
}

rutas.get("/", async (solicitud, respuesta) => {
  const numeroPagina = pagina(solicitud.query.pagina);
  const cantidad = limite(solicitud.query.limite);
  const clave = `productos:${numeroPagina}:${cantidad}`;
  // Aplica cache-aside: retorna la respuesta almacenada en memoria si existe; si no, consulta la base de datos y almacena el resultado
  const almacenado = cacheProductos.obtener(clave);
  if (almacenado) {
    respuesta.json({ exito: true, ...almacenado, cache: true });
    return;
  }

  const [datos, total] = await Promise.all([
    prisma.producto.findMany({
      skip: (numeroPagina - 1) * cantidad,
      take: cantidad,
      include: { categoria: true },
      orderBy: { idProducto: "desc" }
    }),
    prisma.producto.count()
  ]);
  const resultado = { datos: datos.map(presentar), paginacion: { pagina: numeroPagina, limite: cantidad, total } };
  cacheProductos.guardar(clave, resultado);
  respuesta.json({ exito: true, ...resultado, cache: false });
});

rutas.get("/:id", async (solicitud, respuesta) => {
  const producto = await prisma.producto.findUnique({ where: { idProducto: Number(solicitud.params.id) }, include: { categoria: true } });
  if (!producto) {
    respuesta.status(404).json({ exito: false, mensaje: "Producto no encontrado" });
    return;
  }
  respuesta.json({ exito: true, datos: presentar(producto) });
});

rutas.post("/", async (solicitud, respuesta) => {
  const resultado = esquemaProducto.safeParse(solicitud.body);
  if (!resultado.success) {
    respuesta.status(400).json({ exito: false, mensaje: "Datos de producto invalidos" });
    return;
  }
  // Valida la existencia previa de la categoria para garantizar la integridad referencial antes de crear el producto
  const categoria = await prisma.categoria.findUnique({ where: { idCategoria: resultado.data.idCategoria } });
  if (!categoria) {
    respuesta.status(404).json({ exito: false, mensaje: "Categoria no encontrada" });
    return;
  }
  const producto = await prisma.producto.create({ data: resultado.data });
  // Invalida la cache de productos para evitar servir listados desactualizados tras una modificacion
  cacheProductos.limpiar();
  respuesta.status(201).json({ exito: true, datos: presentar(producto) });
});

rutas.patch("/:id", async (solicitud, respuesta) => {
  const resultado = esquemaProducto.partial().safeParse(solicitud.body);
  if (!resultado.success) {
    respuesta.status(400).json({ exito: false, mensaje: "Datos de producto invalidos" });
    return;
  }
  if (resultado.data.idCategoria !== undefined) {
    const categoria = await prisma.categoria.findUnique({ where: { idCategoria: resultado.data.idCategoria } });
    if (!categoria) {
      respuesta.status(404).json({ exito: false, mensaje: "Categoria no encontrada" });
      return;
    }
  }
  try {
    const producto = await prisma.producto.update({ where: { idProducto: Number(solicitud.params.id) }, data: resultado.data });
    // Invalida la cache de productos tras actualizar datos del inventario
    cacheProductos.limpiar();
    respuesta.json({ exito: true, datos: presentar(producto) });
  } catch {
    respuesta.status(404).json({ exito: false, mensaje: "Producto no encontrado" });
  }
});

rutas.delete("/:id", async (solicitud, respuesta) => {
  const idProducto = Number(solicitud.params.id);
  const producto = await prisma.producto.findUnique({ where: { idProducto } });
  if (!producto) {
    respuesta.status(404).json({ exito: false, mensaje: "Producto no encontrado" });
    return;
  }
  // Evita la eliminacion fisica si el producto posee ventas asociadas para preservar la integridad historica
  const detalle = await prisma.detalleVenta.findFirst({ where: { idProducto } });
  if (detalle) {
    respuesta.status(409).json({ exito: false, mensaje: "No se puede eliminar un producto con ventas asociadas" });
    return;
  }
  await prisma.producto.delete({ where: { idProducto } });
  // Invalida la cache de productos tras eliminar un registro
  cacheProductos.limpiar();
  respuesta.json({ exito: true, mensaje: "Producto eliminado" });
});

export default rutas;
