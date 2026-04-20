import { pool } from "../config/db.js";

const BASE_VACANTES_SELECT = `
  SELECT
    v.id_vacante,
    v.id_empresa_fk,
    e.id_empresa,
    e.nombre_comercial,
    e.nombre_comercial AS nombre_empresa,
    e.nombre_comercial AS empresa,
    v.id_categoria_fk,
    c.id_categoria,
    c.nombre_categoria,
    v.titulo_puesto,
    v.descripcion_puesto,
    v.responsabilidades,
    v.requisitos,
    v.salario_offrecido,
    v.modalidad,
    v.tipo_contrato,
    v.educacion,
    v.idiomas,
    v.id_municipio_fk,
    m.nombre_municipio,
    v.fecha_publicacion,
    CASE
      WHEN LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '%practic%' OR
           LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '%becari%' OR
           LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '%trainee%' OR
           LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '%intern%'
        THEN 'Practicante'
      WHEN LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '%junior%' OR
           LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '% jr %' OR
           LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE 'jr %' OR
           LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '% jr'
        THEN 'Junior'
      WHEN LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '%semi%' OR
           LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '%mid%'
        THEN 'Semi-senior'
      WHEN LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '%senior%' OR
           LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '% lead %' OR
           LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE 'lead %' OR
           LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '% principal %'
        THEN 'Senior'
      ELSE 'No especificado'
    END AS experiencia_nivel
  FROM Vacantes v
  INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
  INNER JOIN Categorias c ON v.id_categoria_fk = c.id_categoria
  LEFT JOIN Municipios m ON v.id_municipio_fk = m.id_municipio
`;

const ORDER_BY_RECIENTES = " ORDER BY v.fecha_publicacion DESC, v.id_vacante DESC";

const buildExperiencePatterns = (experiencia = "") => {
  const niveles = experiencia
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const patterns = [];

  for (const nivel of niveles) {
    if (nivel.includes("practic") || nivel.includes("becario")) {
      patterns.push("%practic%", "%becari%", "%trainee%", "%intern%");
    } else if (nivel.includes("junior")) {
      patterns.push("%junior%", "% jr %", "jr %", "% jr");
    } else if (nivel.includes("semi")) {
      patterns.push("%semi%", "%mid%");
    } else if (nivel.includes("senior")) {
      patterns.push("%senior%", "% lead %", "lead %", "% principal %");
    }
  }

  return [...new Set(patterns)];
};

export const getAllVacantes = async () => {
  const [rows] = await pool.query(`${BASE_VACANTES_SELECT}${ORDER_BY_RECIENTES}`);
  return rows;
};

export const getVacanteById = async (id) => {
  const [rows] = await pool.query(
    `${BASE_VACANTES_SELECT} WHERE v.id_vacante = ?`,
    [id]
  );

  return rows[0];
};

export const getVacantesByEmpresa = async (id_empresa) => {
  const [rows] = await pool.query(
    `${BASE_VACANTES_SELECT} WHERE v.id_empresa_fk = ?${ORDER_BY_RECIENTES}`,
    [id_empresa]
  );

  return rows;
};

export const createVacante = async (vacante) => {
  const {
    id_empresa_fk,
    id_categoria_fk,
    titulo_puesto,
    descripcion_puesto,
    responsabilidades,
    requisitos,
    salario_offrecido,
    modalidad,
    tipo_contrato,
    educacion,
    idiomas,
    id_municipio_fk
  } = vacante;

  const [result] = await pool.query(
    `
    INSERT INTO Vacantes
    (
      id_empresa_fk,
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      responsabilidades,
      requisitos,
      salario_offrecido,
      modalidad,
      tipo_contrato,
      educacion,
      idiomas,
      id_municipio_fk
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id_empresa_fk,
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      responsabilidades,
      requisitos,
      salario_offrecido,
      modalidad,
      tipo_contrato,
      educacion,
      idiomas,
      id_municipio_fk
    ]
  );

  return getVacanteById(result.insertId);
};

export const updateVacante = async (id, vacante) => {
  const {
    id_empresa_fk,
    id_categoria_fk,
    titulo_puesto,
    descripcion_puesto,
    responsabilidades,
    requisitos,
    salario_offrecido,
    modalidad,
    tipo_contrato,
    educacion,
    idiomas,
    id_municipio_fk
  } = vacante;

  const [result] = await pool.query(
    `
    UPDATE Vacantes
    SET
      id_empresa_fk = ?,
      id_categoria_fk = ?,
      titulo_puesto = ?,
      descripcion_puesto = ?,
      responsabilidades = ?,
      requisitos = ?,
      salario_offrecido = ?,
      modalidad = ?,
      tipo_contrato = ?,
      educacion = ?,
      idiomas = ?,
      id_municipio_fk = ?
    WHERE id_vacante = ?
    `,
    [
      id_empresa_fk,
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      responsabilidades,
      requisitos,
      salario_offrecido,
      modalidad,
      tipo_contrato,
      educacion,
      idiomas,
      id_municipio_fk,
      id
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getVacanteById(id);
};

export const deleteVacante = async (id) => {
  const vacante = await getVacanteById(id);

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

export const getVacanteSimpleById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_vacante,
      id_empresa_fk
    FROM Vacantes
    WHERE id_vacante = ?
    `,
    [id]
  );

  return rows[0];
};

export const buscarVacantesConFiltros = async (filtros) => {
  const { titulo, ubicacion, tipo, experiencia, min, max, fecha } = filtros;
  const params = [];
  let sql = `${BASE_VACANTES_SELECT} WHERE 1=1`;

  if (titulo) {
    sql += `
      AND (
        v.titulo_puesto LIKE ? OR
        v.descripcion_puesto LIKE ? OR
        e.nombre_comercial LIKE ? OR
        c.nombre_categoria LIKE ?
      )
    `;
    const term = `%${titulo}%`;
    params.push(term, term, term, term);
  }

  if (ubicacion) {
    sql += " AND COALESCE(m.nombre_municipio, '') LIKE ?";
    params.push(`%${ubicacion}%`);
  }

  if (tipo) {
    sql += `
      AND (
        COALESCE(v.modalidad, '') LIKE ? OR
        COALESCE(v.titulo_puesto, '') LIKE ? OR
        COALESCE(v.descripcion_puesto, '') LIKE ?
      )
    `;
    const typeTerm = `%${tipo}%`;
    params.push(typeTerm, typeTerm, typeTerm);
  }

  const experiencePatterns = buildExperiencePatterns(experiencia);
  if (experiencePatterns.length > 0) {
    sql += ` AND (${experiencePatterns
      .map(
        () =>
          "LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE ?"
      )
      .join(" OR ")})`;
    params.push(...experiencePatterns);
  }

  if (min) {
    sql += " AND COALESCE(v.salario_offrecido, 0) >= ?";
    params.push(Number(min));
  }

  if (max) {
    sql += " AND COALESCE(v.salario_offrecido, 0) <= ?";
    params.push(Number(max));
  }

  if (fecha === "24h") {
    sql += " AND v.fecha_publicacion >= DATE_SUB(NOW(), INTERVAL 1 DAY)";
  } else if (fecha === "semana") {
    sql += " AND v.fecha_publicacion >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
  } else if (fecha === "mes") {
    sql += " AND v.fecha_publicacion >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
  }

  sql += ORDER_BY_RECIENTES;

  const [rows] = await pool.query(sql, params);
  return rows;
};

export const getDetalleVacanteById = async (id) => {
  const query = `
    SELECT 
      v.id_vacante,
      v.id_empresa_fk,
      v.titulo_puesto,
      v.descripcion_puesto,
      v.responsabilidades,
      v.requisitos,
      v.salario_offrecido,
      v.modalidad,
      v.tipo_contrato,      
      v.educacion,          
      v.idiomas,            
      v.fecha_publicacion,
      v.id_categoria_fk,
      c.nombre_categoria,
      m.nombre_municipio,
      e.id_empresa,
      e.nombre_comercial,
      e.descripcion_empresa,
      e.sitio_web,
      -- Cálculo de experiencia usando solo titulo y descripcion (que sí existen)
      CASE 
        WHEN LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '%junior%' THEN 'Junior'
        WHEN LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '%senior%' THEN 'Senior'
        WHEN LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '%semi%' THEN 'Semi-senior'
        WHEN LOWER(CONCAT_WS(' ', v.titulo_puesto, v.descripcion_puesto)) LIKE '%practic%' THEN 'Practicante'
        ELSE 'No especificado'
      END AS experiencia_nivel
    FROM Vacantes v
    LEFT JOIN Categorias c ON v.id_categoria_fk = c.id_categoria
    LEFT JOIN Municipios m ON v.id_municipio_fk = m.id_municipio
    LEFT JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
    WHERE v.id_vacante = ?
  `;

  const [rows] = await pool.query(query, [id]);
  return rows[0];
};

export const getVacantesSimilaresById = async (id, limit = 3) => {
  const query = `
    SELECT
      similares.id_vacante,
      similares.id_empresa_fk,
      similares.id_empresa,
      similares.nombre_empresa,
      similares.nombre_comercial,
      similares.titulo_puesto,
      similares.salario_offrecido,
      similares.modalidad,
      similares.nombre_municipio,
      similares.fecha_publicacion,
      similares.experiencia_nivel
    FROM Vacantes base
    INNER JOIN (
      ${BASE_VACANTES_SELECT}
    ) AS similares
      ON similares.id_vacante <> base.id_vacante
      AND (
        similares.id_categoria_fk = base.id_categoria_fk OR
        similares.id_empresa_fk = base.id_empresa_fk OR
        similares.id_municipio_fk = base.id_municipio_fk
      )
    WHERE base.id_vacante = ?
    ORDER BY
      (similares.id_categoria_fk = base.id_categoria_fk) DESC,
      (similares.id_empresa_fk = base.id_empresa_fk) DESC,
      similares.fecha_publicacion DESC,
      similares.id_vacante DESC
    LIMIT ?
  `;

  const [rows] = await pool.query(query, [id, Number(limit)]);
  return rows;
};
