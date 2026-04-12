import { pool } from "../config/db.js";

export const getPostulacionesUsuario = async (id_usuario) => {
  const [rows] = await pool.query(
    `
    SELECT
      p.id_postulacion,
      p.fecha_postulacion,
      p.id_estado_fk,
      ep.nombre_estado,

      v.id_vacante,
      v.titulo_puesto,
      v.modalidad,
      v.salario_offrecido,

      e.id_empresa,
      e.nombre_comercial
    FROM Postulaciones p
    INNER JOIN Vacantes v ON p.id_vacante_fk = v.id_vacante
    INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
    INNER JOIN Estados_Postulacion ep ON p.id_estado_fk = ep.id_estado
    WHERE p.id_usuario_fk = ?
    ORDER BY p.id_postulacion DESC
    `,
    [id_usuario]
  );

  return rows;
};

export const getDetallePostulacionUsuario = async (id_postulacion, id_usuario) => {
  const [rows] = await pool.query(
    `
    SELECT
      p.id_postulacion,
      p.fecha_postulacion,
      p.id_estado_fk,
      ep.nombre_estado,

      v.id_vacante,
      v.titulo_puesto,
      v.descripcion_puesto,
      v.modalidad,
      v.salario_offrecido,

      e.id_empresa,
      e.nombre_comercial,
      e.razon_social,
      e.sitio_web,
      e.descripcion_empresa
    FROM Postulaciones p
    INNER JOIN Vacantes v ON p.id_vacante_fk = v.id_vacante
    INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
    INNER JOIN Estados_Postulacion ep ON p.id_estado_fk = ep.id_estado
    WHERE p.id_postulacion = ? AND p.id_usuario_fk = ?
    `,
    [id_postulacion, id_usuario]
  );

  return rows[0];
};