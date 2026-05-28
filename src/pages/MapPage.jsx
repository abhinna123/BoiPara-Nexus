import ZoneMapSection from '../components/ZoneMapSection';
import { motion } from 'framer-motion';

const MapPage = () => {
  return (
    <div style={styles.wrapper}>
      <ZoneMapSection />
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
