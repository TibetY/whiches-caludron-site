import logo from '@assets/logo-sticker.webp';
import { Link } from 'react-router-dom';
import { externalUrl, telHref } from '../../lib/format';
import { hoursFooterLine } from '../../lib/hours';
import { usePublished } from '../../store/context';
import { SwirlBand, WaveDivider } from '../ui';
import styles from './SiteFooter.module.css';

/** Purple swirl footer. `waveFill` is the colour of the section above it. */
export function SiteFooter({ waveFill }: { waveFill: string }) {
  const { contact, hours } = usePublished();

  return (
    <footer className={styles.footer}>
      <SwirlBand />
      <WaveDivider position="top" fill={waveFill} />
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img src={logo} alt="" width="104" height="125" className={styles.logo} />
          <div>
            <div className={styles.wordmark}>’wiches cauldron</div>
            <div className={styles.tagline}>sandwich shoppe · Carp, Ontario</div>
          </div>
        </div>
        <p className={styles.address}>
          {contact.address}
          <br />
          {hoursFooterLine(hours.week)}
        </p>
        <div className={styles.links}>
          <a href={telHref(contact.phone)}>{contact.phone}</a>
          <a href={`mailto:${contact.email}`}>Email us</a>
          <a href={externalUrl(contact.instagram)}>Instagram</a>
          <a href={externalUrl(contact.facebook)}>Facebook</a>
          {/* Not in the artboards: the owners' way in to the dashboard (no login yet). */}
          <Link to="/dashboard">For the owners</Link>
        </div>
      </div>
      <p className={styles.bye}>See you at lunch!</p>
    </footer>
  );
}
