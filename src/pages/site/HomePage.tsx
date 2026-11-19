import logo from '@assets/logo-sticker.webp';
import Cauldron from '@assets/svg/cauldron.svg?react';
import SoupBowl from '@assets/svg/soup-bowl.svg?react';
import Trucker from '@assets/svg/trucker-exploded.svg?react';
import { DoorSign } from '../../components/site/DoorSign';
import {
  CameraSketch,
  Envelope,
  HandArrow,
  Heart,
  HeroBubbles,
  ListDot,
  MapPin,
  RibbonDot,
  Sun,
} from '../../components/site/decorations';
import { PublicPage } from '../../components/site/PublicPage';
import { StoredPhoto } from '../../components/site/StoredPhoto';
import { TodayCard } from '../../components/site/TodayCard';
import {
  CartoonLink,
  OutlinedHeading,
  Ribbon,
  StickerCard,
  SwirlBand,
  WaveDivider,
} from '../../components/ui';
import { externalUrl, menuPriceText, splitAddress, telHref } from '../../lib/format';
import { hoursRibbon, openingSummary, weeklyHoursRows } from '../../lib/hours';
import type { SiteContent } from '../../lib/types';
import { usePublished } from '../../store/context';
import styles from './HomePage.module.css';

const SOUP_DOTS = ['#83EDF8', '#B8E06A', '#C56CB0'];

export default function HomePage() {
  const content = usePublished();

  return (
    <PublicPage
      page="home"
      title="’Wiches Cauldron Sandwich Shoppe · Carp, Ontario"
      footerWave="var(--cream)"
    >
      <main id="main" tabIndex={-1}>
        <Hero content={content} />
        <HoursRibbon content={content} />
        <TodaysBrew content={content} />
        <TruckerFeature content={content} />
        <Soups content={content} />
        <StickerWall content={content} />
        <Story content={content} />
        <Visit content={content} />
      </main>
    </PublicPage>
  );
}

type SectionProps = { content: SiteContent };

function Hero({ content }: SectionProps) {
  const opening = openingSummary(content.hours.week);
  return (
    <section id="top" className={styles.hero}>
      <SwirlBand />
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <Ribbon className={styles.heroTag} bandAs="p" bandClassName={styles.heroTagBand}>
            come on in — the soup’s on!
          </Ribbon>
          <OutlinedHeading as="h1" outline={3} tone="cream" className={styles.heroTitle}>
            Big sandwiches, good soup &amp; a handful of <span>napkins!</span>
          </OutlinedHeading>
          <p className={styles.heroLede}>
            On Carp Road we pile deli sandwiches high enough to need two hands, ladle out soups that
            change with the seasons, and keep the butter tarts right by the till.
          </p>
          <div className={styles.heroCtas}>
            <CartoonLink to="/menu" variant="secondary" size="xl">
              See the menu
            </CartoonLink>
            <CartoonLink
              href={telHref(content.contact.phone)}
              variant="tertiary"
              size="xl"
              className={styles.heroCall}
            >
              Call for pick-up
            </CartoonLink>
          </div>
          <div className={styles.heroHand}>
            <HandArrow />
            {opening ? `open ${opening}` : 'closed for now'}
          </div>
        </div>
        <div className={styles.heroArt}>
          <HeroBubbles className={styles.heroBubbles} />
          <img
            src={logo}
            alt="’Wiches Cauldron logo: a slice of bread in a chef’s hat stirring a bubbling cauldron"
            width="360"
            height="434"
            className={styles.heroLogo}
          />
        </div>
      </div>
      <WaveDivider position="bottom" />
    </section>
  );
}

function HoursRibbon({ content }: SectionProps) {
  const ribbon = hoursRibbon(content.hours.week);
  const { street, rest } = splitAddress(content.contact.address);
  return (
    <section aria-label="Hours, address and phone" className={styles.hoursSection}>
      <Ribbon className={styles.hoursRibbon} bandClassName={styles.hoursBand}>
        <div className={styles.hoursBlock}>
          <span className={styles.hoursBig}>{ribbon.headline}</span>
          {ribbon.detail && <span className={styles.hoursSmall}>{ribbon.detail}</span>}
        </div>
        <RibbonDot color="#C56CB0" className={styles.hoursDot} />
        <div className={styles.hoursBlock}>
          <span className={styles.hoursBig}>{street}</span>
          {rest && <span className={styles.hoursSmall}>{rest}</span>}
        </div>
        <RibbonDot color="#B8E06A" className={styles.hoursDot} />
        <div className={styles.hoursBlock}>
          <a href={telHref(content.contact.phone)} className={styles.hoursBig}>
            {content.contact.phone}
          </a>
          <span className={styles.hoursSmall}>call ahead for pick-up</span>
        </div>
      </Ribbon>
    </section>
  );
}

function TodaysBrew({ content }: SectionProps) {
  const { today, contact } = content;
  const note = today.note.trim();
  return (
    <section id="today" aria-labelledby="today-title" className={styles.today}>
      <div className={styles.todayInner}>
        <Ribbon className={styles.todayRibbon} bandClassName={styles.todayRibbonBand}>
          <OutlinedHeading id="today-title" className={styles.todayTitle}>
            Today’s Brew
          </OutlinedHeading>
        </Ribbon>
        {note && <p className={styles.note}>{note}</p>}
        <div className={styles.todayRow}>
          <div className={styles.todayArt}>
            <StoredPhoto
              photoId={today.photoId}
              alt={`Today’s brew: ${today.soup.name || 'today’s soup'} and ${today.sammie.name || 'today’s sammie'}`}
              className={styles.todayPhoto}
              placeholder={<Cauldron className={styles.illustration} />}
            />
          </div>
          <div className={styles.todayCardCol}>
            <TodayCard
              today={today}
              variant="full"
              footer={
                <p className={styles.todayFoot}>
                  Soup comes by the cup or bowl, always with warm bread. Follow us on{' '}
                  <a href={externalUrl(contact.instagram)}>Instagram</a> or{' '}
                  <a href={externalUrl(contact.facebook)}>Facebook</a> for the daily specials.
                </p>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function TruckerFeature({ content }: SectionProps) {
  const trucker = content.menu.items.find((item) => item.id === 'trucker');
  const price = trucker ? menuPriceText(trucker.price) : null;
  return (
    <section aria-labelledby="trucker-title" className={styles.trucker}>
      <WaveDivider position="top" />
      <div className={styles.truckerInner}>
        <div className={styles.truckerArt}>
          <Trucker className={styles.illustration} />
        </div>
        <div className={styles.truckerCopy}>
          <p className={styles.truckerAside}>you’ll want napkins for this one —</p>
          <OutlinedHeading id="trucker-title" outline={3} className={styles.truckerTitle}>
            The Trucker
          </OutlinedHeading>
          <p className={styles.truckerBody}>
            Assorted deli meats, mozzarella, rosemary mayo, pickled eggplant, spring greens and
            kettle chips. Big, a little messy, and worth every napkin.
          </p>
          <div className={styles.truckerRow}>
            {price && <div className={styles.priceSticker}>{price}</div>}
            <CartoonLink to="/menu" variant="primary" size="lg">
              See all the sandwiches
            </CartoonLink>
          </div>
          <p className={styles.truckerTweak}>
            Like it your way? Most ’wiches can be tweaked — just ask at the counter.
          </p>
        </div>
      </div>
      <WaveDivider position="bottom" />
    </section>
  );
}

function Soups({ content }: SectionProps) {
  const soups = content.menu.items.filter(
    (item) => item.category === 'soups' && item.visible && item.name.trim(),
  );
  const cup = menuPriceText(content.menu.soupPrices.cup);
  const bowl = menuPriceText(content.menu.soupPrices.bowl);
  return (
    <section aria-labelledby="soups-title" className={styles.soups}>
      <div className={styles.soupsInner}>
        <div className={styles.soupsCopy}>
          <OutlinedHeading id="soups-title" className={styles.soupsTitle}>
            There’s always something good in the pot.
          </OutlinedHeading>
          <p className={styles.soupsLede}>
            Our soups change with the seasons, so there’s usually something new to try. Every cup
            and bowl comes with fresh, warm bread.
          </p>
          <StickerCard className={styles.favourites}>
            <h3 className={styles.favouritesTitle}>Favourites from the pot</h3>
            <ul className={styles.soupList}>
              {soups.map((soup, i) => (
                <li key={soup.id}>
                  <ListDot color={SOUP_DOTS[i % SOUP_DOTS.length]} />
                  {soup.name}
                </li>
              ))}
              <li className={styles.soupOfTheDay}>
                <ListDot color="#FFD23F" />+ the soup of the day — just ask!
              </li>
            </ul>
            {(cup || bowl) && (
              <p className={styles.soupPrices}>
                {cup && (
                  <span>
                    Cup <strong>{cup}</strong>
                  </span>
                )}
                {bowl && (
                  <span>
                    Bowl <strong>{bowl}</strong>
                  </span>
                )}
              </p>
            )}
          </StickerCard>
        </div>
        <div className={styles.soupsArt}>
          <SoupBowl className={styles.soupBowl} />
        </div>
      </div>
    </section>
  );
}

function StickerWall({ content }: SectionProps) {
  const { notices, photos, reviews, contact } = content;
  const [firstReview, ...otherReviews] = reviews;
  return (
    <section aria-labelledby="board-title" className={styles.wall}>
      <SwirlBand mirror />
      <WaveDivider position="top" />
      <div className={styles.wallInner}>
        <div className={styles.wallHead}>
          <OutlinedHeading id="board-title" outline={3} tone="cream" className={styles.wallTitle}>
            News &amp; nice words
          </OutlinedHeading>
          <p className={styles.wallSub}>patio days, holiday treats &amp; what people say</p>
        </div>
        <div className={styles.wallGrid}>
          <StickerCard as="article" tone="aqua" shadow="deep" className={styles.patioSticker}>
            <Sun className={styles.patioSun} />
            <h3 className={styles.stickerTitle}>
              {notices.patioOpen ? 'The patio’s open!' : 'Patio season'}
            </h3>
            <p className={styles.stickerText}>
              {notices.patioOpen
                ? 'Grab a sandwich and a seat in the fresh air while the weather’s nice.'
                : 'When it warms up, the patio opens: cold drinks, sunshine and a sandwich in the fresh air.'}
            </p>
          </StickerCard>

          {notices.holiday.show && (
            <StickerCard as="article" tone="orchid" shadow="deep" className={styles.holidaySticker}>
              <Heart className={styles.holidayHeart} />
              <h3 className={styles.stickerTitle}>Holiday specials</h3>
              <p className={styles.stickerText}>{notices.holiday.message}</p>
              {notices.holiday.nextUp.trim() && (
                <p className={styles.nextUp}>Next up: {notices.holiday.nextUp.trim()}</p>
              )}
            </StickerCard>
          )}

          <StickerCard as="figure" shadow="deep" className={styles.patioPhoto}>
            <StoredPhoto
              photoId={photos.patio.photoId}
              alt={photos.patio.alt.trim() || 'The patio at ’Wiches Cauldron'}
              className={styles.wallPhotoImg}
              placeholder={
                <div className={styles.wallPhotoPlaceholder}>
                  <CameraSketch />
                  [photo: the patio in summer]
                </div>
              }
            />
            <figcaption className={styles.photoCaption}>patio days</figcaption>
          </StickerCard>

          {firstReview && (
            <StickerCard as="figure" shadow="deep" className={styles.quoteSticker}>
              <span aria-hidden="true" className={styles.quoteBadge}>
                “
              </span>
              <blockquote className={styles.quote}>“{firstReview.quote}”</blockquote>
              <figcaption className={styles.quoteSource}>— from a {firstReview.source}</figcaption>
            </StickerCard>
          )}

          {otherReviews.map((review) => (
            <StickerCard
              key={review.quote}
              as="figure"
              tone="lime"
              shadow="deep"
              className={styles.ratingSticker}
            >
              <blockquote className={styles.ratingQuote}>“{review.quote}”</blockquote>
              <figcaption className={styles.ratingSource}>
                — {review.source}
                {review.rating && (
                  <>
                    <br />
                    <strong>Rated {review.rating}</strong>
                  </>
                )}
              </figcaption>
            </StickerCard>
          ))}

          {notices.events.show && (
            <StickerCard as="article" tone="yellow" shadow="deep" className={styles.eventsSticker}>
              <Envelope className={styles.eventsEnvelope} />
              <h3 className={styles.stickerTitle}>Private events</h3>
              <p className={styles.stickerText}>{notices.events.message}</p>
            </StickerCard>
          )}

          <StickerCard as="article" tone="cream" shadow="deep" className={styles.potSticker}>
            <h3 className={styles.stickerTitle}>What’s in the pot today?</h3>
            <p className={styles.stickerText}>
              We post our soups and specials on Instagram and Facebook — follow along so you know
              before you drive over.
            </p>
            <div className={styles.socialButtons}>
              <CartoonLink
                href={externalUrl(contact.instagram)}
                variant="primary"
                className={styles.socialButton}
              >
                Instagram
              </CartoonLink>
              <CartoonLink
                href={externalUrl(contact.facebook)}
                variant="secondary"
                className={styles.socialButton}
              >
                Facebook
              </CartoonLink>
            </div>
          </StickerCard>
        </div>
      </div>
      <WaveDivider position="bottom" />
    </section>
  );
}

function Story({ content }: SectionProps) {
  const { crew } = content.photos;
  return (
    <section id="story" aria-labelledby="story-title" className={styles.story}>
      <div className={styles.storyInner}>
        <article className={styles.letter}>
          <img src={logo} alt="" width="112" height="135" className={styles.letterStamp} />
          <h2 id="story-title" className={styles.letterHello}>
            Hi neighbour,
          </h2>
          <p className={styles.letterText}>
            ’Wiches Cauldron started out as a food truck. These days we’ve got a proper home at 2006
            Carp Road — a little shoppe where the soup pot is always on, the sandwiches get piled
            high, and you’ll leave with more napkins than you came in with.
          </p>
          <p className={styles.letterText}>
            Come say hi, tell us how you like your sandwich, and we’ll make it your way.
          </p>
          <p className={styles.letterSign}>— [Owner names] &amp; the Cauldron crew</p>
        </article>
        <div className={styles.crewCol}>
          <figure className={styles.crew}>
            <StoredPhoto
              photoId={crew.photoId}
              alt={crew.alt.trim() || 'The ’Wiches Cauldron crew behind the counter'}
              className={styles.crewImg}
              placeholder={
                <div className={styles.crewPlaceholder}>
                  <CameraSketch />
                  [photo: the crew behind the counter]
                </div>
              }
            />
            <figcaption className={styles.crewCaption}>that’s us!</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

function Visit({ content }: SectionProps) {
  const { contact, hours } = content;
  const { street, rest } = splitAddress(contact.address);
  const rows = weeklyHoursRows(hours.week);
  return (
    <section id="visit" aria-labelledby="visit-title" className={styles.visit}>
      <div className={styles.visitInner}>
        <div className={styles.visitInfo}>
          <OutlinedHeading id="visit-title" className={styles.visitTitle}>
            Come find the cauldron
          </OutlinedHeading>
          <div className={styles.signRow}>
            <DoorSign />
            <div className={styles.visitDetails}>
              <p className={styles.visitAddress}>
                <strong>{street}</strong>
                {rest && (
                  <>
                    <br />
                    {rest.replace(/, ON\b/, ', Ontario')}
                  </>
                )}
              </p>
              <ul className={styles.hoursList}>
                {rows.map((row) => (
                  <li key={row.label}>
                    <span>{row.label}</span>
                    <span aria-hidden="true" className={styles.leader} />
                    <span>{row.value}</span>
                  </li>
                ))}
              </ul>
              {rows.some((row) => row.closed) && (
                <p className={styles.resting}>(resting the cauldron)</p>
              )}
            </div>
          </div>
          <div className={styles.visitActions}>
            <CartoonLink href={contact.mapsUrl} variant="primary" size="lg">
              Get directions
            </CartoonLink>
            <CartoonLink href={telHref(contact.phone)} variant="secondary" size="lg">
              Call {contact.phone}
            </CartoonLink>
            <a href={`mailto:${contact.email}`} className={styles.email}>
              {contact.email}
            </a>
          </div>
        </div>
        <div className={styles.mapCol}>
          <figure className={styles.map}>
            <div className={styles.mapPlaceholder}>
              <MapPin />
              [map: 2006 Carp Road, Carp]
            </div>
            <figcaption className={styles.mapCaption}>
              look for [the sign / our building] on Carp Road
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
