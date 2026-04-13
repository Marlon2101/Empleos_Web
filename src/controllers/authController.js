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
      return res.status(400).json({
        mensaje: "Debes enviar correo_electronico, contrasena y tipo"
      });
    }

    if (tipo === "usuario") {
      const usuario = await loginUsuario(correo_electronico);

      if (!usuario) {
        return res.status(401).json({
          mensaje: "Credenciales inválidas para usuario"
        });
      }

      const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);

      if (!passwordValida) {
        return res.status(401).json({
          mensaje: "Credenciales inválidas para usuario"
        });
      }

      const token = generarToken({
        id: usuario.id_usuario,
        tipo: "usuario"
      });

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

      if (!empresa) {
        return res.status(401).json({
          mensaje: "Credenciales inválidas para empresa"
        });
      }

      const passwordValida = await bcrypt.compare(contrasena, empresa.contrasena);

      if (!passwordValida) {
        return res.status(401).json({
          mensaje: "Credenciales inválidas para empresa"
        });
      }

      const token = generarToken({
        id: empresa.id_empresa,
        tipo: "empresa"
      });

      const { contrasena: _, ...empresaSinPassword } = empresa;

      return res.json({
        mensaje: "Login correcto",
        tipo: "empresa",
        token,
        data: empresaSinPassword
      });
    }

    return res.status(400).json({
      mensaje: "Tipo no válido. Usa 'usuario' o 'empresa'"
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al iniciar sesión",
      error: error.message
    });
  }
};

// Asegúrate de que los nombres coincidan con las rutas
export const registrarUsuario = async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      correo_electronico,
      contrasena,
      telefono,
      id_municipio_fk,
      resumen_profesional
    } = req.body;

    // Llamamos al modelo que tú ya tienes bien escrito
    const nuevoUsuario = await registerUsuarioAuth({
      nombres,
      apellidos,
      correo_electronico,
      contrasena,
      telefono,
      id_municipio_fk,
      resumen_profesional
    });

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      data: nuevoUsuario
    });
  } catch (error) {
    // Si hay un error de MySQL (como correo duplicado), saldrá aquí
    res.status(500).json({
      mensaje: "Error al registrar usuario",
      error: error.message
    });
  }
};

export const registrarEmpresa = async (req, res) => {
  try {
    const {
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      correo_electronico,
      contrasena
    } = req.body;

    const nuevaEmpresa = await registerEmpresaAuth({
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      correo_electronico,
      contrasena
    });

    res.status(201).json({
      mensaje: "Empresa registrada correctamente",
      data: nuevaEmpresa
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al registrar empresa",
      error: error.message
    });
  }
};