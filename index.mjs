import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
const sesClient = new SESClient({ region: "eu-west-1" });
import axios from "axios";
 
const RECEIVER = process.env.RECEIVER;
const SENDER = process.env.SENDER;
const reCapUrl = "https://www.google.com/recaptcha/api/siteverify";
const recaptchaSecret = process.env.RECAPTCHA_SECRET;

const response = {
    "statusCode": 200,
    "headers": {
        "Access-Control-Allow-Origin": "https://philomusica.org.uk"
    },
    "body": "success",
    "isBase64Encoded": false
};

const failResponse = {
    "statusCode": 403,
    "headers": {
        "Access-Control-Allow-Origin": "https://philomusica.org.uk"
    },
    "body": "forbidden",
    "isBase64Encoded": false
};

export const handler = async (event, context) => {
    const httpBody = JSON.parse(event.body);
    const recaptchaResponse = httpBody.token;
    const capUrlWithParams = reCapUrl + "?secret=" + recaptchaSecret +"&response=" + recaptchaResponse;
    const verifyResult = await axios.post(capUrlWithParams);
    if (verifyResult.data.success === true) {
        await sendEmail(httpBody);
        return response;
    } else {
        return failResponse;
    }
};

 
const sendEmail = async (httpBody) => {
    console.log("sending email")
    const command = new SendEmailCommand({
        Destination: {
            ToAddresses: [
                RECEIVER
            ]
        },
        Message: {
            Body: {
                Text: {
                    Data: 'Name: ' + httpBody.name + '\nEmail address: ' + httpBody.email + '\nMessage:\n' + httpBody.message,
                    Charset: 'UTF-8'
                }
            },
            Subject: {
                Data: 'Philomusica Website Enquiry from ' + httpBody.name,
                Charset: 'UTF-8'
            }
        },
        Source: SENDER
    });
    await sesClient.send(command);
}

