import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const APP_BASE_URL = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
const EMAIL_FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@empleosweb.com";

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const hasSmtpConfig = process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS;

  transporter = hasSmtpConfig
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

  return transporter;
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
  const mailer = getTransporter();
  return mailer.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    html,
    text
  });
};

export const construirEnlaceVerificacion = (token) =>
  `${APP_BASE_URL}/api/auth/verificar-email?token=${encodeURIComponent(token)}`;

export const enviarVerificacionCorreo = async (email, nombre, token) => {
  const verificationUrl = construirEnlaceVerificacion(token);

  return enviarCorreo({
    to: email,
    subject: "Reenvio de verificacion - Empleos_Web",
    text: `Hola ${nombre}. Reenviaremos tu acceso de verificacion. Usa este enlace: ${verificationUrl}`,
    html: renderEmailLayout({
      title: "Reenvio de verificacion",
      lead: `Hola ${nombre}, aqui tienes un nuevo enlace para confirmar tu correo electronico.`,
      content: `
        <p>Por seguridad, el enlace expira en <strong>24 horas</strong>.</p>
        <p>Si no ves el correo en tu bandeja principal, revisa spam o promociones.</p>
      `,
      actionLabel: "Verificar correo",
      actionUrl: verificationUrl,
      footerNote: "Este mensaje fue generado porque solicitaste un nuevo enlace de verificacion en Empleos_Web."
    })
  });
};

export const enviarBienvenida = async (email, nombre, token = "") => {
  const verificationUrl = token ? construirEnlaceVerificacion(token) : "";

  return enviarCorreo({
    to: email,
    subject: "Bienvenido a Empleos_Web - Verifica tu cuenta",
    text: `Hola ${nombre}. Bienvenido a Empleos_Web. ${verificationUrl ? `Verifica tu cuenta aqui: ${verificationUrl}` : ""}`,
    html: renderEmailLayout({
      title: "Bienvenido a Empleos_Web",
      lead: `Hola ${nombre}, tu cuenta fue creada correctamente y ya casi esta lista para usarse.`,
      content: `
        <p>Para activar tu acceso debes verificar tu correo electronico antes de iniciar sesion.</p>
        <p>El enlace expira en <strong>24 horas</strong>. Si no encuentras el mensaje, revisa tambien spam o promociones.</p>
      `,
      actionLabel: "Verificar mi cuenta",
      actionUrl: verificationUrl,
      footerNote: "Si no creaste esta cuenta, puedes ignorar este correo. Nadie podra ingresar sin completar la verificacion."
    })
  });
};

export const enviarConfirmacionVerificacion = async (email, nombre) => {
  const loginUrl = `${APP_BASE_URL}/views/public/login/index.html?verified=1`;

  return enviarCorreo({
    to: email,
    subject: "Email verificado correctamente - Empleos_Web",
    text: `Hola ${nombre}. Tu correo ya fue verificado correctamente. Puedes iniciar sesion en ${loginUrl}`,
    html: renderEmailLayout({
      title: "Email verificado correctamente",
      lead: `Excelente, ${nombre}. Tu cuenta ya esta activa.`,
      content: `
        <p>Ahora ya puedes iniciar sesion y continuar con tu experiencia dentro de Empleos_Web.</p>
        <p>Si alguna vez no reconoces actividad en tu cuenta, cambia tu contrasena de inmediato.</p>
      `,
      actionLabel: "Ir a iniciar sesion",
      actionUrl: loginUrl,
      footerNote: "Gracias por verificar tu identidad y ayudarnos a mantener la plataforma mas segura."
    })
  });
};
