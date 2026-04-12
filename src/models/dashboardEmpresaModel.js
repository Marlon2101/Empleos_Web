import { pool } from "../config/db.js";

export const getResumenEmpresa = async (id_empresa) => {
  const [[empresa]] = await pool.query(
    `
    SELECT
      id_empresa,
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      correo_electronico,
      id_municipio_fk
    FROM Empresas
    WHERE id_empresa = ?
    `,
    [id_empresa]
  );

  const [[totalVacantes]] = await pool.query(
    `
    SELECT COUNT(*) AS total_vacantes
    FROM Vacantes
    WHERE id_empresa_fk = ?
    `,
    [id_empresa]
  );

  const [[totalPostulaciones]] = await pool.query(
    `
    SELECT COUNT(*) AS total_postulaciones
    FROM Postulaciones p
    INNER JOIN Vacantes v ON p.id_vacante_fk = v.id_vacante
    WHERE v.id_empresa_fk = ?
    `,
    [id_empresa]
  );

  const [ultimasVacantes] = await pool.query(
    `
    SELECT
      id_vacante,
      titulo_puesto,
      modalidad,
      salario_offrecido,
      fecha_publicacion
    FROM Vacantes
    WHERE id_empresa_fk = ?
    ORDER BY id_vacante DESC
    LIMIT 5
    `,
    [id_empresa]
  );

  const [ultimasPostulaciones] = await pool.query(
    `
    SELECT
      p.id_postulacion,
      p.fecha_postulacion,
      p.id_estado_fk,
      ep.nombre_estado,
      v.id_vacante,
      v.titulo_puesto,
      u.id_usuario,
      CONCAT(u.nombres, ' ', u.apellidos) AS nombre_usuario
    FROM Postulaciones p
    INNER JOIN Vacantes v ON p.id_vacante_fk = v.id_vacante
    INNER JOIN Usuarios u ON p.id_usuario_fk = u.id_usuario
    INNER JOIN Estados_Postulacion ep ON p.id_estado_fk = ep.id_estado
    WHERE v.id_empresa_fk = ?
    ORDER BY p.id_postulacion DESC
    LIMIT 5
    `,
    [id_empresa]
  );

  return {
    empresa,
    metricas: {
      total_vacantes: totalVacantes.total_vacantes,
      total_postulaciones: totalPostulaciones.total_postulaciones
    },
    ultimasVacantes,
    ultimasPostulaciones
  };
};