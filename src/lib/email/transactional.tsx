import { CancellationEmail } from "../../../emails/cancellation-email";
import { ConfirmEmail } from "../../../emails/confirm-email";
import { PaymentFailedEmail } from "../../../emails/payment-failed-email";
import { RenewalSuccessEmail } from "../../../emails/renewal-success-email";
import { SubscriptionActivatedEmail } from "../../../emails/subscription-activated-email";
import { TrialExpiringEmail } from "../../../emails/trial-expiring-email";
import { WelcomeEmail } from "../../../emails/welcome-email";
import { getAppUrl } from "@/lib/config/app-url";
import { sendTransactionalEmail } from "@/lib/email/resend";

function dashboardUrl() {
  return `${getAppUrl()}/admin`;
}

export async function sendConfirmationEmail(to: string, confirmationUrl: string) {
  return sendTransactionalEmail({
    html: <ConfirmEmail confirmationUrl={confirmationUrl} />,
    subject: "Confirma tu cuenta en Groo Menu",
    to,
  });
}

export async function sendWelcomeEmail(to: string) {
  return sendTransactionalEmail({
    html: <WelcomeEmail dashboardUrl={dashboardUrl()} />,
    subject: "Bienvenido a Groo Menu",
    to,
  });
}

export async function sendSubscriptionActivatedEmail(to: string, planName: string) {
  return sendTransactionalEmail({
    html: <SubscriptionActivatedEmail dashboardUrl={dashboardUrl()} planName={planName} />,
    subject: "Tu suscripcion de Groo Menu esta activa",
    to,
  });
}

export async function sendRenewalSuccessEmail(to: string, planName: string) {
  return sendTransactionalEmail({
    html: <RenewalSuccessEmail dashboardUrl={dashboardUrl()} planName={planName} />,
    subject: "Renovacion exitosa de Groo Menu",
    to,
  });
}

export async function sendPaymentFailedEmail(to: string) {
  return sendTransactionalEmail({
    html: <PaymentFailedEmail dashboardUrl={dashboardUrl()} />,
    subject: "No pudimos confirmar tu pago",
    to,
  });
}

export async function sendCancellationEmail(to: string) {
  return sendTransactionalEmail({
    html: <CancellationEmail dashboardUrl={dashboardUrl()} />,
    subject: "Tu suscripcion fue cancelada",
    to,
  });
}

export async function sendTrialExpiringEmail(to: string, trialEnd: string) {
  return sendTransactionalEmail({
    html: <TrialExpiringEmail dashboardUrl={dashboardUrl()} trialEnd={trialEnd} />,
    subject: "Tu prueba gratis termina pronto",
    to,
  });
}
