import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/prisma/client/client.js";

const adaptador = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter: adaptador });

async function sembrar() {
  const contrasena = await bcrypt.hash("Naye123!", 10);

  // Utiliza upsert para garantizar la siembra idempotente y evitar duplicidad en ejecuciones repetidas
  const usuario = await prisma.usuario.upsert({
    where: { correo: "admin@naye.test" },
    update: {},
    create: {
      nombre: "Administradora",
      apellido: "Naye",
      correo: "admin@naye.test",
      contrasena,
      rol: "propietario"
    }
  });

  const categoria = await prisma.categoria.upsert({
    where: { nombreCategoria: "Vestidos" },
    update: {},
    create: {
      nombreCategoria: "Vestidos",
      descripcion: "Vestidos para dama"
    }
  });

  await prisma.producto.upsert({
    where: { idProducto: 1 },
    update: {},
    create: {
      idCategoria: categoria.idCategoria,
      nombre: "Vestido basico",
      descripcion: "Producto inicial de demostracion",
      talla: "M",
      color: "Negro",
      precio: 39.90,
      stock: 10
    }
  });

  console.log(`Datos iniciales creados para ${usuario.correo}`);
}

sembrar()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
