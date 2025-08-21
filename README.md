# 🚀 Panel Administrativo Deno

Panel administrativo completo para gestión de usuarios y productos, construido con **Deno** y conectado a la base de datos **MySQL de Laravel**.

## ✨ Características

- 🔐 **Autenticación JWT** con roles (admin/user)
- 👥 **Gestión de usuarios** completa (CRUD)
- 📦 **Gestión de productos** con filtros y paginación
- 🗄️ **Conexión directa** a MySQL de Laravel
- 🛡️ **Autorización basada en roles**
- 📊 **Dashboard con estadísticas**
- 🔍 **Búsqueda avanzada** de productos
- 📱 **API RESTful** completa

## 🏗️ Arquitectura

```
src/
├── controllers/          # Controladores de la API
│   ├── AuthController.ts # Autenticación y autorización
│   ├── UserController.ts # Gestión de usuarios
│   └── ProductController.ts # Gestión de productos
├── models/              # Interfaces y tipos TypeScript
│   ├── User.ts         # Modelo de usuario
│   └── Product.ts      # Modelo de producto
├── routes/              # Definición de rutas
│   ├── authRoutes.ts   # Rutas de autenticación
│   ├── userRoutes.ts   # Rutas de usuarios
│   └── productRoutes.ts # Rutas de productos
├── middleware/          # Middleware personalizado
│   └── auth.ts         # Autenticación JWT
├── utils/               # Utilidades
│   └── database.ts     # Conexión MySQL y operaciones
└── app.ts              # Aplicación principal
```

## 🚀 Instalación y Configuración

### 1. Verificar que Deno esté instalado

```bash
deno --version
```

Si no está instalado, descárgalo desde [deno.land](https://deno.land/)

### 2. Configurar la base de datos

Edita `src/utils/database.ts` y ajusta la configuración de MySQL:

```typescript
const DB_CONFIG = {
    hostname: "localhost",      // Tu host MySQL
    username: "root",          // Tu usuario MySQL
    password: "",              // Tu password MySQL
    database: "educacionit",   // Tu base de datos
    port: 3306                 // Puerto MySQL
};
```

### 3. Ejecutar la aplicación

```bash
# Modo desarrollo (con auto-reload)
deno task dev

# Modo producción
deno task start
```

## 📡 Endpoints de la API

### 🔐 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `GET` | `/api/auth/profile` | Obtener perfil (requiere auth) |

### 👥 Usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/users` | Listar usuarios | ✅ |
| `GET` | `/api/users/:id` | Obtener usuario | ✅ |
| `POST` | `/api/users` | Crear usuario | ✅ Admin |
| `PUT` | `/api/users/:id` | Actualizar usuario | ✅ |
| `DELETE` | `/api/users/:id` | Eliminar usuario | ✅ Admin |

### 📦 Productos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/products` | Listar productos | ✅ |
| `GET` | `/api/products/:id` | Obtener producto | ✅ |
| `POST` | `/api/products` | Crear producto | ✅ |
| `PUT` | `/api/products/:id` | Actualizar producto | ✅ |
| `DELETE` | `/api/products/:id` | Eliminar producto | ✅ |
| `GET` | `/api/products/dashboard` | Estadísticas | ✅ |
| `GET` | `/api/products/search?q=term` | Búsqueda | ✅ |

## 🔑 Autenticación

### 1. Registro de usuario

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 3. Usar el token

```bash
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 📊 Ejemplos de Uso

### Crear un producto

```bash
curl -X POST http://localhost:8000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "name": "Laptop Gaming",
    "description": "Laptop de alto rendimiento",
    "price": 1299.99,
    "stock": 15,
    "category": "Electrónicos"
  }'
```

### Buscar productos

```bash
curl -X GET "http://localhost:8000/api/products/search?q=laptop" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Obtener estadísticas

```bash
curl -X GET http://localhost:8000/api/products/dashboard \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 🛠️ Tareas Disponibles

```bash
# Desarrollo con auto-reload
deno task dev

# Producción
deno task start

# Formatear código
deno task fmt

# Linting
deno task lint

# Tests
deno task test
```

## 🔧 Configuración de Base de Datos

La aplicación se conecta directamente a tu base de datos MySQL de Laravel. Asegúrate de que:

1. **MySQL esté ejecutándose**
2. **Las tablas existan** (`users`, `products`)
3. **Los permisos estén configurados** correctamente
4. **La configuración de conexión** sea correcta

### Estructura de tablas esperada

```sql
-- Tabla users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla products
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category VARCHAR(255),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🚨 Solución de Problemas

### Error de conexión MySQL

- Verifica que MySQL esté ejecutándose
- Confirma las credenciales en `database.ts`
- Asegúrate de que la base de datos exista

### Error de permisos

- Verifica que el usuario MySQL tenga permisos de lectura/escritura
- Confirma que las tablas existan y sean accesibles

### Error de JWT

- Verifica que el token esté en el header `Authorization: Bearer TOKEN`
- Confirma que el token no haya expirado

## 📝 Notas de Desarrollo

- **Modo desarrollo**: Usa `deno task dev` para auto-reload
- **Logs**: La aplicación muestra logs detallados en consola
- **CORS**: Configurado para permitir todas las origenes (ajusta según necesidades)
- **Seguridad**: JWT con expiración de 24 horas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**¡Disfruta usando tu panel administrativo en Deno! 🎉**
