import { ButtonLink, EmailLayout, Text } from "./components";

export function ConfirmEmail({ confirmationUrl }: { confirmationUrl: string }) {
  return (
    <EmailLayout
      preview="Confirma tu correo para activar tu cuenta de Groo Menu."
      title="Confirma tu correo"
    >
      <Text>
        Estas a un paso de crear el menu digital de tu restaurante. Confirma tu correo para
        activar tu cuenta y entrar al panel administrativo.
      </Text>
      <ButtonLink href={confirmationUrl}>Confirmar correo</ButtonLink>
      <Text>Si no creaste esta cuenta, puedes ignorar este mensaje.</Text>
    </EmailLayout>
  );
}
