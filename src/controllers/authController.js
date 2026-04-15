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
    const { correo_electronico, contrasena, tipo } = req.body;

    if (!correo_electronico || !contrasena || !tipo) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }


    if (tipo === "usuario") {
      const usuario = await loginUsuario(correo_electronico);

      // Si no existe el usuario o la contraseña es nula
      if (!usuario || !usuario.contrasena) {
        return res.status(401).json({ mensaje: "Credenciales inválidas para usuario" });
      }

      const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);

      if (!passwordValida) {
        return res.status(401).json({ mensaje: "Credenciales inválidas para usuario" });
      }

      const token = generarToken({ id: usuario.id_usuario, tipo: "usuario" });
      const { contrasena: _, ...usuarioSinPassword } = usuario;

      return res.json({
        mensaje: "Login correcto",
        tipo: "usuario",
        token,
        data: usuarioSinPassword
      });
    }

   
    if (tipo === "empresa") {
      const empresa = await loginEmpresa(correo_electronico);

      // Si no existe la empresa o la contraseña es nula
      if (!empresa || !empresa.contrasena) {
        return res.status(401).json({ mensaje: "Credenciales inválidas para empresa" });
      }

      const passwordValida = await bcrypt.compare(contrasena, empresa.contrasena);

      if (!passwordValida) {
        return res.status(401).json({ mensaje: "Credenciales inválidas para empresa" });
      }

      const token = generarToken({ id: empresa.id_empresa, tipo: "empresa" });
      const { contrasena: _, ...empresaSinPassword } = empresa;

      return res.json({
        mensaje: "Login correcto",
        tipo: "empresa",
        token,
        data: empresaSinPassword
      });
    }

    return res.status(400).json({ mensaje: "Tipo no válido. Usa 'usuario' o 'empresa'" });

  } catch (error) {
    console.log("ERROR EN LOGIN:", error); 
    res.status(500).json({
      mensaje: "Error interno del servidor al iniciar sesión",
      error: error.message
    });
  }
};


export const registrarUsuario = async (req, res) => {
  try {
    const { nombres, apellidos, correo_electronico, contrasena, telefono, id_municipio_fk, resumen_profesional } = req.body;

    // 1. ENCRIPTAR LA CONTRASEÑA AQUÍ
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(contrasena, salt);

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
    const passwordEncriptada = await bcrypt.hash(contrasena, salt);
console.log("--- DEBUG LOGIN EMPRESA ---");
console.log("Clave escrita en navegador:", contrasena);
console.log("Hash guardado en DB:", empresa.contrasena);
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