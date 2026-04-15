import { pool } from "../config/db.js";

export const getAllVacantes = async () => {
  const [rows] = await pool.query(`
    SELECT
      v.id_vacante,
      v.id_empresa_fk,
      e.nombre_comercial,
      v.id_categoria_fk,
      c.nombre_categoria,
      v.titulo_puesto,
      v.descripcion_puesto,
      v.salario_offrecido,
      v.modalidad,
      v.id_municipio_fk,
      m.nombre_municipio,
      v.fecha_publicacion
    FROM Vacantes v
    INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
    INNER JOIN Categorias c ON v.id_categoria_fk = c.id_categoria
    LEFT JOIN Municipios m ON v.id_municipio_fk = m.id_municipio
    ORDER BY v.id_vacante DESC
  `);

  return rows;
};

export const getVacanteById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      v.id_vacante,
      v.id_empresa_fk,
      e.nombre_comercial,
      v.id_categoria_fk,
      c.nombre_categoria,
      v.titulo_puesto,
      v.descripcion_puesto,
      v.salario_offrecido,
      v.modalidad,
      v.id_municipio_fk,
      m.nombre_municipio,
      v.fecha_publicacion
    FROM Vacantes v
    INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
    INNER JOIN Categorias c ON v.id_categoria_fk = c.id_categoria
    LEFT JOIN Municipios m ON v.id_municipio_fk = m.id_municipio
    WHERE v.id_vacante = ?
    `,
    [id]
  );

  return rows[0];
};

export const getVacantesByEmpresa = async (id_empresa) => {
  const [rows] = await pool.query(
    `
    SELECT
      v.id_vacante,
      v.id_empresa_fk,
      v.id_categoria_fk,
      c.nombre_categoria,
      v.titulo_puesto,
      v.descripcion_puesto,
      v.salario_offrecido,
      v.modalidad,
      v.id_municipio_fk,
      m.nombre_municipio,
      v.fecha_publicacion
    FROM Vacantes v
    INNER JOIN Categorias c ON v.id_categoria_fk = c.id_categoria
    LEFT JOIN Municipios m ON v.id_municipio_fk = m.id_municipio
    WHERE v.id_empresa_fk = ?
    ORDER BY v.id_vacante DESC
    `,
    [id_empresa]
  );

  return rows;
};

export const createVacante = async (vacante) => {
  const {
    id_empresa_fk,
    id_categoria_fk,
    titulo_puesto,
    descripcion_puesto,
    salario_offrecido,
    modalidad,
    id_municipio_fk
  } = vacante;

  const [result] = await pool.query(
    `
    INSERT INTO Vacantes
    (
      id_empresa_fk,
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      salario_offrecido,
      modalidad,
      id_municipio_fk
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id_empresa_fk,
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      salario_offrecido,
      modalidad,
      id_municipio_fk
    ]
  );

  return {
    id_vacante: result.insertId,
    id_empresa_fk,
    id_categoria_fk,
    titulo_puesto,
    descripcion_puesto,
    salario_offrecido,
    modalidad,
    id_municipio_fk
  };
};

export const updateVacante = async (id, vacante) => {
  const {
    id_empresa_fk,
    id_categoria_fk,
    titulo_puesto,
    descripcion_puesto,
    salario_offrecido,
    modalidad,
    id_municipio_fk
  } = vacante;

  const [result] = await pool.query(
    `
    UPDATE Vacantes
    SET
      id_empresa_fk = ?,
      id_categoria_fk = ?,
      titulo_puesto = ?,
      descripcion_puesto = ?,
      salario_offrecido = ?,
      modalidad = ?,
      id_municipio_fk = ?
    WHERE id_vacante = ?
    `,
    [
      id_empresa_fk,
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      salario_offrecido,
      modalidad,
      id_municipio_fk,
      id
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return {
    id_vacante: Number(id),
    id_empresa_fk,
    id_categoria_fk,
    titulo_puesto,
    descripcion_puesto,
    salario_offrecido,
    modalidad,
    id_municipio_fk
  };
};

export const deleteVacante = async (id) => {
  const vacante = await getVacanteById(id);

  if (!vacante) {
    return null;
  }

  await pool.query(
    `
    DELETE FROM Vacantes
    WHERE id_vacante = ?
    `,
    [id]
  );

  return vacante;
};

export const getVacanteSimpleById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_vacante,
      id_empresa_fk
    FROM Vacantes
    WHERE id_vacante = ?
    `,
    [id]
  );

  return rows[0];
};

export const buscarVacantesConFiltros = async (filtros) => {
  const {
    titulo,
    id_categoria,
    id_municipio,
    modalidad
  } = filtros;

  let query = `
    SELECT
      v.id_vacante,
      v.id_empresa_fk,
      e.nombre_comercial,
      v.id_categoria_fk,
      c.nombre_categoria,
      v.titulo_puesto,
      v.descripcion_puesto,
      v.salario_offrecido,
      v.modalidad,
      v.id_municipio_fk,
      m.nombre_municipio,
      v.fecha_publicacion
    FROM Vacantes v
    INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
    INNER JOIN Categorias c ON v.id_categoria_fk = c.id_categoria
    LEFT JOIN Municipios m ON v.id_municipio_fk = m.id_municipio
    WHERE 1 = 1
  `;

  const params = [];

  if (titulo) {
    query += ` AND v.titulo_puesto LIKE ?`;
    params.push(`%${titulo}%`);
  }

  if (id_categoria) {
    query += ` AND v.id_categoria_fk = ?`;
    params.push(id_categoria);
  }

  if (id_municipio) {
    query += ` AND v.id_municipio_fk = ?`;
    params.push(id_municipio);
  }

  if (modalidad) {
    query += ` AND v.modalidad = ?`;
    params.push(modalidad);
  }

  query += ` ORDER BY v.id_vacante DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

// models/vacantesModel.js

export const getDetalleVacanteById = async (id) => {
    
    const query = `
        SELECT 
            v.id_vacante,
            v.titulo_puesto,
            v.descripcion_puesto,
            v.responsabilidades, /* ¡DEBEN ESTAR AQUÍ! */
            v.requisitos,        /* ¡DEBEN ESTAR AQUÍ! */
            v.salario_offrecido,
            v.modalidad,
            v.fecha_publicacion,
            c.nombre_categoria, 
            m.nombre_municipio, 
            d.nombre_departamento,
            e.nombre_comercial,
            e.descripcion_empresa,
            e.sitio_web
        FROM Vacantes v
        LEFT JOIN Categorias c ON v.id_categoria_fk = c.id_categoria
        LEFT JOIN Municipios m ON v.id_municipio_fk = m.id_municipio
        LEFT JOIN Departamentos d ON m.id_departamento_fk = d.id_departamento
        LEFT JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
        WHERE v.id_vacante = ?
    `;
    
    const [rows] = await pool.query(query, [id]);
    return rows[0];
};