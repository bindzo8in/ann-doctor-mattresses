import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column
} from "@react-email/components";
import * as React from "react";
import { z } from "zod";

export const OrderConfirmationSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  orderNumber: z.string().min(1, "Order number is required"),
  items: z.array(
    z.object({
      productName: z.string(),
      quantity: z.number(),
      price: z.number(),
    })
  ),
  subTotal: z.number(),
  discountTotal: z.number(),
  shippingTotal: z.number(),
  totalAmount: z.number(),
  shippingAddress: z.object({
    fullName: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().optional().nullable(),
    landmark: z.string().optional().nullable(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    phone: z.string(),
  }),
  notes: z.string().optional().nullable(),
});

type OrderConfirmationProps = z.infer<typeof OrderConfirmationSchema>;

export const OrderConfirmationEmail = (props: OrderConfirmationProps) => {
  // Validate props on render
  const validatedProps = OrderConfirmationSchema.parse(props);
  
  const {
    customerName,
    orderNumber,
    items,
    subTotal,
    discountTotal,
    shippingTotal,
    totalAmount,
    shippingAddress,
    notes,
  } = validatedProps;

  const formatCurrency = (val: number) =>
    `₹${Math.round(val).toLocaleString("en-IN")}`;

  return (
    <Html>
      <Head />
      <Preview>Order Confirmed: {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Order Confirmed!</Heading>
          <Text style={paragraph}>Hello {customerName},</Text>
          <Text style={paragraph}>
            Thank you for your purchase. We have received your payment, and your
            order <strong>{orderNumber}</strong> is now confirmed.
          </Text>

          <Section style={section}>
            <Heading as="h3" style={subheading}>
              Order Summary
            </Heading>
            {items.map((item, idx) => (
              <Row key={idx} style={itemRow}>
                <Column>
                  <Text style={itemText}>
                    {item.productName} (Qty: {item.quantity})
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={itemText}>{formatCurrency(item.price)}</Text>
                </Column>
              </Row>
            ))}

            <Hr style={hr} />

            <Row>
              <Column><Text style={summaryLabel}>Subtotal:</Text></Column>
              <Column align="right"><Text style={summaryValue}>{formatCurrency(subTotal)}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={summaryLabel}>Discount:</Text></Column>
              <Column align="right"><Text style={{ ...summaryValue, color: "green" }}>-{formatCurrency(discountTotal)}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={summaryLabel}>Shipping:</Text></Column>
              <Column align="right">
                <Text style={summaryValue}>
                  {shippingTotal === 0 ? "Free" : formatCurrency(shippingTotal)}
                </Text>
              </Column>
            </Row>
            <Hr style={hr} />
            <Row>
              <Column><Text style={totalLabel}>Total Amount Paid:</Text></Column>
              <Column align="right"><Text style={totalValue}>{formatCurrency(totalAmount)}</Text></Column>
            </Row>
          </Section>

          <Section style={section}>
            <Heading as="h3" style={subheading}>
              Shipping Address
            </Heading>
            <Text style={addressText}>
              <strong>{shippingAddress.fullName}</strong>
              <br />
              {shippingAddress.addressLine1}
              <br />
              {shippingAddress.addressLine2 ? <>{shippingAddress.addressLine2}<br /></> : null}
              {shippingAddress.landmark ? <>Landmark: {shippingAddress.landmark}<br /></> : null}
              {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}
              <br />
              Phone: {shippingAddress.phone}
            </Text>
          </Section>

          {notes && (
            <Section style={section}>
              <Text style={paragraph}>
                <strong>Order Notes:</strong> {notes}
              </Text>
            </Section>
          )}

          <Hr style={hr} />
          <Text style={footerText}>
            You can track your order status in your profile dashboard at any time.
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

const section = {
  padding: "0 20px",
  marginTop: "20px",
};

const subheading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#484848",
  margin: "10px 0",
};

const itemRow = {
  padding: "5px 0",
};

const itemText = {
  fontSize: "14px",
  color: "#3c4149",
  margin: "0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const summaryLabel = {
  fontSize: "14px",
  color: "#666",
  margin: "2px 0",
};

const summaryValue = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#3c4149",
  margin: "2px 0",
};

const totalLabel = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#0f172a",
  margin: "10px 0",
};

const totalValue = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#0f172a",
  margin: "10px 0",
};

const addressText = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#3c4149",
  margin: "0",
};

const footerText = {
  fontSize: "12px",
  color: "#8898aa",
  padding: "0 20px",
  margin: "0",
};

export default OrderConfirmationEmail;
