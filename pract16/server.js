const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Replace with your email and app password
const USER_EMAIL = 'keyasonaiya.26@gmail.com';
const USER_PASS = 'zpss gfwu uewf srfe'; // Use an App Password if using Gmail

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: USER_EMAIL,
    pass: USER_PASS,
  },
});

app.get('/', (req, res) => {
  res.render('index', { status: null });
});

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Validate inputs
  if (!name || !email || !message) {
    return res.render('index', {
      status: { type: 'error', message: 'All fields are required.' }
    });
  }

  const mailOptions = {
    from: email,
    to: USER_EMAIL,
    subject: `New message from ${name}`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.render('index', {
      status: { type: 'success', message: 'Message sent successfully!' }
    });
  } catch (error) {
    console.error(error);
    res.render('index', {
      status: { type: 'error', message: 'Failed to send message.' }
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
