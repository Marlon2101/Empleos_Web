import { pool } from "../config/db.js";

let emailVerificationTablePromise = null;

export const ensureEmailVerificationTable = async () => {
  if (emailVerificationTablePromise) {
    return emailVerificationTablePromise;
  }

  emailVerificationTablePromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id INT NOT NULL AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'usuario',
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        invalidado TINYINT(1) NOT NULL DEFAULT 0,
        motivo VARCHAR(30) NOT NULL DEFAULT 'registro',
        PRIMARY KEY (id),
        UNIQUE KEY uq_email_verifications_token (token),
        KEY idx_email_verifications_usuario (usuario_id, tipo_usuario),
        KEY idx_email_verifications_created (created_at)
      ) ENGINE=InnoDB;
    `);
  })();

  return emailVerificationTablePromise;
};

export const invalidarTokensActivos = async (usuario_id, tipo_usuario) => {
  await ensureEmailVerificationTable();

  await pool.query(
    `
    UPDATE email_verifications
    SET invalidado = 1
    WHERE usuario_id = ? AND tipo_usuario = ? AND invalidado = 0
    `,
    [usuario_id, tipo_usuario]
  );
};

export const crearTokenVerificacion = async ({
  usuario_id,
  tipo_usuario,
  token,
  expires_at,
  motivo = "registro"
}) => {
  await ensureEmailVerificationTable();

  const [result] = await pool.query(
    `
    INSERT INTO email_verifications
    (
      usuario_id,
      tipo_usuario,
      token,
      expires_at,
      motivo
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [usuario_id, tipo_usuario, token, expires_at, motivo]
  );

  return {
    id: result.insertId,
    usuario_id,
    tipo_usuario,
    token,
    expires_at,
    motivo
  };
};

export const obtenerTokenVerificacion = async (token) => {
  await ensureEmailVerificationTable();

  const [rows] = await pool.query(
    `
    SELECT
      id,
      usuario_id,
      tipo_usuario,
      token,
      expires_at,
      created_at,
      invalidado,
      motivo
    FROM email_verifications
    WHERE token = ?
    LIMIT 1
    `,
    [token]
  );

  return rows[0] || null;
};

export const marcarTokenComoInvalido = async (id) => {
  await ensureEmailVerificationTable();

  await pool.query(
    "UPDATE email_verifications SET invalidado = 1 WHERE id = ?",
    [id]
  );
};

export const contarReenviosHoy = async (usuario_id, tipo_usuario) => {
  await ensureEmailVerificationTable();

  const [rows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM email_verifications
    WHERE usuario_id = ?
      AND tipo_usuario = ?
      AND motivo = 'reenvio'
      AND DATE(created_at) = CURDATE()
    `,
    [usuario_id, tipo_usuario]
  );

  return Number(rows[0]?.total || 0);
};
