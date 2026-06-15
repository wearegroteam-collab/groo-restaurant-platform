import { ButtonLink, EmailLayout, Highlight, Text } from "./components";

export function TrialExpiringEmail({ dashboardUrl, trialEnd }: { dashboardUrl: string; trialEnd: string }) {
  return (
    <EmailLayout
      preview="Tu prueba gratis de Groo Menu esta por terminar."
      title="Tu prueba termina pronto"
    >
      <Text>Tu prueba gratis esta por vencer.</Text>
      <Highlight>Fecha de vencimiento: {trialEnd}</Highlight>
      <Text>Activa un plan para que tu menu publico siga disponible sin interrupciones.</Text>
      <ButtonLink href={dashboardUrl}>Activar plan</ButtonLink>
    </EmailLayout>
  );
}
