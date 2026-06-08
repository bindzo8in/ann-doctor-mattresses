import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";
import { z } from "zod";

export const ContactMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().min(1, "Message is required"),
});

type ContactMessageProps = z.infer<typeof ContactMessageSchema>;

export const ContactMessageEmail = (props: ContactMessageProps) => {
  const validatedProps = ContactMessageSchema.parse(props);
  const { name, email, message } = validatedProps;

  return (
    <Html>
      <Head />
      <Preview>New Contact Request from {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Contact Message</Heading>
          <Section style={section}>
            <Text style={text}>
              <strong>Name:</strong> {name}
            </Text>
            <Text style={text}>
              <strong>Email:</strong> {email}
            </Text>
            <Text style={text}>
              <strong>Message:</strong>
            </Text>
            <Text style={messageBlock}>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  border: "1px solid #f0f0f0",
  borderRadius: "5px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 20px 0",
};

const section = {
  padding: "0 20px",
  marginTop: "20px",
};

const text = {
  margin: "0 0 10px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};

const messageBlock = {
  margin: "0",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
  backgroundColor: "#f9f9f9",
  padding: "15px",
  borderRadius: "5px",
  whiteSpace: "pre-wrap",
};

export default ContactMessageEmail;
