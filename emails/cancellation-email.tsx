import { ButtonLink, EmailLayout, Text } from "./components";

export function CancellationEmail({ dashboardUrl }: { dashboardUrl: string }) {
  return (
    <EmailLayout
      preview="Tu suscripcion de Groo Menu fue cancelada."
      title="Suscripcion cancelada"
    >
      <Text>
        Tu suscripcion fue cancelada. Tus datos no se borran, pero tu menu publico puede quedar
        temporalmente oculto hasta que reactives un plan.
      </Text>
      <ButtonLink href={dashboardUrl}>Reactivar plan</ButtonLink>
    </EmailLayout>
  );
}
