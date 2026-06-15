import { ButtonLink, EmailLayout, Highlight, Text } from "./components";

export function PaymentFailedEmail({ dashboardUrl }: { dashboardUrl: string }) {
  return (
    <EmailLayout
      preview="No pudimos confirmar el pago de tu suscripcion."
      title="Pago fallido"
    >
      <Text>No pudimos confirmar el pago de tu suscripcion de Groo Menu.</Text>
      <Highlight>
        Actualiza tu plan para evitar que tu menu publico quede temporalmente oculto.
      </Highlight>
      <ButtonLink href={dashboardUrl}>Actualizar plan</ButtonLink>
    </EmailLayout>
  );
}
