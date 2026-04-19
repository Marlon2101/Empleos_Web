import { pool } from "../config/db.js";
// ❌ Borra el import de bcrypt de aquí, ya no lo necesitas en el modelo.

export const loginUsuario = async (correo_electronico) => {
    const [rows] = await pool.query(
        `SELECT id_usuario, nombres, apellidos, correo_electronico, contrasena, telefono, id_municipio_fk, resumen_profesional 
         FROM Usuarios WHERE correo_electronico = ?`,
        [correo_electronico]
    );
    return rows[0];
};

export const loginEmpresa = async (correo_electronico) => {
    const [rows] = await pool.query(
        `SELECT id_empresa, nombre_comercial, razon_social, sitio_web, descripcion_empresa, id_municipio_fk, correo_electronico, contrasena 
         FROM Empresas WHERE correo_electronico = ?`,
        [correo_electronico]
    );
    return rows[0];
};

export const registerEmpresaAuth = async (empresa) => {
    const {
        nombre_comercial, razon_social, sitio_web, descripcion_empresa,
        id_municipio_fk, correo_electronico, contrasena // <-- Esta ya viene encriptada del controlador
    } = empresa;

    try {
        const [result] = await pool.query(
            `INSERT INTO Empresas (nombre_comercial, razon_social, sitio_web, descripcion_empresa, id_municipio_fk, correo_electronico, contrasena) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nombre_comercial, razon_social, sitio_web, descripcion_empresa, id_municipio_fk, correo_electronico, contrasena]
        );

        return { id_empresa: result.insertId, nombre_comercial, correo_electronico };
    } catch (error) {
        console.error("Error en registerEmpresaAuth:", error.message);
        throw error;
    }
};

export const registerUsuarioAuth = async (usuario) => {
    const {
        nombres, apellidos, correo_electronico, contrasena, // <-- Esta ya viene encriptada del controlador
        telefono, id_municipio_fk, resumen_profesional
    } = usuario;

    try {
        const [result] = await pool.query(
            `INSERT INTO Usuarios (nombres, apellidos, correo_electronico, contrasena, telefono, id_municipio_fk, resumen_profesional) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nombres, apellidos, correo_electronico, contrasena, telefono, id_municipio_fk, resumen_profesional]
        );

        return { id_usuario: result.insertId, nombres, correo_electronico };
    } catch (error) {
        console.error("Error en registerUsuarioAuth:", error.message);
        throw error;
    }
};