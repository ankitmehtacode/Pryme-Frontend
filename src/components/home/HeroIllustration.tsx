import { motion } from "framer-motion";
import styles from "./HeroIllustration.module.css";

interface HeroIllustrationProps {
  src: string;
  alt: string;
}

/**
 * Decorative hero illustration — rendered as a background
 * architectural element inside the center grid column.
 *
 * All sizing / positioning lives in HeroIllustration.module.css.
 * To swap the asset or tweak placement, edit the CSS module only.
 */
const HeroIllustration: React.FC<HeroIllustrationProps> = ({ src, alt }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
    className={styles.wrapper}
  >
    <img
      src={src}
      alt={alt}
      className={styles.image}
      loading="eager"
      fetchPriority="high"
    />
  </motion.div>
);

export default HeroIllustration;
