import { pool } from "../config/db.js";

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
