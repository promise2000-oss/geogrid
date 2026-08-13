import { LegalScaffold } from "@/components/shared/legal-scaffold";
import { useSeo } from "@/lib/seo";

export default function Cookies() {
  useSeo("Cookie Policy", "What cookies GeoGrid uses — and the ones it deliberately doesn't.");
  return (
    <LegalScaffold
      title="Cookie Policy"
      updated="[Date TBD]"
      intro="This policy explains the cookies and similar technologies GeoGrid uses, and the categories we deliberately do not use."
      sections={[
        {
          heading: "1. Categories we use",
          items: [
            "Essential cookies — required for login sessions, security, and core functionality. These cannot be disabled.",
            "Analytics cookies — aggregate, privacy-respecting usage measurement to improve the product.",
          ],
        },
        {
          heading: "2. What we never use",
          paragraphs: [
            "GeoGrid does not run advertising and does not use third-party advertising or cross-site tracking cookies. There is no ad network on this site, period.",
          ],
        },
        {
          heading: "3. Consent banner",
          paragraphs: [
            "On your first visit you'll see a banner asking for consent to analytics cookies. Essential cookies are set regardless. You can change your choice at any time from the banner link in the footer.",
          ],
        },
        {
          heading: "4. Managing cookies",
          paragraphs: [
            "You can clear or block cookies in your browser settings. Blocking essential cookies will break signing in, so we don't recommend it.",
          ],
        },
        {
          heading: "5. Contact",
          paragraphs: ["Questions about cookies? Email hello@geogrid.example."],
        },
      ]}
    />
  );
}