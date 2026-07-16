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
  name: z.string().min(1),
  appName: z.string().min(1),
  verificationUrl: z.string().url(),
  supportEmail: z.string().email(),
});

type EmailVerificationProps = z.infer<typeof EmailVerificationSchema>;

export function EmailVerificationEmail(props: EmailVerificationProps) {
  const { name, appName, verificationUrl, supportEmail } =
    EmailVerificationSchema.parse(props);

  return (
    <Html>
      <Head />
      <Preview>Verify your email address for {appName}</Preview>

      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>{appName}</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Verify your email</Heading>

            <Text style={paragraph}>Hi {name},</Text>

            <Text style={paragraph}>
              Thanks for creating an account with <strong>{appName}</strong>.
              Please verify your email address by clicking the button below.
            </Text>

            <Section style={buttonContainer}>
              <Button href={verificationUrl} style={button}>
                Verify Email Address
              </Button>
            </Section>

            <Text style={paragraph}>
              If the button doesn't work, copy and paste this link into your
              browser:
            </Text>

            <Text style={link}>{verificationUrl}</Text>

            <Hr style={hr} />

            <Text style={hint}>
              This verification link will expire automatically. If you didn't
              create an account, you can safely ignore this email.
            </Text>

            <Text style={support}>
              Need help? Contact us at{" "}
              <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default EmailVerificationEmail;

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  maxWidth: "560px",
  borderRadius: "10px",
  overflow: "hidden" as const,
  border: "1px solid #e5e7eb",
};

const header = {
  backgroundColor: "#0f172a",
  padding: "24px 32px",
};

const brand = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  margin: 0,
};

const content = {
  padding: "36px 32px",
};

const heading = {
  color: "#111827",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 20px",
};

const paragraph = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 18px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#111827",
  color: "#ffffff",
  padding: "14px 28px",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "15px",
};

const link = {
  fontSize: "13px",
  color: "#2563eb",
  wordBreak: "break-all" as const,
  lineHeight: "20px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const hint = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "20px",
};

const support = {
  color: "#6b7280",
  fontSize: "13px",
  marginTop: "20px",
};

const footer = {
  backgroundColor: "#f8fafc",
  padding: "20px 32px",
  borderTop: "1px solid #e5e7eb",
};

const footerText = {
  color: "#94a3b8",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: 0,
};