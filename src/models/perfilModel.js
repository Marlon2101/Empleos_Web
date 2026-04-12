import { pool } from "../config/db.js";

export const getPerfilUsuarioById = async (id_usuario) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_usuario,
      nombres,
      apellidos,
      correo_electronico,
      telefono,
      id_municipio_fk,
      resumen_profesional
    FROM Usuarios
    WHERE id_usuario = ?
    `,
    [id_usuario]
  );

  return rows[0];
};

export const updatePerfilUsuarioById = async (id_usuario, data) => {
  const {
    nombres,
    apellidos,
    telefono,
    id_municipio_fk,
    resumen_profesional
  } = data;

  const [result] = await pool.query(
    `
    UPDATE Usuarios
    SET
      nombres = ?,
      apellidos = ?,
      telefono = ?,
      id_municipio_fk = ?,
      resumen_profesional = ?
    WHERE id_usuario = ?
    `,
    [
      nombres,
      apellidos,
      telefono,
      id_municipio_fk,
      resumen_profesional,
      id_usuario
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return await getPerfilUsuarioById(id_usuario);
};

export const getPerfilEmpresaById = async (id_empresa) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_empresa,
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      correo_electronico
    FROM Empresas
    WHERE id_empresa = ?
    `,
    [id_empresa]
  );

  return rows[0];
};

export const updatePerfilEmpresaById = async (id_empresa, data) => {
  const {
    nombre_comercial,
    razon_social,
    sitio_web,
    descripcion_empresa,
    id_municipio_fk
  } = data;

  const [result] = await pool.query(
    `
    UPDATE Empresas
    SET
      nombre_comercial = ?,
      razon_social = ?,
      sitio_web = ?,
      descripcion_empresa = ?,
      id_municipio_fk = ?
    WHERE id_empresa = ?
    `,
    [
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      id_empresa
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return await getPerfilEmpresaById(id_empresa);
};