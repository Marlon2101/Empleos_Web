import { pool } from "../config/db.js";

export const getAllUser = async () => {
  const [rows] = await pool.query(`
    SELECT
      id_usuario,
      nombres,
      apellidos,
      correo_electronico,
      telefono,
      id_municipio_fk,
      resumen_profesional
    FROM Usuarios
  `);

  return rows;
};

export const getById = async (id) => {
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
    [id]
  );

  return rows[0];
};

export const createUser = async (user) => {
  const {
    nombres,
    apellidos,
    correo_electronico,
    contrasena,
    telefono,
    id_municipio_fk,
    resumen_profesional
  } = user;

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
    telefono,
    id_municipio_fk,
    resumen_profesional
  };
};

export const updateUser = async (id, user) => {
  const {
    nombres,
    apellidos,
    correo_electronico,
    contrasena,
    telefono,
    id_municipio_fk,
    resumen_profesional
  } = user;

  const [result] = await pool.query(
    `
    UPDATE Usuarios
    SET
      nombres = ?,
      apellidos = ?,
      correo_electronico = ?,
      contrasena = ?,
      telefono = ?,
      id_municipio_fk = ?,
      resumen_profesional = ?
    WHERE id_usuario = ?
    `,
    [
      nombres,
      apellidos,
      correo_electronico,
      contrasena,
      telefono,
      id_municipio_fk,
      resumen_profesional,
      id
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return {
    id_usuario: Number(id),
    nombres,
    apellidos,
    correo_electronico,
    telefono,
    id_municipio_fk,
    resumen_profesional
  };
};

export const deleteUser = async (id) => {
  const usuario = await getById(id);

  if (!usuario) {
    return null;
  }

  await pool.query(
    `
    DELETE FROM Usuarios
    WHERE id_usuario = ?
    `,
    [id]
  );

  return usuario;
};