import { pool } from "../config/db.js";

export const getDepartamentos = async () => {
  const [rows] = await pool.query(`
    SELECT id_departamento, nombre_departamento
    FROM Departamentos
    ORDER BY nombre_departamento
  `);

  return rows;
};

export const getMunicipios = async () => {
  const [rows] = await pool.query(`
    SELECT id_municipio, id_departamento_fk, nombre_municipio
    FROM Municipios
    ORDER BY nombre_municipio
  `);

  return rows;
};

export const getMunicipiosByDepartamento = async (id_departamento) => {
  const [rows] = await pool.query(
    `
    SELECT id_municipio, id_departamento_fk, nombre_municipio
    FROM Municipios
    WHERE id_departamento_fk = ?
    ORDER BY nombre_municipio
    `,
    [id_departamento]
  );

  return rows;
};

export const getCategorias = async () => {
  const [rows] = await pool.query(`
    SELECT id_categoria, nombre_categoria
    FROM Categorias
    ORDER BY nombre_categoria
  `);

  return rows;
};

export const getHabilidades = async () => {
  const [rows] = await pool.query(`
    SELECT id_habilidad, nombre_habilidad
    FROM Habilidades
    ORDER BY nombre_habilidad
  `);

  return rows;
};

export const getEstadosPostulacion = async () => {
  const [rows] = await pool.query(`
    SELECT id_estado, nombre_estado
    FROM Estados_Postulacion
    ORDER BY id_estado
  `);

  return rows;
};