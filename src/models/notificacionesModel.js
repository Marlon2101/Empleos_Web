import { pool } from "../config/db.js";

export const getNotificaciones = async (tipo_usuario, id_destinatario) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_notificacion,
      tipo_usuario,
      id_destinatario,
      titulo,
      mensaje,
      leida,
      fecha_creacion
    FROM Notificaciones
    WHERE tipo_usuario = ? AND id_destinatario = ?
    ORDER BY id_notificacion DESC
    `,
    [tipo_usuario, id_destinatario]
  );

  return rows;
};

export const crearNotificacion = async (data) => {
  const {
    tipo_usuario,
    id_destinatario,
    titulo,
    mensaje
  } = data;

  const [result] = await pool.query(
    `
    INSERT INTO Notificaciones
    (
      tipo_usuario,
      id_destinatario,
      titulo,
      mensaje
    )
    VALUES (?, ?, ?, ?)
    `,
    [tipo_usuario, id_destinatario, titulo, mensaje]
  );

  return {
    id_notificacion: result.insertId,
    tipo_usuario,
    id_destinatario,
    titulo,
    mensaje,
    leida: 0
  };
};

export const marcarNotificacionLeida = async (id_notificacion, tipo_usuario, id_destinatario) => {
  const [result] = await pool.query(
    `
    UPDATE Notificaciones
    SET leida = 1
    WHERE id_notificacion = ? AND tipo_usuario = ? AND id_destinatario = ?
    `,
    [id_notificacion, tipo_usuario, id_destinatario]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await pool.query(
    `
    SELECT
      id_notificacion,
      tipo_usuario,
      id_destinatario,
      titulo,
      mensaje,
      leida,
      fecha_creacion
    FROM Notificaciones
    WHERE id_notificacion = ?
    `,
    [id_notificacion]
  );

  return rows[0];
};

export const marcarTodasLeidas = async (tipo_usuario, id_destinatario) => {
  await pool.query(
    `
    UPDATE Notificaciones
    SET leida = 1
    WHERE tipo_usuario = ? AND id_destinatario = ?
    `,
    [tipo_usuario, id_destinatario]
  );

  return true;
};