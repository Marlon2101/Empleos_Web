import {
  loginUsuario,
  loginEmpresa,
  registerUsuarioAuth,
  registerEmpresaAuth
} from "../models/authModel.js";
import bcrypt from "bcryptjs";
import { generarToken } from "../utils/jwt.js";

export const iniciarSesion = async (req, res) => {
  try {
    const { correo_electronico, contrasena } = req.body;

    if (!correo_electronico || !contrasena) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    // 1. Buscamos en USUARIOS
    let persona = await loginUsuario(correo_electronico);
    let tipoIdentificado = "usuario";

    // 2. Si no es usuario, buscamos en EMPRESAS
    if (!persona) {
      persona = await loginEmpresa(correo_electronico);
      tipoIdentificado = "empresa";
    }

    // 3. Si no existe en ninguna
    if (!persona) {
      return res.status(401).json({ mensaje: "El correo electrónico no está registrado" });
    }

    // --- DEBUG PARA CONSOLA ---
    console.log(`--- INTENTO DE LOGIN [${tipoIdentificado}] ---`);
    
    // Limpieza de datos para evitar errores de comparación
    const passwordIngresada = contrasena.toString().trim();
    const hashDB = persona.contrasena ? persona.contrasena.toString() : null;

    if (!hashDB) {
      console.log("❌ ERROR: No se encontró el campo 'contrasena' en el objeto de la DB");
      return res.status(500).json({ mensaje: "Error interno en la estructura de datos" });
    }

    // 4. VALIDACIÓN DE CONTRASEÑA
    const passwordValida = await bcrypt.compare(passwordIngresada, hashDB);
    
    if (!passwordValida) {
      console.log("❌ RESULTADO: Contraseña incorrecta");
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    console.log("✅ RESULTADO: Contraseña válida");

    // 5. OBTENER EL ID CORRECTO
    const idValue = persona.id_usuario || persona.id_empresa || persona.id;

    // 6. GENERAR TOKEN
    const token = generarToken({ id: idValue, tipo: tipoIdentificado });

    // 7. RESPUESTA SIN LA CONTRASEÑA POR SEGURIDAD
    const { contrasena: _, ...datosSinPassword } = persona;

    return res.json({
      mensaje: "Login correcto",
      token,
      tipo: tipoIdentificado,
      data: datosSinPassword
    });

  } catch (error) {
    console.error("ERROR CRÍTICO EN LOGIN:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// --- REGISTROS ---
export const registrarUsuario = async (req, res) => {
  try {
    const { nombres, apellidos, correo_electronico, contrasena, telefono, id_municipio_fk, resumen_profesional } = req.body;

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(contrasena.trim(), salt);

    const nuevoUsuario = await registerUsuarioAuth({
      nombres,
      apellidos,
      correo_electronico,
      contrasena: passwordEncriptada, 
      telefono,
      id_municipio_fk,
      resumen_profesional
    });

    res.status(201).json({ mensaje: "Usuario registrado correctamente", data: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario", error: error.message });
  }
};

export const registrarEmpresa = async (req, res) => {
  try {
    const { nombre_comercial, razon_social, sitio_web, descripcion_empresa, id_municipio_fk, correo_electronico, contrasena } = req.body;

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(contrasena.trim(), salt);

    const nuevaEmpresa = await registerEmpresaAuth({
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      correo_electronico,
      contrasena: passwordEncriptada 
    });

    res.status(201).json({ mensaje: "Empresa registrada correctamente", data: nuevaEmpresa });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar empresa", error: error.message });
  }
};