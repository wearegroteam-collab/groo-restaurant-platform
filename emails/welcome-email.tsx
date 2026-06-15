import { ButtonLink, EmailLayout, Highlight, Text } from "./components";

export function WelcomeEmail({ dashboardUrl }: { dashboardUrl: string }) {
  return (
    <EmailLayout
      preview="Tu cuenta de Groo Menu esta lista."
      title="Bienvenido a Groo Menu"
    >
      <Text>
        Tu cuenta ya esta activa. Desde ahora puedes crear tu restaurante, cargar productos,
        configurar promociones y compartir tu menu digital con tus clientes.
      </Text>
      <Highlight>Empiezas con 14 dias gratis para tu primera sucursal.</Highlight>
      <ButtonLink href={dashboardUrl}>Ir al panel</ButtonLink>
      <Text>Gracias por elegir Groo Team para vender mejor por WhatsApp.</Text>
    </EmailLayout>
  );
}
