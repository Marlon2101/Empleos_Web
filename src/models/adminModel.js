import { pool } from "../config/db.js";

const vacanteEstados = new Map();

const withVacanteEstado = (vacante) => ({
  ...vacante,
  estado: vacanteEstados.get(Number(vacante.id_vacante)) || vacante.estado || "Activo"
});

const getAdminVacanteBaseQuery = () => `
  SELECT
    v.id_vacante,
    v.id_empresa_fk,
    e.id_empresa,
    e.nombre_comercial,
    v.id_categoria_fk,
    c.id_categoria,
    c.nombre_categoria,
    v.titulo_puesto,
    v.descripcion_puesto,
    v.salario_offrecido,
    v.modalidad,
    v.id_municipio_fk,
    m.nombre_municipio,
    v.fecha_publicacion
  FROM Vacantes v
  INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
  INNER JOIN Categorias c ON v.id_categoria_fk = c.id_categoria
  LEFT JOIN Municipios m ON v.id_municipio_fk = m.id_municipio
`;

const getAdminVacanteById = async (id) => {
  const [rows] = await pool.query(
    `${getAdminVacanteBaseQuery()} WHERE v.id_vacante = ?`,
    [id]
  );

  return rows[0] ? withVacanteEstado(rows[0]) : null;
};

const getAdminEmpresaById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      e.id_empresa,
      e.nombre_comercial,
      e.razon_social,
      e.sitio_web,
      e.descripcion_empresa,
      e.id_municipio_fk,
      e.correo_electronico,
      m.nombre_municipio
    FROM Empresas e
    LEFT JOIN Municipios m ON e.id_municipio_fk = m.id_municipio
    WHERE e.id_empresa = ?
    `,
    [id]
  );

  return rows[0];
};

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
      e.id_empresa,
      e.nombre_comercial,
      e.razon_social,
      e.sitio_web,
      e.descripcion_empresa,
      e.id_municipio_fk,
      e.correo_electronico,
      m.nombre_municipio
    FROM Empresas e
    LEFT JOIN Municipios m ON e.id_municipio_fk = m.id_municipio
    ORDER BY e.id_empresa DESC
  `);

  return rows;
};

export const createAdminEmpresa = async (empresa) => {
  const {
    nombre_comercial,
    razon_social,
    sitio_web,
    descripcion_empresa,
    id_municipio_fk,
    correo_electronico,
    contrasena
  } = empresa;

  const [result] = await pool.query(
    `
    INSERT INTO Empresas
    (
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      correo_electronico,
      contrasena
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      correo_electronico,
      contrasena
    ]
  );

  return getAdminEmpresaById(result.insertId);
};

export const getAdminVacantes = async () => {
  const [rows] = await pool.query(
    `${getAdminVacanteBaseQuery()} ORDER BY v.fecha_publicacion DESC, v.id_vacante DESC`
  );

  return rows.map(withVacanteEstado);
};

export const createAdminVacante = async (vacante) => {
  const {
    id_empresa_fk,
    id_categoria_fk,
    titulo_puesto,
    descripcion_puesto,
    salario_offrecido,
    modalidad,
    id_municipio_fk,
    estado = "Activo"
  } = vacante;

  const [result] = await pool.query(
    `
    INSERT INTO Vacantes
    (
      id_empresa_fk,
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      salario_offrecido,
      modalidad,
      id_municipio_fk
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id_empresa_fk,
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      salario_offrecido,
      modalidad,
      id_municipio_fk
    ]
  );

  vacanteEstados.set(result.insertId, estado);
  return getAdminVacanteById(result.insertId);
};

export const updateAdminVacante = async (id, vacante) => {
  const {
    id_empresa_fk,
    id_categoria_fk,
    titulo_puesto,
    descripcion_puesto,
    salario_offrecido,
    modalidad,
    id_municipio_fk,
    estado
  } = vacante;

  const [result] = await pool.query(
    `
    UPDATE Vacantes
    SET
      id_empresa_fk = ?,
      id_categoria_fk = ?,
      titulo_puesto = ?,
      descripcion_puesto = ?,
      salario_offrecido = ?,
      modalidad = ?,
      id_municipio_fk = ?
    WHERE id_vacante = ?
    `,
    [
      id_empresa_fk,
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      salario_offrecido,
      modalidad,
      id_municipio_fk,
      id
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  if (estado) {
    vacanteEstados.set(Number(id), estado);
  }

  return getAdminVacanteById(id);
};

export const updateAdminVacanteEstado = async (id, estado) => {
  const vacante = await getAdminVacanteById(id);

  if (!vacante) {
    return null;
  }

  vacanteEstados.set(Number(id), estado);
  return getAdminVacanteById(id);
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
  const empresa = await getAdminEmpresaById(id);

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
  const vacante = await getAdminVacanteById(id);

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

  vacanteEstados.delete(Number(id));

  return vacante;
};
