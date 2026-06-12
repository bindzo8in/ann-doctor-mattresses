import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { z } from "zod";

export const ForgotPasswordSchema = z.object({
  customerName: z.string().min(1),
  otpCode: z.string().length(6),
});

type ForgotPasswordProps = z.infer<typeof ForgotPasswordSchema>;

export const ForgotPasswordEmail = (props: ForgotPasswordProps) => {
  const { customerName, otpCode } = ForgotPasswordSchema.parse(props);

  return (
    <Html>
      <Head />
      <Preview>Reset your password — Ann Doctor Mattresses</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={brand}>Ann Doctor Mattresses</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Reset your password</Heading>

            <Text style={paragraph}>Hi {customerName},</Text>
            <Text style={paragraph}>
              We received a request to reset the password for your Ann Doctor
              Mattresses account. Click the button below to choose a new
              password.
            </Text>

            <Section style={otpContainer}>
              <Text style={otpText}>{otpCode}</Text>
            </Section>

            <Text style={hint}>
              This code is valid for <strong>15 minutes</strong>. If you
              didn&apos;t request a password reset, please ignore this email —
              your password will remain unchanged.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Ann Doctor Mattresses · Tamil Nadu,
              India
            </Text>
            <Text style={footerText}>
              For security, this email was sent to you because a password reset
              was requested. If this wasn&apos;t you, contact us immediately.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "560px",
  borderRadius: "8px",
  border: "1px solid #e6ebf1",
  overflow: "hidden" as const,
};

const header = {
  backgroundColor: "#0f172a",
  padding: "24px 32px",
};

const brand = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#ffffff",
  margin: "0",
};

const content = {
  padding: "32px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#0f172a",
  margin: "0 0 16px",
  letterSpacing: "-0.3px",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#475569",
  margin: "0 0 16px",
};

const otpContainer = {
  margin: "28px 0",
  textAlign: "center" as const,
  backgroundColor: "#f8fafc",
  padding: "20px",
  borderRadius: "6px",
  border: "1px solid #e2e8f0",
};

const otpText = {
  fontSize: "32px",
  fontWeight: "700",
  letterSpacing: "4px",
  color: "#0f172a",
  margin: "0",
};

const hint = {
  fontSize: "13px",
  lineHeight: "1.5",
  color: "#94a3b8",
  margin: "0 0 24px",
};

const footer = {
  backgroundColor: "#f8fafc",
  padding: "16px 32px",
  borderTop: "1px solid #e6ebf1",
};

const footerText = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "0 0 4px",
  textAlign: "center" as const,
};

export default ForgotPasswordEmail;
