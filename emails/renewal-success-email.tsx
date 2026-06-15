import { ButtonLink, EmailLayout, Highlight, Text } from "./components";

export function RenewalSuccessEmail({
  dashboardUrl,
  planName,
}: {
  dashboardUrl: string;
  planName: string;
}) {
  return (
    <EmailLayout
      preview="Tu renovacion de Groo Menu fue exitosa."
      title="Renovacion exitosa"
    >
      <Text>Tu suscripcion se renovo correctamente.</Text>
      <Highlight>Plan renovado: {planName}</Highlight>
      <Text>No tienes que hacer nada mas. Tu menu publico continua activo.</Text>
      <ButtonLink href={dashboardUrl}>Ver suscripcion</ButtonLink>
    </EmailLayout>
  );
}
