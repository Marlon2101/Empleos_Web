import { pool } from "../config/db.js";

export const getAdminUsuarios = async () => {
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
    ORDER BY id_usuario DESC
  `);

  return rows;
};

export const getAdminEmpresas = async () => {
  const [rows] = await pool.query(`
    SELECT
      id_empresa,
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      correo_electronico
    FROM Empresas
    ORDER BY id_empresa DESC
  `);

  return rows;
};

export const getAdminVacantes = async () => {
  const [rows] = await pool.query(`
    SELECT
      v.id_vacante,
      v.titulo_puesto,
      v.modalidad,
      v.salario_offrecido,
      v.fecha_publicacion,
      e.id_empresa,
      e.nombre_comercial,
      c.id_categoria,
      c.nombre_categoria
    FROM Vacantes v
    INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
    INNER JOIN Categorias c ON v.id_categoria_fk = c.id_categoria
    ORDER BY v.id_vacante DESC
  `);

  return rows;
};

export const deleteAdminUsuario = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_usuario,
      nombres,
      apellidos,
      correo_electronico
    FROM Usuarios
    WHERE id_usuario = ?
    `,
    [id]
  );

  const usuario = rows[0];

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

export const deleteAdminEmpresa = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_empresa,
      nombre_comercial,
      razon_social,
      correo_electronico
    FROM Empresas
    WHERE id_empresa = ?
    `,
    [id]
  );

  const empresa = rows[0];

  if (!empresa) {
    return null;
  }

  await pool.query(
    `
    DELETE FROM Empresas
    WHERE id_empresa = ?
    `,
    [id]
  );

  return empresa;
};

export const deleteAdminVacante = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_vacante,
      titulo_puesto
    FROM Vacantes
    WHERE id_vacante = ?
    `,
    [id]
  );

  const vacante = rows[0];

  if (!vacante) {
    return null;
  }

  await pool.query(
    `
    DELETE FROM Vacantes
    WHERE id_vacante = ?
    `,
    [id]
  );

  return vacante;
};