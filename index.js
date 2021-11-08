const AWS = require('aws-sdk');
const ses = new AWS.SES();
const axios = require('axios');
 
const RECEIVER = process.env.RECEIVER;
const SENDER = process.env.SENDER;
const reCapUrl = "https://www.google.com/recaptcha/api/siteverify";
const recaptchaSecret = process.env.RECAPTCHA_SECRET;

const response = {
    "statusCode": 200,
    "headers": {
        "Access-Control-Allow-Origin": "*"
    },
    "body": "success",
    "isBase64Encoded": false
};

const failResponse = {
    "statusCode": 403,
    "headers": {
        "Access-Control-Allow-Origin": "*"
    },
    "body": "forbidden",
    "isBase64Encoded": false
};

exports.handler = async (event, context, callback) => {

    
    const httpBody = JSON.parse(event.body);
    const recaptchaResponse = httpBody.captchaResponse;
    const capUrlWithParams = reCapUrl + "?secret=" + recaptchaSecret +"&response=" + recaptchaResponse;
    let verifyResult = await axios.post(capUrlWithParams);
    
    if(verifyResult.data.success === true) {
        await sendEmail(httpBody, function (err, data) {
            context.done(err, null);
        })
        callback(null, response);
    } else {
        callback(null, failResponse);
    }
     
    
};

 
const sendEmail = async (httpBody, done) => {
    console.log("sending email")
    var params = {
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
    };
    ses.sendEmail(params, done);
}
