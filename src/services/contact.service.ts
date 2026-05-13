import Contact from "../models/Contact";
import { IContact } from "../types/contact.types";
import emailService from "./email.service";

class ContactService {
  async submitContactForm(data: any) {
    const contact = await Contact.create(data);
    emailService.sendContactEmails(contact as IContact);
    return contact;
  }
}

export default new ContactService();
