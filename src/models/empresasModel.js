import { pool } from "../config/db.js";

export const getAllEmpresas = async () => {
  const [rows] = await pool.query(`
    SELECT
      id_empresa,
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk
    FROM Empresas
    ORDER BY id_empresa DESC
  `);

  return rows;
};

export const getEmpresaById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_empresa,
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk
    FROM Empresas
    WHERE id_empresa = ?
    `,
    [id]
  );

  return rows[0];
};

export const createEmpresa = async (empresa) => {
  const {
    nombre_comercial,
    razon_social,
    sitio_web,
    descripcion_empresa,
    id_municipio_fk
  } = empresa;

  const [result] = await pool.query(
    `
    INSERT INTO Empresas
    (
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk
    ]
  );

  return {
    id_empresa: result.insertId,
    nombre_comercial,
    razon_social,
    sitio_web,
    descripcion_empresa,
    id_municipio_fk
  };
};

export const updateEmpresa = async (id, empresa) => {
  const {
    nombre_comercial,
    razon_social,
    sitio_web,
    descripcion_empresa,
    id_municipio_fk
  } = empresa;

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
      id
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return {
    id_empresa: Number(id),
    nombre_comercial,
    razon_social,
    sitio_web,
    descripcion_empresa,
    id_municipio_fk
  };
};

export const deleteEmpresa = async (id) => {
  const empresa = await getEmpresaById(id);

  if (!empresa) {
    return null;
  }

  await pool.query(
    `
    DELETE FROM Empresas
    WHERE id_empresa = ?
    `,
    [id]
  );

  return empresa;
};