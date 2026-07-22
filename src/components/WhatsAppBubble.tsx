import { motion } from "framer-motion";

const WHATSAPP_NUMBER = "919243294291"; // +91 92432 94291
const WHATSAPP_MESSAGE = "Hi! I want to compare loans and check my eligibility.";

// wa.me deep-links land directly in the chat with the number pre-filled --
// on mobile it opens the WhatsApp app, on desktop it opens WhatsApp Web (or
// the desktop app, if the OS has registered it) -- both skip any contact
// picker or search step.
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.005c5.46 0 9.91-4.45 9.91-9.91C21.98 6.45 17.53 2 12.04 2zm5.83 14.02c-.245.69-1.24 1.26-2.02 1.43-.535.11-1.235.2-3.59-.77-3.01-1.25-4.95-4.31-5.1-4.51-.15-.2-1.22-1.63-1.22-3.11 0-1.48.775-2.2 1.05-2.5.27-.3.6-.375.8-.375.2 0 .4.005.575.01.185.01.435-.07.68.52.245.6.83 2.07.905 2.22.075.15.125.325.025.525-.1.2-.15.325-.3.5-.15.175-.31.39-.44.525-.15.15-.305.315-.13.615.175.3.775 1.28 1.665 2.075 1.145 1.02 2.11 1.335 2.41 1.485.3.15.475.125.65-.075.175-.2.75-.875.95-1.175.2-.3.4-.25.675-.15.275.1 1.74.82 2.04.97.3.15.5.225.575.35.075.125.075.72-.17 1.41z" />
  </svg>
);

const WhatsAppBubble = () => (
  <motion.a
    href={WHATSAPP_URL}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with us on WhatsApp"
    initial={{ opacity: 0, scale: 0.8, y: 16 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.94 }}
    className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[60] flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 transition-shadow"
  >
    <span className="hidden sm:block absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
    <WhatsAppIcon />
  </motion.a>
);

export default WhatsAppBubble;
