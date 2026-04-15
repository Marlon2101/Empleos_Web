import { pool } from "../config/db.js";

export const getAllPostulaciones = async () => {
  const [rows] = await pool.query(`
    SELECT
      p.id_postulacion,
      p.id_usuario_fk,
      CONCAT(u.nombres, ' ', u.apellidos) AS nombre_usuario,
      p.id_vacante_fk,
      v.titulo_puesto,
      p.id_estado_fk,
      ep.nombre_estado,
      p.fecha_postulacion
    FROM Postulaciones p
    INNER JOIN Usuarios u ON p.id_usuario_fk = u.id_usuario
    INNER JOIN Vacantes v ON p.id_vacante_fk = v.id_vacante
    INNER JOIN Estados_Postulacion ep ON p.id_estado_fk = ep.id_estado
    ORDER BY p.id_postulacion DESC
  `);

  return rows;
};

export const getPostulacionesByUsuario = async (id_usuario) => {
  const [rows] = await pool.query(
    `
    SELECT
      p.id_postulacion,
      p.id_usuario_fk,
      p.id_vacante_fk,
      v.titulo_puesto,
      e.nombre_comercial,
      p.id_estado_fk,
      ep.nombre_estado,
      p.fecha_postulacion
    FROM Postulaciones p
    INNER JOIN Vacantes v ON p.id_vacante_fk = v.id_vacante
    INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
    INNER JOIN Estados_Postulacion ep ON p.id_estado_fk = ep.id_estado
    WHERE p.id_usuario_fk = ?
    ORDER BY p.id_postulacion DESC
    `,
    [id_usuario]
  );

  return rows;
};

export const getPostulacionesByVacante = async (id_vacante) => {
  const [rows] = await pool.query(
    `
    SELECT
      p.id_postulacion,
      p.id_usuario_fk,
      CONCAT(u.nombres, ' ', u.apellidos) AS nombre_usuario,
      u.correo_electronico,
      u.telefono,
      p.id_vacante_fk,
      p.id_estado_fk,
      ep.nombre_estado,
      p.fecha_postulacion
    FROM Postulaciones p
    INNER JOIN Usuarios u ON p.id_usuario_fk = u.id_usuario
    INNER JOIN Estados_Postulacion ep ON p.id_estado_fk = ep.id_estado
    WHERE p.id_vacante_fk = ?
    ORDER BY p.id_postulacion DESC
    `,
    [id_vacante]
  );

  return rows;
};

export const getPostulacionById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      p.id_postulacion,
      p.id_usuario_fk,
      p.id_vacante_fk,
      p.id_estado_fk,
      p.fecha_postulacion
    FROM Postulaciones p
    WHERE p.id_postulacion = ?
    `,
    [id]
  );

  return rows[0];
};

export const createPostulacion = async (postulacion) => {
  const {
    id_usuario_fk,
    id_vacante_fk,
    id_estado_fk
  } = postulacion;

  const [result] = await pool.query(
    `
    INSERT INTO Postulaciones
    (
      id_usuario_fk,
      id_vacante_fk,
      id_estado_fk
    )
    VALUES (?, ?, ?)
    `,
    [id_usuario_fk, id_vacante_fk, id_estado_fk]
  );

  return {
    id_postulacion: result.insertId,
    id_usuario_fk,
    id_vacante_fk,
    id_estado_fk
  };
};

export const updatePostulacion = async (id, postulacion) => {
  const { id_estado_fk } = postulacion;

  const [result] = await pool.query(
    `
    UPDATE Postulaciones
    SET
      id_estado_fk = ?
    WHERE id_postulacion = ?
    `,
    [id_estado_fk, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return await getPostulacionById(id);
};

export const deletePostulacion = async (id) => {
  const postulacion = await getPostulacionById(id);

  if (!postulacion) {
    return null;
  }

  await pool.query(
    `
    DELETE FROM Postulaciones
    WHERE id_postulacion = ?
    `,
    [id]
  );

  return postulacion;
};

export const existePostulacion = async (id_usuario_fk, id_vacante_fk) => {
  const [rows] = await pool.query(
    `
    SELECT id_postulacion
    FROM Postulaciones
    WHERE id_usuario_fk = ? AND id_vacante_fk = ?
    LIMIT 1
    `,
    [id_usuario_fk, id_vacante_fk]
  );

  return rows[0];
};

export const usuarioYaPostulado = async (id_usuario, id_vacante) => {
  const [rows] = await pool.query(
    `
    SELECT id_postulacion, id_estado_fk
    FROM Postulaciones
    WHERE id_usuario_fk = ? AND id_vacante_fk = ?
    LIMIT 1
    `,
    [id_usuario, id_vacante]
  );

  return rows[0];
};

export const getPostulacionesByEmpresa = async (id_empresa) => {
  const [rows] = await pool.query(
    `
    SELECT 
        p.id_postulacion, 
        p.id_estado_fk, 
        p.fecha_postulacion,
        u.nombres, 
        u.apellidos, 
        u.correo_electronico, 
        v.titulo_puesto 
    FROM Postulaciones p
    INNER JOIN Usuarios u ON p.id_usuario_fk = u.id_usuario
    INNER JOIN Vacantes v ON p.id_vacante_fk = v.id_vacante
    WHERE v.id_empresa_fk = ?
    ORDER BY p.fecha_postulacion DESC
    `, 
    [id_empresa]
  );
  
  return rows;
};

export const insertPostulacion = async (id_usuario, id_vacante) => {
    const query = `
        INSERT INTO Postulaciones (id_usuario_fk, id_vacante_fk, id_estado_fk, fecha_postulacion)
        VALUES (?, ?, 1, NOW())
    `;
    
    const [result] = await pool.query(query, [id_usuario, id_vacante]);
    return result;
};

