import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import rutasAutenticacion from "./rutas/auth.js";
import rutasCategorias from "./rutas/categorias.js";
import rutasProductos from "./rutas/productos.js";
import rutasVentas from "./rutas/ventas.js";
import rutasMovimientos from "./rutas/movimientos.js";
import rutasReportes from "./rutas/reportes.js";
import { requiereAutenticacion } from "./middleware/auth.js";
import { especificacionOpenApi } from "./documentacion/openapi.js";

const aplicacion = express();
const puerto = Number(process.env.PORT ?? process.env.PUERTO) || 3000;

// Configura middleware base, documentacion Swagger y rutas de la API con proteccion por token
aplicacion.use(express.json());
aplicacion.use("/api/documentacion", swaggerUi.serve, swaggerUi.setup(especificacionOpenApi));

aplicacion.get("/api/salud", (_solicitud, respuesta) => {
  respuesta.status(200).json({
    exito: true,
    mensaje: "API de Naye Fashion Store disponible"
  });
});

aplicacion.use("/api/autenticacion", rutasAutenticacion);
aplicacion.use("/api/categorias", requiereAutenticacion, rutasCategorias);
aplicacion.use("/api/productos", requiereAutenticacion, rutasProductos);
aplicacion.use("/api/ventas", requiereAutenticacion, rutasVentas);
aplicacion.use("/api/movimientos-financieros", requiereAutenticacion, rutasMovimientos);
aplicacion.use("/api/reportes", requiereAutenticacion, rutasReportes);

aplicacion.listen(puerto, () => {
  console.log(`Servidor ejecutándose en el puerto ${puerto}`);
});
