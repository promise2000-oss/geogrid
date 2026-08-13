import { LegalScaffold } from "@/components/shared/legal-scaffold";
import { useSeo } from "@/lib/seo";

export default function Terms() {
  useSeo("Terms of Service", "The terms that govern use of GeoGrid.");
  return (
    <LegalScaffold
      title="Terms of Service"
      updated="[Date TBD]"
      intro="These terms govern your use of GeoGrid. By creating an account you agree to them."
      sections={[
        {
          heading: "1. Eligibility",
          paragraphs: [
            "You must be old enough to consent to online services in your country (13 in the US, 16 by default in the EU). Students below that age need a parent or guardian to set up and consent to the account, per our Privacy Policy.",
          ],
        },
        {
          heading: "2. Accounts",
          paragraphs: [
            "You are responsible for keeping your password secure and for all activity on your account. Email verification is required before full access. You may terminate your account at any time from Settings.",
          ],
        },
        {
          heading: "3. Subscriptions & billing",
          paragraphs: [
            "Plans and current prices are shown on the Pricing page. Monthly plans renew monthly; annual plans renew annually. You can upgrade, downgrade, pause, or cancel at any time, with proration where applicable.",
            "Failed payments: Stripe Smart Retries applies automatically, followed by a dunning sequence and a grace period before any feature lockout.",
            "Refunds are issued at our discretion in accordance with applicable consumer law. To request one, contact support within 14 days of payment.",
          ],
        },
        {
          heading: "4. Academic integrity",
          paragraphs: [
            "Submissions are your own work. You agree not to submit plagiarised content or work you did not produce, and not to use GeoGrid to facilitate cheating — including by generating, buying, or reselling assignments or grades.",
            "Tutors grade submissions at their professional discretion. GeoGrid does not alter grades and never generates grades automatically.",
          ],
        },
        {
          heading: "5. Acceptable use",
          paragraphs: [
            "You agree to the Acceptable Use Policy, which prohibits abusive content, harassment, and misuse of the platform.",
          ],
        },
        {
          heading: "6. Liability",
          paragraphs: [
            "GeoGrid provides the service \u201Cas is\u201D within the limits permitted by law. To the maximum extent permitted, we are not liable for indirect or consequential loss. Nothing in these terms limits liability that cannot be limited by law.",
          ],
        },
        {
          heading: "7. Termination",
          paragraphs: [
            "We may suspend or terminate accounts that violate these terms or the Acceptable Use Policy, with notice where practical. You can delete your account at any time; data is handled per our Privacy Policy.",
          ],
        },
        {
          heading: "8. Changes",
          paragraphs: [
            "We will notify you by email at least 30 days before materially changing these terms. Continued use after the change constitutes acceptance.",
          ],
        },
      ]}
    />
  );
}