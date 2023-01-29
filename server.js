const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const port = 3005;
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const e = require("express");
const env = require("dotenv").config({ path: "./.env" });
const mailchimp = require("@mailchimp/mailchimp_marketing");
const { response } = require("express");
const md5 = require("md5");
const axios = require("axios");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(bodyParser.json());

app.post("/sendLetterApprovedNotification", (req, res, next) => {});
app.post("/sendVideoApprovedNotification", (req, res, next) => {});

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_CLIENT_KEY,
  server: "us18",
});

app.post("/runMailChimp", (req, res) => {
  const runMailChimp = async () => {
    const response = await mailchimp.ping.get();
    console.log(response);
  };

  runMailChimp();
});

app.post("/addSubscriberToMailChimp", async (req, res) => {
  const listId = "dca51ab98c";
  const subscribingUser = {
    firstName: "Prudence",
    lastName: "McVankab",
    email: req.body.email,
  };

  try {
    const response = await mailchimp.lists.addListMember(listId, {
      email_address: subscribingUser.email,
      status: "subscribed",
    });

    res.send(response);

    console.log(
      `Successfully added contact as an audience member. The contact's id is ${response.id}.`
    );
  } catch (e) {
    console.log(e);
    return res.status(400).send({
      e,
    });
  }
});

app.post("/sendAccountVerifiedNotification", (req, res, next) => {
  const filepath = path.join(
    __dirname,
    "./EmailTemplates/AccountVerified.html"
  );
  const source = fs.readFileSync(filepath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    username: req.body.userName,
  };

  const htmlToSend = template(replacements);

  var name = "Account approved.";
  var email = "smithfrank854@gmail.com";
  var subject = `OATW - Account verified.`;
  var message = "Account Verification ";

  var mail = {
    from: "OATW <abbouabderraouf98@gmail.com>",
    to: "saxedeen@gmail.com",
    subject: subject,
    text: message,

    html: htmlToSend,
  };

  const client = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "abbouabderraouf98@gmail.com",
      pass: "nqslkkhoqmezjxrw",
    },
  });

  client.sendMail(mail, (err, data) => {
    if (err) {
      res.json({
        status: "fail",
      });
      console.log(err);
    } else {
      res.json({
        status: "success",
      });
      console.log("Success");
    }
  });
});

app.post("/sendContactForm", (req, res, next) => {
  console.log(req.body);

  const filepath = path.join(__dirname, "./EmailTemplates/ContactForm.html");
  const source = fs.readFileSync(filepath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    description: req.body.description,
    type: req.body.type,
  };

  const htmlToSend = template(replacements);

  var name = "";
  var email = "smithfrank854@gmail.com";
  var subject = `OATW - Account verified.`;
  var message = "Account Verification ";

  var mail = {
    from: "OATW <abbouabderraouf98@gmail.com>",
    to: "saxedeen@gmail.com",
    subject: `${req.body.type} - OATW`,
    text: req.body.description,

    html: htmlToSend,
  };

  const client = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "abbouabderraouf98@gmail.com",
      pass: "nqslkkhoqmezjxrw",
    },
  });

  client.sendMail(mail, (err, data) => {
    if (err) {
      res.json({
        status: "fail",
      });
      console.log(err);
    } else {
      res.json({
        status: "success",
      });
      console.log("Success");
    }
  });
});

app.post("/sendRegistrationConfirmation", (req, res, next) => {
  console.log(req.body);

  const filepath = path.join(
    __dirname,
    "./EmailTemplates/AccountRegistration.html"
  );
  const source = fs.readFileSync(filepath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    firstName: req.body.userName,
  };

  const htmlToSend = template(replacements);

  var name = "test";
  var email = "smithfrank854@gmail.com";
  var subject = `OATW - Registration Successful`;
  var message = "Registration";

  var mail = {
    from: "OATW <abbouabderraouf98@gmail.com>",
    to: "saxedeen@gmail.com",
    subject: subject,
    text: message,

    html: htmlToSend,
  };

  const client = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "abbouabderraouf98@gmail.com",
      pass: "nqslkkhoqmezjxrw",
    },
  });

  client.sendMail(mail, (err, data) => {
    if (err) {
      res.json({
        status: "fail",
      });
      console.log(err);
    } else {
      res.json({
        status: "success",
      });
      console.log("Success");
    }
  });
});

// STRIPE
app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.post("/updateStripeBillingAddress", async (req, res) => {
  console.log("Updating stripe billing address.");
  console.log(req.body);
  try {
    const customer = await stripe.customers.update(req.body.customerId, {
      address: {
        city: req.body.billingAddress.city,
        country: req.body.billingAddress.country,
        postal_code: req.body.billingAddress.postal_code,
        state: req.body.billingAddress.state,
      },
      name: req.body.name,
    });
    res.send(customer);
  } catch (error) {
    console.log(error);
  }
});

app.post("/createStripeCustomer", async (req, res) => {
  console.log("Creating customer.");
  console.log(req.body.userEmail);
  try {
    const customer = await stripe.customers.create({
      description: "OATW - Orphan sponsorship.",
      email: req.body.userEmail,
    });
    res.send({
      customer,
    });
  } catch (error) {
    return res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.post("/create-subscription", async (req, res) => {
  console.log("h");
  try {
    const subscription = await stripe.subscriptions.create({
      customer: req.body.customerId,
      items: [{ price: "price_1MQkWQCW3PBYUUmKPTVaQeCa" }],
    });
    res.send({
      subscription,
    });
  } catch (error) {
    return res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.post("/create-payment-intent", async (req, res) => {
  console.log("Creating payment intent");
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "AUD",
      amount: req.body.price * 100,
      automatic_payment_methods: { enabled: true },
      setup_future_usage: "off_session",
      description: "This is a test payment.",
      customer: req.body.stripeCustomerId,
      receipt_email: "saxedeen@gmail.com",
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

app.post("/payment-intent-test", async (req, res) => {
  console.log(req.body);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "AUD",
      amount: 1000 * 100,
      description: "This is a test payment.",
      customer: "cus_NBpsYEfvCH80X0",
      payment_method: "card_1MRSdICW3PBYUUmKg0f0lhFl",
      receipt_email: "saxedeen@gmail.com",
      off_session: true,
      confirm: true,
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

app.post("/create-setup-intent", async (req, res) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: req.body.id,
      payment_method_types: ["card"],
    });

    res.send({
      setupIntent,
      clientSecret: setupIntent.client_secret,
      setupId: setupIntent.id,
    });
  } catch (error) {
    return res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.post("/attachPaymentMethod", async (req, res) => {
  try {
    const customer = await stripe.paymentMethods.attach(
      req.body.paymentMethodId,
      {
        customer: req.body.customerId,
      }
    );
    res.send({
      customer,
    });
  } catch (error) {
    return res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.post("/makeCardDefault", async (req, res) => {
  console.log(req.body.paymentMethodId);
  try {
    const customer = await stripe.customers.update(req.body.id, {
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    });
    res.send({
      customer,
    });
  } catch (error) {
    return res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.post("/retrieveCardDetails", async (req, res) => {
  console.log(req.body);
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: req.body.customerId,
      type: "card",
    });
    res.send({
      paymentMethods,
    });
  } catch (error) {
    return res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.post("/retrieveSubscriptions", async (req, res) => {
  console.log(req.body);
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: req.body.customerId,
    });
    res.send({
      subscriptions,
    });
  } catch (error) {
    return res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.post("/verifyCaptchaKey", async (req, res) => {
  const { token } = req.body;
  console.log(token);

  if (token === "") {
    console.log("h");
    return null;
  } else {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${token}`
    );
    console.log(response);
  }
});

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
