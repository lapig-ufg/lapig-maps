var nodemailer = require('nodemailer')

module.exports = function(app) {
  
  var Email = {};
  var config = app.config
  var gmailUser = config.email.gmailUser;
  var gmailPassword = config.email.gmailPassword;
  var replyTo = config.email.replyTo;

  Email.send = function(toEmail, title, html, callback) {
  	var transporter = nodemailer.createTransport('smtps://' + gmailUser + ':' + gmailPassword + '@smtp.gmail.com');
    console.log('smtps://' + gmailUser + ':' + gmailPassword + '@smtp.gmail.com')
    var mailOptions = {
        from: replyTo,
        replyTo: replyTo,
        to: toEmail,
        subject: title,
        html: html
    };

    transporter.sendMail(mailOptions, callback);
  }

  return Email;
}

