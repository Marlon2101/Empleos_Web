import { pool } from "../config/db.js";

export const getResumenUsuario = async (id_usuario) => {
  const [[usuario]] = await pool.query(
    `
    SELECT
      id_usuario,
      nombres,
      apellidos,
      correo_electronico,
      telefono,
      id_municipio_fk,
      resumen_profesional
    FROM Usuarios
    WHERE id_usuario = ?
    `,
    [id_usuario]
  );

  const [[totalPostulaciones]] = await pool.query(
    `
    SELECT COUNT(*) AS total_postulaciones
    FROM Postulaciones
    WHERE id_usuario_fk = ?
    `,
    [id_usuario]
  );

  const [[totalHabilidades]] = await pool.query(
    `
    SELECT COUNT(*) AS total_habilidades
    FROM Usuario_Habilidades
    WHERE id_usuario_fk = ?
    `,
    [id_usuario]
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
      e.id_empresa,
      e.nombre_comercial
    FROM Postulaciones p
    INNER JOIN Vacantes v ON p.id_vacante_fk = v.id_vacante
    INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
    INNER JOIN Estados_Postulacion ep ON p.id_estado_fk = ep.id_estado
    WHERE p.id_usuario_fk = ?
    ORDER BY p.id_postulacion DESC
    LIMIT 5
    `,
    [id_usuario]
  );

  const [vacantesRecientes] = await pool.query(
    `
    SELECT
      v.id_vacante,
      v.titulo_puesto,
      v.modalidad,
      v.salario_offrecido,
      v.fecha_publicacion,
      e.nombre_comercial,
      c.nombre_categoria
    FROM Vacantes v
    INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
    INNER JOIN Categorias c ON v.id_categoria_fk = c.id_categoria
    ORDER BY v.id_vacante DESC
    LIMIT 5
    `
  );

  return {
    usuario,
    metricas: {
      total_postulaciones: totalPostulaciones.total_postulaciones,
      total_habilidades: totalHabilidades.total_habilidades
    },
    ultimasPostulaciones,
    vacantesRecientes
  };
};