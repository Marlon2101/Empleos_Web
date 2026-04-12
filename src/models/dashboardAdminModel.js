import { pool } from "../config/db.js";

export const getResumenAdmin = async () => {
  const [[totalUsuarios]] = await pool.query(`
    SELECT COUNT(*) AS total_usuarios
    FROM Usuarios
  `);

  const [[totalEmpresas]] = await pool.query(`
    SELECT COUNT(*) AS total_empresas
    FROM Empresas
  `);

  const [[totalVacantes]] = await pool.query(`
    SELECT COUNT(*) AS total_vacantes
    FROM Vacantes
  `);

  const [[totalPostulaciones]] = await pool.query(`
    SELECT COUNT(*) AS total_postulaciones
    FROM Postulaciones
  `);

  const [ultimosUsuarios] = await pool.query(`
    SELECT
      id_usuario,
      nombres,
      apellidos,
      correo_electronico
    FROM Usuarios
    ORDER BY id_usuario DESC
    LIMIT 5
  `);

  const [ultimasEmpresas] = await pool.query(`
    SELECT
      id_empresa,
      nombre_comercial,
      razon_social,
      correo_electronico
    FROM Empresas
    ORDER BY id_empresa DESC
    LIMIT 5
  `);

  const [ultimasVacantes] = await pool.query(`
    SELECT
      v.id_vacante,
      v.titulo_puesto,
      v.modalidad,
      v.salario_offrecido,
      e.nombre_comercial,
      v.fecha_publicacion
    FROM Vacantes v
    INNER JOIN Empresas e ON v.id_empresa_fk = e.id_empresa
    ORDER BY v.id_vacante DESC
    LIMIT 5
  `);

  return {
    metricas: {
      total_usuarios: totalUsuarios.total_usuarios,
      total_empresas: totalEmpresas.total_empresas,
      total_vacantes: totalVacantes.total_vacantes,
      total_postulaciones: totalPostulaciones.total_postulaciones
    },
    ultimosUsuarios,
    ultimasEmpresas,
    ultimasVacantes
  };
};