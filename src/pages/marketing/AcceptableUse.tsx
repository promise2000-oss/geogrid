import { LegalScaffold } from "@/components/shared/legal-scaffold";
import { useSeo } from "@/lib/seo";

export default function AcceptableUse() {
  useSeo("Acceptable Use Policy", "What's allowed on GeoGrid — and what gets accounts suspended.");
  return (
    <LegalScaffold
      title="Acceptable Use Policy"
      updated="[Date TBD]"
      intro="GeoGrid is built for academic work. This policy sets out what is and isn't allowed. Violations can lead to suspension or termination of accounts."
      sections={[
        {
          heading: "1. Prohibited content in submissions and announcements",
          items: [
            "Content that is unlawful, defamatory, or infringes someone else's intellectual property",
            "Sexually explicit content, or content exploiting or endangering minors",
            "Malware, executables, or files designed to compromise other users' devices",
            "Spam, phishing, or credential-harvesting content",
            "Personal data of third parties without their consent",
          ],
        },
        {
          heading: "2. Plagiarism & cheating facilitation",
          paragraphs: [
            "Assignments must be the submitting student's own work. Using GeoGrid to store, distribute, or resell model answers for another student's assessed work, or to otherwise facilitate academic dishonesty, is prohibited.",
            "Account sharing for the purpose of having another person complete or submit assessed work is prohibited.",
          ],
        },
        {
          heading: "3. Harassment & conduct",
          paragraphs: [
            "Harassment, bullying, threats, hate speech, or targeting any user because of a protected characteristic is prohibited anywhere on the platform — including private grading notes and comment threads.",
          ],
        },
        {
          heading: "4. Platform integrity",
          items: [
            "Attempting to bypass authentication, access another user's data, or probe the admin console is prohibited",
            "Scraping, automated account creation, or abuse of rate-limited endpoints is prohibited",
            "Testing that reasonably anticipates harm to other users requires prior written approval",
          ],
        },
        {
          heading: "5. Reporting & enforcement",
          paragraphs: [
            "Report violations to hello@geogrid.example. We review reports within two business days and take proportionate action, from warning to account termination, logging enforcement actions in our audit trail.",
          ],
        },
      ]}
    />
  );
}