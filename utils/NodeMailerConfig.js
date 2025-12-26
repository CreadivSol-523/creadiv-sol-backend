import nodemailer from 'nodemailer'
import dotenv from "dotenv";

dotenv.config();

let transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    },
    tls: { rejectUnauthorized: false }
});



export default transporter;