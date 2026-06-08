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

export const ComplaintAutoReplySchema = z.object({
  id: z.string().min(1, "Complaint ID is required"),
  name: z.string().min(1, "Name is required"),
  subject: z.string().optional().nullable(),
  message: z.string().min(1, "Message is required"),
});

type ComplaintAutoReplyProps = z.infer<typeof ComplaintAutoReplySchema>;

export const ComplaintAutoReplyEmail = (props: ComplaintAutoReplyProps) => {
  const validatedProps = ComplaintAutoReplySchema.parse(props);
  const { id, name, subject, message } = validatedProps;

  return (
    <Html>
      <Head />
      <Preview>Complaint Received (#{id})</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Hi {name},</Heading>
          <Text style={paragraph}>
            We have successfully logged your complaint (Ticket #{id}). Our support
            team will investigate and respond to you as soon as possible.
          </Text>
          <Section style={section}>
            <Text style={text}>
              <strong>Subject:</strong> {subject || "N/A"}
            </Text>
            <Text style={text}>
              <strong>Details:</strong>
            </Text>
            <Text style={messageBlock}>{message}</Text>
          </Section>
          <Text style={paragraph}>Thank you for your patience.</Text>
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

const section = {
  padding: "0 20px",
  marginTop: "20px",
  marginBottom: "20px",
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

export default ComplaintAutoReplyEmail;
