import { LegalLayout } from '@/components/LegalLayout'

export const Terms = () => {
  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: (
        <>
          <p>
            Welcome to Thunder Kanban. By accessing our services, creating an account, or dragging your first task, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.
          </p>
          <p>
            We reserve the right to modify these terms at any time. We will alert you to major changes by updating the notification banner inside the platform or via email. Continuing to use Thunder Kanban after changes are made means you accept the revised terms.
          </p>
        </>
      ),
    },
    {
      id: "accounts",
      title: "2. User Accounts & Registration",
      content: (
        <>
          <p>
            To use the core features of Thunder Kanban, you must register for an account. You agree to provide accurate, complete information during registration and keep it updated.
          </p>
          <p>
            You are entirely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. If you suspect any security breaches or unauthorized access, contact us immediately.
          </p>
        </>
      ),
    },
    {
      id: "license",
      title: "3. License to Use",
      content: (
        <>
          <p>
            Thunder Kanban grants you a personal, non-transferable, non-exclusive, revocable license to access and use the software for organizing your boards, tasks, and teams.
          </p>
          <p>
            This license is for organizational and personal project management. You may not sell, rent, sub-license, reverse-engineer, or distribute any part of the Thunder Kanban code or branding without written authorization.
          </p>
        </>
      ),
    },
    {
      id: "conduct",
      title: "4. Prohibited Conduct",
      content: (
        <>
          <p>
            You agree not to use Thunder Kanban for any unlawful activities or in ways that disrupt the system. Prohibited conduct includes, but is not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Attempting to breach security protocols, gain unauthorized access, or run heavy scripts that stress the API servers.</li>
            <li>Uploading malicious code, viruses, or Trojan horses.</li>
            <li>Harassing, spamming, or sharing abusive content with collaborators inside public or team boards.</li>
          </ul>
        </>
      ),
    },
    {
      id: "intellectual-property",
      title: "5. Intellectual Property",
      content: (
        <>
          <p>
            The software, user interface design, logo, layouts, and backend APIs are the exclusive property of Thunder Kanban and its creators.
          </p>
          <p>
            Any data, tasks, checklists, and descriptions you upload remain your intellectual property. Thunder Kanban claims no ownership over your board content, and your private data is encrypted and protected.
          </p>
        </>
      ),
    },
    {
      id: "liability",
      title: "6. Limitation of Liability",
      content: (
        <>
          <p>
            Thunder Kanban is provided on an "AS IS" and "AS AVAILABLE" basis. We offer no guarantees that the service will be entirely uninterrupted, error-free, or that task data will never be subject to accidental loss due to force majeure.
          </p>
          <p>
            In no event shall Thunder Kanban, its developers, or affiliates be liable for any indirect, incidental, or consequential damages resulting from the loss of data or business interruption.
          </p>
        </>
      ),
    },
  ]

  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before utilizing our lightning-fast boards."
      sections={sections}
    />
  )
}
export default Terms
