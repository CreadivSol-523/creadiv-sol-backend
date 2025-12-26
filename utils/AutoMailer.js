import transporter from "./NodeMailerConfig.js";

const autoMailer = async ({
    from = "business@creadivsol.com",
    to,
    subject,
    message,
}) => {
    try {
        const info = await transporter.sendMail({
            from,
            to,
            subject,
            html: message,
        });
        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("AutoMailer Error:", error);
        throw error; // important
    }
};



export default autoMailer;