import logo from '@assets/logo-sticker.webp';
import ButterTart from '@assets/svg/butter-tart.svg?react';
import { ListDot, SoupBubbles } from '../../components/site/decorations';
import { PublicPage } from '../../components/site/PublicPage';
import { StoredPhoto } from '../../components/site/StoredPhoto';
import { CartoonLink, OutlinedHeading, Ribbon, SwirlBand, WaveDivider } from '../../components/ui';
import { menuPriceText, telHref } from '../../lib/format';
import { openingSummary } from '../../lib/hours';
import type { Category, MenuItem } from '../../lib/types';
import { cx } from '../../lib/utils';
import { usePublished } from '../../store/context';
import styles from './MenuPage.module.css';

const SOUP_DOTS = ['#FFFFFF', '#B8E06A', '#C56CB0'];

/** Shown until the owners add their drinks (docs/CONTENT.md lists drinks as unknown). */
const DRINK_PLACEHOLDERS = ['[Soft drinks]', '[Coffee & tea]', '[Patio drinks]'];

export default function MenuPage() {
  const { menu, today, hours, contact, notices } = usePublished();
  const onMenu = (category: Category) =>
    menu.items.filter((item) => item.category === category && item.visible && item.name.trim());
  const sammys = onMenu('sammys');
  const soups = onMenu('soups');
  const sweets = onMenu('sweets');
  const drinks = onMenu('drinks');
  const cup = menuPriceText(menu.soupPrices.cup);
  const bowl = menuPriceText(menu.soupPrices.bowl);
  const opening = openingSummary(hours.week);

  return (
    <PublicPage page="menu" title="The menu · ’Wiches Cauldron" footerWave="var(--lavender)">
      <main id="main" tabIndex={-1} className={styles.main}>
        <SwirlBand tone="light" />
        <WaveDivider position="top" />

        <div className={styles.card}>
          <img
            src={logo}
            alt="’Wiches Cauldron logo"
            width="180"
            height="217"
            className={styles.logo}
          />

          <div className={styles.intro}>
            <Ribbon className={styles.ribbon} bandClassName={styles.ribbonBand}>
              <OutlinedHeading as="h1" outline={3} className={styles.title}>
                the menu
              </OutlinedHeading>
            </Ribbon>
            <p className={styles.kicker}>pull up a stool — here’s what’s bubbling</p>
            <p className={styles.subtitle}>
              Sandwiches, soups &amp; sweet things{opening ? ` · ${opening}` : ''}
            </p>
          </div>

          <div className={styles.grid}>
            <section aria-labelledby="sandwiches">
              <OutlinedHeading id="sandwiches" className={styles.sectionTitle}>
                Sandwiches
              </OutlinedHeading>
              <p className={styles.sandwichKicker}>most can be made your way — just ask!</p>
              {sammys.map((item) => (
                <SandwichItem key={item.id} item={item} />
              ))}
              <div className={cx(styles.item, styles.lastItem)}>
                <ItemLine name="Sammie of the Day" price={menuPriceText(today.sammie.price)} />
                <p className={styles.description}>
                  Changes daily — ask at the counter, or check our Instagram.
                </p>
              </div>
            </section>

            <div className={styles.side}>
              <section aria-labelledby="soups" className={styles.soups}>
                <SoupBubbles className={styles.soupBubbles} />
                <OutlinedHeading id="soups" className={styles.sectionTitle}>
                  Soups
                </OutlinedHeading>
                <p className={styles.soupKicker}>always with fresh, warm bread</p>
                <ul className={styles.soupList}>
                  {soups.map((soup, i) => (
                    <li key={soup.id}>
                      <ListDot color={SOUP_DOTS[i % SOUP_DOTS.length]} />
                      <span>
                        {soup.name}
                        <Labels item={soup} />
                      </span>
                    </li>
                  ))}
                  <li>
                    <ListDot color="#FFD23F" />+ the soup of the day
                  </li>
                </ul>
                {(cup || bowl) && (
                  <p className={styles.soupPrices}>
                    {cup && <span>cup {cup}</span>}
                    {bowl && <span>bowl {bowl}</span>}
                  </p>
                )}
              </section>

              {sweets.length > 0 && (
                <section aria-labelledby="sweets" className={styles.sweets}>
                  <ButterTart className={styles.tart} />
                  <div className={styles.sweetsList}>
                    <OutlinedHeading id="sweets" className={styles.smallTitle}>
                      Sweets
                    </OutlinedHeading>
                    <p className={styles.handNote}>parked right by the till</p>
                    {sweets.map((item) => (
                      <SmallItem key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              )}

              <section aria-labelledby="drinks">
                <OutlinedHeading id="drinks" className={cx(styles.smallTitle, styles.drinksTitle)}>
                  Drinks
                </OutlinedHeading>
                {drinks.length > 0
                  ? drinks.map((item) => <SmallItem key={item.id} item={item} />)
                  : DRINK_PLACEHOLDERS.map((name) => (
                      <div key={name} className={styles.smallRow}>
                        <span className={styles.smallName}>{name}</span>
                        {menuPriceText('') && (
                          <>
                            <span aria-hidden="true" className={styles.leader} />
                            <span className={styles.smallPrice}>{menuPriceText('')}</span>
                          </>
                        )}
                      </div>
                    ))}
                <p className={styles.drinksNote}>
                  {notices.patioOpen
                    ? 'the patio’s open — grab a seat outside!'
                    : 'patio’s open in the warmer months'}
                </p>
              </section>
            </div>
          </div>

          <div className={styles.callAhead}>
            <p className={styles.callText}>Call ahead &amp; we’ll have it ready:</p>
            <CartoonLink
              href={telHref(contact.phone)}
              variant="primary"
              className={styles.callButton}
            >
              {contact.phone}
            </CartoonLink>
          </div>
          <p className={styles.footnote}>
            The menu changes with the seasons — ask about today’s soup and sammie of the day.
          </p>
        </div>
      </main>
    </PublicPage>
  );
}

function SandwichItem({ item }: { item: MenuItem }) {
  const description = item.description.trim();
  return (
    <div className={cx(styles.item, item.photoId && styles.itemWithPhoto)}>
      {item.photoId && (
        <StoredPhoto
          photoId={item.photoId}
          alt={item.name}
          className={styles.itemPhoto}
          placeholder={null}
        />
      )}
      <div>
        <ItemLine name={item.name} price={menuPriceText(item.price)} item={item} />
        {description && <p className={styles.description}>{description}</p>}
        {item.labels.includes('napkins') && <p className={styles.napkins}>napkins recommended!</p>}
      </div>
    </div>
  );
}

/** Name, dotted leader and price on one line. Without a price there's no leader either. */
function ItemLine({ name, price, item }: { name: string; price: string | null; item?: MenuItem }) {
  return (
    <div className={styles.line}>
      <h3 className={styles.itemName}>
        {name}
        {item && <Labels item={item} />}
      </h3>
      {price && (
        <>
          <span aria-hidden="true" className={styles.leader} />
          <span className={styles.price}>{price}</span>
        </>
      )}
    </div>
  );
}

function SmallItem({ item }: { item: MenuItem }) {
  const price = menuPriceText(item.price);
  return (
    <div className={styles.smallRow}>
      {item.photoId && (
        <StoredPhoto
          photoId={item.photoId}
          alt={item.name}
          className={styles.smallPhoto}
          placeholder={null}
        />
      )}
      <span className={styles.smallName}>
        {item.name}
        <Labels item={item} />
      </span>
      {price && (
        <>
          <span aria-hidden="true" className={styles.leader} />
          <span className={styles.smallPrice}>{price}</span>
        </>
      )}
    </div>
  );
}

/** Little badges after an item's name. “Napkins” is a handwritten note instead. */
function Labels({ item }: { item: MenuItem }) {
  return (
    <>
      {item.labels.includes('vegetarian') && (
        <abbr title="vegetarian" className={styles.veg}>
          V
        </abbr>
      )}
      {item.labels.includes('new') && (
        <span className={cx(styles.badge, styles.badgeNew)}>new!</span>
      )}
      {item.labels.includes('spicy') && (
        <span className={cx(styles.badge, styles.badgeSpicy)}>spicy</span>
      )}
    </>
  );
}
