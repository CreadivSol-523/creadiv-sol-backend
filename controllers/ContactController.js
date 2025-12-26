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

        await autoMailer({
            to: "steve@creadivsol.com",
            subject: "New Contact Query",
            message: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone ? phone : "N/A"}</p>
          <p><strong>Services:</strong> ${contact.services?.length
                    ? contact.services.join(", ")
                    : "N/A"
                }</p>
          <p><strong>Description:</strong> ${description || "N/A"}</p>
        `,
        });


        await autoMailer({
            to: "business@creadivsol.com",
            subject: "New Contact Query",
            message: `
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone ? phone : "N/A"}</p>
              <p><strong>Services:</strong> ${contact.services?.length
                    ? contact.services.join(", ")
                    : "N/A"
                }</p>
              <p><strong>Description:</strong> ${description || "N/A"}</p>
            `,
        });

        await autoMailer({
            to: email,
            subject: "Thank You For Connecting With CreadivSol",
            message: `Please Wait Our Team Will Respond To You Within 24 hours`,
        });

        return res.status(201).json({
            success: true,
            message: "Your message has been sent successfully",
            data: contact,
        });

    } catch (error) {
        console.error("ContactUs Error:", error);
        next(error);
    }
};
