import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

export const loginUsuario = async (correo_electronico) => {
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
      resumen_profesional
    FROM Usuarios
    WHERE correo_electronico = ?
    `,
    [correo_electronico]
  );

  return rows[0];
};

export const loginEmpresa = async (correo_electronico) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_empresa,
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      correo_electronico,
      contrasena
    FROM Empresas
    WHERE correo_electronico = ?
    `,
    [correo_electronico]
  );

  return rows[0];
};

export const registerEmpresaAuth = async (empresa) => {
  const {
    nombre_comercial,
    razon_social,
    sitio_web,
    descripcion_empresa,
    id_municipio_fk,
    correo_electronico,
    contrasena
  } = empresa;

  const hashedPassword = await bcrypt.hash(contrasena, 10);

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
      contrasena
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      correo_electronico,
      hashedPassword
    ]
  );

  return {
    id_empresa: result.insertId,
    nombre_comercial,
    razon_social,
    sitio_web,
    descripcion_empresa,
    id_municipio_fk,
    correo_electronico
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

  const hashedPassword = await bcrypt.hash(contrasena, 10);

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
      resumen_profesional
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      nombres,
      apellidos,
      correo_electronico,
      hashedPassword,
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
    telefono,
    id_municipio_fk,
    resumen_profesional
  };
};