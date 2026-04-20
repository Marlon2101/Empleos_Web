import { pool } from "../config/db.js";

let emailVerificationSchemaPromise = null;

const addColumnIfMissing = async (tableName, columnDefinition) => {
  try {
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition}`);
  } catch {
    // La columna ya existe.
  }
};

export const ensureEmailVerificationSchema = async () => {
  if (emailVerificationSchemaPromise) {
    return emailVerificationSchemaPromise;
  }

  emailVerificationSchemaPromise = (async () => {
    await addColumnIfMissing("Usuarios", "email_verificado TINYINT(1) NOT NULL DEFAULT 0");
    await addColumnIfMissing("Empresas", "email_verificado TINYINT(1) NOT NULL DEFAULT 0");
  })();

  return emailVerificationSchemaPromise;
};

const mapCuenta = (row, tipo) => {
  if (!row) {
    return null;
  }

  const id = tipo === "empresa" ? row.id_empresa : row.id_usuario;
  const nombre = tipo === "empresa"
    ? row.nombre_comercial
    : `${row.nombres || ""} ${row.apellidos || ""}`.trim();

  return {
    ...row,
    id,
    tipo,
    nombre,
    email_verificado: Boolean(row.email_verificado)
  };
};

export const obtenerCuentaPorCorreo = async (correo_electronico) => {
  await ensureEmailVerificationSchema();

  const [usuarios] = await pool.query(
    `
    SELECT
      id_usuario,
      nombres,
      apellidos,
      correo_electronico,
      COALESCE(email_verificado, 0) AS email_verificado
    FROM Usuarios
    WHERE correo_electronico = ?
    LIMIT 1
    `,
    [correo_electronico]
  );

  if (usuarios[0]) {
    return mapCuenta(usuarios[0], "usuario");
  }

  const [empresas] = await pool.query(
    `
    SELECT
      id_empresa,
      nombre_comercial,
      razon_social,
      correo_electronico,
      COALESCE(email_verificado, 0) AS email_verificado
    FROM Empresas
    WHERE correo_electronico = ?
    LIMIT 1
    `,
    [correo_electronico]
  );

  return mapCuenta(empresas[0], "empresa");
};

export const obtenerCuentaPorIdYTipo = async (id, tipo) => {
  await ensureEmailVerificationSchema();

  if (tipo === "empresa") {
    const [rows] = await pool.query(
      `
      SELECT
        id_empresa,
        nombre_comercial,
        razon_social,
        correo_electronico,
        COALESCE(email_verificado, 0) AS email_verificado
      FROM Empresas
      WHERE id_empresa = ?
      LIMIT 1
      `,
      [id]
    );

    return mapCuenta(rows[0], "empresa");
  }

  const [rows] = await pool.query(
    `
    SELECT
      id_usuario,
      nombres,
      apellidos,
      correo_electronico,
      COALESCE(email_verificado, 0) AS email_verificado
    FROM Usuarios
    WHERE id_usuario = ?
    LIMIT 1
    `,
    [id]
  );

  return mapCuenta(rows[0], "usuario");
};

export const obtenerEstadoVerificacionCuenta = async (id, tipo) => {
  const cuenta = await obtenerCuentaPorIdYTipo(id, tipo);
  if (!cuenta) {
    return null;
  }

  return {
    id: cuenta.id,
    tipo: cuenta.tipo,
    nombre: cuenta.nombre,
    correo_electronico: cuenta.correo_electronico,
    email_verificado: cuenta.email_verificado
  };
};

export const marcarCuentaComoVerificada = async (id, tipo) => {
  await ensureEmailVerificationSchema();

  if (tipo === "empresa") {
    await pool.query(
      "UPDATE Empresas SET email_verificado = 1 WHERE id_empresa = ?",
      [id]
    );
  } else {
    await pool.query(
      "UPDATE Usuarios SET email_verificado = 1 WHERE id_usuario = ?",
      [id]
    );
  }

  return obtenerCuentaPorIdYTipo(id, tipo);
};

export const actualizarCorreoPendienteCuenta = async (id, tipo, nuevoCorreo) => {
  await ensureEmailVerificationSchema();

  if (tipo === "empresa") {
    await pool.query(
      "UPDATE Empresas SET correo_electronico = ?, email_verificado = 0 WHERE id_empresa = ?",
      [nuevoCorreo, id]
    );
  } else {
    await pool.query(
      "UPDATE Usuarios SET correo_electronico = ?, email_verificado = 0 WHERE id_usuario = ?",
      [nuevoCorreo, id]
    );
  }

  return obtenerCuentaPorIdYTipo(id, tipo);
};

export const correoYaExisteEnSistema = async (correo_electronico, cuentaActual = null) => {
  const cuenta = await obtenerCuentaPorCorreo(correo_electronico);
  if (!cuenta) {
    return false;
  }

  if (
    cuentaActual &&
    Number(cuenta.id) === Number(cuentaActual.id) &&
    cuenta.tipo === cuentaActual.tipo
  ) {
    return false;
  }

  return true;
};
