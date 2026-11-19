import { useRef, useState, type KeyboardEvent } from 'react';
import { DashCard } from '../../components/dashboard/DashCard';
import { useDashboard } from '../../components/dashboard/context';
import { FieldLabel, FileButton, PriceInput } from '../../components/dashboard/fields';
import forms from '../../components/dashboard/forms.module.css';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Icon } from '../../components/icons/Icon';
import { TodayCard } from '../../components/site/TodayCard';
import { CartoonButton, Chip, Switch } from '../../components/ui';
import { usePageSetup } from '../../hooks/usePageSetup';
import { usePhotoUrl } from '../../hooks/usePhotoUrl';
import { useUploader } from '../../hooks/useUploader';
import { formatDateLabel, getDoorStatus, greetingFor } from '../../lib/hours';
import type { DoorOverride, SiteContent } from '../../lib/types';
import { cx, newId } from '../../lib/utils';
import { useStore } from '../../store/context';
import styles from './TodayPage.module.css';

type Today = SiteContent['today'];

const DOOR_OPTIONS: Array<[DoorOverride, string]> = [
  ['auto', 'Automatic'],
  ['open', 'Open now'],
  ['closed', 'Closed now'],
];

export default function TodayPage() {
  usePageSetup('Today’s brew · Shop dashboard', 'dashboard');
  const { draft, update } = useStore();
  const { now } = useDashboard();
  const { today, menu, hours } = draft;
  const [newTreat, setNewTreat] = useState('');
  const photo = usePhotoUrl(today.photoId);
  const uploader = useUploader();

  const editToday = (recipe: (today: Today) => void) => update((d) => recipe(d.today));

  const regulars = menu.items
    .filter((item) => item.category === 'soups' && item.name.trim())
    .map((item) => item.name.trim());

  const door = getDoorStatus(now, hours.week, hours.specials, today.doorOverride);
  const signWord = door.open ? 'OPEN' : 'CLOSED';
  const doorHelp =
    today.doorOverride === 'auto'
      ? `Right now the sign on the website says ${signWord}${door.note ? ` (${door.note})` : ''}.`
      : `The sign stays ${signWord} until you set it back to Automatic.`;

  const addTreat = () => {
    const name = newTreat.trim();
    if (!name) return;
    const id = newId('treat');
    editToday((t) => {
      const existing = t.treats.find((treat) => treat.name.toLowerCase() === name.toLowerCase());
      if (existing) existing.onCounter = true;
      else t.treats.push({ id, name, onCounter: true });
    });
    setNewTreat('');
  };

  const onPhoto = (files: File[]) =>
    uploader.upload(files.slice(0, 1), (photoId) =>
      editToday((t) => {
        t.photoId = photoId;
      }),
    );

  const note = today.note.trim();

  return (
    <div className={styles.page}>
      <PageHeader
        title="Today’s brew"
        greeting={`${greetingFor(now)}! It’s ${formatDateLabel(now)}.`}
        description="What you set here shows on the home page, in the Today’s Brew card."
        hideDescriptionOnPhone
      />

      <div className={styles.columns}>
        <div className={styles.form}>
          <DashCard
            titleId="soup-h"
            icon="soup"
            title="Soup of the day"
            phoneTitle="Soup"
            aside={
              <Switch
                checked={today.soup.soldOut}
                onChange={(soldOut) =>
                  editToday((t) => {
                    t.soup.soldOut = soldOut;
                  })
                }
                label="Sold out"
                ariaLabel="Soup sold out"
              />
            }
          >
            <FieldLabel htmlFor="soup-name" className={styles.firstLabel}>
              <span className={styles.wide}>Soup name</span>
              <span className={styles.phone}>Soup of the day</span>
            </FieldLabel>
            <input
              id="soup-name"
              type="text"
              className={forms.input}
              value={today.soup.name}
              placeholder="e.g. Potato Parmesan Maple"
              onChange={(e) =>
                editToday((t) => {
                  t.soup.name = e.target.value;
                })
              }
            />
            <p className={cx(forms.help, styles.wide)}>Quick pick from your regulars:</p>
            <div className={cx(forms.chips, styles.picks)}>
              {regulars.map((name) => (
                <Chip
                  key={name}
                  pressed={today.soup.name.trim().toLowerCase() === name.toLowerCase()}
                  onClick={() =>
                    editToday((t) => {
                      t.soup.name = name;
                    })
                  }
                >
                  {name}
                </Chip>
              ))}
            </div>
            <FieldLabel htmlFor="soup-desc" hint="(optional)">
              A line about it
            </FieldLabel>
            <textarea
              id="soup-desc"
              rows={2}
              className={forms.input}
              value={today.soup.description}
              placeholder="e.g. Perfect for a chilly day"
              onChange={(e) =>
                editToday((t) => {
                  t.soup.description = e.target.value;
                })
              }
            />
          </DashCard>

          <DashCard
            titleId="sammie-h"
            icon="sammie"
            title="Sammie of the day"
            phoneTitle="Sammie"
            aside={
              <Switch
                checked={today.sammie.soldOut}
                onChange={(soldOut) =>
                  editToday((t) => {
                    t.sammie.soldOut = soldOut;
                  })
                }
                label="Sold out"
                ariaLabel="Sammie sold out"
              />
            }
          >
            <FieldLabel htmlFor="sammie-name" className={styles.firstLabel}>
              <span className={styles.wide}>Sammie name</span>
              <span className={styles.phone}>Sammie of the day</span>
            </FieldLabel>
            <input
              id="sammie-name"
              type="text"
              className={forms.input}
              value={today.sammie.name}
              placeholder="e.g. The Trucker"
              onChange={(e) =>
                editToday((t) => {
                  t.sammie.name = e.target.value;
                })
              }
            />
            <div className={styles.sammieRow}>
              <div className={styles.sammieDesc}>
                <FieldLabel htmlFor="sammie-desc">What’s on it</FieldLabel>
                <input
                  id="sammie-desc"
                  type="text"
                  className={forms.input}
                  value={today.sammie.description}
                  placeholder="Fillings, cheese, sauce, bread"
                  onChange={(e) =>
                    editToday((t) => {
                      t.sammie.description = e.target.value;
                    })
                  }
                />
              </div>
              <div className={styles.sammiePrice}>
                <FieldLabel htmlFor="sammie-price">Price</FieldLabel>
                <PriceInput
                  id="sammie-price"
                  className={styles.priceField}
                  value={today.sammie.price}
                  onChange={(price) =>
                    editToday((t) => {
                      t.sammie.price = price;
                    })
                  }
                />
              </div>
            </div>
          </DashCard>

          <DashCard titleId="till-h" icon="till" title="By the till">
            <p className={cx(forms.help, styles.wide)}>Tap what’s on the counter today.</p>
            <div className={cx(forms.chips, styles.treats)}>
              {today.treats.map((treat) => (
                <Chip
                  key={treat.id}
                  tone="lime"
                  pressed={treat.onCounter}
                  onClick={() =>
                    editToday((t) => {
                      const target = t.treats.find((x) => x.id === treat.id);
                      if (target) target.onCounter = !target.onCounter;
                    })
                  }
                >
                  <Icon
                    name={treat.onCounter ? 'check' : 'plus'}
                    strokeWidth={3}
                    color="#26121F"
                    className={styles.chipIcon}
                  />
                  {treat.name}
                </Chip>
              ))}
            </div>
            <form
              className={styles.addRow}
              onSubmit={(event) => {
                event.preventDefault();
                addTreat();
              }}
            >
              <div className={styles.addField}>
                <FieldLabel htmlFor="new-treat">Add something new</FieldLabel>
                <input
                  id="new-treat"
                  type="text"
                  className={forms.input}
                  value={newTreat}
                  placeholder="e.g. Lemon squares"
                  onChange={(e) => setNewTreat(e.target.value)}
                />
              </div>
              <CartoonButton type="submit" variant="secondary">
                Add
              </CartoonButton>
            </form>
          </DashCard>

          <DashCard titleId="door-h" icon="door" title="Door sign & notes" phoneTitle="Door sign">
            <p className={cx(forms.help, styles.wide)}>
              “Automatic” follows your regular hours. Switch it if you open late or close early.
            </p>
            <DoorControl
              value={today.doorOverride}
              labelledBy="door-h"
              onChange={(value) =>
                editToday((t) => {
                  t.doorOverride = value;
                })
              }
            />
            <p className={cx(forms.help, styles.doorHelp)}>{doorHelp}</p>
            <FieldLabel htmlFor="day-note" hint="(optional)">
              Note for today’s visitors
            </FieldLabel>
            <input
              id="day-note"
              type="text"
              className={forms.input}
              value={today.note}
              placeholder="e.g. Closing at 2 today for a private event"
              onChange={(e) =>
                editToday((t) => {
                  t.note = e.target.value;
                })
              }
            />
            <p className={forms.help}>Shows in a yellow banner above Today’s Brew.</p>
          </DashCard>

          <DashCard
            titleId="photo-h"
            icon="camera"
            title={
              <>
                Photo of the day <span className={styles.optional}>(optional)</span>
              </>
            }
          >
            {today.photoId ? (
              <div className={styles.photoRow}>
                {photo.url ? (
                  <img src={photo.url} alt="Today’s upload" className={styles.photoThumb} />
                ) : (
                  <div className={styles.photoThumb} />
                )}
                <div className={styles.photoMeta}>
                  <p className={styles.photoName}>{photo.name ?? 'Photo of the day'}</p>
                  <button
                    type="button"
                    className={cx(forms.smallButton, styles.removePhoto)}
                    onClick={() =>
                      editToday((t) => {
                        t.photoId = null;
                      })
                    }
                  >
                    Remove photo
                  </button>
                </div>
              </div>
            ) : (
              <div className={cx(forms.dropzone, styles.drop)}>
                <Icon name="upload" size={40} strokeWidth={2.2} color="#9E4C92" />
                <p className={styles.dropText}>
                  Snap today’s pot or sammie and it shows next to Today’s Brew.
                </p>
                <FileButton onFiles={onPhoto} disabled={uploader.busy}>
                  {uploader.busy ? 'Saving…' : 'Choose a photo'}
                </FileButton>
              </div>
            )}
            {uploader.error && (
              <p role="alert" className={forms.error}>
                {uploader.error}
              </p>
            )}
          </DashCard>
        </div>

        <div className={styles.previewColumn}>
          <DashCard titleId="preview-h" title="How it looks on the website" tone="cream">
            <p className={forms.help}>
              Updates as you type. Visitors see it once you press <strong>Publish changes</strong>.
            </p>
            <div className={styles.preview}>
              <div className={styles.miniRibbon}>
                <span className={styles.miniRibbonText}>Today’s Brew</span>
              </div>
              {note && <p className={styles.previewNote}>{note}</p>}
              {photo.url && <img src={photo.url} alt="" className={styles.previewPhoto} />}
              <TodayCard today={today} variant="preview" />
              <div className={styles.previewDoor}>
                <span>Door sign:</span>
                <span
                  className={cx(
                    styles.previewSign,
                    door.open ? styles.signOpen : styles.signClosed,
                  )}
                >
                  {signWord}
                </span>
                <span className={styles.previewSignNote}>{door.note}</span>
              </div>
            </div>
          </DashCard>
        </div>
      </div>
    </div>
  );
}

type DoorControlProps = {
  value: DoorOverride;
  labelledBy: string;
  onChange: (value: DoorOverride) => void;
};

/** Three-way radio group (Automatic / Open now / Closed now) with arrow-key support. */
function DoorControl({ value, labelledBy, onChange }: DoorControlProps) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + DOOR_OPTIONS.length) % DOOR_OPTIONS.length;
    onChange(DOOR_OPTIONS[next][0]);
    buttons.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className={styles.segmented}>
      {DOOR_OPTIONS.map(([option, label], index) => (
        <button
          key={option}
          ref={(element) => {
            buttons.current[index] = element;
          }}
          type="button"
          role="radio"
          aria-checked={value === option}
          tabIndex={value === option ? 0 : -1}
          className={styles.segment}
          onClick={() => onChange(option)}
          onKeyDown={(event) => onKeyDown(event, index)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
