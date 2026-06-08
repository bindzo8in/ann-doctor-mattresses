import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";
import { z } from "zod";

export const ContactAutoReplySchema = z.object({
  name: z.string().min(1, "Name is required"),
  message: z.string().min(1, "Message is required"),
});

type ContactAutoReplyProps = z.infer<typeof ContactAutoReplySchema>;

export const ContactAutoReplyEmail = (props: ContactAutoReplyProps) => {
  const validatedProps = ContactAutoReplySchema.parse(props);
  const { name, message } = validatedProps;

  return (
    <Html>
      <Head />
      <Preview>We received your message</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Thank you for reaching out, {name}!</Heading>
          <Text style={paragraph}>
            We have received your message and our team will get back to you shortly.
          </Text>
          <Hr style={hr} />
          <Section style={section}>
            <Text style={paragraph}>
              <em>Your message:</em>
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

const paragraph = {
  margin: "0 20px 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const section = {
  padding: "0 20px",
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
  fontStyle: "italic",
};

export default ContactAutoReplyEmail;
