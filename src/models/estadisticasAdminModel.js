import { pool } from "../config/db.js";

export const getEstadisticasAdmin = async () => {
  const [vacantesPorCategoria] = await pool.query(`
    SELECT
      c.id_categoria,
      c.nombre_categoria,
      COUNT(v.id_vacante) AS total
    FROM Categorias c
    LEFT JOIN Vacantes v ON c.id_categoria = v.id_categoria_fk
    GROUP BY c.id_categoria, c.nombre_categoria
    ORDER BY total DESC, c.nombre_categoria ASC
  `);

  const [vacantesPorModalidad] = await pool.query(`
    SELECT
      modalidad,
      COUNT(*) AS total
    FROM Vacantes
    GROUP BY modalidad
    ORDER BY total DESC, modalidad ASC
  `);

  const [postulacionesPorEstado] = await pool.query(`
    SELECT
      ep.id_estado,
      ep.nombre_estado,
      COUNT(p.id_postulacion) AS total
    FROM Estados_Postulacion ep
    LEFT JOIN Postulaciones p ON ep.id_estado = p.id_estado_fk
    GROUP BY ep.id_estado, ep.nombre_estado
    ORDER BY ep.id_estado ASC
  `);

  const [empresasConMasVacantes] = await pool.query(`
    SELECT
      e.id_empresa,
      e.nombre_comercial,
      COUNT(v.id_vacante) AS total_vacantes
    FROM Empresas e
    LEFT JOIN Vacantes v ON e.id_empresa = v.id_empresa_fk
    GROUP BY e.id_empresa, e.nombre_comercial
    ORDER BY total_vacantes DESC, e.nombre_comercial ASC
    LIMIT 10
  `);

  return {
    vacantesPorCategoria,
    vacantesPorModalidad,
    postulacionesPorEstado,
    empresasConMasVacantes
  };
};