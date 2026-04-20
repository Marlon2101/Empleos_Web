import { pool } from "../config/db.js";

let schemaReadyPromise = null;

const ensureSchema = async () => {
  if (schemaReadyPromise) {
    return schemaReadyPromise;
  }

  schemaReadyPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Resenas_Postulantes (
        id_resena INT NOT NULL AUTO_INCREMENT,
        id_empresa_fk INT NOT NULL,
        id_usuario_fk INT NOT NULL,
        id_postulacion_fk INT NOT NULL,
        puntuacion INT NOT NULL,
        comentario TEXT NOT NULL,
        etiquetas_json LONGTEXT NULL,
        fecha_resena DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id_resena),
        UNIQUE KEY uq_resena_postulacion (id_postulacion_fk),
        CONSTRAINT chk_resena_postulante_puntuacion CHECK (puntuacion BETWEEN 1 AND 5),
        CONSTRAINT fk_resena_postulante_empresa
          FOREIGN KEY (id_empresa_fk)
          REFERENCES Empresas(id_empresa)
          ON UPDATE CASCADE
          ON DELETE CASCADE,
        CONSTRAINT fk_resena_postulante_usuario
          FOREIGN KEY (id_usuario_fk)
          REFERENCES Usuarios(id_usuario)
          ON UPDATE CASCADE
          ON DELETE CASCADE,
        CONSTRAINT fk_resena_postulante_postulacion
          FOREIGN KEY (id_postulacion_fk)
          REFERENCES Postulaciones(id_postulacion)
          ON UPDATE CASCADE
          ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  })();

  return schemaReadyPromise;
};

const parseJson = (value, fallback = []) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const getPostulacionesResenablesByEmpresa = async (id_empresa) => {
  await ensureSchema();

  const [rows] = await pool.query(
    `
    SELECT
      p.id_postulacion,
      p.fecha_postulacion,
      u.id_usuario,
      u.nombres,
      u.apellidos,
      u.correo_electronico,
      v.id_vacante,
      v.titulo_puesto,
      rp.id_resena,
      rp.puntuacion,
      rp.comentario,
      rp.etiquetas_json,
      rp.fecha_resena
    FROM Postulaciones p
    INNER JOIN Usuarios u ON u.id_usuario = p.id_usuario_fk
    INNER JOIN Vacantes v ON v.id_vacante = p.id_vacante_fk
    LEFT JOIN Resenas_Postulantes rp ON rp.id_postulacion_fk = p.id_postulacion
    WHERE v.id_empresa_fk = ?
    ORDER BY p.fecha_postulacion DESC, p.id_postulacion DESC
    `,
    [id_empresa]
  );

  return rows.map((item) => ({
    ...item,
    etiquetas: parseJson(item.etiquetas_json, [])
  }));
};

export const getResenasPostulantesByEmpresa = async (id_empresa) => {
  await ensureSchema();

  const [rows] = await pool.query(
    `
    SELECT
      rp.id_resena,
      rp.id_postulacion_fk,
      rp.id_usuario_fk,
      rp.puntuacion,
      rp.comentario,
      rp.etiquetas_json,
      rp.fecha_resena,
      u.nombres,
      u.apellidos,
      v.titulo_puesto
    FROM Resenas_Postulantes rp
    INNER JOIN Usuarios u ON u.id_usuario = rp.id_usuario_fk
    INNER JOIN Postulaciones p ON p.id_postulacion = rp.id_postulacion_fk
    INNER JOIN Vacantes v ON v.id_vacante = p.id_vacante_fk
    WHERE rp.id_empresa_fk = ?
    ORDER BY rp.fecha_resena DESC, rp.id_resena DESC
    `,
    [id_empresa]
  );

  return rows.map((item) => ({
    ...item,
    etiquetas: parseJson(item.etiquetas_json, [])
  }));
};

export const getResenasExternasSobreMisPostulantes = async (id_empresa) => {
  await ensureSchema();

  const [rows] = await pool.query(
    `
    SELECT
      rp.id_resena,
      rp.id_empresa_fk,
      rp.id_usuario_fk,
      rp.id_postulacion_fk,
      rp.puntuacion,
      rp.comentario,
      rp.etiquetas_json,
      rp.fecha_resena,
      u.nombres,
      u.apellidos,
      e.nombre_comercial,
      v.titulo_puesto
    FROM Resenas_Postulantes rp
    INNER JOIN Usuarios u ON u.id_usuario = rp.id_usuario_fk
    INNER JOIN Empresas e ON e.id_empresa = rp.id_empresa_fk
    INNER JOIN Postulaciones p ON p.id_postulacion = rp.id_postulacion_fk
    INNER JOIN Vacantes v ON v.id_vacante = p.id_vacante_fk
    WHERE rp.id_empresa_fk <> ?
      AND EXISTS (
        SELECT 1
        FROM Postulaciones pm
        INNER JOIN Vacantes vm ON vm.id_vacante = pm.id_vacante_fk
        WHERE pm.id_usuario_fk = rp.id_usuario_fk
          AND vm.id_empresa_fk = ?
      )
    ORDER BY rp.fecha_resena DESC, rp.id_resena DESC
    `,
    [id_empresa, id_empresa]
  );

  return rows.map((item) => ({
    ...item,
    etiquetas: parseJson(item.etiquetas_json, [])
  }));
};

export const getResumenResenasPostulantesByEmpresa = async (id_empresa) => {
  await ensureSchema();

  const [[row]] = await pool.query(
    `
    SELECT
      ROUND(AVG(puntuacion), 2) AS promedio,
      COUNT(*) AS total_resenas
    FROM Resenas_Postulantes
    WHERE id_empresa_fk = ?
    `,
    [id_empresa]
  );

  return {
    promedio: Number(row?.promedio || 0),
    total_resenas: Number(row?.total_resenas || 0)
  };
};

export const getPostulacionResenableByEmpresa = async (id_empresa, id_postulacion) => {
  await ensureSchema();

  const [rows] = await pool.query(
    `
    SELECT
      p.id_postulacion,
      p.id_usuario_fk,
      v.id_vacante,
      v.titulo_puesto
    FROM Postulaciones p
    INNER JOIN Vacantes v ON v.id_vacante = p.id_vacante_fk
    WHERE p.id_postulacion = ? AND v.id_empresa_fk = ?
    LIMIT 1
    `,
    [id_postulacion, id_empresa]
  );

  return rows[0] || null;
};

export const upsertResenaPostulante = async ({
  id_empresa_fk,
  id_usuario_fk,
  id_postulacion_fk,
  puntuacion,
  comentario,
  etiquetas
}) => {
  await ensureSchema();

  await pool.query(
    `
    INSERT INTO Resenas_Postulantes
    (
      id_empresa_fk,
      id_usuario_fk,
      id_postulacion_fk,
      puntuacion,
      comentario,
      etiquetas_json
    )
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      puntuacion = VALUES(puntuacion),
      comentario = VALUES(comentario),
      etiquetas_json = VALUES(etiquetas_json),
      fecha_resena = CURRENT_TIMESTAMP
    `,
    [
      id_empresa_fk,
      id_usuario_fk,
      id_postulacion_fk,
      puntuacion,
      comentario,
      JSON.stringify(etiquetas || [])
    ]
  );

  const [rows] = await pool.query(
    `
    SELECT
      rp.id_resena,
      rp.id_postulacion_fk,
      rp.id_usuario_fk,
      rp.puntuacion,
      rp.comentario,
      rp.etiquetas_json,
      rp.fecha_resena,
      u.nombres,
      u.apellidos,
      v.titulo_puesto
    FROM Resenas_Postulantes rp
    INNER JOIN Usuarios u ON u.id_usuario = rp.id_usuario_fk
    INNER JOIN Postulaciones p ON p.id_postulacion = rp.id_postulacion_fk
    INNER JOIN Vacantes v ON v.id_vacante = p.id_vacante_fk
    WHERE rp.id_postulacion_fk = ?
    LIMIT 1
    `,
    [id_postulacion_fk]
  );

  const resena = rows[0];
  return {
    ...resena,
    etiquetas: parseJson(resena?.etiquetas_json, [])
  };
};
