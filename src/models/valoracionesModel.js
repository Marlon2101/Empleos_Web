import { pool } from "../config/db.js";

export const getEmpresasValorables = async (id_usuario = null) => {
  const [rows] = await pool.query(
    `
    SELECT
      e.id_empresa,
      e.nombre_comercial,
      e.descripcion_empresa,
      e.sitio_web,
      e.correo_electronico,
      m.nombre_municipio,
      d.nombre_departamento,
      ROUND(AVG(vr.puntuacion), 2) AS promedio,
      COUNT(vr.id_valoracion) AS total_valoraciones,
      CASE
        WHEN ? IS NULL THEN 0
        WHEN EXISTS (
          SELECT 1
          FROM Postulaciones p
          INNER JOIN Vacantes vac ON p.id_vacante_fk = vac.id_vacante
          WHERE p.id_usuario_fk = ? AND vac.id_empresa_fk = e.id_empresa
        ) THEN 1
        ELSE 0
      END AS puede_valorar,
      CASE
        WHEN ? IS NULL THEN 0
        WHEN EXISTS (
          SELECT 1
          FROM Valoraciones_Empresas ve
          WHERE ve.id_usuario_fk = ? AND ve.id_empresa_fk = e.id_empresa
        ) THEN 1
        ELSE 0
      END AS ya_valoro
    FROM Empresas e
    LEFT JOIN Municipios m ON e.id_municipio_fk = m.id_municipio
    LEFT JOIN Departamentos d ON m.id_departamento_fk = d.id_departamento
    LEFT JOIN Valoraciones_Empresas vr ON vr.id_empresa_fk = e.id_empresa
    GROUP BY
      e.id_empresa,
      e.nombre_comercial,
      e.descripcion_empresa,
      e.sitio_web,
      e.correo_electronico,
      m.nombre_municipio,
      d.nombre_departamento
    ORDER BY
      puede_valorar DESC,
      ya_valoro ASC,
      e.nombre_comercial ASC
    `,
    [id_usuario, id_usuario, id_usuario, id_usuario]
  );

  return rows;
};

export const getValoracionesByEmpresa = async (id_empresa) => {
  const [rows] = await pool.query(
    `
    SELECT
      v.id_valoracion,
      v.id_usuario_fk,
      CONCAT(u.nombres, ' ', u.apellidos) AS nombre_usuario,
      v.id_empresa_fk,
      v.puntuacion,
      v.comentario,
      v.fecha_valoracion
    FROM Valoraciones_Empresas v
    INNER JOIN Usuarios u ON v.id_usuario_fk = u.id_usuario
    WHERE v.id_empresa_fk = ?
    ORDER BY v.id_valoracion DESC
    `,
    [id_empresa]
  );

  return rows;
};

export const getValoracionUsuarioEmpresa = async (id_usuario, id_empresa) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_valoracion,
      id_usuario_fk,
      id_empresa_fk,
      puntuacion,
      comentario,
      fecha_valoracion
    FROM Valoraciones_Empresas
    WHERE id_usuario_fk = ? AND id_empresa_fk = ?
    LIMIT 1
    `,
    [id_usuario, id_empresa]
  );

  return rows[0] || null;
};

export const getEmpresaValoracionDetalle = async (id_empresa, id_usuario = null) => {
  const [rows] = await pool.query(
    `
    SELECT
      e.id_empresa,
      e.nombre_comercial,
      e.descripcion_empresa,
      e.sitio_web,
      e.correo_electronico,
      m.nombre_municipio,
      d.nombre_departamento,
      ROUND(AVG(vr.puntuacion), 2) AS promedio,
      COUNT(vr.id_valoracion) AS total_valoraciones,
      CASE
        WHEN ? IS NULL THEN 0
        WHEN EXISTS (
          SELECT 1
          FROM Postulaciones p
          INNER JOIN Vacantes vac ON p.id_vacante_fk = vac.id_vacante
          WHERE p.id_usuario_fk = ? AND vac.id_empresa_fk = e.id_empresa
        ) THEN 1
        ELSE 0
      END AS puede_valorar,
      CASE
        WHEN ? IS NULL THEN 0
        WHEN EXISTS (
          SELECT 1
          FROM Valoraciones_Empresas ve
          WHERE ve.id_usuario_fk = ? AND ve.id_empresa_fk = e.id_empresa
        ) THEN 1
        ELSE 0
      END AS ya_valoro
    FROM Empresas e
    LEFT JOIN Municipios m ON e.id_municipio_fk = m.id_municipio
    LEFT JOIN Departamentos d ON m.id_departamento_fk = d.id_departamento
    LEFT JOIN Valoraciones_Empresas vr ON vr.id_empresa_fk = e.id_empresa
    WHERE e.id_empresa = ?
    GROUP BY
      e.id_empresa,
      e.nombre_comercial,
      e.descripcion_empresa,
      e.sitio_web,
      e.correo_electronico,
      m.nombre_municipio,
      d.nombre_departamento
    LIMIT 1
    `,
    [id_usuario, id_usuario, id_usuario, id_usuario, id_empresa]
  );

  return rows[0];
};

export const getValoracionesUsuario = async (id_usuario) => {
  const [rows] = await pool.query(
    `
    SELECT
      v.id_valoracion,
      v.id_empresa_fk,
      e.nombre_comercial,
      v.puntuacion,
      v.comentario,
      v.fecha_valoracion
    FROM Valoraciones_Empresas v
    INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
    WHERE v.id_usuario_fk = ?
    ORDER BY v.id_valoracion DESC
    `,
    [id_usuario]
  );

  return rows;
};

export const existeValoracionUsuarioEmpresa = async (id_usuario, id_empresa) => {
  const [rows] = await pool.query(
    `
    SELECT id_valoracion
    FROM Valoraciones_Empresas
    WHERE id_usuario_fk = ? AND id_empresa_fk = ?
    LIMIT 1
    `,
    [id_usuario, id_empresa]
  );

  return rows[0];
};

export const usuarioPuedeValorarEmpresa = async (id_usuario, id_empresa) => {
  const [rows] = await pool.query(
    `
    SELECT p.id_postulacion
    FROM Postulaciones p
    INNER JOIN Vacantes v ON p.id_vacante_fk = v.id_vacante
    WHERE p.id_usuario_fk = ? AND v.id_empresa_fk = ?
    LIMIT 1
    `,
    [id_usuario, id_empresa]
  );

  return Boolean(rows[0]);
};

export const createValoracion = async (data) => {
  const {
    id_usuario_fk,
    id_empresa_fk,
    puntuacion,
    comentario
  } = data;

  const [result] = await pool.query(
    `
    INSERT INTO Valoraciones_Empresas
    (
      id_usuario_fk,
      id_empresa_fk,
      puntuacion,
      comentario
    )
    VALUES (?, ?, ?, ?)
    `,
    [id_usuario_fk, id_empresa_fk, puntuacion, comentario]
  );

  return {
    id_valoracion: result.insertId,
    id_usuario_fk,
    id_empresa_fk,
    puntuacion,
    comentario
  };
};

export const updateValoracionUsuarioEmpresa = async (id_usuario, id_empresa, data) => {
  const {
    puntuacion,
    comentario
  } = data;

  const [result] = await pool.query(
    `
    UPDATE Valoraciones_Empresas
    SET
      puntuacion = ?,
      comentario = ?,
      fecha_valoracion = CURRENT_TIMESTAMP
    WHERE id_usuario_fk = ? AND id_empresa_fk = ?
    `,
    [puntuacion, comentario, id_usuario, id_empresa]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return await getValoracionUsuarioEmpresa(id_usuario, id_empresa);
};

export const getPromedioEmpresa = async (id_empresa) => {
  const [[row]] = await pool.query(
    `
    SELECT
      ROUND(AVG(puntuacion), 2) AS promedio,
      COUNT(*) AS total_valoraciones
    FROM Valoraciones_Empresas
    WHERE id_empresa_fk = ?
    `,
    [id_empresa]
  );

  return row;
};

