import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
} from "@react-email/components";

export interface EmailProps {
  toClient: boolean;
  clientName?: string;
}

const DailyProgressEmail: React.FC<EmailProps> = ({ toClient, clientName }) => {
  const currentDate = new Date().toLocaleDateString();

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ padding: "20px" }}>
          <Section style={{ padding: "20px 0" }}>
            {toClient ? (
              <Text style={{ fontSize: "16px", lineHeight: "24px", marginBottom: "16px" }}>
                Dear Valued Client,
              </Text>
            ) : (
              <Text style={{ fontSize: "16px", lineHeight: "24px", marginBottom: "16px" }}>
                Dear Team,
              </Text>
            )}
            <Text style={{ fontSize: "14px", lineHeight: "20px", marginBottom: "16px" }}>
              Please find attached the Daily Progress Report for {currentDate},
              along with the mail for your reference.
            </Text>
            <Text style={{ fontSize: "14px", lineHeight: "20px", marginTop: "16px" }}>
              Best regards,
              <br />
              Uniglaze team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default DailyProgressEmail;
