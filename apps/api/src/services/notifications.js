import nodemailer from 'nodemailer';

let transport;
function getTransport(){if(transport)return transport;const {SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASSWORD}=process.env;if(!SMTP_HOST||!SMTP_PORT||!process.env.ENQUIRY_NOTIFICATION_EMAIL)return null;transport=nodemailer.createTransport({host:SMTP_HOST,port:Number(SMTP_PORT),secure:Number(SMTP_PORT)===465,auth:SMTP_USER?{user:SMTP_USER,pass:SMTP_PASSWORD}:undefined});return transport;}
export async function notifyEnquiry(enquiry){const mailer=getTransport();if(!mailer)return;await mailer.sendMail({from:process.env.MAIL_FROM||process.env.SMTP_USER,to:process.env.ENQUIRY_NOTIFICATION_EMAIL,subject:`New website enquiry ${enquiry.reference}`,text:`A new enquiry was received.\n\nReference: ${enquiry.reference}\nName: ${enquiry.name}\nBusiness: ${enquiry.businessName||'Not provided'}\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone}\n\nOpen the private CMS to review the message.`});}
