import { LegalLayout } from '@/components/LegalLayout'

export const Privacy = () => {
  const sections = [
    {
      id: "information",
      title: "1. Information We Collect",
      content: (
        <>
          <p>
            We collect information required to build, manage, and synchronize your kanban boards:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Info:</strong> Your name, email address, and encrypted password credentials when you register.</li>
            <li><strong>Board Content:</strong> Names of columns, tasks, descriptions, comments, and priority fields that you create on your boards.</li>
            <li><strong>Usage Logs:</strong> Basic technical logs, such as IP address and browser type, to maintain server integrity and debug issues.</li>
          </ul>
        </>
      ),
    },
    {
      id: "usage",
      title: "2. How We Use Information",
      content: (
        <>
          <p>
            Your information is used solely to power the Thunder Kanban experience:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To authenticate your session and prevent unauthorized access to your dashboards.</li>
            <li>To synchronize task updates in real-time across your logged-in devices and collaborators.</li>
            <li>To send you important system announcements or security updates (never promotional spam).</li>
          </ul>
        </>
      ),
    },
    {
      id: "security",
      title: "3. Data Protection & Security",
      content: (
        <>
          <p>
            We implement strict security measures to protect your personal information:
          </p>
          <p>
            Passwords are hashed using industry-standard hashing algorithms before saving. All network communication between the frontend client and backend API is encrypted via HTTPS/SSL.
          </p>
          <p>
            While we strive for bank-grade security, no storage method or internet transmission is 100% secure. We encourage strong passwords and secure browser environments.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      title: "4. Cookies and Web Storage",
      content: (
        <>
          <p>
            Thunder Kanban uses browser LocalStorage and Session Cookies to keep you logged in. These tokens do not track your behavior on external websites; their sole purpose is keeping your session active and responsive.
          </p>
          <p>
            If you disable cookies in your browser, the dashboard and board features will not function correctly since the system won't be able to authenticate your requests.
          </p>
        </>
      ),
    },
    {
      id: "third-party",
      title: "5. Third-Party Disclosures",
      content: (
        <>
          <p>
            We respect your privacy. We do not sell, trade, rent, or lease your personal data to advertisers or marketing lists.
          </p>
          <p>
            We may share limited anonymous technical data with hosting partners (e.g. database host, web host) strictly to host and serve Thunder Kanban.
          </p>
        </>
      ),
    },
    {
      id: "rights",
      title: "6. Your Rights & Data Portability",
      content: (
        <>
          <p>
            You have full control over your data. At any time, you can edit your profile information, delete specific boards, or permanently remove your tasks.
          </p>
          <p>
            If you decide to delete your account, all associated boards and tasks are permanently deleted from our primary databases within 30 days. Contact us if you need to export your boards.
          </p>
        </>
      ),
    },
  ]

  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How we manage, secure, and protect your private workflow and task data."
      sections={sections}
    />
  )
}
export default Privacy
