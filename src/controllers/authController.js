import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  loginUsuario,
  loginEmpresa,
  registerUsuarioAuth,
  registerEmpresaAuth
} from "../models/authModel.js";
import {
  obtenerCuentaPorCorreo,
  obtenerCuentaPorIdYTipo,
  correoYaExisteEnSistema,
  marcarCuentaComoVerificada,
  actualizarCorreoPendienteCuenta
} from "../models/usuarioModel.js";
import {
  invalidarTokensActivos,
  crearTokenVerificacion,
  obtenerTokenVerificacion,
  marcarTokenComoInvalido,
  contarReenviosHoy
} from "../models/emailVerificationModel.js";
import {
  enviarBienvenida,
  enviarVerificacionCorreo,
  enviarConfirmacionVerificacion
} from "../services/emailService.js";
import { generarToken } from "../utils/jwt.js";

const HORAS_VERIFICACION = 24;

const normalizarCorreo = (value) => String(value || "").trim().toLowerCase();

const generarTokenCorreo = () => crypto.randomBytes(32).toString("hex");

const calcularExpiracion = () => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + HORAS_VERIFICACION);
  return expiresAt;
};

const getPendingViewPath = (correo, tipo) =>
  `/views/public/verificacion-pendiente/index.html?email=${encodeURIComponent(correo)}&tipo=${encodeURIComponent(tipo)}`;

const getLoginViewPath = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  return `/views/public/login/index.html${search ? `?${search}` : ""}`;
};

const crearRegistroVerificacion = async ({ id, tipo, motivo = "registro" }) => {
  const token = generarTokenCorreo();
  const expiresAt = calcularExpiracion();

  await invalidarTokensActivos(id, tipo);
  await crearTokenVerificacion({
    usuario_id: id,
    tipo_usuario: tipo,
    token,
    expires_at: expiresAt,
    motivo
  });

  return token;
};

const enviarCorreoBienvenidaSeguro = async (cuenta, token) => {
  try {
    await enviarBienvenida(cuenta.correo_electronico, cuenta.nombre, token);
    return null;
  } catch (error) {
    console.error("No se pudo enviar el correo de bienvenida/verificacion:", error.message);
    return "La cuenta se creo correctamente, pero no se pudo enviar el correo de verificacion. Puedes reenviarlo desde la pantalla de acceso.";
  }
};

export const iniciarSesion = async (req, res) => {
  try {
    const correo_electronico = normalizarCorreo(req.body.correo_electronico);
    const { contrasena } = req.body;

    if (!correo_electronico || !contrasena) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    let persona = await loginUsuario(correo_electronico);
    let tipoIdentificado = "usuario";

    if (!persona) {
      persona = await loginEmpresa(correo_electronico);
      tipoIdentificado = "empresa";
    }

    if (!persona) {
      return res.status(401).json({ mensaje: "El correo electronico no esta registrado" });
    }

    const passwordIngresada = String(contrasena).trim();
    const hashDB = persona.contrasena ? String(persona.contrasena) : "";

    if (!hashDB) {
      return res.status(500).json({ mensaje: "Error interno en la estructura de datos" });
    }

    const passwordValida = await bcrypt.compare(passwordIngresada, hashDB);

    if (!passwordValida) {
      return res.status(401).json({ mensaje: "Contrasena incorrecta" });
    }

    if (!Boolean(persona.email_verificado)) {
      return res.status(403).json({
        mensaje: "Debes verificar tu email antes de iniciar sesion",
        code: "EMAIL_NO_VERIFICADO",
        tipo: tipoIdentificado,
        correo_electronico,
        redirect: getPendingViewPath(correo_electronico, tipoIdentificado)
      });
    }

    const idValue = persona.id_usuario || persona.id_empresa || persona.id;
    const token = generarToken({
      id: idValue,
      tipo: tipoIdentificado,
      email_verificado: true
    });

    const { contrasena: _, ...datosSinPassword } = persona;

    return res.json({
      mensaje: "Login correcto",
      token,
      tipo: tipoIdentificado,
      data: {
        ...datosSinPassword,
        email_verificado: true
      }
    });
  } catch (error) {
    console.error("ERROR CRITICO EN LOGIN:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

export const registrarUsuario = async (req, res) => {
  try {
    const correo_electronico = normalizarCorreo(req.body.correo_electronico);

    if (await correoYaExisteEnSistema(correo_electronico)) {
      return res.status(409).json({
        mensaje: "Ya existe una cuenta registrada con ese correo electronico"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(String(req.body.contrasena || "").trim(), salt);

    const nuevoUsuario = await registerUsuarioAuth({
      nombres: String(req.body.nombres || "").trim(),
      apellidos: String(req.body.apellidos || "").trim(),
      correo_electronico,
      contrasena: passwordEncriptada,
      telefono: String(req.body.telefono || "").trim(),
      id_municipio_fk: req.body.id_municipio_fk,
      resumen_profesional: String(req.body.resumen_profesional || "").trim()
    });

    const cuenta = await obtenerCuentaPorIdYTipo(nuevoUsuario.id_usuario, "usuario");
    const token = await crearRegistroVerificacion({
      id: nuevoUsuario.id_usuario,
      tipo: "usuario",
      motivo: "registro"
    });

    const advertencia = await enviarCorreoBienvenidaSeguro(cuenta, token);

    res.status(201).json({
      mensaje: "Usuario registrado correctamente. Revisa tu correo para verificar tu cuenta.",
      requiere_verificacion: true,
      tipo: "usuario",
      email: correo_electronico,
      redirect: getPendingViewPath(correo_electronico, "usuario"),
      advertencia,
      data: nuevoUsuario
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario", error: error.message });
  }
};

export const registrarEmpresa = async (req, res) => {
  try {
    const correo_electronico = normalizarCorreo(req.body.correo_electronico);

    if (await correoYaExisteEnSistema(correo_electronico)) {
      return res.status(409).json({
        mensaje: "Ya existe una cuenta registrada con ese correo electronico"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(String(req.body.contrasena || "").trim(), salt);

    const nuevaEmpresa = await registerEmpresaAuth({
      nombre_comercial: String(req.body.nombre_comercial || "").trim(),
      razon_social: String(req.body.razon_social || "").trim(),
      sitio_web: String(req.body.sitio_web || "").trim() || null,
      descripcion_empresa: String(req.body.descripcion_empresa || "").trim(),
      id_municipio_fk: req.body.id_municipio_fk,
      correo_electronico,
      contrasena: passwordEncriptada,
      telefono: String(req.body.telefono || "").trim()
    });

    const cuenta = await obtenerCuentaPorIdYTipo(nuevaEmpresa.id_empresa, "empresa");
    const token = await crearRegistroVerificacion({
      id: nuevaEmpresa.id_empresa,
      tipo: "empresa",
      motivo: "registro"
    });

    const advertencia = await enviarCorreoBienvenidaSeguro(cuenta, token);

    res.status(201).json({
      mensaje: "Empresa registrada correctamente. Revisa tu correo para verificar tu cuenta.",
      requiere_verificacion: true,
      tipo: "empresa",
      email: correo_electronico,
      redirect: getPendingViewPath(correo_electronico, "empresa"),
      advertencia,
      data: nuevaEmpresa
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar empresa", error: error.message });
  }
};

export const verificarEmail = async (req, res) => {
  try {
    const token = String(req.query.token || "").trim();

    if (!token) {
      return res.redirect(getLoginViewPath({ verification: "invalid" }));
    }

    const registro = await obtenerTokenVerificacion(token);

    if (!registro || Number(registro.invalidado) === 1) {
      return res.redirect(getLoginViewPath({ verification: "invalid" }));
    }

    const expirado = new Date(registro.expires_at).getTime() < Date.now();
    const cuenta = await obtenerCuentaPorIdYTipo(registro.usuario_id, registro.tipo_usuario);

    if (!cuenta) {
      await marcarTokenComoInvalido(registro.id);
      return res.redirect(getLoginViewPath({ verification: "invalid" }));
    }

    if (expirado) {
      await marcarTokenComoInvalido(registro.id);
      return res.redirect(getPendingViewPath(cuenta.correo_electronico, cuenta.tipo) + "&status=expired");
    }

    await marcarCuentaComoVerificada(registro.usuario_id, registro.tipo_usuario);
    await invalidarTokensActivos(registro.usuario_id, registro.tipo_usuario);

    try {
      await enviarConfirmacionVerificacion(cuenta.correo_electronico, cuenta.nombre);
    } catch (error) {
      console.error("No se pudo enviar la confirmacion de verificacion:", error.message);
    }

    return res.redirect(getLoginViewPath({
      verified: "1",
      email: cuenta.correo_electronico
    }));
  } catch (error) {
    console.error("Error al verificar email:", error);
    res.redirect(getLoginViewPath({ verification: "error" }));
  }
};

export const reenviarVerificacion = async (req, res) => {
  try {
    const correo_electronico = normalizarCorreo(req.body.correo_electronico);

    if (!correo_electronico) {
      return res.status(400).json({ mensaje: "Debes indicar el correo electronico" });
    }

    const cuenta = await obtenerCuentaPorCorreo(correo_electronico);

    if (!cuenta) {
      return res.status(404).json({ mensaje: "No existe una cuenta con ese correo electronico" });
    }

    if (cuenta.email_verificado) {
      return res.status(400).json({ mensaje: "Esta cuenta ya fue verificada" });
    }

    const reenviosHoy = await contarReenviosHoy(cuenta.id, cuenta.tipo);
    if (reenviosHoy >= 3) {
      return res.status(429).json({
        mensaje: "Ya alcanzaste el limite de 3 reenvios por hoy. Intenta nuevamente manana."
      });
    }

    const token = await crearRegistroVerificacion({
      id: cuenta.id,
      tipo: cuenta.tipo,
      motivo: "reenvio"
    });

    await enviarVerificacionCorreo(cuenta.correo_electronico, cuenta.nombre, token);

    res.json({
      mensaje: "Te enviamos un nuevo correo de verificacion.",
      redirect: getPendingViewPath(cuenta.correo_electronico, cuenta.tipo)
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al reenviar la verificacion",
      error: error.message
    });
  }
};

export const cambiarCorreoPendiente = async (req, res) => {
  try {
    const correo_actual = normalizarCorreo(req.body.correo_actual);
    const nuevo_correo = normalizarCorreo(req.body.nuevo_correo);
    const tipo_usuario = String(req.body.tipo_usuario || "").trim();

    if (!correo_actual || !nuevo_correo || !tipo_usuario) {
      return res.status(400).json({
        mensaje: "Debes enviar correo actual, nuevo correo y tipo de usuario"
      });
    }

    const cuenta = await obtenerCuentaPorCorreo(correo_actual);

    if (!cuenta || cuenta.tipo !== tipo_usuario) {
      return res.status(404).json({
        mensaje: "No se encontro una cuenta pendiente con los datos proporcionados"
      });
    }

    if (cuenta.email_verificado) {
      return res.status(400).json({
        mensaje: "La cuenta ya esta verificada. No necesitas cambiar el correo desde esta vista."
      });
    }

    if (await correoYaExisteEnSistema(nuevo_correo, cuenta)) {
      return res.status(409).json({
        mensaje: "El nuevo correo ya esta en uso por otra cuenta"
      });
    }

    const cuentaActualizada = await actualizarCorreoPendienteCuenta(cuenta.id, cuenta.tipo, nuevo_correo);
    const token = await crearRegistroVerificacion({
      id: cuenta.id,
      tipo: cuenta.tipo,
      motivo: "cambio_correo"
    });

    await enviarVerificacionCorreo(cuentaActualizada.correo_electronico, cuentaActualizada.nombre, token);

    res.json({
      mensaje: "Correo actualizado. Revisa tu nueva bandeja de entrada para verificar la cuenta.",
      email: cuentaActualizada.correo_electronico,
      tipo: cuentaActualizada.tipo,
      redirect: getPendingViewPath(cuentaActualizada.correo_electronico, cuentaActualizada.tipo)
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al cambiar el correo pendiente",
      error: error.message
    });
  }
};
