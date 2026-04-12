import { pool } from "../config/db.js";

export const getHabilidadesByUsuario = async (id_usuario) => {
  const [rows] = await pool.query(
    `
    SELECT
      uh.id_habilidad_fk,
      h.nombre_habilidad
    FROM Usuario_Habilidades uh
    INNER JOIN Habilidades h ON uh.id_habilidad_fk = h.id_habilidad
    WHERE uh.id_usuario_fk = ?
    ORDER BY h.nombre_habilidad
    `,
    [id_usuario]
  );

  return rows;
};

export const existeHabilidadUsuario = async (id_usuario, id_habilidad) => {
  const [rows] = await pool.query(
    `
    SELECT id_usuario_fk, id_habilidad_fk
    FROM Usuario_Habilidades
    WHERE id_usuario_fk = ? AND id_habilidad_fk = ?
    LIMIT 1
    `,
    [id_usuario, id_habilidad]
  );

  return rows[0];
};

export const agregarHabilidadUsuario = async (id_usuario, id_habilidad) => {
  await pool.query(
    `
    INSERT INTO Usuario_Habilidades
    (
      id_usuario_fk,
      id_habilidad_fk
    )
    VALUES (?, ?)
    `,
    [id_usuario, id_habilidad]
  );

  return {
    id_usuario_fk: id_usuario,
    id_habilidad_fk: id_habilidad
  };
};

export const eliminarHabilidadUsuario = async (id_usuario, id_habilidad) => {
  const existe = await existeHabilidadUsuario(id_usuario, id_habilidad);

  if (!existe) {
    return null;
  }

  await pool.query(
    `
    DELETE FROM Usuario_Habilidades
    WHERE id_usuario_fk = ? AND id_habilidad_fk = ?
    `,
    [id_usuario, id_habilidad]
  );

  return existe;
};