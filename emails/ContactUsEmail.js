import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import autoMailer from '../utils/AutoMailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const renderEmailTemplate = async (templateName, data) => {
    try {
        const templatePath = path.join(__dirname, 'templates', `${templateName}.ejs`);

        // Add empty options object as third parameter
        const html = await ejs.renderFile(templatePath, data, {});

        return html;
    } catch (error) {
        console.error('Error rendering email template:', error);
        throw error;
    }
};

export const sendTemplateEmail = async ({ to, subject, template, data }) => {
    try {
        const message = await renderEmailTemplate(template, data);

        await autoMailer({
            to,
            subject,
            message
        });

        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error('Error sending template email:', error);
        throw error;
    }
};
export const sendThankYouContact = async ({ to, subject, template, data }) => {
    try {
        const message = await renderEmailTemplate(template, data);

        await autoMailer({
            to,
            subject,
            message
        });

        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error('Error sending template email:', error);
        throw error;
    }
};