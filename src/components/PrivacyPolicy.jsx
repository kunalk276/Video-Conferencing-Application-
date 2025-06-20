import React from 'react';
import { motion } from 'framer-motion';
import { FaUserShield, FaCookieBite, FaUserCheck, FaBalanceScale, FaFileDownload } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import SharedLayout from './SharedLayout';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const sections = [
  {
    title: 'Data Collection',
    content: `We collect both personal and non-personal data to ensure high-quality, reliable service. 
This includes information you provide during account registration (such as your name, email address, and password), as well as data generated while using our services (including meeting duration, participant count, and technical diagnostics).
Additionally, we may collect device and browser metadata, IP addresses, and location data to optimize performance and enhance security.`,
    icon: <FaUserShield />
  },
  {
    title: 'Cookies',
    content: `Our website uses cookies and similar tracking technologies to improve your experience. 
These cookies enable us to remember your preferences, keep you logged in securely, analyze user behavior, and tailor content or features accordingly. 
You can manage or disable cookies in your browser settings, but doing so may limit some features of the platform. 
We do not use cookies for invasive advertising or to track users across third-party websites.`,
    icon: <FaCookieBite />
  },
  {
    title: 'User Rights',
    content: `As a user, you retain full rights over your personal data. 
You may request access to your data at any time, and have the ability to update, export, or delete it permanently. 
We are committed to transparency and user control — your data is never sold or shared without consent. 
If you choose to delete your account, all associated data will be erased from our active systems within 30 days, with backups purged periodically as per our retention policy.`,
    icon: <FaUserCheck />
  },
  {
    title: 'GDPR Compliance',
    content: `We strictly adhere to the General Data Protection Regulation (GDPR) and other global data protection laws. 
All personal data is processed lawfully, fairly, and transparently. We implement strong encryption protocols, access controls, and data minimization practices to protect your information. 
Users within the EU and EEA are provided additional rights, such as the right to data portability and objection to automated decision-making. 
Our appointed Data Protection Officer (DPO) oversees compliance and handles user requests and inquiries regarding privacy concerns.`,
    icon: <FaBalanceScale />
  }
];


  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Privacy Policy', 20, 20);

    let y = 30;
    sections.forEach((sec, index) => {
      doc.setFontSize(14);
      doc.setTextColor(33, 150, 243); // blue title
      doc.text(`${index + 1}. ${sec.title}`, 20, y);
      y += 8;

      doc.setFontSize(12);
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(sec.content, 170); // wrap text
      doc.text(lines, 20, y);
      y += lines.length * 7 + 6;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save('PrivacyPolicy.pdf');
  };

  return (
    <SharedLayout>
      <motion.div
        className="privacy-policy"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="privacy-heading">Privacy Policy</h2>

        <div className="privacy-section">
          {sections.map((sec, i) => (
            <motion.details
              key={i}
              className="privacy-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <summary>
                <span className="icon">{sec.icon}</span> {sec.title}
              </summary>
              <p>{sec.content}</p>
            </motion.details>
          ))}

          <div className="text-center">
            <button className="download-btn" onClick={handleDownload}>
              Download Full Policy <FaFileDownload style={{ marginLeft: '10px' }} />
            </button>
          </div>
        </div>
      </motion.div>
    </SharedLayout>
  );
};

export default PrivacyPolicy;
