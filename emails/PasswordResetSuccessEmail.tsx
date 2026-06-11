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

export const PasswordResetSuccessSchema = z.object({
  customerName: z.string().min(1),
  /** URL to the sign-in page so the user can log in immediately */
  signinUrl: z.url(),
});

type PasswordResetSuccessProps = z.infer<typeof PasswordResetSuccessSchema>;

export const PasswordResetSuccessEmail = (
  props: PasswordResetSuccessProps
) => {
  const { customerName, signinUrl } =
    PasswordResetSuccessSchema.parse(props);

  return (
    <Html>
      <Head />
      <Preview>Your password has been reset — Ann Doctor Mattresses</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={brand}>Ann Doctor Mattresses</Text>
          </Section>

          <Section style={content}>
            {/* Icon area */}
            <Section style={iconArea}>
              <Text style={checkmark}>✓</Text>
            </Section>

            <Heading style={heading}>Password reset successful</Heading>

            <Text style={paragraph}>Hi {customerName},</Text>
            <Text style={paragraph}>
              Your password has been reset successfully. You can now sign in
              with your new password.
            </Text>

            <Section style={btnContainer}>
              <Button style={button} href={signinUrl}>
                Sign In to Your Account
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={securityNote}>
              <strong>Didn&apos;t do this?</strong> If you did not reset your
              password, your account may be compromised. Please contact our
              support team immediately at{" "}
              <strong>info@doctormattresses.com</strong>.
            </Text>
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

const iconArea = {
  textAlign: "center" as const,
  margin: "0 0 16px",
};

const checkmark = {
  display: "inline-block",
  width: "48px",
  height: "48px",
  lineHeight: "48px",
  textAlign: "center" as const,
  backgroundColor: "#dcfce7",
  color: "#16a34a",
  borderRadius: "50%",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 auto",
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
  backgroundColor: "#16a34a",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "14px 32px",
  borderRadius: "6px",
  display: "inline-block",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "24px 0",
};

const securityNote = {
  fontSize: "13px",
  lineHeight: "1.5",
  color: "#64748b",
  backgroundColor: "#fef9c3",
  border: "1px solid #fde047",
  borderRadius: "6px",
  padding: "12px 16px",
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

export default PasswordResetSuccessEmail;
