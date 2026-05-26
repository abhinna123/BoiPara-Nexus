import ZoneMapSection from '../components/ZoneMapSection';
import { motion } from 'framer-motion';

const MapPage = () => {
  return (
    <div style={styles.wrapper}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <ZoneMapSection />
      </motion.div>
    </div>
  );
};

const styles = {
  wrapper: {
    paddingTop: '80px', // Below navbar
    minHeight: '100vh',
    background: 'var(--color-bg-paper)',
  }
};

export default MapPage;
