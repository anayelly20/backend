# Naye Fashion Store - Backend

## Requisitos

- Node.js instalado.
- PostgreSQL ejecutandose en `localhost:5432`.
- Una base de datos llamada `naye_fashion_store`.

## Configuracion

Crea o revisa el archivo `.env` en la raiz del proyecto:

```env
DATABASE_URL="postgresql://usuario:contrasena@localhost:5432/naye_fashion_store"
JWT_SECRETO="cambia_este_secreto_local"
PUERTO=3000
```

Instala dependencias y genera el cliente Prisma:

```bash
npm install
npm run prisma:generate
```

Aplica migraciones y crea datos iniciales:

```bash
npm run db:migrate
npm run db:seed
```

## Ejecucion

Desarrollo con recarga automatica:

```bash
npm run dev
```

Produccion:

```bash
npm run build
npm start
```

La API queda disponible en `http://localhost:3000`.

- Salud: `GET /api/salud`
- Documentacion: `http://localhost:3000/api/documentacion/`
- Login: `POST /api/autenticacion/iniciar-sesion`

El seed crea el usuario de prueba `admin@naye.test` con contrasena `Naye123!`. Cambialo antes de usar el sistema fuera de desarrollo.

## Comandos utiles

```bash
npm run db:studio
npx prisma migrate status
```
