import { ButtonLink, EmailLayout, Highlight, Text } from "./components";

export function SubscriptionActivatedEmail({
  dashboardUrl,
  planName,
}: {
  dashboardUrl: string;
  planName: string;
}) {
  return (
    <EmailLayout
      preview="Tu suscripcion de Groo Menu fue activada."
      title="Suscripcion activada"
    >
      <Text>Tu pago fue confirmado y tu plan ya esta activo.</Text>
      <Highlight>Plan actual: {planName}</Highlight>
      <Text>Tu menu publico seguira visible y puedes administrar tus restaurantes desde el panel.</Text>
      <ButtonLink href={dashboardUrl}>Ir al panel</ButtonLink>
    </EmailLayout>
  );
}
