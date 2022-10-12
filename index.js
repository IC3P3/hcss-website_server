const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require ('socket.io');
const nodemailer = require('nodemailer');
const io = new Server(server, {
    cors: {
        origin: dotenv.parsed.CLIENT_URL
      }
});

const port = dotenv.parsed.SERVER_PORT;
const smtpServer = dotenv.parsed.SMTP_SERVER_URL;
const smtpServerPort = dotenv.parsed.SMTP_SERVER_PORT;
const smtpUsername = dotenv.parsed.SMTP_USERNAME;
const smtpPassword = dotenv.parsed.SMTP_PASSWORD;
const recipientEmail = dotenv.parsed.RECIPIENT_EMAIL;

var transporter = nodemailer.createTransport({
    host: smtpServer,
    port: smtpServerPort,
    secure: smtpServerPort === 465,
    auth: {
        user: smtpUsername,
        pass: smtpPassword
    }
});

server.on('error', err => {
    console.error("[Mail Sent Server] A server error has occurred: " + err);
});

server.on('close', () => {
    console.log("[Mail Sent Server] Server has been closed.")
});

server.listen(port, () => {
    console.log("[Mail Sent Server] The Server is now listening to port " + port);
});

io.on('connection', socket => {
    socket.on('sendContact', (contactName, contactAdress, contactMessage) => {
        const infoInternMail = transporter.sendMail({
            from: smtpUsername,
            to: recipientEmail,
            subject: "Neue Nachricht von der Website",
            text: `Neue Nachricht von "${contactName}" <${contactAdress}> mit der Nachricht: ${contactMessage}.`
        });        
        transporter.sendMail(infoInternMail, (error, res) => {
            if(error) {
                console.error("[Mail Sent Server] An error has occurred: " + error);
            } else {
                console.log("[Mail Sent Server] A message has been sent: " + res.response);
            }
        });
    });
});