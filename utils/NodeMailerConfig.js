import nodemailer from 'nodemailer'

let transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'business@creadivsol.com',
        pass: 'CreadivSol@001'
    },
    tls: { rejectUnauthorized: false }
});



export default transporter;