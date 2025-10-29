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
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", margin: 0, padding: 0 }}>
        <Container>
          <Section>
            {toClient ? (
              <Text>Dear {clientName ?? "Valued Client"},</Text>
            ) : (
              <Text>Dear Team,</Text>
            )}
            <Text>
              Please find attached the Daily Progress Report for {currentDate},
              along with the mail for your reference.
            </Text>
            <Text>
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
