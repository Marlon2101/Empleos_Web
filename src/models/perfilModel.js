import { pool } from "../config/db.js";

let profileSchemaReadyPromise = null;

const ensurePerfilSchema = async () => {
  if (profileSchemaReadyPromise) {
    return profileSchemaReadyPromise;
  }

  profileSchemaReadyPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Usuarios_Perfil_Detalle (
        id_usuario_fk INT NOT NULL,
        direccion VARCHAR(255) NULL,
        titulo_profesional VARCHAR(150) NULL,
        sitio_web VARCHAR(150) NULL,
        foto_perfil LONGTEXT NULL,
        habilidades_json LONGTEXT NULL,
        experiencia_json LONGTEXT NULL,
        educacion_json LONGTEXT NULL,
        PRIMARY KEY (id_usuario_fk),
        CONSTRAINT fk_usuarios_perfil_detalle_usuario
          FOREIGN KEY (id_usuario_fk)
          REFERENCES Usuarios(id_usuario)
          ON UPDATE CASCADE
          ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  })();

  return profileSchemaReadyPromise;
};

const safeJsonParse = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getHabilidadesUsuario = async (id_usuario) => {
  const [rows] = await pool.query(
    `
    SELECT
      h.id_habilidad,
      h.nombre_habilidad
    FROM Usuario_Habilidades uh
    INNER JOIN Habilidades h ON uh.id_habilidad_fk = h.id_habilidad
    WHERE uh.id_usuario_fk = ?
    ORDER BY h.nombre_habilidad ASC
    `,
    [id_usuario]
  );

  return rows;
};

export const getPerfilUsuarioById = async (id_usuario) => {
  await ensurePerfilSchema();

  const [rows] = await pool.query(
    `
    SELECT
      u.id_usuario,
      u.nombres,
      u.apellidos,
      u.correo_electronico,
      u.telefono,
      u.id_municipio_fk,
      u.resumen_profesional,
      m.nombre_municipio,
      d.nombre_departamento,
      upd.direccion,
      upd.titulo_profesional,
      upd.sitio_web,
      upd.foto_perfil,
      upd.habilidades_json,
      upd.experiencia_json,
      upd.educacion_json
    FROM Usuarios u
    LEFT JOIN Municipios m ON u.id_municipio_fk = m.id_municipio
    LEFT JOIN Departamentos d ON m.id_departamento_fk = d.id_departamento
    LEFT JOIN Usuarios_Perfil_Detalle upd ON upd.id_usuario_fk = u.id_usuario
    WHERE u.id_usuario = ?
    LIMIT 1
    `,
    [id_usuario]
  );

  const perfil = rows[0];

  if (!perfil) {
    return null;
  }

  const habilidadesCatalogo = await getHabilidadesUsuario(id_usuario);
  const habilidadesDetalle = safeJsonParse(perfil.habilidades_json, []);
  const experiencia = safeJsonParse(perfil.experiencia_json, []);
  const educacion = safeJsonParse(perfil.educacion_json, []);

  return {
    id_usuario: perfil.id_usuario,
    nombres: perfil.nombres,
    apellidos: perfil.apellidos,
    nombre_completo: `${perfil.nombres} ${perfil.apellidos}`.trim(),
    correo_electronico: perfil.correo_electronico,
    telefono: perfil.telefono,
    id_municipio_fk: perfil.id_municipio_fk,
    nombre_municipio: perfil.nombre_municipio,
    nombre_departamento: perfil.nombre_departamento,
    direccion: perfil.direccion,
    titulo_profesional: perfil.titulo_profesional,
    sitio_web: perfil.sitio_web,
    resumen_profesional: perfil.resumen_profesional,
    foto_perfil: perfil.foto_perfil,
    habilidades: habilidadesDetalle.length
      ? habilidadesDetalle
      : habilidadesCatalogo.map((item) => item.nombre_habilidad),
    experiencia,
    educacion
  };
};

export const updatePerfilUsuarioById = async (id_usuario, data) => {
  await ensurePerfilSchema();

  const {
    nombres,
    apellidos,
    telefono,
    id_municipio_fk,
    resumen_profesional,
    direccion = null,
    titulo_profesional = null,
    sitio_web = null,
    foto_perfil = null,
    habilidades = [],
    experiencia = [],
    educacion = []
  } = data;

  const [result] = await pool.query(
    `
    UPDATE Usuarios
    SET
      nombres = ?,
      apellidos = ?,
      telefono = ?,
      id_municipio_fk = ?,
      resumen_profesional = ?
    WHERE id_usuario = ?
    `,
    [
      nombres,
      apellidos,
      telefono,
      id_municipio_fk || null,
      resumen_profesional,
      id_usuario
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  await pool.query(
    `
    INSERT INTO Usuarios_Perfil_Detalle
    (
      id_usuario_fk,
      direccion,
      titulo_profesional,
      sitio_web,
      foto_perfil,
      habilidades_json,
      experiencia_json,
      educacion_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      direccion = VALUES(direccion),
      titulo_profesional = VALUES(titulo_profesional),
      sitio_web = VALUES(sitio_web),
      foto_perfil = VALUES(foto_perfil),
      habilidades_json = VALUES(habilidades_json),
      experiencia_json = VALUES(experiencia_json),
      educacion_json = VALUES(educacion_json)
    `,
    [
      id_usuario,
      direccion,
      titulo_profesional,
      sitio_web,
      foto_perfil,
      JSON.stringify(habilidades || []),
      JSON.stringify(experiencia || []),
      JSON.stringify(educacion || [])
    ]
  );

  return await getPerfilUsuarioById(id_usuario);
};

export const getPerfilEmpresaById = async (id_empresa) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_empresa,
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      correo_electronico
    FROM Empresas
    WHERE id_empresa = ?
    `,
    [id_empresa]
  );

  return rows[0];
};

export const updatePerfilEmpresaById = async (id_empresa, data) => {
  const {
    nombre_comercial,
    razon_social,
    sitio_web,
    descripcion_empresa,
    id_municipio_fk
  } = data;

  const [result] = await pool.query(
    `
    UPDATE Empresas
    SET
      nombre_comercial = ?,
      razon_social = ?,
      sitio_web = ?,
      descripcion_empresa = ?,
      id_municipio_fk = ?
    WHERE id_empresa = ?
    `,
    [
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      id_empresa
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return await getPerfilEmpresaById(id_empresa);
};

