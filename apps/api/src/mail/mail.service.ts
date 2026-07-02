import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.initEthereal();
  }

  private async initEthereal() {
    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Usa provedor de email REAL (Gmail, Resend, etc)
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 465,
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        this.logger.log('📩 SMTP Real configurado com sucesso!');
        return;
      }

      // Fallback: Cria uma conta de testes automática no Ethereal
      // Cria uma conta de testes automática no Ethereal
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.logger.log('📩 Nodemailer/Ethereal configurado com sucesso. E-mails serão gerados em modo DEV.');
    } catch (err) {
      this.logger.error('Falha ao configurar Ethereal Mail', err);
    }
  }

  async send2FACode(to: string, code: string) {
    if (!this.transporter) {
      this.logger.warn('Transporter não inicializado. Simulando no log:');
      console.log(`[2FA CODE para ${to}]: ${code}`);
      return;
    }

    try {
      this.transporter.sendMail({
        from: '"PostFlow AI Security" <security@postflow.ai>',
        to,
        subject: 'Seu Código de Segurança 2FA',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #10B981;">PostFlow AI - Acesso Seguro</h2>
            <p>Alguém tentou fazer login na sua conta. Se foi você, utilize o código abaixo:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #6b7280; font-size: 12px;">Este código expira em 5 minutos. Se não foi você, recomendamos alterar sua senha imediatamente.</p>
          </div>
        `
      }).then(info => {
        this.logger.log(`✅ E-mail de 2FA enviado para ${to}`);
        this.logger.log(`🔗 PREVIEW DO E-MAIL: ${nodemailer.getTestMessageUrl(info)}`);
      }).catch(err => {
        this.logger.error('Erro ao enviar email silencioso:', err);
      });
    } catch (error) {
      this.logger.error('Erro ao enviar e-mail 2FA', error);
    }
  }

  async sendPasswordRecovery(to: string, resetToken: string) {
    if (!this.transporter) {
      this.logger.warn('Transporter não inicializado. Simulando no log:');
      console.log(`[RECOVERY TOKEN para ${to}]: ${resetToken}`);
      return;
    }

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    try {
      const info = await this.transporter.sendMail({
        from: '"PostFlow AI Suporte" <support@postflow.ai>',
        to,
        subject: 'Recuperação de Senha',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #6366f1;">Recuperação de Senha</h2>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Redefinir Minha Senha</a>
            </div>
            <p style="color: #6b7280; font-size: 12px;">Ou copie e cole este link: ${resetLink}</p>
            <p style="color: #6b7280; font-size: 12px;">Este link expira em 30 minutos. Se você não solicitou, ignore este e-mail.</p>
          </div>
        `,
      });

      this.logger.log(`✅ E-mail de Recuperação enviado para ${to}`);
      this.logger.log(`🔗 PREVIEW DO E-MAIL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
      this.logger.error('Erro ao enviar e-mail de recuperação', error);
    }
  }
}
