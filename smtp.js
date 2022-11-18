const nodemailer = require('nodemailer');
const { credentials } = require('./config');
const htmlToFormattedText = require('html-to-formatted-text');

async function go(to, subject, html) {
  try {
    const result = await mailTransport.sendMail({
      from: `"${credentials.mailConfig.from}" <${credentials.mailConfig.user}>`,
      to,
      subject,
      html,
      text: htmlToFormattedText(html),
    });
    console.log('Письмо успешно: ', result);
    return 'OK! Message sended';
  } catch (err) {
    console.log('! Невохможно отправить письмо: ' + err.message);
    return 'ERROR! Message NOT sended';
  }
}

const mailTransport = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true, // use TLS
  auth: {
    user: credentials.mailConfig.user,
    pass: credentials.mailConfig.password,
  },
});

exports.send = (to, subject, html) => {
  return go(to, subject, html);
};
