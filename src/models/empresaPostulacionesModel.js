import { pool } from "../config/db.js";

export const getPostulacionesEmpresa = async (id_empresa) => {
  const [rows] = await pool.query(
    `
    SELECT
      p.id_postulacion,
      p.fecha_postulacion,
      p.id_estado_fk,
      ep.nombre_estado,

      u.id_usuario,
      u.nombres,
      u.apellidos,
      u.correo_electronico,
      u.telefono,
      u.resumen_profesional,

      v.id_vacante,
      v.titulo_puesto,
      v.modalidad,
      v.salario_offrecido
    FROM Postulaciones p
    INNER JOIN Usuarios u ON p.id_usuario_fk = u.id_usuario
    INNER JOIN Vacantes v ON p.id_vacante_fk = v.id_vacante
    INNER JOIN Estados_Postulacion ep ON p.id_estado_fk = ep.id_estado
    WHERE v.id_empresa_fk = ?
    ORDER BY p.id_postulacion DESC
    `,
    [id_empresa]
  );

  return rows;
};

export const getDetallePostulacionEmpresa = async (id_postulacion, id_empresa) => {
  const [rows] = await pool.query(
    `
    SELECT
      p.id_postulacion,
      p.fecha_postulacion,
      p.id_estado_fk,
      ep.nombre_estado,

      u.id_usuario,
      u.nombres,
      u.apellidos,
      u.correo_electronico,
      u.telefono,
      u.id_municipio_fk,
      u.resumen_profesional,

      v.id_vacante,
      v.titulo_puesto,
      v.descripcion_puesto,
      v.modalidad,
      v.salario_offrecido,

      e.id_empresa,
      e.nombre_comercial
    FROM Postulaciones p
    INNER JOIN Usuarios u ON p.id_usuario_fk = u.id_usuario
    INNER JOIN Vacantes v ON p.id_vacante_fk = v.id_vacante
    INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
    INNER JOIN Estados_Postulacion ep ON p.id_estado_fk = ep.id_estado
    WHERE p.id_postulacion = ? AND e.id_empresa = ?
    `,
    [id_postulacion, id_empresa]
  );

  return rows[0];
};