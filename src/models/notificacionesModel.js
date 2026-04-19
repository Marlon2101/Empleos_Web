import { pool } from "../config/db.js";

let schemaReadyPromise = null;

const ensureNotificacionesSchema = async () => {
  if (schemaReadyPromise) {
    return schemaReadyPromise;
  }

  schemaReadyPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Notificaciones (
        id_notificacion INT NOT NULL AUTO_INCREMENT,
        tipo_usuario VARCHAR(20) NOT NULL,
        id_destinatario INT NOT NULL,
        titulo VARCHAR(150) NOT NULL,
        mensaje TEXT NOT NULL,
        tipo_notificacion VARCHAR(60) NOT NULL DEFAULT 'sistema',
        enlace VARCHAR(255) NULL,
        metadata_json LONGTEXT NULL,
        leida TINYINT(1) NOT NULL DEFAULT 0,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id_notificacion)
      ) ENGINE=InnoDB;
    `);

    const alterStatements = [
      "ALTER TABLE Notificaciones ADD COLUMN tipo_notificacion VARCHAR(60) NOT NULL DEFAULT 'sistema'",
      "ALTER TABLE Notificaciones ADD COLUMN enlace VARCHAR(255) NULL",
      "ALTER TABLE Notificaciones ADD COLUMN metadata_json LONGTEXT NULL"
    ];

    for (const statement of alterStatements) {
      try {
        await pool.query(statement);
      } catch {
        // La columna ya existe en entornos donde la tabla fue creada antes.
      }
    }
  })();

  return schemaReadyPromise;
};

const parseMetadata = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const mapNotificacion = (row) => ({
  ...row,
  leida: Number(row.leida),
  metadata: parseMetadata(row.metadata_json)
});

const buildWhereFilters = (filters = {}) => {
  const clauses = [];
  const params = [];

  if (filters.tipo_notificacion) {
    clauses.push("tipo_notificacion = ?");
    params.push(filters.tipo_notificacion);
  }

  if (filters.search) {
    clauses.push("(titulo LIKE ? OR mensaje LIKE ?)");
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.leida === "0" || filters.leida === "1" || filters.leida === 0 || filters.leida === 1) {
    clauses.push("leida = ?");
    params.push(Number(filters.leida));
  }

  return { clauses, params };
};

export const getNotificaciones = async (tipo_usuario, id_destinatario, filters = {}) => {
  await ensureNotificacionesSchema();

  const { clauses, params } = buildWhereFilters(filters);
  const limit = Number(filters.limit) > 0 ? Number(filters.limit) : null;

  let query = `
    SELECT
      id_notificacion,
      tipo_usuario,
      id_destinatario,
      titulo,
      mensaje,
      tipo_notificacion,
      enlace,
      metadata_json,
      leida,
      fecha_creacion
    FROM Notificaciones
    WHERE tipo_usuario = ? AND id_destinatario = ?
  `;

  const values = [tipo_usuario, id_destinatario, ...params];

  if (clauses.length) {
    query += ` AND ${clauses.join(" AND ")}`;
  }

  query += " ORDER BY id_notificacion DESC";

  if (limit) {
    query += " LIMIT ?";
    values.push(limit);
  }

  const [rows] = await pool.query(query, values);
  return rows.map(mapNotificacion);
};

export const getResumenNotificaciones = async (tipo_usuario, id_destinatario) => {
  await ensureNotificacionesSchema();

  const [totales] = await pool.query(
    `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN leida = 0 THEN 1 ELSE 0 END) AS no_leidas,
      SUM(CASE WHEN tipo_notificacion = 'postulacion' THEN 1 ELSE 0 END) AS postulaciones,
      SUM(CASE WHEN tipo_notificacion = 'estado' THEN 1 ELSE 0 END) AS cambios_estado,
      SUM(CASE WHEN tipo_notificacion = 'sistema' THEN 1 ELSE 0 END) AS sistema
    FROM Notificaciones
    WHERE tipo_usuario = ? AND id_destinatario = ?
    `,
    [tipo_usuario, id_destinatario]
  );

  const ultimas = await getNotificaciones(tipo_usuario, id_destinatario, { limit: 5 });

  return {
    total: Number(totales[0]?.total || 0),
    no_leidas: Number(totales[0]?.no_leidas || 0),
    postulaciones: Number(totales[0]?.postulaciones || 0),
    cambios_estado: Number(totales[0]?.cambios_estado || 0),
    sistema: Number(totales[0]?.sistema || 0),
    ultimas
  };
};

export const crearNotificacion = async (data) => {
  await ensureNotificacionesSchema();

  const {
    tipo_usuario,
    id_destinatario,
    titulo,
    mensaje,
    tipo_notificacion = "sistema",
    enlace = null,
    metadata = null
  } = data;

  const [result] = await pool.query(
    `
    INSERT INTO Notificaciones
    (
      tipo_usuario,
      id_destinatario,
      titulo,
      mensaje,
      tipo_notificacion,
      enlace,
      metadata_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      tipo_usuario,
      id_destinatario,
      titulo,
      mensaje,
      tipo_notificacion,
      enlace,
      metadata ? JSON.stringify(metadata) : null
    ]
  );

  return await getNotificacionById(result.insertId);
};

export const crearNotificacionParaTodosLosUsuarios = async (payload) => {
  await ensureNotificacionesSchema();

  const [usuarios] = await pool.query("SELECT id_usuario FROM Usuarios");

  if (!usuarios.length) {
    return [];
  }

  const values = usuarios.map((usuario) => [
    "usuario",
    usuario.id_usuario,
    payload.titulo,
    payload.mensaje,
    payload.tipo_notificacion || "sistema",
    payload.enlace || null,
    payload.metadata ? JSON.stringify(payload.metadata) : null
  ]);

  await pool.query(
    `
    INSERT INTO Notificaciones
    (
      tipo_usuario,
      id_destinatario,
      titulo,
      mensaje,
      tipo_notificacion,
      enlace,
      metadata_json
    )
    VALUES ?
    `,
    [values]
  );

  return true;
};

export const getNotificacionById = async (id_notificacion) => {
  await ensureNotificacionesSchema();

  const [rows] = await pool.query(
    `
    SELECT
      id_notificacion,
      tipo_usuario,
      id_destinatario,
      titulo,
      mensaje,
      tipo_notificacion,
      enlace,
      metadata_json,
      leida,
      fecha_creacion
    FROM Notificaciones
    WHERE id_notificacion = ?
    LIMIT 1
    `,
    [id_notificacion]
  );

  return rows[0] ? mapNotificacion(rows[0]) : null;
};

const updateLeidaState = async (id_notificacion, tipo_usuario, id_destinatario, leida) => {
  await ensureNotificacionesSchema();

  const [result] = await pool.query(
    `
    UPDATE Notificaciones
    SET leida = ?
    WHERE id_notificacion = ? AND tipo_usuario = ? AND id_destinatario = ?
    `,
    [leida, id_notificacion, tipo_usuario, id_destinatario]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return await getNotificacionById(id_notificacion);
};

export const marcarNotificacionLeida = async (id_notificacion, tipo_usuario, id_destinatario) =>
  updateLeidaState(id_notificacion, tipo_usuario, id_destinatario, 1);

export const marcarNotificacionNoLeida = async (id_notificacion, tipo_usuario, id_destinatario) =>
  updateLeidaState(id_notificacion, tipo_usuario, id_destinatario, 0);

export const marcarTodasLeidas = async (tipo_usuario, id_destinatario) => {
  await ensureNotificacionesSchema();

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

export const eliminarNotificacion = async (id_notificacion, tipo_usuario, id_destinatario) => {
  await ensureNotificacionesSchema();

  const notificacion = await getNotificacionById(id_notificacion);

  if (!notificacion || notificacion.tipo_usuario !== tipo_usuario || Number(notificacion.id_destinatario) !== Number(id_destinatario)) {
    return null;
  }

  await pool.query(
    `
    DELETE FROM Notificaciones
    WHERE id_notificacion = ? AND tipo_usuario = ? AND id_destinatario = ?
    `,
    [id_notificacion, tipo_usuario, id_destinatario]
  );

  return notificacion;
};

