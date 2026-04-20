import { pool } from "../config/db.js";
import { ensureEmailVerificationSchema } from "./usuarioModel.js";

let companyProfileSchemaReadyPromise = null;

const ensureEmpresaPerfilSchema = async () => {
  if (companyProfileSchemaReadyPromise) {
    return companyProfileSchemaReadyPromise;
  }

  companyProfileSchemaReadyPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Empresas_Perfil_Detalle (
        id_empresa_fk INT NOT NULL,
        telefono VARCHAR(20) NULL,
        direccion VARCHAR(255) NULL,
        logo_empresa LONGTEXT NULL,
        especialidades_json LONGTEXT NULL,
        cultura_json LONGTEXT NULL,
        beneficios_json LONGTEXT NULL,
        PRIMARY KEY (id_empresa_fk),
        CONSTRAINT fk_empresas_perfil_detalle_empresa
          FOREIGN KEY (id_empresa_fk)
          REFERENCES Empresas(id_empresa)
          ON UPDATE CASCADE
          ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  })();

  return companyProfileSchemaReadyPromise;
};

export const loginUsuario = async (correo_electronico) => {
  await ensureEmailVerificationSchema();

  const [rows] = await pool.query(
    `
    SELECT
      id_usuario,
      nombres,
      apellidos,
      correo_electronico,
      contrasena,
      telefono,
      id_municipio_fk,
      resumen_profesional,
      COALESCE(email_verificado, 0) AS email_verificado
    FROM Usuarios
    WHERE correo_electronico = ?
    LIMIT 1
    `,
    [correo_electronico]
  );

  return rows[0] || null;
};

export const loginEmpresa = async (correo_electronico) => {
  await ensureEmpresaPerfilSchema();
  await ensureEmailVerificationSchema();

  const [rows] = await pool.query(
    `
    SELECT
      e.id_empresa,
      e.nombre_comercial,
      e.razon_social,
      e.sitio_web,
      e.descripcion_empresa,
      e.id_municipio_fk,
      e.correo_electronico,
      e.contrasena,
      COALESCE(e.email_verificado, 0) AS email_verificado,
      epd.telefono
    FROM Empresas e
    LEFT JOIN Empresas_Perfil_Detalle epd ON epd.id_empresa_fk = e.id_empresa
    WHERE e.correo_electronico = ?
    LIMIT 1
    `,
    [correo_electronico]
  );

  return rows[0] || null;
};

export const registerEmpresaAuth = async (empresa) => {
  const {
    nombre_comercial,
    razon_social,
    sitio_web,
    descripcion_empresa,
    id_municipio_fk,
    correo_electronico,
    contrasena,
    telefono
  } = empresa;

  await ensureEmpresaPerfilSchema();
  await ensureEmailVerificationSchema();

  const [result] = await pool.query(
    `
    INSERT INTO Empresas
    (
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      correo_electronico,
      contrasena,
      email_verificado
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `,
    [
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      correo_electronico,
      contrasena
    ]
  );

  if (telefono) {
    await pool.query(
      `
      INSERT INTO Empresas_Perfil_Detalle (id_empresa_fk, telefono)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE telefono = VALUES(telefono)
      `,
      [result.insertId, telefono]
    );
  }

  return {
    id_empresa: result.insertId,
    nombre_comercial,
    correo_electronico,
    email_verificado: 0
  };
};

export const registerUsuarioAuth = async (usuario) => {
  const {
    nombres,
    apellidos,
    correo_electronico,
    contrasena,
    telefono,
    id_municipio_fk,
    resumen_profesional
  } = usuario;

  await ensureEmailVerificationSchema();

  const [result] = await pool.query(
    `
    INSERT INTO Usuarios
    (
      nombres,
      apellidos,
      correo_electronico,
      contrasena,
      telefono,
      id_municipio_fk,
      resumen_profesional,
      email_verificado
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `,
    [
      nombres,
      apellidos,
      correo_electronico,
      contrasena,
      telefono,
      id_municipio_fk,
      resumen_profesional
    ]
  );

  return {
    id_usuario: result.insertId,
    nombres,
    apellidos,
    correo_electronico,
    email_verificado: 0
  };
};
