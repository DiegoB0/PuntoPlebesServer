# Punto Plebes Server

Este proyecto es el backend para la aplicación **Punto Plebes**. Está desarrollado con **TypeScript** y **Express**, configura **ts-node** para implementar TypeScript en NodeJS y utiliza **Supabase** (PostgreSQL) como base de datos.

## 📦 Instalar Bun

### Usando PowerShell/CMD.exe

```powershell
powershell -c "irm bun.sh/install.ps1|iex"
```

### Usando NPM

```npm
npm install -g bun
```

## 🚀 Como usar

```bun
bun install
```

## ⚙️ Configuración del Entorno

El proyecto requiere un archivo .env para configurar las variables de entorno. Asegúrate de crear este archivo con las siguientes variables:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
PORT=5000
```

Estas variables permiten la conexión a la base de datos Supabase y definen el puerto en el que el servidor escucha las solicitudes.

## 📄 Scripts

El archivo package.json incluye varios scripts para facilitar el desarrollo:
start: Inicia la aplicación en modo producción.

```bash
bun start
```

dev: Inicia la aplicación en modo desarrollo con reinicio automático.

## 🚀 Empieza a desarrollar

Para iniciar el servidor en modo desarrollo, ejecuta el siguiente comando:

```bash
bun dev
```

build: Compila el código TypeScript a JavaScript.

```bash
bun build
```

format: formatea el codigo en todos los archivos

```bash
bun format
```

## 🛠 Dependencias

### Dependencias de Producción

- @supabase/supabase-js: Cliente para interactuar con Supabase.
- dotenv: Carga variables de entorno desde un archivo .env.
- express: Framework para Node.js.
- ts-node: Ejecuta TypeScript directamente en Node.js.
- typescript: Lenguaje superconjunto de JavaScript con tipado estático.

### Dependencias de Desarrollo

- @types/cors: Tipos de TypeScript para CORS.
- @types/express: Tipos de TypeScript para Express.
- @types/morgan: Tipos de TypeScript para Morgan.
- @types/node: Tipos de TypeScript para Node.js.
- cors: Middleware para habilitar CORS.
- eslint: Herramienta para verificar el código.
- morgan: Middleware para registrar solicitudes HTTP.
- nodemon: Reinicia el servidor automáticamente al detectar cambios.
- prettier: Formateador de código.

## 🖥️ Estructura del Proyecto

```
/src
  └── controllers   # Controladores de las rutas
  └── middlewares   # Middlewares de Express
  └── routes        # Definición de rutas
  └── services      # Lógica de negocio y conexión a Supabase
  └── index.ts      # Punto de entrada principal
/dist               # Código compilado
node_modules        # Dependencias instaladas
.env                # Variables de entorno
.gitignore          # Archivos y carpetas ignoradas por Git
package.json        # Información y scripts del proyecto
tsconfig.json       # Configuración de TypeScript
```
