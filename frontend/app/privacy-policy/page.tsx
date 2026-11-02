import type {Metadata} from 'next'
import Link from 'next/link'
import {ShieldCheck} from 'lucide-react'

import {breadcrumbs} from '@/lib/collections'

const sections = [
  {id: 'interpretation-and-definitions', label: 'Interpretation and definitions'},
  {id: 'collecting-personal-data', label: 'Collecting personal data'},
  {id: 'using-personal-data', label: 'Using personal data'},
  {id: 'retention-and-transfer', label: 'Retention and transfer'},
  {id: 'deletion-and-disclosure', label: 'Deletion and disclosure'},
  {id: 'security-and-children', label: 'Security and children'},
  {id: 'links-and-changes', label: 'Links and policy changes'},
  {id: 'contact-us', label: 'Contact us'},
] as const

const breadcrumbItems = [
  {name: 'Home', path: '/'},
  {name: 'Privacy Policy', path: '/privacy-policy/'},
]

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how OC Law Group LLC collects, uses, stores, and protects personal information, including information related to SMS communications.',
  alternates: {canonical: '/privacy-policy/'},
}

function JsonLd({value}: {value: object}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(value).replace(/</g, '\\u003c')}}
    />
  )
}

export default function PrivacyPolicyPage() {
  return (
    <div className="collection-page container privacy-page">
      <nav aria-label="Breadcrumb" className="collection-breadcrumbs">
        {breadcrumbItems.map((item, index) => (
          <span key={item.path}>
            {index > 0 && <span aria-hidden="true"> / </span>}
            <Link
              href={item.path}
              aria-current={index === breadcrumbItems.length - 1 ? 'page' : undefined}
            >
              {item.name}
            </Link>
          </span>
        ))}
      </nav>

      <div className="practice-detail">
        <main className="practice-article privacy-article">
          <p className="practice-eyebrow">Your information and your rights</p>
          <h1>Privacy Policy</h1>
          <p className="privacy-updated">Last updated: February 1, 2025</p>
          <p className="practice-lead">
            This Privacy Policy describes Our policies and procedures on the collection, use and
            disclosure of Your information when You use the Service and tells You about Your privacy
            rights and how the law protects You.
          </p>

          <section className="privacy-notice" aria-labelledby="sms-notice-heading">
            <div className="privacy-notice-icon" aria-hidden="true">
              <ShieldCheck size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="site-eyebrow">SMS communications</p>
              <h2 id="sms-notice-heading">Text messaging terms</h2>
              <p>
                OC Law Group LLC will respond to any missed phone calls with a text message. It is
                also possible that if you have provided us with your phone number previously you
                could receive a message from us with status updates, to set up a meeting, or to ask
                follow-up questions.
              </p>
              <p>
                You can cancel the SMS service at any time. Just text “STOP” to the short code.
                After you send the SMS message “STOP” to us, we will send you an SMS message to
                confirm that you have been unsubscribed. After this, you will no longer receive SMS
                messages from us. If you want to join again, just sign up as you did the first time
                and we will start sending SMS messages to you again.
              </p>
              <p>
                If you are experiencing issues with the messaging program, you can reply with the
                keyword HELP for more assistance, or get help directly at{' '}
                <a href="mailto:info@oclaw.us">info@oclaw.us</a>.
              </p>
              <p>Carriers are not liable for delayed or undelivered messages.</p>
              <p>
                Message and data rates may apply for messages sent to you from us and to us from
                you. You will receive messages very sparingly. If you have questions about your text
                or data plan, contact your wireless provider.
              </p>
              <p>
                <strong>
                  No mobile information will be shared with third parties or affiliates for
                  marketing or promotional purposes.
                </strong>
              </p>
            </div>
          </section>

          <p>
            We use Your Personal Data to provide and improve the Service. By using the Service, You
            agree to the collection and use of information in accordance with this Privacy Policy.
          </p>

          <section id="interpretation-and-definitions" className="privacy-section">
            <h2>Interpretation and Definitions</h2>
            <h3>Interpretation</h3>
            <p>
              The words whose initial letters are capitalized have meanings defined under the
              following conditions. The following definitions shall have the same meaning regardless
              of whether they appear in singular or plural.
            </p>
            <h3>Definitions</h3>
            <p>For the purposes of this Privacy Policy:</p>
            <ul>
              <li>
                <strong>Account</strong> means a unique account created for You to access our
                Service or parts of our Service.
              </li>
              <li>
                <strong>Affiliate</strong> means an entity that controls, is controlled by, or is
                under common control with a party, where “control” means ownership of 50% or more of
                the shares, equity interest, or other securities entitled to vote for election of
                directors or other managing authority.
              </li>
              <li>
                <strong>Company</strong> (referred to as either “the Company,” “We,” “Us,” or “Our”
                in this Agreement) refers to OC Law Group LLC, 518 E. Northwest Highway, Mount
                Prospect, IL 60056.
              </li>
              <li>
                <strong>Cookies</strong> are small files placed on Your computer, mobile device, or
                any other device by a website, containing details of Your browsing history on that
                website among their many uses.
              </li>
              <li>
                <strong>Country</strong> refers to Illinois, United States.
              </li>
              <li>
                <strong>Device</strong> means any device that can access the Service, such as a
                computer, cellphone, or digital tablet.
              </li>
              <li>
                <strong>Personal Data</strong> is any information that relates to an identified or
                identifiable individual.
              </li>
              <li>
                <strong>Service</strong> refers to the Website.
              </li>
              <li>
                <strong>Service Provider</strong> means any natural or legal person who processes
                data on behalf of the Company. It refers to third-party companies or individuals
                employed by the Company to facilitate or provide the Service, perform services
                related to the Service, or assist the Company in analyzing how the Service is used.
              </li>
              <li>
                <strong>Usage Data</strong> refers to data collected automatically, either generated
                by the use of the Service or from the Service infrastructure itself, such as the
                duration of a page visit.
              </li>
              <li>
                <strong>Website</strong> refers to OC Law Group LLC, accessible from{' '}
                <a href="https://www.oclaw.us/">www.oclaw.us</a>.
              </li>
              <li>
                <strong>You</strong> means the individual accessing or using the Service, or the
                company or other legal entity on behalf of which such individual is accessing or
                using the Service, as applicable.
              </li>
            </ul>
          </section>

          <section id="collecting-personal-data" className="privacy-section">
            <h2>Collecting and Using Your Personal Data</h2>
            <h3>Types of Data Collected</h3>
            <h4>Personal Data</h4>
            <p>
              While using Our Service, We may ask You to provide Us with certain personally
              identifiable information that can be used to contact or identify You. Personally
              identifiable information may include, but is not limited to:
            </p>
            <ul>
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Phone number</li>
              <li>Usage Data</li>
            </ul>
            <h4>Usage Data</h4>
            <p>Usage Data is collected automatically when using the Service.</p>
            <p>
              Usage Data may include information such as Your Device&apos;s Internet Protocol
              address, browser type, browser version, the pages of our Service that You visit, the
              time and date of Your visit, the time spent on those pages, unique device identifiers,
              and other diagnostic data.
            </p>
            <p>
              When You access the Service through a mobile device, We may collect information
              automatically, including the type of mobile device You use, Your mobile device unique
              ID, its IP address, Your mobile operating system, the type of mobile Internet browser
              You use, unique device identifiers, and other diagnostic data. We may also collect
              information that Your browser sends whenever You visit or access the Service through a
              mobile device.
            </p>
            <h3>Tracking Technologies and Cookies</h3>
            <p>
              We use Cookies and similar tracking technologies to track activity on Our Service and
              store certain information. Technologies used may include beacons, tags, and scripts to
              collect and track information and to improve and analyze Our Service.
            </p>
            <ul>
              <li>
                <strong>Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your
                Device. You can instruct Your browser to refuse all Cookies or indicate when a
                Cookie is being sent. However, if You do not accept Cookies, You may not be able to
                use some parts of our Service. Unless You have adjusted Your browser settings to
                refuse Cookies, our Service may use Cookies.
              </li>
              <li>
                <strong>Web Beacons.</strong> Certain sections of our Service and our emails may
                contain small electronic files known as web beacons that permit the Company to count
                users who visited pages or opened an email and compile related website statistics.
              </li>
            </ul>
            <p>
              Cookies can be Persistent or Session Cookies. Persistent Cookies remain on Your
              computer or mobile device when You go offline, while Session Cookies are deleted when
              You close Your browser. Learn more in this{' '}
              <a
                href="https://www.termsfeed.com/blog/cookies/#What_Are_Cookies"
                target="_blank"
                rel="noopener noreferrer"
              >
                article about cookies
              </a>
              .
            </p>
            <h4>Necessary / Essential Cookies</h4>
            <p>
              <strong>Type:</strong> Session Cookies
              <br />
              <strong>Administered by:</strong> Us
            </p>
            <p>
              These Cookies are essential to provide services available through the Website and
              enable You to use some of its features. They help authenticate users and prevent
              fraudulent use of user accounts. Without them, requested services cannot be provided.
            </p>
            <h4>Cookies Policy / Notice Acceptance Cookies</h4>
            <p>
              <strong>Type:</strong> Persistent Cookies
              <br />
              <strong>Administered by:</strong> Us
            </p>
            <p>
              These Cookies identify whether users have accepted the use of Cookies on the Website.
            </p>
            <h4>Functionality Cookies</h4>
            <p>
              <strong>Type:</strong> Persistent Cookies
              <br />
              <strong>Administered by:</strong> Us
            </p>
            <p>
              These Cookies allow us to remember choices You make when You use the Website, such as
              login details or language preference. They provide a more personal experience and
              prevent You from having to re-enter preferences every time You use the Website.
            </p>
          </section>

          <section id="using-personal-data" className="privacy-section">
            <h2>Use of Your Personal Data</h2>
            <p>The Company may use Personal Data for the following purposes:</p>
            <ul>
              <li>
                <strong>To provide and maintain our Service,</strong> including monitoring usage.
              </li>
              <li>
                <strong>To manage Your Account</strong> and Your registration as a user of the
                Service.
              </li>
              <li>
                <strong>For the performance of a contract,</strong> including the development,
                compliance, and undertaking of a purchase contract or other contract with Us.
              </li>
              <li>
                <strong>To contact You</strong> by email, telephone, SMS, or equivalent electronic
                communication regarding updates, informative communications, products, contracted
                services, or security updates when necessary or reasonable.
              </li>
              <li>
                <strong>To provide news, offers, and information</strong> about goods, services, and
                events similar to those You purchased or asked about, unless You opted out.
              </li>
              <li>
                <strong>To manage Your requests.</strong>
              </li>
              <li>
                <strong>For business transfers,</strong> such as evaluating or conducting a merger,
                divestiture, restructuring, reorganization, dissolution, or other transfer of
                assets.
              </li>
              <li>
                <strong>For other purposes,</strong> such as data analysis, identifying usage
                trends, evaluating promotional campaigns, and improving our Service, products,
                services, marketing, and Your experience.
              </li>
            </ul>
            <h3>Sharing Your Personal Information</h3>
            <p>We may share Your personal information in the following situations:</p>
            <ul>
              <li>
                <strong>With Service Providers</strong> to monitor and analyze use of our Service
                and to contact You.
              </li>
              <li>
                <strong>For business transfers</strong> connected to negotiations of a merger, sale,
                financing, or acquisition.
              </li>
              <li>
                <strong>With Affiliates</strong> that are required to honor this Privacy Policy.
              </li>
              <li>
                <strong>With business partners</strong> to offer certain products, services, or
                promotions.
              </li>
              <li>
                <strong>With other users</strong> when You share personal information in public
                areas.
              </li>
              <li>
                <strong>With Your consent</strong> for any other purpose.
              </li>
            </ul>
          </section>

          <section id="retention-and-transfer" className="privacy-section">
            <h2>Retention and Transfer of Your Personal Data</h2>
            <h3>Retention of Your Personal Data</h3>
            <p>
              The Company will retain Your Personal Data only for as long as necessary for the
              purposes set out in this Privacy Policy. We will retain and use it as necessary to
              comply with legal obligations, resolve disputes, and enforce our legal agreements and
              policies.
            </p>
            <p>
              The Company will retain Usage Data for internal analysis. Usage Data is generally
              retained for a shorter period, except when used to strengthen security or improve Our
              Service, or when We are legally required to retain it longer.
            </p>
            <h3>Transfer of Your Personal Data</h3>
            <p>
              Your information, including Personal Data, is processed at the Company&apos;s
              operating offices and other places where the parties involved in processing are
              located. This means it may be transferred to—and maintained on—computers outside Your
              state, province, country, or other governmental jurisdiction where data-protection
              laws may differ from those in Your jurisdiction.
            </p>
            <p>
              Your consent to this Privacy Policy followed by Your submission of information
              represents Your agreement to that transfer. The Company will take reasonable steps to
              ensure Your data is treated securely and in accordance with this Privacy Policy. No
              transfer will take place unless adequate controls are in place, including controls for
              the security of Your data and other personal information.
            </p>
          </section>

          <section id="deletion-and-disclosure" className="privacy-section">
            <h2>Deletion and Disclosure of Your Personal Data</h2>
            <h3>Delete Your Personal Data</h3>
            <p>
              You have the right to delete or request that We assist in deleting Personal Data We
              collected about You. Our Service may give You the ability to delete certain
              information from within the Service.
            </p>
            <p>
              You may update, amend, or delete Your information at any time by signing in to Your
              Account, if You have one, and visiting account settings. You may also contact Us to
              request access to, correction of, or deletion of personal information You provided. We
              may need to retain certain information when We have a legal obligation or lawful basis
              to do so.
            </p>
            <h3>Business Transactions</h3>
            <p>
              If the Company is involved in a merger, acquisition, or asset sale, Your Personal Data
              may be transferred. We will provide notice before it is transferred and becomes
              subject to a different Privacy Policy.
            </p>
            <h3>Law Enforcement</h3>
            <p>
              Under certain circumstances, the Company may be required to disclose Your Personal
              Data by law or in response to valid requests by public authorities, such as a court or
              government agency.
            </p>
            <h3>Other Legal Requirements</h3>
            <p>
              The Company may disclose Your Personal Data in the good-faith belief that such action
              is necessary to:
            </p>
            <ul>
              <li>Comply with a legal obligation</li>
              <li>Protect and defend the rights or property of the Company</li>
              <li>Prevent or investigate possible wrongdoing connected to the Service</li>
              <li>Protect the personal safety of Service users or the public</li>
              <li>Protect against legal liability</li>
            </ul>
          </section>

          <section id="security-and-children" className="privacy-section">
            <h2>Security and Children&apos;s Privacy</h2>
            <h3>Security of Your Personal Data</h3>
            <p>
              The security of Your Personal Data is important to Us, but no method of Internet
              transmission or electronic storage is 100% secure. While We strive to use commercially
              acceptable means to protect Your Personal Data, We cannot guarantee absolute security.
            </p>
            <h3>Children&apos;s Privacy</h3>
            <p>
              Our Service does not address anyone under age 13. We do not knowingly collect
              personally identifiable information from anyone under 13. If You are a parent or
              guardian and know that Your child provided Us with Personal Data, please contact Us.
              If We learn that We collected Personal Data from anyone under 13 without parental
              consent, We take steps to remove it from Our servers.
            </p>
            <p>
              If We need to rely on consent as a legal basis for processing Your information and
              Your country requires parental consent, We may require Your parent&apos;s consent
              before We collect and use that information.
            </p>
          </section>

          <section id="links-and-changes" className="privacy-section">
            <h2>Links and Changes to This Privacy Policy</h2>
            <h3>Links to Other Websites</h3>
            <p>
              Our Service may contain links to websites not operated by Us. If You click a
              third-party link, You will be directed to that party&apos;s site. We strongly advise
              You to review the Privacy Policy of every site You visit. We have no control over and
              assume no responsibility for third-party content, privacy policies, or practices.
            </p>
            <h3>Changes to This Privacy Policy</h3>
            <p>
              We may update Our Privacy Policy from time to time. We will notify You of changes by
              posting the new Privacy Policy on this page. We will let You know by email and/or a
              prominent notice on Our Service before a change becomes effective and will update the
              “Last updated” date at the top of this Privacy Policy.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically. Changes become effective
              when they are posted on this page.
            </p>
          </section>

          <section id="contact-us" className="privacy-section privacy-contact">
            <h2>Contact Us</h2>
            <p>If you have questions about this Privacy Policy, contact us:</p>
            <ul>
              <li>
                By email: <a href="mailto:info@oclaw.us">info@oclaw.us</a>
              </li>
              <li>
                By phone: <a href="tel:+18472589954">847-258-9954</a>
              </li>
            </ul>
          </section>
        </main>

        <aside className="practice-sidebar privacy-sidebar">
          <section className="practice-sidebar-panel">
            <h2>On this page</h2>
            <nav aria-label="Privacy policy sections">
              {sections.map((section) => (
                <a href={`#${section.id}`} key={section.id}>
                  {section.label}
                </a>
              ))}
            </nav>
          </section>

          <div className="practice-sidebar-callout">
            <p className="site-eyebrow">Questions?</p>
            <h2>Talk with our team</h2>
            <p>Your privacy questions are important to us.</p>
            <a className="privacy-contact-link" href="mailto:info@oclaw.us">
              Email OC Law Group
            </a>
          </div>
        </aside>
      </div>

      <JsonLd value={breadcrumbs(breadcrumbItems)} />
    </div>
  )
}
