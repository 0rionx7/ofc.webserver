import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'karfidouioanna@gmail.com',
    pass: 'loas tdue ennj ennr',
  },
});

export function composeForgotPassword(emailAddress, token) {
  return {
    from: `support@${process.env.DOMAIN_NAME}`,
    to: emailAddress,
    subject: `Επαναφορά κωδικού εισόδου στο ${process.env.DOMAIN_NAME}`,
    html: `
    <div>
      Χρησιμοποιήστε τον παρακάτω σύνδεσμο για την επαναφορά του κωδικού σας στο
      ${process.env.DOMAIN_NAME}. Ο σύνδεσμος θα παραμείνει ενεργός για μία ώρα.<br />
      <a
        href="http://localhost:3000/resetPassword?t=${token}"
        style="text-decoration: none">
        <div
          style="
            padding: 2rem 3rem;
            width: fit-content;
            color: white;
            background-color: #f56700;
            border-radius: 7px;
            font-weight: 600;
            font-size: 1rem;
            margin-top:1rem
          ">
          Eπαναφορά κωδικού
        </div> </a
      ><br />
      Αν δεν αιτηθήκατε επαναφορά κωδικού, παρακαλώ αγνοήστε το μήνυμα.
      <div style="margin-bottom: 1rem" />
      Φιλικά,
      <br />
      η ομάδα του ${process.env.DOMAIN_NAME}
    </div>`,
  };
}
export const criticalErrorEmail = {
  from: `AppService@${process.env.DOMAIN_NAME}`,
  to: process.env.ADMINS_EMAILS,
  subject: `Critical error occured`,
  html: `<div>
    <h3>Check the App!!!</h3>
    </div>`,
};
