import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_EMAIL_FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@empleosweb.com";
const PLACEHOLDER_VALUES = new Set([
  "",
  "tuemail@gmail.com",
  "tu_contrasena_de_app"
]);

let transporter;
let transportMeta;

const cleanEnv = (value) => String(value || "").trim();

const getEmailConfig = () => {
  const host = cleanEnv(process.env.EMAIL_HOST);
  const port = cleanEnv(process.env.EMAIL_PORT);
  const user = cleanEnv(process.env.EMAIL_USER);
  const pass = cleanEnv(process.env.EMAIL_PASS);
  const from = cleanEnv(process.env.EMAIL_FROM);
  const hasRequired = Boolean(host && port && user && pass);
  const usesPlaceholders =
    PLACEHOLDER_VALUES.has(user) ||
    PLACEHOLDER_VALUES.has(pass) ||
    (!from || PLACEHOLDER_VALUES.has(from));

  return {
    host,
    port,
    user,
    pass,
    from: from || user || DEFAULT_EMAIL_FROM,
    hasRequired,
    usesPlaceholders
  };
};

const getTransporter = () => {
  if (transporter && transportMeta) {
    return { transporter, meta: transportMeta };
  }

  const config = getEmailConfig();
  const canUseRealSmtp = config.hasRequired && !config.usesPlaceholders;

  transporter = canUseRealSmtp
    ? nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      })
    : nodemailer.createTransport({
        jsonTransport: true
      });

  transportMeta = canUseRealSmtp
    ? {
        mode: "smtp",
        canDeliver: true,
        info: `SMTP configurado con ${config.user}`
      }
    : {
        mode: "simulated",
        canDeliver: false,
        info: "SMTP no configurado con credenciales reales. El correo se simulara localmente."
      };

  return { transporter, meta: transportMeta };
};

const renderEmailLayout = ({ title, lead, content, actionLabel, actionUrl, footerNote }) => `
  <div style="background:#eef4ff;padding:32px 16px;font-family:Arial,sans-serif;color:#182033;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 40px rgba(4,21,75,0.12);">
      <div style="background:linear-gradient(135deg,#04154b,#275df5);padding:28px 32px;color:#ffffff;">
        <div style="font-size:28px;font-weight:800;letter-spacing:0.02em;">Empleos_Web</div>
        <div style="opacity:0.82;font-size:14px;margin-top:6px;">Conectando talento con oportunidades reales</div>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.15;color:#182033;">${title}</h1>
        <p style="margin:0 0 18px;font-size:16px;line-height:1.65;color:#4a5568;">${lead}</p>
        <div style="font-size:15px;line-height:1.7;color:#4a5568;">${content}</div>
        ${actionUrl ? `
          <div style="margin-top:28px;">
            <a href="${actionUrl}" style="display:inline-block;background:#275df5;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:700;">
              ${actionLabel}
            </a>
          </div>
          <p style="margin:16px 0 0;font-size:13px;color:#6a7488;word-break:break-word;">Si el botón no funciona, copia este enlace en tu navegador:<br>${actionUrl}</p>
        ` : ""}
      </div>
      <div style="padding:20px 32px;background:#f8fbff;border-top:1px solid #e7edf9;color:#6a7488;font-size:13px;line-height:1.6;">
        ${footerNote}
      </div>
    </div>
  </div>
`;

const enviarCorreo = async ({ to, subject, html, text }) => {
  const { transporter: mailer, meta } = getTransporter();
  const config = getEmailConfig();
  const result = await mailer.sendMail({
    from: config.from,
    to,
    subject,
    html,
    text
  });

  if (meta.mode === "simulated") {
    console.warn(`[email-service] Correo simulado para ${to}. ${meta.info}`);
    console.warn(`[email-service] Asunto: ${subject}`);
  } else {
    console.log(`[email-service] Correo enviado a ${to} usando ${meta.mode}. MessageId: ${result.messageId || "sin-id"}`);
  }

  return {
    ...result,
    delivery: meta
  };
};

export const enviarVerificacionCorreo = async (email, nombre, codigo) => {
  return enviarCorreo({
    to: email,
    subject: "Codigo de verificacion - Empleos_Web",
    text: `Hola ${nombre}. Tu codigo de verificacion es ${codigo}. Expira en 24 horas.`,
    html: renderEmailLayout({
      title: "Verifica tu correo",
      lead: `Hola ${nombre}, usa este codigo para confirmar tu correo electronico dentro de Empleos_Web.`,
      content: `
        <p style="margin:0 0 14px;">Tu codigo de verificacion es:</p>
        <div style="display:inline-block;background:#f3f6ff;border:1px solid #d9e4ff;border-radius:18px;padding:14px 22px;font-size:34px;font-weight:800;letter-spacing:0.18em;color:#04154b;">
          ${codigo}
        </div>
        <p style="margin:18px 0 0;">Por seguridad, el codigo expira en <strong>24 horas</strong>.</p>
        <p style="margin:12px 0 0;">Escribelo en la pantalla de verificacion de la plataforma. Si no ves el correo en tu bandeja principal, revisa spam o promociones.</p>
      `,
      footerNote: "Este mensaje fue generado para verificar tu cuenta en Empleos_Web."
    })
  });
};

export const enviarBienvenida = async (email, nombre, codigo = "") => {
  return enviarCorreo({
    to: email,
    subject: "Bienvenido a Empleos_Web - Verifica tu cuenta",
    text: `Hola ${nombre}. Bienvenido a Empleos_Web. ${codigo ? `Tu codigo de verificacion es ${codigo}.` : ""}`,
    html: renderEmailLayout({
      title: "Bienvenido a Empleos_Web",
      lead: `Hola ${nombre}, tu cuenta fue creada correctamente y ya casi esta lista para usarse.`,
      content: `
        <p>Para activar tu acceso debes verificar tu correo electronico antes de iniciar sesion.</p>
        ${codigo ? `
          <p style="margin:18px 0 12px;">Ingresa este codigo en la pantalla de verificacion:</p>
          <div style="display:inline-block;background:#f3f6ff;border:1px solid #d9e4ff;border-radius:18px;padding:14px 22px;font-size:34px;font-weight:800;letter-spacing:0.18em;color:#04154b;">
            ${codigo}
          </div>
        ` : ""}
        <p style="margin:18px 0 0;">El codigo expira en <strong>24 horas</strong>. Si no encuentras el mensaje, revisa tambien spam o promociones.</p>
      `,
      footerNote: "Si no creaste esta cuenta, puedes ignorar este correo. Nadie podra ingresar sin completar la verificacion."
    })
  });
};

export const enviarConfirmacionVerificacion = async (email, nombre) => {
  return enviarCorreo({
    to: email,
    subject: "Email verificado correctamente - Empleos_Web",
    text: `Hola ${nombre}. Tu correo ya fue verificado correctamente. Ya puedes iniciar sesion en Empleos_Web.`,
    html: renderEmailLayout({
      title: "Email verificado correctamente",
      lead: `Excelente, ${nombre}. Tu cuenta ya esta activa.`,
      content: `
        <p>Ahora ya puedes iniciar sesion y continuar con tu experiencia dentro de Empleos_Web.</p>
        <p>Si alguna vez no reconoces actividad en tu cuenta, cambia tu contrasena de inmediato.</p>
      `,
      footerNote: "Gracias por verificar tu identidad y ayudarnos a mantener la plataforma mas segura."
    })
  });
};

export const getEmailDeliveryStatus = () => {
  const { meta } = getTransporter();
  return meta;
};
