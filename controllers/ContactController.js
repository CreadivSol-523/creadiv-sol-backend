import { sendTemplateEmail, sendThankYouContact } from "../emails/ContactUsEmail.js";
import ContactUsModel from "../models/ContactUsSchema.js";
import autoMailer from "../utils/AutoMailer.js";


export const createContactMessage = async (req, res, next) => {
    try {
        const {
            name,
            services,
            email,
            phone,
            description,
        } = req.body;

        if (!name || !email || !description) {
            return res.status(400).json({
                success: false,
                message: "Name, email and message are required",
            });
        }

        const contact = new ContactUsModel({
            name,
            services,
            email,
            phone,
            description,
        });
        await contact.save();


        res.status(201).json({
            success: true,
            message: "Your message has been sent successfully",
            data: contact,
        });


        await sendTemplateEmail({
            to: "steve@creadivsol.com",
            subject: "New Contact Query",
            template: "EmailTemplate",
            data: {
                title: "New Contact Query",
                name: name,
                email: email,
                phone: phone,
                services: contact.services,
                description: description
            }
        });

        await sendTemplateEmail({
            to: "business@creadivsol.com",
            subject: "New Contact Query",
            template: "EmailTemplate",
            data: {
                title: "New Contact Query",
                name: name,
                email: email,
                phone: phone,
                services: contact.services,
                description: description
            }
        });

        await sendThankYouContact({
            to: email,
            subject: "Thank You For Connecting With CreadivSol",
            template: "ContactThankYou",
            data: {
                title: "Thank You",
                message: `Please Wait Our Team Will Respond To You Within 24 hours`,
            }
        });


    } catch (error) {
        console.error("ContactUs Error:", error);
        next(error);
    }
};
