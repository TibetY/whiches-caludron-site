import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashCard } from '../../components/dashboard/DashCard';
import card from '../../components/dashboard/DashCard.module.css';
import { FieldLabel, FileButton } from '../../components/dashboard/fields';
import forms from '../../components/dashboard/forms.module.css';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Icon } from '../../components/icons/Icon';
import { Chip } from '../../components/ui';
import { usePageSetup } from '../../hooks/usePageSetup';
import { usePhotoUrl } from '../../hooks/usePhotoUrl';
import { useUploader } from '../../hooks/useUploader';
import type { LibraryPhoto, PhotoRef } from '../../lib/types';
import { cx } from '../../lib/utils';
import { useStore } from '../../store/context';
import styles from './PhotosPage.module.css';

type SlotKey = 'patio' | 'crew' | 'share';

const SLOTS: Array<{
  key: SlotKey;
  title: string;
  help: string;
  ratio: string;
  placeholder: string;
  fallbackAlt: string;
}> = [
  {
    key: 'patio',
    title: 'Patio photo',
    help: 'Shows in “News & nice words” on the home page. Wide photos work best.',
    ratio: '4 / 3',
    placeholder: 'e.g. Picnic tables on the patio in the sun',
    fallbackAlt: 'The patio',
  },
  {
    key: 'crew',
    title: 'The crew',
    help: 'Shows next to the letter in “Our story”. Square photos work best.',
    ratio: '1 / 1',
    placeholder: 'e.g. The team smiling behind the counter',
    fallbackAlt: 'The crew',
  },
  {
    key: 'share',
    title: 'Link preview',
    help: 'Shows when someone shares your website on Facebook, Instagram or by text. Use a wide photo.',
    ratio: '1200 / 630',
    placeholder: 'e.g. A stacked Trucker on the counter',
    fallbackAlt: 'Link preview',
  },
];

const TAGS: Array<[string, string]> = [
  ['all', 'All'],
  ['sammys', 'Sammys'],
  ['soup', 'Soup'],
  ['sweets', 'Sweets'],
  ['patio', 'Patio'],
  ['events', 'Events'],
];

export default function PhotosPage() {
  usePageSetup('Photos · Shop dashboard', 'dashboard');
  const { draft, update } = useStore();
  const [tag, setTag] = useState('all');
  const uploader = useUploader();
  const library = draft.photos.library;
  const shown = tag === 'all' ? library : library.filter((photo) => photo.tags.includes(tag));
  const tagLabel = TAGS.find(([key]) => key === tag)?.[1] ?? '';

  const uploadToLibrary = (files: File[]) =>
    uploader.upload(files, (photoId, file) =>
      update((d) => {
        d.photos.library.push({ photoId, name: file.name, tags: tag === 'all' ? [] : [tag] });
      }),
    );

  return (
    <div className={styles.page}>
      <PageHeader
        title="Photos"
        description="Swap any photo on the website. Phone photos are fine. We’ll size them to fit."
      />

      <div className={styles.grid}>
        {SLOTS.map((slot) => (
          <SlotCard
            key={slot.key}
            slot={slot}
            photo={draft.photos[slot.key]}
            onChange={(recipe) => update((d) => recipe(d.photos[slot.key]))}
          />
        ))}
        <div className={styles.infoColumn}>
          <DashCard titleId="pod-h" title="Photo of the day" tone="wash" className={styles.info}>
            <p className={cx(forms.help, styles.infoText)}>
              Changes daily and sits next to Today’s Brew on the home page.
            </p>
            <Link to="/dashboard" className={cx(forms.smallButton, styles.infoLink)}>
              Set it on Today’s brew
            </Link>
          </DashCard>
          <DashCard titleId="menu-photos-h" title="Menu photos" tone="wash" className={styles.info}>
            <p className={cx(forms.help, styles.infoText)}>
              Each sammie, soup and sweet can have its own photo on the menu page.
            </p>
            <Link to="/dashboard/menu" className={cx(forms.smallButton, styles.infoLink)}>
              Go to Menu &amp; prices
            </Link>
          </DashCard>
        </div>
      </div>

      <DashCard
        titleId="lib-h"
        title="Photo library"
        description="Everything you’ve uploaded, ready to reuse. Tag photos so they’re easy to find."
        aside={
          <FileButton variant="primary" multiple disabled={uploader.busy} onFiles={uploadToLibrary}>
            <Icon name="upload" size={22} strokeWidth={2.4} />
            {uploader.busy ? 'Saving…' : 'Upload photos'}
          </FileButton>
        }
      >
        <div role="group" aria-label="Filter by tag" className={cx(forms.chips, styles.tags)}>
          {TAGS.map(([key, label]) => (
            <Chip key={key} tone="purple" pressed={tag === key} onClick={() => setTag(key)}>
              {label}
            </Chip>
          ))}
        </div>
        {tag !== 'all' && <p className={forms.help}>New uploads get the “{tagLabel}” tag.</p>}
        {uploader.error && (
          <p role="alert" className={forms.error}>
            {uploader.error}
          </p>
        )}
        {library.length === 0 ? (
          <div className={cx(forms.dropzone, styles.libraryEmpty)}>
            <Icon name="camera" size={44} color="#9E4C92" />
            No photos yet. Upload a few sammies, soups and sweets and they’ll show up here.
          </div>
        ) : shown.length === 0 ? (
          <p className={cx(forms.empty, styles.libraryNone)}>No photos tagged “{tagLabel}” yet.</p>
        ) : (
          <ul className={styles.library}>
            {shown.map((photo) => (
              <LibraryItem
                key={photo.photoId}
                photo={photo}
                onRemove={() =>
                  update((d) => {
                    d.photos.library = d.photos.library.filter((p) => p.photoId !== photo.photoId);
                  })
                }
              />
            ))}
          </ul>
        )}
      </DashCard>
    </div>
  );
}

type SlotCardProps = {
  slot: (typeof SLOTS)[number];
  photo: PhotoRef;
  onChange: (recipe: (photo: PhotoRef) => void) => void;
};

function SlotCard({ slot, photo, onChange }: SlotCardProps) {
  const image = usePhotoUrl(photo.photoId);
  const uploader = useUploader();
  const titleId = `slot-${slot.key}-h`;

  return (
    <section aria-labelledby={titleId} className={cx(card.card, styles.slot)}>
      <div className={styles.slotImage} style={{ aspectRatio: slot.ratio }}>
        {image.url ? (
          <img
            src={image.url}
            alt={photo.alt.trim() || slot.fallbackAlt}
            className={styles.slotImg}
          />
        ) : (
          <div className={styles.noPhoto}>
            <Icon name="camera" size={40} color="#9E4C92" />
            {photo.photoId ? 'Loading…' : 'No photo yet'}
          </div>
        )}
      </div>
      <div className={styles.slotBody}>
        <h2 id={titleId} className={cx(card.title, styles.slotTitle)}>
          {slot.title}
        </h2>
        <p className={forms.help}>{slot.help}</p>
        <div className={styles.slotButtons}>
          <FileButton
            size="sm"
            disabled={uploader.busy}
            onFiles={(files) =>
              uploader.upload(files.slice(0, 1), (photoId) =>
                onChange((p) => {
                  p.photoId = photoId;
                }),
              )
            }
          >
            <Icon name="upload" size={20} strokeWidth={2.4} />
            {uploader.busy ? 'Saving…' : 'Upload'}
          </FileButton>
          {photo.photoId && (
            <button
              type="button"
              className={forms.smallButton}
              onClick={() =>
                onChange((p) => {
                  p.photoId = null;
                })
              }
            >
              Remove
            </button>
          )}
        </div>
        {uploader.error && (
          <p role="alert" className={forms.error}>
            {uploader.error}
          </p>
        )}
        <FieldLabel htmlFor={`alt-${slot.key}`} hint="(read aloud for people who can’t see it)">
          Describe it
        </FieldLabel>
        <input
          id={`alt-${slot.key}`}
          type="text"
          className={forms.input}
          value={photo.alt}
          placeholder={slot.placeholder}
          onChange={(e) =>
            onChange((p) => {
              p.alt = e.target.value;
            })
          }
        />
      </div>
    </section>
  );
}

function LibraryItem({ photo, onRemove }: { photo: LibraryPhoto; onRemove: () => void }) {
  const image = usePhotoUrl(photo.photoId);
  return (
    <li className={styles.libraryItem}>
      <figure className={styles.figure}>
        {image.url ? (
          <img src={image.url} alt="" className={styles.figureImg} />
        ) : (
          <div className={styles.figureImg} />
        )}
        <figcaption className={styles.caption}>
          {photo.name}
          {photo.tags.length > 0 && (
            <span className={styles.captionTags}>{photo.tags.join(', ')}</span>
          )}
        </figcaption>
      </figure>
      <button
        type="button"
        className={styles.remove}
        aria-label={`Remove ${photo.name} from the library`}
        onClick={onRemove}
      >
        <Icon name="close" size={18} strokeWidth={3} />
      </button>
    </li>
  );
}
