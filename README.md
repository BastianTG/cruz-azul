# ERP Cruz Azul

App web para gestión de productos (inventario). Consta de un frontend HTML+JS vanilla servido por Express y una base de datos PostgreSQL.

## Stack

| Capa       | Tecnología                        |
|------------|-----------------------------------|
| Frontend   | HTML5 + CSS3 + JavaScript vanilla |
| Backend    | Node.js 18 + Express 4.x          |
| Base de datos | PostgreSQL 15                  |
| Contenedores | Docker + Docker Compose         |

## Estructura

```
cruz-azul/
├── database/           # Dockerfile + init.sql para PostgreSQL
│   ├── Dockerfile
│   └── init.sql
├── frontend/           # App Node.js
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js       # API REST (Express)
│   └── views/
│       └── index.html  # SPA
├── infra/
│   └── cloudformation.yaml  # Infra AWS (EC2 + ECS)
├── docker.compose.yml
└── .gitignore
```

## Cómo funciona

1. **Backend** — `server.js` expone una API REST en el puerto 3000:
   - `GET /api/productos` — lista todos los productos
   - `POST /api/productos` — crea un producto (body: `nombre`, `descripcion`, `precio`, `stock`)
   - `GET /` — sirve el frontend `index.html`

2. **Frontend** — página única que carga los productos al iniciar y permite agregar nuevos mediante un formulario. Todo viaja por `fetch()` a la API.

3. **Base de datos** — PostgreSQL con tabla `productos` (id, nombre, descripcion, precio, stock, fecha_ingreso) y un registro semilla.

## Ejecutar local

```bash
# Clonar y entrar
git clone <repo> cruz-azul
cd cruz-azul

# Iniciar todo
docker compose up -d

# Acceder
# http://localhost
```

La app asume que PostgreSQL corre en el host `db` (definido via `DB_HOST`). En local con Docker Compose se resuelve automáticamente.

## Variables de entorno

| Variable       | Default         | Descripción                    |
|----------------|-----------------|--------------------------------|
| `PORT`         | 3000            | Puerto del servidor Express    |
| `DB_HOST`      | db              | Host de PostgreSQL             |
| `DB_PORT`      | 5432            | Puerto de PostgreSQL           |
| `DB_NAME`      | cruzazul        | Nombre de la base de datos     |
| `DB_USER`      | postgres        | Usuario de PostgreSQL          |
| `DB_PASSWORD`  | tu_password     | Contraseña de PostgreSQL       |

## Endpoints de la API

```http
GET  /api/productos     → lista productos
POST /api/productos     → crea producto
     Content-Type: application/json
     Body: { "nombre": "...", "descripcion": "...", "precio": 2500, "stock": 100 }
```
