import { body, validationResult } from "express-validator";

export const validarResultados = (req, res, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      mensaje: "Errores de validación",
      errores: errores.array()
    });
  }

  next();
};

export const validarLogin = [
  body("correo_electronico")
    .notEmpty().withMessage("El correo_electronico es obligatorio")
    .isEmail().withMessage("El correo_electronico no es válido"),

  body("contrasena")
    .notEmpty().withMessage("La contrasena es obligatoria")
    .isLength({ min: 6 }).withMessage("La contrasena debe tener al menos 6 caracteres"),

  // ❌ BORRAMOS EL BLOQUE DE body("tipo") 
  // Ya no es obligatorio porque la DB lo decidirá.

  validarResultados
];
export const validarRegistroUsuario = [
  body("nombres")
    .notEmpty().withMessage("Los nombres son obligatorios"),

  body("apellidos")
    .notEmpty().withMessage("Los apellidos son obligatorios"),

  body("correo_electronico")
    .notEmpty().withMessage("El correo_electronico es obligatorio")
    .isEmail().withMessage("El correo_electronico no es válido"),

  body("contrasena")
    .notEmpty().withMessage("La contrasena es obligatoria")
    .isLength({ min: 6 }).withMessage("La contrasena debe tener al menos 6 caracteres"),

  body("telefono")
    .notEmpty().withMessage("El telefono es obligatorio"),

  body("id_municipio_fk")
    .notEmpty().withMessage("El id_municipio_fk es obligatorio")
    .isInt().withMessage("El id_municipio_fk debe ser numérico"),

  body("resumen_profesional")
    .notEmpty().withMessage("El resumen_profesional es obligatorio"),

  validarResultados
];

export const validarRegistroEmpresa = [
  body("nombre_comercial")
    .notEmpty().withMessage("El nombre_comercial es obligatorio"),

  body("razon_social")
    .notEmpty().withMessage("La razon_social es obligatoria"),

  body("correo_electronico")
    .notEmpty().withMessage("El correo_electronico es obligatorio")
    .isEmail().withMessage("El correo_electronico no es válido"),

  body("contrasena")
    .notEmpty().withMessage("La contrasena es obligatoria")
    .isLength({ min: 6 }).withMessage("La contrasena debe tener al menos 6 caracteres"),

  body("id_municipio_fk")
    .notEmpty().withMessage("El id_municipio_fk es obligatorio")
    .isInt().withMessage("El id_municipio_fk debe ser numérico"),

  validarResultados
];

export const validarVacante = [
  body("id_categoria_fk")
    .notEmpty().withMessage("El id_categoria_fk es obligatorio")
    .isInt().withMessage("El id_categoria_fk debe ser numérico"),

  body("titulo_puesto")
    .notEmpty().withMessage("El titulo_puesto es obligatorio"),

  body("descripcion_puesto")
    .notEmpty().withMessage("La descripcion_puesto es obligatoria"),

  body("salario_offrecido")
    .notEmpty().withMessage("El salario_offrecido es obligatorio")
    .isDecimal().withMessage("El salario_offrecido debe ser decimal"),

  body("modalidad")
    .notEmpty().withMessage("La modalidad es obligatoria"),

  body("id_municipio_fk")
    .notEmpty().withMessage("El id_municipio_fk es obligatorio")
    .isInt().withMessage("El id_municipio_fk debe ser numérico"),

  validarResultados
];

export const validarPostulacion = [
  body("id_usuario_fk")
    .notEmpty().withMessage("El id_usuario_fk es obligatorio")
    .isInt().withMessage("El id_usuario_fk debe ser numérico"),

  body("id_vacante_fk")
    .notEmpty().withMessage("El id_vacante_fk es obligatorio")
    .isInt().withMessage("El id_vacante_fk debe ser numérico"),

  body("id_estado_fk")
    .notEmpty().withMessage("El id_estado_fk es obligatorio")
    .isInt().withMessage("El id_estado_fk debe ser numérico"),

  validarResultados
];

export const validarValoracion = [
  body("id_empresa_fk")
    .notEmpty().withMessage("El id_empresa_fk es obligatorio")
    .isInt().withMessage("El id_empresa_fk debe ser numérico"),

  body("puntuacion")
    .notEmpty().withMessage("La puntuacion es obligatoria")
    .isInt({ min: 1, max: 5 }).withMessage("La puntuacion debe estar entre 1 y 5"),

  body("comentario")
    .notEmpty().withMessage("El comentario es obligatorio"),

  validarResultados
];