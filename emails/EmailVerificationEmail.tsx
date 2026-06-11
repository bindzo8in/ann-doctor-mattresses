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

export const EmailVerificationSchema = z.object({
  customerName: z.string().min(1),
  verificationUrl: z.string().url(),
});

type EmailVerificationProps = z.infer<typeof EmailVerificationSchema>;

export const EmailVerificationEmail = (props: EmailVerificationProps) => {
  const { customerName, verificationUrl } =
    EmailVerificationSchema.parse(props);

  return (
    <Html>
      <Head />
      <Preview>Verify your email address — Ann Doctor Mattresses</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={brand}>Ann Doctor Mattresses</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Confirm your email</Heading>

            <Text style={paragraph}>Hi {customerName},</Text>
            <Text style={paragraph}>
              Welcome aboard! Please verify your email address to activate your
              account and start shopping.
            </Text>

            <Section style={btnContainer}>
              <Button style={button} href={verificationUrl}>
                Verify Email Address
              </Button>
            </Section>

            <Text style={hint}>
              This link expires in <strong>24 hours</strong>. If you didn&apos;t
              create an account, you can safely ignore this email.
            </Text>

            <Hr style={hr} />

            <Text style={fallback}>
              If the button above doesn&apos;t work, copy and paste this URL
              into your browser:
            </Text>
            <Text style={urlText}>{verificationUrl}</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Ann Doctor Mattresses · Tamil Nadu,
              India
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

const btnContainer = {
  margin: "28px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#0f172a",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "14px 32px",
  borderRadius: "6px",
  display: "inline-block",
};

const hint = {
  fontSize: "13px",
  lineHeight: "1.5",
  color: "#94a3b8",
  margin: "0 0 24px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "24px 0",
};

const fallback = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "0 0 8px",
};

const urlText = {
  fontSize: "12px",
  color: "#64748b",
  wordBreak: "break-all" as const,
  margin: "0",
};

const footer = {
  backgroundColor: "#f8fafc",
  padding: "16px 32px",
  borderTop: "1px solid #e6ebf1",
};

const footerText = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "0",
  textAlign: "center" as const,
};

export default EmailVerificationEmail;
