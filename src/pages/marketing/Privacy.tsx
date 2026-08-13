import { LegalScaffold } from "@/components/shared/legal-scaffold";
import { useSeo } from "@/lib/seo";

export default function Privacy() {
  useSeo("Privacy Policy", "How GeoGrid collects, uses, and protects student, tutor, and payment data.");
  return (
    <LegalScaffold
      title="Privacy Policy"
      updated="[Date TBD]"
      intro="This Privacy Policy explains what GeoGrid collects, why we collect it, how long we keep it, and the rights you have over it. It covers students, tutors, and institution buyers."
      sections={[
        {
          heading: "1. What we collect",
          paragraphs: [
            "Account data: name, email, date of birth (for age-appropriate onboarding), country, and profile details you choose to add.",
            "Submission data: files, links, and text you submit as assignments, plus grading records and feedback.",
            "Payment metadata: processed by our payment processor (Stripe). GeoGrid stores invoice history, amounts, and statuses, but not full card numbers.",
            "Communications: your phone number if you opt in to WhatsApp notifications, and email address for transactional email.",
          ],
        },
        {
          heading: "2. Why we process it",
          paragraphs: [
            "We process account and submission data to provide the service — storing and grading assignments, managing subscriptions, and producing progress records.",
            "Legal bases under GDPR (for EU users): performance of contract, legitimate interest (fraud prevention, service improvement), and consent where required (e.g., WhatsApp notifications).",
          ],
        },
        {
          heading: "3. Retention",
          paragraphs: [
            "Explicit retention windows apply per data type. Submission files and payment records are purged a defined period after account deletion, minus any legal-hold requirement. We do not retain data indefinitely by default.",
          ],
        },
        {
          heading: "4. Subprocessors",
          items: [
            "Stripe — payment processing and billing",
            "Supabase — database, storage, and authentication infrastructure",
            "WhatsApp Business Platform provider — templated notification delivery",
            "Email provider — transactional email",
            "Analytics provider — product usage (aggregated)",
          ],
        },
        {
          heading: "5. Children's data",
          paragraphs: [
            "GeoGrid may be used by students under 18. We collect a date of birth at registration and gate full account access on parental consent where the account holder is below the applicable regional minimum (13 in the US under COPPA; 16 by default in the EU under GDPR unless a member state sets it lower).",
            "A parent or guardian may exercise any of the rights in this policy on behalf of their child by contacting us.",
          ],
        },
        {
          heading: "6. Your rights",
          items: [
            "Access a copy of the personal data we hold about you",
            "Export your data in a portable format",
            "Request deletion of your data",
            "Object to or restrict processing, where applicable",
            "Withdraw consent for WhatsApp or marketing communications at any time",
          ],
        },
        {
          heading: "7. Breach notification",
          paragraphs: [
            "If a data breach affects your personal data, we will notify you and the relevant supervisory authority in accordance with applicable law — without undue delay and within 72 hours where GDPR applies.",
          ],
        },
        {
          heading: "8. Contact",
          paragraphs: [
            "To exercise any right, email hello@geogrid.example with the subject line \u201CData request\u201D. We respond within 30 days.",
          ],
        },
      ]}
    />
  );
}