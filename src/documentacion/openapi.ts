// Define la especificacion OpenAPI desacoplada del codigo de controladores para evitar bloques extensos en rutas
export const especificacionOpenApi = {
  openapi: "3.0.3",
  info: {
    title: "Naye Fashion Store API",
    version: "1.0.0",
    description: "API REST para la administracion de Naye Fashion Store"
  },
  components: {
    securitySchemes: {
      portador: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
    }
  },
  paths: {
    "/api/salud": { get: { summary: "Estado de la API", responses: { "200": { description: "API disponible" } } } },
    "/api/autenticacion/iniciar-sesion": {
      post: {
        summary: "Iniciar sesion",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["correo", "contrasena"],
                properties: {
                  correo: { type: "string", format: "email", example: "admin@naye.test" },
                  contrasena: { type: "string", format: "password", example: "Naye123!" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Token JWT" },
          "400": { description: "Datos de inicio invalidos" },
          "401": { description: "Credenciales invalidas" }
        }
      }
    },
    "/api/categorias": { get: { security: [{ portador: [] }], summary: "Listar categorias", responses: { "200": { description: "Categorias" } } } },
    "/api/productos": {
      get: { security: [{ portador: [] }], summary: "Listar productos", responses: { "200": { description: "Productos paginados" } } },
      post: {
        security: [{ portador: [] }],
        summary: "Crear producto",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["idCategoria", "nombre", "talla", "color", "precio", "stock"],
                properties: {
                  idCategoria: { type: "integer", example: 1 },
                  nombre: { type: "string", example: "Vestido rojo" },
                  descripcion: { type: "string", nullable: true, example: "Vestido de fiesta" },
                  talla: { type: "string", example: "M" },
                  color: { type: "string", example: "Rojo" },
                  precio: { type: "number", example: 49.9 },
                  stock: { type: "integer", example: 10 }
                }
              }
            }
          }
        },
        responses: { "201": { description: "Producto creado" }, "400": { description: "Datos invalidos" }, "404": { description: "Categoria no encontrada" } }
      }
    },
    "/api/productos/{id}": {
      get: { security: [{ portador: [] }], summary: "Consultar producto", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Producto" } } },
      patch: {
        security: [{ portador: [] }],
        summary: "Actualizar producto",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  idCategoria: { type: "integer", example: 1 },
                  nombre: { type: "string", example: "Vestido rojo actualizado" },
                  descripcion: { type: "string", nullable: true },
                  talla: { type: "string", example: "L" },
                  color: { type: "string", example: "Rojo" },
                  precio: { type: "number", example: 54.9 },
                  stock: { type: "integer", example: 8 }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Producto actualizado" }, "400": { description: "Datos invalidos" }, "404": { description: "Producto o categoria no encontrada" } }
      },
      delete: { security: [{ portador: [] }], summary: "Eliminar producto", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Producto eliminado" }, "409": { description: "Producto con ventas" } } }
    },
    "/api/ventas": {
      get: { security: [{ portador: [] }], summary: "Listar ventas", responses: { "200": { description: "Ventas paginadas" } } },
      post: {
        security: [{ portador: [] }],
        summary: "Registrar venta",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["detalles"],
                properties: {
                  detalles: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      required: ["idProducto", "cantidad"],
                      properties: {
                        idProducto: { type: "integer", example: 1 },
                        cantidad: { type: "integer", example: 1 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: { "201": { description: "Venta creada" }, "400": { description: "Detalles invalidos" }, "409": { description: "Stock insuficiente" } }
      }
    },
    "/api/movimientos-financieros": {
      get: { security: [{ portador: [] }], summary: "Listar movimientos financieros", responses: { "200": { description: "Movimientos paginados" } } },
      post: {
        security: [{ portador: [] }],
        summary: "Crear movimiento financiero",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["tipoMovimiento", "monto", "fecha"],
                properties: {
                  tipoMovimiento: { type: "string", enum: ["ingreso", "gasto"], example: "ingreso" },
                  descripcion: { type: "string", nullable: true, example: "Venta del dia" },
                  monto: { type: "number", example: 100 },
                  fecha: { type: "string", format: "date-time", example: "2026-09-05T12:00:00.000Z" }
                }
              }
            }
          }
        },
        responses: { "201": { description: "Movimiento creado" }, "400": { description: "Datos invalidos" } }
      }
    },
    "/api/reportes/resumen": { get: { security: [{ portador: [] }], summary: "Resumen financiero", responses: { "200": { description: "Resumen" } } } },
    "/api/reportes/generar": { post: { security: [{ portador: [] }], summary: "Generar reporte asincrono", responses: { "202": { description: "Reporte en proceso" } } } }
  }
};
