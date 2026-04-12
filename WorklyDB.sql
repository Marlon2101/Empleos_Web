-- =========================================
-- CREACIÓN DE LA BASE DE DATOS
-- =========================================
DROP DATABASE IF EXISTS WorklyDB;
CREATE DATABASE WorklyDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE WorklyDB;

-- =========================================
-- TABLAS MAESTRAS (CATÁLOGOS)
-- =========================================
CREATE TABLE Departamentos (
    id_departamento INT NOT NULL AUTO_INCREMENT,
    nombre_departamento VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_departamento)
) ENGINE=InnoDB;

CREATE TABLE Municipios (
    id_municipio INT NOT NULL AUTO_INCREMENT,
    id_departamento_fk INT NOT NULL,
    nombre_municipio VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_municipio),
    CONSTRAINT fk_municipios_departamentos
        FOREIGN KEY (id_departamento_fk)
        REFERENCES Departamentos(id_departamento)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE Categorias (
    id_categoria INT NOT NULL AUTO_INCREMENT,
    nombre_categoria VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_categoria)
) ENGINE=InnoDB;

CREATE TABLE Estados_Postulacion (
    id_estado INT NOT NULL AUTO_INCREMENT,
    nombre_estado VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_estado)
) ENGINE=InnoDB;

CREATE TABLE Habilidades (
    id_habilidad INT NOT NULL AUTO_INCREMENT,
    nombre_habilidad VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_habilidad)
) ENGINE=InnoDB;

-- =========================================
-- TABLAS PRINCIPALES
-- =========================================
CREATE TABLE Usuarios (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(150) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    id_municipio_fk INT NULL,
    resumen_profesional TEXT,
    PRIMARY KEY (id_usuario),
    UNIQUE KEY uq_usuarios_correo (correo_electronico),
    CONSTRAINT fk_usuarios_municipios
        FOREIGN KEY (id_municipio_fk)
        REFERENCES Municipios(id_municipio)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE Empresas (
    id_empresa INT NOT NULL AUTO_INCREMENT,
    nombre_comercial VARCHAR(150) NOT NULL,
    razon_social VARCHAR(150),
    sitio_web VARCHAR(100),
    descripcion_empresa TEXT,
    id_municipio_fk INT NULL,
    PRIMARY KEY (id_empresa),
    CONSTRAINT fk_empresas_municipios
        FOREIGN KEY (id_municipio_fk)
        REFERENCES Municipios(id_municipio)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================================
-- TABLAS DE PROCESO
-- =========================================
CREATE TABLE Vacantes (
    id_vacante INT NOT NULL AUTO_INCREMENT,
    id_empresa_fk INT NOT NULL,
    id_categoria_fk INT NOT NULL,
    titulo_puesto VARCHAR(150) NOT NULL,
    descripcion_puesto TEXT NOT NULL,
    salario_offrecido DECIMAL(10,2),
    modalidad VARCHAR(50),
    id_municipio_fk INT NULL,
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_vacante),
    CONSTRAINT fk_vacantes_empresas
        FOREIGN KEY (id_empresa_fk)
        REFERENCES Empresas(id_empresa)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_vacantes_categorias
        FOREIGN KEY (id_categoria_fk)
        REFERENCES Categorias(id_categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_vacantes_municipios
        FOREIGN KEY (id_municipio_fk)
        REFERENCES Municipios(id_municipio)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE Postulaciones (
    id_postulacion INT NOT NULL AUTO_INCREMENT,
    id_usuario_fk INT NOT NULL,
    id_vacante_fk INT NOT NULL,
    id_estado_fk INT NOT NULL,
    fecha_postulacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_postulacion),
    CONSTRAINT fk_postulaciones_usuarios
        FOREIGN KEY (id_usuario_fk)
        REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_postulaciones_vacantes
        FOREIGN KEY (id_vacante_fk)
        REFERENCES Vacantes(id_vacante)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_postulaciones_estados
        FOREIGN KEY (id_estado_fk)
        REFERENCES Estados_Postulacion(id_estado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =========================================
-- TABLAS DE RELACIÓN Y FEEDBACK
-- =========================================
CREATE TABLE Usuario_Habilidades (
    id_usuario_fk INT NOT NULL,
    id_habilidad_fk INT NOT NULL,
    PRIMARY KEY (id_usuario_fk, id_habilidad_fk),
    CONSTRAINT fk_usuario_habilidades_usuarios
        FOREIGN KEY (id_usuario_fk)
        REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_usuario_habilidades_habilidades
        FOREIGN KEY (id_habilidad_fk)
        REFERENCES Habilidades(id_habilidad)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Valoraciones_Empresas (
    id_valoracion INT NOT NULL AUTO_INCREMENT,
    id_usuario_fk INT NOT NULL,
    id_empresa_fk INT NOT NULL,
    puntuacion INT NOT NULL,
    comentario TEXT,
    fecha_valoracion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_valoracion),
    CONSTRAINT chk_puntuacion CHECK (puntuacion BETWEEN 1 AND 5),
    CONSTRAINT fk_valoraciones_usuarios
        FOREIGN KEY (id_usuario_fk)
        REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_valoraciones_empresas
        FOREIGN KEY (id_empresa_fk)
        REFERENCES Empresas(id_empresa)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =========================================
-- INSERTAR DATOS
-- =========================================

-- Departamentos de El Salvador
INSERT INTO Departamentos (nombre_departamento) VALUES
('Santa Ana'),
('San Salvador'),
('La Libertad'),
('San Miguel');

-- Municipios
INSERT INTO Municipios (id_departamento_fk, nombre_municipio) VALUES
(1, 'Santa Ana Centro'),
(1, 'Chalchuapa'),
(2, 'San Salvador Centro'),
(2, 'Soyapango'),
(3, 'Santa Tecla'),
(3, 'Colón'),
(4, 'San Miguel Centro');

-- Categorías de Empleo
INSERT INTO Categorias (nombre_categoria) VALUES
('Tecnología y Software'),
('Administración y Oficina'),
('Ventas y Marketing'),
('Atención al Cliente'),
('Diseño y Creatividad');

-- Estados de Postulación
INSERT INTO Estados_Postulacion (nombre_estado) VALUES
('Recibida'),
('En Revisión'),
('Entrevista'),
('Rechazada'),
('Contratado');

-- Habilidades
INSERT INTO Habilidades (nombre_habilidad) VALUES
('SQL Server'),
('C#'),
('Bootstrap'),
('JavaScript'),
('Gestión de Proyectos'),
('Inglés Técnico');

-- Usuarios
INSERT INTO Usuarios (
    nombres, apellidos, correo_electronico, contrasena, telefono, id_municipio_fk, resumen_profesional
) VALUES
('Henry Gary', 'Arévalo Valencia', 'henry.arevalo@mail.com', 'Clave123', '7788-9900', 1, 'Estudiante de ingeniería con experiencia en desarrollo web y bases de datos.'),
('Sofía Valeria', 'Velásquez Vega', 'sofia.vega@mail.com', 'Clave456', '7122-3344', 5, 'Especialista en diseño UI/UX y creación de prototipos funcionales.');

-- Empresas
INSERT INTO Empresas (
    nombre_comercial, razon_social, sitio_web, descripcion_empresa, id_municipio_fk
) VALUES
('TechSolutions SV', 'TechSolutions S.A. de C.V.', 'www.techsolutions.sv', 'Empresa líder en desarrollo de software a medida.', 3),
('Global Marketing', 'Global Marketing Group', 'www.globalmkt.com', 'Agencia regional de publicidad y mercadeo digital.', 2);

-- Vacantes
INSERT INTO Vacantes (
    id_empresa_fk, id_categoria_fk, titulo_puesto, descripcion_puesto, salario_offrecido, modalidad, id_municipio_fk
) VALUES
(1, 1, 'Desarrollador Junior SQL', 'Buscamos estudiante para apoyo en bases de datos.', 600.00, 'Híbrido', 1),
(1, 1, 'Programador FullStack', 'Experiencia en C# y Bootstrap indispensable.', 1200.00, 'Remoto', 3),
(2, 3, 'Ejecutivo de Ventas', 'Persona proactiva para cumplimiento de metas.', 500.00, 'Presencial', 2),
(2, 5, 'Diseñador Gráfico', 'Manejo de Adobe Suite y Figma.', 850.00, 'Presencial', 5);

-- Habilidades de Usuarios
INSERT INTO Usuario_Habilidades (id_usuario_fk, id_habilidad_fk) VALUES
(1, 1),
(1, 3),
(1, 4),
(2, 3),
(2, 6);

-- Postulaciones
INSERT INTO Postulaciones (id_usuario_fk, id_vacante_fk, id_estado_fk) VALUES
(1, 1, 2),
(2, 4, 1);

-- Valoraciones de Empresas
INSERT INTO Valoraciones_Empresas (
    id_usuario_fk, id_empresa_fk, puntuacion, comentario
) VALUES
(1, 1, 5, 'Excelente ambiente laboral y oportunidades de crecimiento.');

CREATE TABLE Notificaciones (
    id_notificacion INT NOT NULL AUTO_INCREMENT,
    tipo_usuario ENUM('usuario', 'empresa') NOT NULL,
    id_destinatario INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    leida TINYINT(1) NOT NULL DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_notificacion)
) ENGINE=InnoDB;



ALTER TABLE Empresas
ADD COLUMN correo_electronico VARCHAR(150) NULL,
ADD COLUMN contrasena VARCHAR(255) NULL;

ALTER TABLE Empresas
ADD CONSTRAINT uq_empresas_correo UNIQUE (correo_electronico);

UPDATE Empresas
SET correo_electronico = 'techsolutions@mail.com',
    contrasena = 'ClaveEmpresa123'
WHERE id_empresa = 1;

UPDATE Empresas
SET correo_electronico = 'globalmarketing@mail.com',
    contrasena = 'ClaveEmpresa456'
WHERE id_empresa = 2;