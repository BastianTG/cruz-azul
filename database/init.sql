CREATE DATABASE cruzazul;
\c cruzazul;

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2),
    stock INTEGER,
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO productos (nombre, descripcion, precio, stock) 
VALUES ('Paracetamol 500mg', 'Analgésico y antipirético', 2500, 100);