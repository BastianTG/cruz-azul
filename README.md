# ERP Cruz Azul

App web para gestión de productos (inventario). Frontend HTML+JS vanilla servido por Express con PostgreSQL.

## Stack

| Capa            | Tecnología                        |
|-----------------|-----------------------------------|
| Frontend        | HTML5 + CSS3 + JavaScript vanilla |
| Backend         | Node.js 18 + Express 4.x          |
| Base de datos   | PostgreSQL 15                     |
| Contenedores    | Docker + Docker Compose           |

## Cambios realizados

| Cambio | Detalle |
|--------|---------|
| SQLite → PostgreSQL | `server.js` migrado de `sql.js` a `pg` (node-postgres). Conexión vía Pool con variables de entorno |
| Puerto corregido | `docker.compose.yml`: `80:80` → `80:3000` |
| Variables de BD | Agregadas `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` al compose |
| Infraestructura AWS | Template CloudFormation en `infra/cloudformation.yaml` (EC2 + ECS + EFS + CloudMap) |
| Despliegue EC2 dual | `docker-compose.frontend.yml` (solo app) + `docker-compose.backend.yml` (solo PostgreSQL) |
| Control de versiones | `.gitignore` creado (node_modules, *.db, .env) |

## Estructura

```
cruz-azul/
├── database/                       # Dockerfile + init.sql para PostgreSQL
│   ├── Dockerfile
│   └── init.sql
├── frontend/                       # App Node.js
│   ├── Dockerfile
│   ├── package.json                # express + pg (sql.js eliminado)
│   ├── server.js                   # API REST con PostgreSQL
│   └── views/
│       └── index.html              # SPA
├── infra/
│   └── cloudformation.yaml         # Template CloudFormation (EC2 + ECS + EFS)
├── scripts/
│   ├── setup-backend.sh            # Script automatizado para backend EC2
│   └── setup-frontend.sh           # Script automatizado para frontend EC2
├── docker.compose.yml              # Local (frontend + db)
├── docker-compose.frontend.yml     # Frontend EC2 — solo app, apunta a BD remota
├── docker-compose.backend.yml      # Backend EC2 — solo PostgreSQL
├── package-lock.json
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
git clone <repo> cruz-azul
cd cruz-azul
docker compose up -d
# http://localhost
```

La app asume que PostgreSQL corre en el host `db` (definido via `DB_HOST`). En local con Docker Compose se resuelve automáticamente gracias al servicio `db`.

## Despliegue en producción (2 servidores EC2)

Usar los scripts automatizados en `scripts/`. Solo necesitan la URL del repo.

### Backend (PostgreSQL) — 54.88.53.173

```bash
ssh ec2-user@54.88.53.173
sudo chmod +x scripts/setup-backend.sh
./scripts/setup-backend.sh https://github.com/usuario/cruz-azul.git tu_password_segura
```

> Security Group del backend: permitir TCP **5432** desde `3.221.29.47/32`.

### Frontend (Node.js) — 3.221.29.47

```bash
ssh ec2-user@3.221.29.47
sudo chmod +x scripts/setup-frontend.sh
./scripts/setup-frontend.sh https://github.com/usuario/cruz-azul.git 54.88.53.173 tu_password_segura
```

> Security Group del frontend: permitir HTTP **80** desde `0.0.0.0/0` y SSH **22** desde tu IP.

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
