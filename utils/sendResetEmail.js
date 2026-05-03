import nodemailer from 'nodemailer'
export async function sendResetEmail(email, resetURL) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',  
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    })

    await transporter.sendMail({
        from: `"MyApp Support" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
      <p>You requested a password reset.</p>
      <p>Click the link below (valid for 15 minutes):</p>
      <a href="${resetURL}">Reset Password</a>
      <p>If you didn't request this, ignore this email.</p>
    `,
    })
}