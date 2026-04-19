import { pool } from "../config/db.js";

let schemaReadyPromise = null;

const ensureGuardadosSchema = async () => {
  if (schemaReadyPromise) {
    return schemaReadyPromise;
  }

  schemaReadyPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Vacantes_Guardadas (
        id_guardado INT NOT NULL AUTO_INCREMENT,
        id_usuario_fk INT NOT NULL,
        id_vacante_fk INT NOT NULL,
        fecha_guardado DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id_guardado),
        UNIQUE KEY uq_guardado_usuario_vacante (id_usuario_fk, id_vacante_fk),
        CONSTRAINT fk_guardados_usuario
          FOREIGN KEY (id_usuario_fk)
          REFERENCES Usuarios(id_usuario)
          ON UPDATE CASCADE
          ON DELETE CASCADE,
        CONSTRAINT fk_guardados_vacante
          FOREIGN KEY (id_vacante_fk)
          REFERENCES Vacantes(id_vacante)
          ON UPDATE CASCADE
          ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  })();

  return schemaReadyPromise;
};

export const getGuardadoByUsuarioVacante = async (id_usuario, id_vacante) => {
  await ensureGuardadosSchema();

  const [rows] = await pool.query(
    `
    SELECT id_guardado, id_usuario_fk, id_vacante_fk, fecha_guardado
    FROM Vacantes_Guardadas
    WHERE id_usuario_fk = ? AND id_vacante_fk = ?
    LIMIT 1
    `,
    [id_usuario, id_vacante]
  );

  return rows[0] || null;
};

export const createGuardado = async (id_usuario, id_vacante) => {
  await ensureGuardadosSchema();

  await pool.query(
    `
    INSERT INTO Vacantes_Guardadas (id_usuario_fk, id_vacante_fk)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE fecha_guardado = CURRENT_TIMESTAMP
    `,
    [id_usuario, id_vacante]
  );

  return getGuardadoByUsuarioVacante(id_usuario, id_vacante);
};

export const deleteGuardado = async (id_usuario, id_vacante) => {
  await ensureGuardadosSchema();

  const guardado = await getGuardadoByUsuarioVacante(id_usuario, id_vacante);

  if (!guardado) {
    return null;
  }

  await pool.query(
    `
    DELETE FROM Vacantes_Guardadas
    WHERE id_usuario_fk = ? AND id_vacante_fk = ?
    `,
    [id_usuario, id_vacante]
  );

  return guardado;
};

export const getGuardadosByUsuario = async (id_usuario) => {
  await ensureGuardadosSchema();

  const [rows] = await pool.query(
    `
    SELECT
      g.id_guardado,
      g.fecha_guardado,
      v.id_vacante,
      v.titulo_puesto,
      v.salario_offrecido,
      v.modalidad,
      e.id_empresa,
      e.nombre_comercial,
      m.nombre_municipio
    FROM Vacantes_Guardadas g
    INNER JOIN Vacantes v ON g.id_vacante_fk = v.id_vacante
    INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
    LEFT JOIN Municipios m ON v.id_municipio_fk = m.id_municipio
    WHERE g.id_usuario_fk = ?
    ORDER BY g.fecha_guardado DESC, g.id_guardado DESC
    `,
    [id_usuario]
  );

  return rows;
};
