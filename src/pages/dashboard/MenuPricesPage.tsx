import { useEffect, useRef, useState, type Ref, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { DashCard } from '../../components/dashboard/DashCard';
import { FieldLabel, FileButton, PriceInput } from '../../components/dashboard/fields';
import forms from '../../components/dashboard/forms.module.css';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Icon } from '../../components/icons/Icon';
import { Chip, Switch } from '../../components/ui';
import { usePageSetup } from '../../hooks/usePageSetup';
import { usePhotoUrl } from '../../hooks/usePhotoUrl';
import { useUploader } from '../../hooks/useUploader';
import { isPlaceholder, pluralize, SHOW_PRICE_PLACEHOLDERS } from '../../lib/format';
import type { Category, MenuItem, MenuLabel, SiteContent } from '../../lib/types';
import { cx, newId } from '../../lib/utils';
import { useStore } from '../../store/context';
import styles from './MenuPricesPage.module.css';

type Filter = 'all' | Category;

const FILTERS: Array<[Filter, string]> = [
  ['all', 'All'],
  ['sammys', 'Sammys'],
  ['soups', 'Soups'],
  ['sweets', 'Sweets'],
  ['drinks', 'Drinks'],
];

const SECTIONS: Array<{
  category: Category;
  title: string;
  add: string;
  count: (n: number) => string;
  empty: string;
}> = [
  {
    category: 'sammys',
    title: 'Sammys',
    add: 'Add a sammie',
    // the sammie of the day row counts too
    count: (n) => pluralize(n + 1, 'item'),
    empty: 'No sammies on the menu yet.',
  },
  {
    category: 'soups',
    title: 'Soups',
    add: 'Add a soup',
    count: (n) => `${n} in rotation`,
    empty: 'No soups on the menu yet. Add your regulars.',
  },
  {
    category: 'sweets',
    title: 'Sweets',
    add: 'Add a sweet',
    count: (n) => pluralize(n, 'item'),
    empty: 'No sweets on the menu yet.',
  },
  {
    category: 'drinks',
    title: 'Drinks',
    add: 'Add a drink',
    count: (n) => pluralize(n, 'item'),
    empty: 'No drinks on the menu yet. Add your soft drinks, coffee & tea and patio drinks.',
  },
];

const LABELS: Array<[MenuLabel, string]> = [
  ['napkins', 'Napkins recommended!'],
  ['vegetarian', 'Vegetarian'],
  ['new', 'New'],
  ['spicy', 'Spicy'],
];

export default function MenuPricesPage() {
  usePageSetup('Menu & prices · Shop dashboard', 'dashboard');
  const { draft, update } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    () => draft.menu.items[0]?.id ?? null,
  );
  const [focusRequest, setFocusRequest] = useState<{ target: 'heading' | 'name'; n: number }>({
    target: 'heading',
    n: 0,
  });
  const editorRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const items = draft.menu.items;
  const selected = items.find((item) => item.id === selectedId) ?? null;
  const search = query.trim().toLowerCase();
  const matches = (item: MenuItem) =>
    !search || `${item.name} ${item.description}`.toLowerCase().includes(search);

  // Bring the editor into view after Edit / Add; on phones it sits below the lists.
  useEffect(() => {
    if (!focusRequest.n) return;
    editorRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    if (focusRequest.target === 'name') nameRef.current?.focus({ preventScroll: true });
    else document.getElementById('editor-h')?.focus({ preventScroll: true });
  }, [focusRequest]);

  const editItem = (id: string, recipe: (item: MenuItem) => void) =>
    update((d) => {
      const item = d.menu.items.find((x) => x.id === id);
      if (item) recipe(item);
    });

  const startEditing = (id: string) => {
    setSelectedId(id);
    setFocusRequest((r) => ({ target: 'heading', n: r.n + 1 }));
  };

  const addItem = (category: Category) => {
    const id = newId(category);
    update((d) => {
      d.menu.items.push({
        id,
        category,
        name: '',
        description: '',
        price: '',
        visible: true,
        labels: [],
        photoId: null,
      });
    });
    setQuery('');
    setFilter((current) => (current === 'all' ? current : category));
    setSelectedId(id);
    setFocusRequest((r) => ({ target: 'name', n: r.n + 1 }));
  };

  const deleteItem = (item: MenuItem) => {
    if (!window.confirm(`Delete “${item.name || 'this item'}” from the menu?`)) return;
    update((d) => {
      d.menu.items = d.menu.items.filter((x) => x.id !== item.id);
    });
    setSelectedId(null);
  };

  const visibleSections = SECTIONS.filter((s) => filter === 'all' || filter === s.category);
  const sammieOfTheDayMatches = !search || 'sammie of the day'.includes(search);
  const nothingMatches =
    !!search &&
    visibleSections.every(
      (s) =>
        !items.some((item) => item.category === s.category && matches(item)) &&
        !(s.category === 'sammys' && sammieOfTheDayMatches),
    );

  return (
    <div className={styles.page}>
      <PageHeader
        title="Menu & prices"
        description={
          SHOW_PRICE_PLACEHOLDERS
            ? `Everything here shows on your menu page. A blank price shows as “[PRICE]” until you fill it in.`
            : `Everything here shows on your menu page. Leave a price blank to hide it.`
        }
        actions={
          <Link to="/menu" className={forms.smallButton}>
            <Icon name="external" size={18} />
            Preview menu page
          </Link>
        }
      />

      <div className={styles.toolbar}>
        <div role="group" aria-label="Show" className={forms.chips}>
          {FILTERS.map(([key, label]) => (
            <Chip key={key} tone="purple" pressed={filter === key} onClick={() => setFilter(key)}>
              {label}
            </Chip>
          ))}
        </div>
        <div className={styles.search}>
          <label htmlFor="menu-search" className="visually-hidden">
            Search the menu
          </label>
          <input
            id="menu-search"
            type="search"
            className={forms.input}
            value={query}
            placeholder="Search the menu"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.columns}>
        <div className={styles.lists}>
          {nothingMatches && (
            <p className={forms.empty}>Nothing on the menu matches “{query.trim()}”.</p>
          )}
          {visibleSections.map((section) => {
            const inCategory = items.filter((item) => item.category === section.category);
            const rows = inCategory.filter(matches);
            const showSammieOfTheDay = section.category === 'sammys' && sammieOfTheDayMatches;
            if (search && !rows.length && !showSammieOfTheDay) return null;
            const titleId = `${section.category}-h`;
            return (
              <DashCard
                key={section.category}
                titleId={titleId}
                title={
                  <>
                    {section.title}{' '}
                    <span className={styles.count}>{section.count(inCategory.length)}</span>
                  </>
                }
                aside={
                  <button
                    type="button"
                    className={forms.smallButton}
                    onClick={() => addItem(section.category)}
                  >
                    <Icon name="plus" size={18} strokeWidth={2.6} />
                    {section.add}
                  </button>
                }
              >
                {section.category === 'soups' && (
                  <SoupPrices
                    prices={draft.menu.soupPrices}
                    onChange={(key, value) =>
                      update((d) => {
                        d.menu.soupPrices[key] = value;
                      })
                    }
                  />
                )}
                {rows.length || showSammieOfTheDay ? (
                  <div className={styles.tableScroll}>
                    <table className={styles.table} aria-labelledby={titleId}>
                      <thead>
                        <tr>
                          <th scope="col">
                            <span className="visually-hidden">Photo</span>
                          </th>
                          <th scope="col">Item</th>
                          <th scope="col">Price</th>
                          <th scope="col">On the menu</th>
                          <th scope="col">
                            <span className="visually-hidden">Edit</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((item) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            selected={item.id === selectedId}
                            onEdit={() => startEditing(item.id)}
                            onPrice={(price) =>
                              editItem(item.id, (x) => {
                                x.price = price;
                              })
                            }
                            onVisible={(visible) =>
                              editItem(item.id, (x) => {
                                x.visible = visible;
                              })
                            }
                          />
                        ))}
                        {showSammieOfTheDay && (
                          <tr className={styles.row}>
                            <td className={styles.photoCell}>
                              <div
                                aria-hidden="true"
                                className={cx(styles.thumb, styles.thumbBrew)}
                              >
                                <Icon name="brew" size={26} color="#26121F" />
                              </div>
                            </td>
                            <td colSpan={3}>
                              <div className={styles.itemName}>Sammie of the day</div>
                              <div className={styles.itemDesc}>
                                Changes daily. Set the name and price on Today’s brew.
                              </div>
                            </td>
                            <td className={styles.editCell}>
                              <Link to="/dashboard" className={forms.smallButton}>
                                Today’s brew
                              </Link>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={cx(forms.empty, styles.empty)}>{section.empty}</p>
                )}
              </DashCard>
            );
          })}
        </div>

        <ItemEditor
          cardRef={editorRef}
          nameRef={nameRef}
          item={selected}
          onChange={(recipe) => selected && editItem(selected.id, recipe)}
          onDelete={() => selected && deleteItem(selected)}
        />
      </div>
    </div>
  );
}

function SoupPrices({
  prices,
  onChange,
}: {
  prices: SiteContent['menu']['soupPrices'];
  onChange: (key: 'cup' | 'bowl', value: string) => void;
}) {
  return (
    <div className={styles.soupPrices}>
      <div>
        <FieldLabel htmlFor="price-cup" className={styles.inlineLabel}>
          Cup price
        </FieldLabel>
        <PriceInput
          id="price-cup"
          className={styles.soupPrice}
          value={prices.cup}
          onChange={(v) => onChange('cup', v)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="price-bowl" className={styles.inlineLabel}>
          Bowl price
        </FieldLabel>
        <PriceInput
          id="price-bowl"
          className={styles.soupPrice}
          value={prices.bowl}
          onChange={(v) => onChange('bowl', v)}
        />
      </div>
      <p className={cx(forms.help, styles.soupNote)}>
        Every soup comes with warm bread. The soup of the day is set on Today’s brew.
      </p>
    </div>
  );
}

type ItemRowProps = {
  item: MenuItem;
  selected: boolean;
  onEdit: () => void;
  onPrice: (price: string) => void;
  onVisible: (visible: boolean) => void;
};

function ItemRow({ item, selected, onEdit, onPrice, onVisible }: ItemRowProps) {
  const name = item.name.trim() || 'Untitled';
  const description = item.description.trim();
  return (
    <tr className={cx(styles.row, selected && styles.rowSelected)}>
      <td className={styles.photoCell}>
        <Thumb photoId={item.photoId} />
      </td>
      <td>
        <div className={styles.itemName}>{item.name.trim() || <em>Untitled</em>}</div>
        <div className={styles.itemDesc}>
          {isPlaceholder(description) ? <em>Add what goes on it</em> : description}
        </div>
      </td>
      <td className={styles.priceCell}>
        {item.category === 'soups' ? (
          <span className={styles.soupHint}>Cup &amp; bowl prices above</span>
        ) : (
          <PriceInput
            className={styles.rowPrice}
            value={item.price}
            onChange={onPrice}
            ariaLabel={`Price for ${name}`}
          />
        )}
      </td>
      <td className={styles.showCell}>
        <Switch
          checked={item.visible}
          onChange={onVisible}
          label={item.visible ? 'Showing' : 'Hidden'}
          ariaLabel={`Show ${name} on the menu`}
        />
      </td>
      <td className={styles.editCell}>
        {selected ? (
          <span className={cx(forms.smallButton, styles.editing)}>Editing</span>
        ) : (
          <button
            type="button"
            className={forms.smallButton}
            aria-label={`Edit ${name}`}
            onClick={onEdit}
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  );
}

function Thumb({ photoId }: { photoId: string | null }) {
  const photo = usePhotoUrl(photoId);
  if (photo.url) return <img src={photo.url} alt="" className={styles.thumb} />;
  return (
    <div aria-hidden="true" className={styles.thumb}>
      <Icon name="camera" color="#9E4C92" />
    </div>
  );
}

type ItemEditorProps = {
  item: MenuItem | null;
  cardRef: Ref<HTMLElement>;
  nameRef: RefObject<HTMLInputElement>;
  onChange: (recipe: (item: MenuItem) => void) => void;
  onDelete: () => void;
};

function ItemEditor({ item, cardRef, nameRef, onChange, onDelete }: ItemEditorProps) {
  const photo = usePhotoUrl(item?.photoId ?? null);
  const uploader = useUploader();

  if (!item) {
    return (
      <DashCard
        ref={cardRef}
        as="aside"
        titleId="editor-h"
        title="Pick something to edit"
        className={styles.editor}
      >
        <p className={forms.help}>Choose Edit next to any item, or add something new.</p>
      </DashCard>
    );
  }

  const name = item.name.trim();
  return (
    <DashCard
      ref={cardRef}
      as="aside"
      titleId="editor-h"
      kicker="Editing"
      title={name || 'New item'}
      titleClassName={styles.editorTitle}
      className={styles.editor}
    >
      <FieldLabel htmlFor="ed-name">Name</FieldLabel>
      <input
        id="ed-name"
        ref={nameRef}
        type="text"
        className={forms.input}
        value={item.name}
        onChange={(e) =>
          onChange((x) => {
            x.name = e.target.value;
          })
        }
      />
      <FieldLabel htmlFor="ed-desc">
        {item.category === 'sammys' ? 'What’s on it' : 'A line about it'}
      </FieldLabel>
      <textarea
        id="ed-desc"
        rows={3}
        className={forms.input}
        value={item.description}
        onChange={(e) =>
          onChange((x) => {
            x.description = e.target.value;
          })
        }
      />
      {item.category === 'soups' ? (
        <p className={forms.help}>Soups use the cup &amp; bowl prices.</p>
      ) : (
        <>
          <FieldLabel htmlFor="ed-price">Price</FieldLabel>
          <PriceInput
            id="ed-price"
            className={styles.editorPrice}
            value={item.price}
            onChange={(price) =>
              onChange((x) => {
                x.price = price;
              })
            }
          />
        </>
      )}

      <p className={forms.label}>Photo</p>
      {item.photoId ? (
        <div className={styles.editorPhoto}>
          {photo.url ? (
            <img src={photo.url} alt={name || 'Menu item'} className={styles.editorPhotoImg} />
          ) : (
            <div className={styles.editorPhotoImg} />
          )}
          <button
            type="button"
            className={forms.smallButton}
            onClick={() =>
              onChange((x) => {
                x.photoId = null;
              })
            }
          >
            Remove photo
          </button>
        </div>
      ) : (
        <div className={cx(forms.dropzone, styles.editorDrop)}>
          <Icon name="upload" size={34} strokeWidth={2.2} color="#9E4C92" />
          <span className={styles.editorDropText}>Add a photo for the menu page</span>
          <FileButton
            size="sm"
            disabled={uploader.busy}
            onFiles={(files) =>
              uploader.upload(files.slice(0, 1), (photoId) =>
                onChange((x) => {
                  x.photoId = photoId;
                }),
              )
            }
          >
            {uploader.busy ? 'Saving…' : 'Choose photo'}
          </FileButton>
        </div>
      )}
      {uploader.error && (
        <p role="alert" className={forms.error}>
          {uploader.error}
        </p>
      )}

      <p className={forms.label}>Labels</p>
      <div role="group" aria-label="Labels" className={forms.chips}>
        {LABELS.map(([label, text]) => (
          <Chip
            key={label}
            pressed={item.labels.includes(label)}
            onClick={() =>
              onChange((x) => {
                x.labels = x.labels.includes(label)
                  ? x.labels.filter((l) => l !== label)
                  : [...x.labels, label];
              })
            }
          >
            {text}
          </Chip>
        ))}
      </div>

      <div className={styles.editorFoot}>
        <Switch
          checked={item.visible}
          onChange={(visible) =>
            onChange((x) => {
              x.visible = visible;
            })
          }
          label="Show on the menu"
        />
        <button type="button" className={styles.delete} onClick={onDelete}>
          Delete item
        </button>
      </div>
    </DashCard>
  );
}
