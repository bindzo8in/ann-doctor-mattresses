import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";
import { z } from "zod";

export const DeliveryStatusSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  orderNumber: z.string().min(1, "Order number is required"),
});

type DeliveryStatusProps = z.infer<typeof DeliveryStatusSchema>;

export const DeliveryStatusEmail = (props: DeliveryStatusProps) => {
  const validatedProps = DeliveryStatusSchema.parse(props);
  const { customerName, orderNumber } = validatedProps;

  return (
    <Html>
      <Head />
      <Preview>Order Delivered: {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Order Delivered!</Heading>
          <Text style={paragraph}>Hello {customerName},</Text>
          <Text style={paragraph}>
            Your order <strong>{orderNumber}</strong> has been successfully
            delivered!
          </Text>
          <Text style={paragraph}>
            We hope you are enjoying your new Ann Doctor mattress / sofa. Thank
            you for shopping with us.
          </Text>
          <Hr style={hr} />
          <Text style={footerText}>
            If you have any questions or feedback, please contact our support team.
          </Text>
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

const footerText = {
  fontSize: "12px",
  color: "#8898aa",
  padding: "0 20px",
  margin: "0",
};

export default DeliveryStatusEmail;
