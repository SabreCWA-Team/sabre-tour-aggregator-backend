const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, templateId, dynamicData }) => {
  try {
    const msg = {
      to,
      from: "mercyoyelude2@gmail.com",
      templateId,
      dynamic_template_data: dynamicData,
    };

    await sgMail.send(msg);
    console.log("Email sent successfully!");
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

module.exports = sendEmail;
