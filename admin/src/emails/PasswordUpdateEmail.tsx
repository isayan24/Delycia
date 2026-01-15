import {
    Html,
    Head,
    Font,
    Preview,
    Heading,
    Row,
    Section,
    Text,
    Button,
  } from '@react-email/components';
  
  interface PasswordUpdatedEmailProps {
    username: string;
  }
  
  export default function PasswordUpdatedEmail({ username }: PasswordUpdatedEmailProps) {
    return (
      <Html lang="en" dir="ltr">
        <Head>
          <title>Password Updated Successfully</title>
          <Font
            fontFamily="Roboto"
            fallbackFontFamily="Verdana"
            webFont={{
              url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
              format: 'woff2',
            }}
            fontWeight={400}
            fontStyle="normal"
          />
        </Head>
        <Preview>Your password has been updated successfully.</Preview>
        <Section>
          <Row>
            <Heading as="h2">Hello {username},</Heading>
          </Row>
          <Row>
            <Text>
              We are writing to let you know that your password has been updated successfully.
            </Text>
          </Row>
          <Row>
            <Text>
              If you did not initiate this change or if you believe this to be a mistake, please contact our support team immediately.
            </Text>
          </Row>
          <Row>
            <Text>
              Thank you for your continued trust in our services.
            </Text>
          </Row> 
        </Section>
      </Html>
    );
  }
  