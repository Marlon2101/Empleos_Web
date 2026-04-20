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
    correo_electronico VARCHAR(150) NULL,
    contrasena VARCHAR(255) NULL,
    PRIMARY KEY (id_empresa),
    UNIQUE KEY uq_empresas_correo (correo_electronico),
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
    responsabilidades TEXT NULL,
    requisitos TEXT NULL,
    salario_offrecido DECIMAL(10,2),
    modalidad VARCHAR(50),
    tipo_contrato VARCHAR(100) NULL,
    educacion VARCHAR(100) NULL,
    idiomas VARCHAR(100) NULL,
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

CREATE TABLE Notificaciones (
    id_notificacion INT NOT NULL AUTO_INCREMENT,
    tipo_usuario VARCHAR(20) NOT NULL,
    id_destinatario INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo_notificacion VARCHAR(60) NOT NULL DEFAULT 'sistema',
    enlace VARCHAR(255) NULL,
    metadata_json LONGTEXT NULL,
    leida TINYINT(1) NOT NULL DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_notificacion)
) ENGINE=InnoDB;

CREATE TABLE Usuarios_Perfil_Detalle (
    id_usuario_fk INT NOT NULL,
    direccion VARCHAR(255) NULL,
    titulo_profesional VARCHAR(150) NULL,
    sitio_web VARCHAR(150) NULL,
    foto_perfil LONGTEXT NULL,
    habilidades_json LONGTEXT NULL,
    experiencia_json LONGTEXT NULL,
    educacion_json LONGTEXT NULL,
    PRIMARY KEY (id_usuario_fk),
    CONSTRAINT fk_usuarios_perfil_detalle_usuario
        FOREIGN KEY (id_usuario_fk)
        REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Vacantes_Guardadas (
    id_guardado INT NOT NULL AUTO_INCREMENT,
    id_usuario_fk INT NOT NULL,
    id_vacante_fk INT NOT NULL,
    fecha_guardado DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_guardado),
    UNIQUE KEY uq_guardado_usuario_vacante (id_usuario_fk, id_vacante_fk),
    CONSTRAINT fk_guardados_usuario
        FOREIGN KEY (id_usuario_fk)
        REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_guardados_vacante
        FOREIGN KEY (id_vacante_fk)
        REFERENCES Vacantes(id_vacante)
        ON UPDATE CASCADE
        ON DELETE CASCADE
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
(1, 'Atiquizaya'),
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
('Diseño y Creatividad'),
('Redes y Telecomunicaciones');

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
('Inglés Técnico'),
('Node.js'),
('Figma'),
('Cisco Packet Tracer');

-- Usuarios
INSERT INTO Usuarios (
    nombres, apellidos, correo_electronico, contrasena, telefono, id_municipio_fk, resumen_profesional
) VALUES
('Henry Gary', 'Arévalo Valencia', 'henry.arevalo@mail.com', 'Clave123', '7788-9900', 1, 'Estudiante de ingeniería con experiencia en desarrollo web y bases de datos.'),
('Sofía Valeria', 'Velásquez Vega', 'sofia.vega@mail.com', 'Clave456', '7122-3344', 5, 'Especialista en diseño UI/UX y creación de prototipos funcionales.');

-- Empresas
INSERT INTO Empresas (
    nombre_comercial, razon_social, sitio_web, descripcion_empresa, id_municipio_fk, correo_electronico, contrasena
) VALUES
('TechSolutions SV', 'TechSolutions S.A. de C.V.', 'www.techsolutions.sv', 'Empresa líder en desarrollo de software a medida, aplicaciones web y arquitecturas en la nube para clientes regionales.', 3, 'techsolutions@mail.com', 'ClaveEmpresa123'),
('Global Marketing', 'Global Marketing Group', 'www.globalmkt.com', 'Agencia regional de publicidad, mercadeo digital y creación de interfaces interactivas para marcas de alto impacto.', 2, 'globalmarketing@mail.com', 'ClaveEmpresa456'),
('InnovaNet El Salvador', 'InnovaNet S.A.', 'www.innovanet.sv', 'Proveedores de infraestructura de redes, configuración de routers y switches empresariales.', 4, 'rrhh@innovanet.sv', 'NetAdmin2026');

-- Vacantes Completas
INSERT INTO Vacantes (
    id_empresa_fk, id_categoria_fk, titulo_puesto, descripcion_puesto, responsabilidades, requisitos, 
    salario_offrecido, modalidad, tipo_contrato, educacion, idiomas, id_municipio_fk
) VALUES
(1, 1, 'Desarrollador Junior SQL y Node.js', 'Buscamos un estudiante o recién graduado para apoyar en la creación de APIs y consultas a bases de datos relacionales. Un ambiente perfecto para crecer profesionalmente.', 
'Crear y optimizar consultas en MySQL y PostgreSQL. Desarrollar endpoints REST usando Node.js. Colaborar con el equipo de frontend para integrar los datos.', 
'Conocimientos sólidos en SQL. Experiencia básica con Node.js y JavaScript. Capacidad de resolución de problemas. Estudiante de 4to año en adelante.', 
600.00, 'Híbrido', 'Tiempo Completo', 'Estudiante de Ingeniería en Sistemas', 'Inglés Técnico (Lectura)', 1),

(1, 1, 'Programador FullStack Web', 'Buscamos un perfil FullStack capaz de maquetar con frameworks modernos y conectar con el backend de manera segura y eficiente.', 
'Maquetar interfaces responsivas utilizando Bootstrap nativo. Conectar el frontend con bases de datos. Asegurar buenas prácticas de código limpio.', 
'Dominio avanzado de JavaScript, Node.js y Bootstrap. Experiencia previa comprobable en proyectos de la universidad o freelancing.', 
1200.00, 'Remoto', 'Tiempo Completo', 'Ingeniería en Sistemas o afín', 'Inglés Avanzado', 3),

(2, 3, 'Ejecutivo de Ventas B2B', 'Te necesitamos para expandir nuestra cartera de clientes corporativos en la zona occidental del país, ofreciendo nuestros servicios de marketing digital.', 
'Prospección de clientes. Cierre de ventas y negociación de contratos. Seguimiento post-venta.', 
'Vehículo propio. Experiencia mínima de 1 año en ventas. Excelentes habilidades de comunicación y negociación.', 
500.00, 'Presencial', 'Tiempo Completo', 'Bachillerato o Técnico', 'Español Nativo', 2),

(2, 5, 'Diseñador UI/UX Senior', 'Buscamos un experto en diseño centrado en el usuario para liderar el prototipado de alta fidelidad de nuestras nuevas plataformas web y móviles.', 
'Crear wireframes, mockups y prototipos interactivos de alta fidelidad. Diseñar componentes reutilizables. Realizar pruebas de usabilidad.', 
'Experiencia avanzada utilizando Figma. Portafolio de proyectos UI/UX actualizado. Conocimientos de HTML/CSS son un plus.', 
1500.00, 'Híbrido', 'Tiempo Completo', 'Licenciatura en Diseño Gráfico o similar', 'Inglés Intermedio', 5),

(3, 6, 'Técnico de Redes y Ruteo Estático', 'Excelente oportunidad para estudiantes interesados en el área de telecomunicaciones. Te encargarás del soporte de nivel 1 y configuración de equipos Cisco.', 
'Configuración de routers y switches. Asignación de IPs y subnetting. Resolución de problemas de red mediante simuladores y equipos físicos.', 
'Conocimientos en ruteo estático y dinámico. Experiencia comprobable utilizando simuladores como Cisco Packet Tracer. Pasión por la infraestructura.', 
750.00, 'Presencial', 'Tiempo Completo', 'Estudiante de Ingeniería o Técnico en Redes', 'Inglés Técnico', 4),

(1, 1, 'Practicante de Frontend (Bootstrap)', 'Abre tu camino en el mundo del desarrollo web. Trabajarás de la mano con desarrolladores Senior creando tablas, dashboards y componentes visuales.', 
'Aplicar estilos utilizando las clases nativas de Bootstrap. Asegurar la adaptabilidad móvil de los diseños. Apoyar en tareas de depuración en JavaScript.', 
'Ganas de aprender. No usar CSS personalizado, saber estructurar con las clases base de Bootstrap. Conocimiento básico de repositorios Git.', 
350.00, 'Remoto', 'Medio tiempo', 'Estudiante de Informática o Sistemas', 'Inglés Básico', 1),

(3, 1, 'Ingeniero de Bases de Datos Oracle/MySQL', 'Únete a nuestro equipo de infraestructura de datos gestionando y optimizando arquitecturas de alta disponibilidad.', 
'Normalización de bases de datos. Creación de diagramas relacionales. Mantenimiento y backups de servidores Oracle y MySQL.', 
'Experiencia de 3+ años como DBA. Conocimiento profundo de SQL avanzado. Proactividad.', 
1800.00, 'Híbrido', 'Por Proyecto', 'Ingeniería en Sistemas Computacionales', 'Inglés Avanzado', 3),

(2, 1, 'Desarrollador de Hardware (Arduino)', 'Buscamos un desarrollador innovador para la creación de prototipos funcionales de rastreo y seguridad (Internet de las Cosas - IoT).', 
'Programar microcontroladores Arduino Uno. Integrar sensores, buzzers y motores. Diseñar esquemas lógicos y de alimentación (ej. paneles solares).', 
'Experiencia programando en C/C++ para Arduino. Conocimientos sólidos de electrónica básica y compuertas lógicas.', 
900.00, 'Presencial', 'Tiempo Completo', 'Ingeniería Mecatrónica o Sistemas', 'Inglés Intermedio', 2);

-- =========================================
-- VACANTES ADICIONALES PARA PRUEBAS MASIVAS
-- Requiere MySQL 8+ por el uso de WITH RECURSIVE.
-- Genera 100 vacantes extra con fechas variadas para probar filtros.
-- =========================================
INSERT INTO Vacantes (
    id_empresa_fk,
    id_categoria_fk,
    titulo_puesto,
    descripcion_puesto,
    responsabilidades,
    requisitos,
    salario_offrecido,
    modalidad,
    tipo_contrato,
    educacion,
    idiomas,
    id_municipio_fk,
    fecha_publicacion
)
WITH RECURSIVE secuencia AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1
    FROM secuencia
    WHERE n < 100
)
SELECT
    CASE MOD(n, 3)
        WHEN 1 THEN 1
        WHEN 2 THEN 2
        ELSE 3
    END AS id_empresa_fk,
    CASE MOD(n, 6)
        WHEN 1 THEN 1
        WHEN 2 THEN 2
        WHEN 3 THEN 3
        WHEN 4 THEN 4
        WHEN 5 THEN 5
        ELSE 6
    END AS id_categoria_fk,
    CONCAT(
        CASE MOD(n, 5)
            WHEN 1 THEN 'Practicante'
            WHEN 2 THEN 'Junior'
            WHEN 3 THEN 'Semi-senior'
            WHEN 4 THEN 'Senior'
            ELSE 'Especialista'
        END,
        ' ',
        CASE MOD(n, 6)
            WHEN 1 THEN 'Desarrollador Web'
            WHEN 2 THEN 'Analista Administrativo'
            WHEN 3 THEN 'Ejecutivo de Ventas'
            WHEN 4 THEN 'Asesor de Soporte'
            WHEN 5 THEN 'Disenador UI'
            ELSE 'Tecnico de Redes'
        END,
        ' #',
        LPAD(n, 3, '0')
    ) AS titulo_puesto,
    CASE MOD(n, 6)
        WHEN 1 THEN 'Vacante orientada a desarrollo web, mantenimiento de modulos y mejora continua de la plataforma.'
        WHEN 2 THEN 'Oportunidad para apoyar operaciones administrativas, reporteria y seguimiento de procesos internos.'
        WHEN 3 THEN 'Rol comercial para prospeccion, cierres y seguimiento de cartera de clientes empresariales.'
        WHEN 4 THEN 'Posicion enfocada en soporte a usuarios, resolucion de incidencias y atencion multicanal.'
        WHEN 5 THEN 'Proyecto para crear interfaces, prototipos y piezas visuales para productos digitales.'
        ELSE 'Puesto tecnico para apoyar configuracion de redes, conectividad y mantenimiento preventivo.'
    END AS descripcion_puesto,
    CASE MOD(n, 6)
        WHEN 1 THEN 'Implementar mejoras, corregir errores, documentar cambios y coordinar pruebas con el equipo.'
        WHEN 2 THEN 'Preparar reportes, validar datos, organizar expedientes y dar seguimiento a solicitudes.'
        WHEN 3 THEN 'Buscar oportunidades, presentar propuestas, negociar condiciones y actualizar CRM.'
        WHEN 4 THEN 'Registrar tickets, escalar casos, orientar al usuario y medir tiempos de respuesta.'
        WHEN 5 THEN 'Construir wireframes, ajustar componentes visuales y colaborar con desarrollo frontend.'
        ELSE 'Configurar equipos, monitorear enlaces, documentar topologias y atender incidencias tecnicas.'
    END AS responsabilidades,
    CASE MOD(n, 6)
        WHEN 1 THEN 'Conocimientos en JavaScript, Node.js, SQL y control de versiones. Capacidad de aprendizaje.'
        WHEN 2 THEN 'Orden, manejo de hojas de calculo, seguimiento de tareas y comunicacion efectiva.'
        WHEN 3 THEN 'Experiencia en ventas, negociacion, servicio al cliente y manejo de metas.'
        WHEN 4 THEN 'Paciencia, criterio tecnico, atencion al detalle y buena comunicacion escrita.'
        WHEN 5 THEN 'Manejo de Figma, criterios de UX, composicion visual y pensamiento creativo.'
        ELSE 'Bases de redes, soporte tecnico, cableado estructurado y uso de herramientas de diagnostico.'
    END AS requisitos,
    CASE MOD(n, 6)
        WHEN 1 THEN 550 + (n * 8)
        WHEN 2 THEN 500 + (n * 6)
        WHEN 3 THEN 600 + (n * 7)
        WHEN 4 THEN 520 + (n * 5)
        WHEN 5 THEN 650 + (n * 9)
        ELSE 700 + (n * 10)
    END AS salario_offrecido,
    CASE MOD(n, 4)
        WHEN 1 THEN 'Remoto'
        WHEN 2 THEN 'Hibrido'
        ELSE 'Presencial'
    END AS modalidad,
    CASE MOD(n, 5)
        WHEN 1 THEN 'Tiempo Completo'
        WHEN 2 THEN 'Medio tiempo'
        WHEN 3 THEN 'Por Proyecto'
        WHEN 4 THEN 'Tiempo Completo'
        ELSE 'Tiempo Completo'
    END AS tipo_contrato,
    CASE MOD(n, 6)
        WHEN 1 THEN 'Ingenieria en Sistemas'
        WHEN 2 THEN 'Administracion de Empresas'
        WHEN 3 THEN 'Mercadeo o Ventas'
        WHEN 4 THEN 'Bachillerato'
        WHEN 5 THEN 'Diseno Grafico'
        ELSE 'Tecnico en Redes'
    END AS educacion,
    CASE MOD(n, 4)
        WHEN 1 THEN 'Ingles Basico'
        WHEN 2 THEN 'Ingles Intermedio'
        WHEN 3 THEN 'Ingles Avanzado'
        ELSE 'Espanol'
    END AS idiomas,
    MOD(n - 1, 8) + 1 AS id_municipio_fk,
    CASE
        WHEN n <= 10 THEN DATE_SUB(NOW(), INTERVAL ((n - 1) * 2) HOUR)
        WHEN n <= 25 THEN DATE_SUB(NOW(), INTERVAL n DAY)
        WHEN n <= 50 THEN DATE_SUB(NOW(), INTERVAL (n + 7) DAY)
        WHEN n <= 75 THEN DATE_SUB(NOW(), INTERVAL (n + 20) DAY)
        ELSE DATE_SUB(NOW(), INTERVAL (n + 45) DAY)
    END AS fecha_publicacion
FROM secuencia;

-- Habilidades de Usuarios
INSERT INTO Usuario_Habilidades (id_usuario_fk, id_habilidad_fk) VALUES
(1, 1),
(1, 3),
(1, 4),
(1, 7),
(2, 3),
(2, 8);

-- Postulaciones
INSERT INTO Postulaciones (id_usuario_fk, id_vacante_fk, id_estado_fk) VALUES
(1, 1, 2),
(1, 6, 1),
(2, 4, 3);

-- Valoraciones de Empresas
INSERT INTO Valoraciones_Empresas (
    id_usuario_fk, id_empresa_fk, puntuacion, comentario
) VALUES
(1, 1, 5, 'Excelente ambiente laboral y me enseñaron mucho sobre optimización de código y uso de herramientas en la nube.'),
(2, 2, 4, 'Muy buenos proyectos de diseño, aunque el ritmo de trabajo a veces es acelerado.');
-- ========================================
-- MIGRACION: VERIFICACION DE EMAIL
-- ========================================
ALTER TABLE Usuarios
ADD COLUMN email_verificado TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE Empresas
ADD COLUMN email_verificado TINYINT(1) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS email_verifications (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'usuario',
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    invalidado TINYINT(1) NOT NULL DEFAULT 0,
    motivo VARCHAR(30) NOT NULL DEFAULT 'registro',
    PRIMARY KEY (id),
    UNIQUE KEY uq_email_verifications_token (token),
    KEY idx_email_verifications_usuario (usuario_id, tipo_usuario),
    KEY idx_email_verifications_created (created_at)
);

-- ========================================
-- CUENTAS DE PRUEBA LISTAS PARA USAR
-- ========================================
UPDATE Usuarios
SET email_verificado = 1;

UPDATE Empresas
SET email_verificado = 1;
