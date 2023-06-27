import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

let transporter = nodemailer.createTransport({
    port: process.env.SMTP_PORT!,
    host: process.env.SMTP_HOST,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})


export const sendActivationLink = async (to: string, link: string) => {
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Активация аккаунта на' + process.env.BACKEND_URL,
        text:'',
        html: 
            `
            <div>
                <h1>Для активации перейдите по ссылке</h1>
                <a href='${link}'>${link}</a>
            </div>
            `
    })
}
export const sendRestoreLink = async (to: string, link: string) => {
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Сброс пароля на ' + process.env.FRONT_URL,
        text: '',
        html: 
            `
            <div>
                <h1>Для сброса пароля перейдите по ссылке</h1>
                <a href='${link}'>${link}</a>
            </div>
            `
    })
}