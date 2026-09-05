// Define la especificacion OpenAPI desacoplada del codigo de controladores para evitar bloques extensos en rutas
export const especificacionOpenApi = {
  openapi: "3.0.3",
  info: {
    title: "Naye Fashion Store API",
    version: "1.0.0",
    description: "API REST para la administracion de Naye Fashion Store"
  },
  servers: [{ url: "http://localhost:3000" }],
  components: {
    securitySchemes: {
      portador: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
    }
  },
  paths: {
    "/api/salud": { get: { summary: "Estado de la API", responses: { "200": { description: "API disponible" } } } },
    "/api/autenticacion/iniciar-sesion": { post: { summary: "Iniciar sesion", responses: { "200": { description: "Token JWT" }, "401": { description: "Credenciales invalidas" } } } },
    "/api/categorias": { get: { security: [{ portador: [] }], summary: "Listar categorias", responses: { "200": { description: "Categorias" } } } },
    "/api/productos": { get: { security: [{ portador: [] }], summary: "Listar productos", responses: { "200": { description: "Productos paginados" } } }, post: { security: [{ portador: [] }], summary: "Crear producto", responses: { "201": { description: "Producto creado" } } } },
    "/api/productos/{id}": { get: { security: [{ portador: [] }], summary: "Consultar producto", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Producto" } } }, patch: { security: [{ portador: [] }], summary: "Actualizar producto", responses: { "200": { description: "Producto actualizado" } } }, delete: { security: [{ portador: [] }], summary: "Eliminar producto", responses: { "200": { description: "Producto eliminado" }, "409": { description: "Producto con ventas" } } } },
    "/api/ventas": { get: { security: [{ portador: [] }], summary: "Listar ventas", responses: { "200": { description: "Ventas paginadas" } } }, post: { security: [{ portador: [] }], summary: "Registrar venta", responses: { "201": { description: "Venta creada" } } } },
    "/api/movimientos-financieros": { get: { security: [{ portador: [] }], summary: "Listar movimientos financieros", responses: { "200": { description: "Movimientos paginados" } } }, post: { security: [{ portador: [] }], summary: "Crear movimiento financiero", responses: { "201": { description: "Movimiento creado" } } } },
    "/api/reportes/resumen": { get: { security: [{ portador: [] }], summary: "Resumen financiero", responses: { "200": { description: "Resumen" } } } },
    "/api/reportes/generar": { post: { security: [{ portador: [] }], summary: "Generar reporte asincrono", responses: { "202": { description: "Reporte en proceso" } } } }
  }
};
