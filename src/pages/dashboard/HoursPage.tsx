import { Fragment, useState } from 'react';
import { DashCard } from '../../components/dashboard/DashCard';
import { useDashboard } from '../../components/dashboard/context';
import { FieldLabel } from '../../components/dashboard/fields';
import forms from '../../components/dashboard/forms.module.css';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Icon } from '../../components/icons/Icon';
import { CartoonButton, Switch } from '../../components/ui';
import { usePageSetup } from '../../hooks/usePageSetup';
import { mapsUrlFor } from '../../lib/format';
import {
  DAY_NAMES,
  WEEK_ORDER,
  breakHint,
  formatRangesLong,
  formatSpecialDate,
  isRangeValid,
  splitAroundBreak,
  torontoIsoDate,
} from '../../lib/hours';
import type { DayHours, DayKey, SiteContent } from '../../lib/types';
import { cx, newId } from '../../lib/utils';
import { useStore } from '../../store/context';
import styles from './HoursPage.module.css';

type Contact = SiteContent['contact'];

const CONTACT_FIELDS: Array<{ key: keyof Contact; label: string; type: string }> = [
  { key: 'phone', label: 'Phone', type: 'tel' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'instagram', label: 'Instagram', type: 'text' },
  { key: 'facebook', label: 'Facebook', type: 'text' },
  { key: 'address', label: 'Address', type: 'text' },
];

export default function HoursPage() {
  usePageSetup('Hours & notices · Shop dashboard', 'dashboard');
  const { draft, update } = useStore();
  const { now } = useDashboard();
  const { week, specials } = draft.hours;
  const { notices, contact } = draft;

  const editDay = (day: DayKey, recipe: (hours: DayHours) => void) =>
    update((d) => recipe(d.hours.week[day]));

  return (
    <div className={styles.page}>
      <PageHeader
        title="Hours & notices"
        description="Your hours drive the door sign and every hours list on the website."
      />

      <div className={styles.columns}>
        <div className={styles.main}>
          <DashCard
            titleId="week-h"
            icon="clock"
            title="Regular hours"
            description={`Need a midday break? ${breakHint(week)}`}
          >
            <div className={styles.tableScroll}>
              <table className={styles.table} aria-labelledby="week-h">
                <tbody>
                  {WEEK_ORDER.map((day) => (
                    <DayRow
                      key={day}
                      day={day}
                      hours={week[day]}
                      onChange={(recipe) => editDay(day, recipe)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </DashCard>

          <SpecialDays
            specials={specials}
            today={torontoIsoDate(now)}
            onAdd={(special) =>
              update((d) => {
                d.hours.specials = [
                  ...d.hours.specials.filter((s) => s.date !== special.date),
                  special,
                ].sort((a, b) => a.date.localeCompare(b.date));
              })
            }
            onRemove={(id) =>
              update((d) => {
                d.hours.specials = d.hours.specials.filter((s) => s.id !== id);
              })
            }
          />
        </div>

        <div className={styles.side}>
          <DashCard
            titleId="notices-h"
            icon="megaphone"
            title="Notices"
            description="These show as stickers in “News & nice words” on the home page."
          >
            <div className={styles.notice}>
              <div className={styles.noticeHead}>
                <h3 className={styles.noticeTitle}>Holiday specials</h3>
                <Switch
                  checked={notices.holiday.show}
                  onChange={(show) =>
                    update((d) => {
                      d.notices.holiday.show = show;
                    })
                  }
                  label={notices.holiday.show ? 'Showing' : 'Hidden'}
                  ariaLabel="Show Holiday specials on the website"
                />
              </div>
              <FieldLabel htmlFor="n-holiday">Message</FieldLabel>
              <textarea
                id="n-holiday"
                rows={3}
                className={forms.input}
                value={notices.holiday.message}
                onChange={(e) =>
                  update((d) => {
                    d.notices.holiday.message = e.target.value;
                  })
                }
              />
              <FieldLabel htmlFor="n-next">Next up</FieldLabel>
              <input
                id="n-next"
                type="text"
                className={forms.input}
                value={notices.holiday.nextUp}
                placeholder="e.g. Valentine’s Day, February 14"
                onChange={(e) =>
                  update((d) => {
                    d.notices.holiday.nextUp = e.target.value;
                  })
                }
              />
            </div>
            <div className={styles.notice}>
              <div className={styles.noticeHead}>
                <h3 className={styles.noticeTitle}>Private events</h3>
                <Switch
                  checked={notices.events.show}
                  onChange={(show) =>
                    update((d) => {
                      d.notices.events.show = show;
                    })
                  }
                  label={notices.events.show ? 'Showing' : 'Hidden'}
                  ariaLabel="Show Private events on the website"
                />
              </div>
              <FieldLabel htmlFor="n-events">Message</FieldLabel>
              <textarea
                id="n-events"
                rows={3}
                className={forms.input}
                value={notices.events.message}
                onChange={(e) =>
                  update((d) => {
                    d.notices.events.message = e.target.value;
                  })
                }
              />
            </div>
            <div className={styles.notice}>
              <div className={styles.noticeHead}>
                <h3 className={styles.noticeTitle}>Patio</h3>
                <Switch
                  checked={notices.patioOpen}
                  onChange={(open) =>
                    update((d) => {
                      d.notices.patioOpen = open;
                    })
                  }
                  label={notices.patioOpen ? 'Open' : 'Closed'}
                  ariaLabel="Patio open"
                />
              </div>
              <p className={forms.help}>Turn this on when the patio opens for the season.</p>
            </div>
          </DashCard>

          <DashCard titleId="contact-h" icon="phone" title="Contact & links">
            {CONTACT_FIELDS.map((field) => (
              <Fragment key={field.key}>
                <FieldLabel htmlFor={`c-${field.key}`}>{field.label}</FieldLabel>
                <input
                  id={`c-${field.key}`}
                  type={field.type}
                  className={forms.input}
                  value={contact[field.key]}
                  onChange={(e) =>
                    update((d) => {
                      d.contact[field.key] = e.target.value;
                      if (field.key === 'address') d.contact.mapsUrl = mapsUrlFor(e.target.value);
                    })
                  }
                />
              </Fragment>
            ))}
          </DashCard>
        </div>
      </div>
    </div>
  );
}

type DayRowProps = {
  day: DayKey;
  hours: DayHours;
  onChange: (recipe: (hours: DayHours) => void) => void;
};

function DayRow({ day, hours, onChange }: DayRowProps) {
  const name = DAY_NAMES[day];
  const invalid = hours.open && hours.ranges.some((range) => !isRangeValid(range));
  const errorId = `t-${day}-error`;

  return (
    <tr className={styles.row}>
      <th scope="row" className={styles.dayCell}>
        {name}
      </th>
      <td className={styles.switchCell}>
        <Switch
          checked={hours.open}
          label={hours.open ? 'Open' : 'Closed'}
          ariaLabel={`Open on ${name}`}
          onChange={(open) =>
            onChange((h) => {
              h.open = open;
              if (open && !h.ranges.length) h.ranges = [{ from: '11:00', to: '16:00' }];
            })
          }
        />
      </td>
      <td>
        {hours.open ? (
          <>
            <div className={styles.ranges}>
              {hours.ranges.map((range, index) => (
                <Fragment key={index}>
                  {index > 0 && <span className={styles.breakWord}>break, then</span>}
                  {/* one opening range stays on one line: [11:00] to [16:00] */}
                  <span className={styles.range}>
                    <label htmlFor={`t-${day}-${index}-from`} className="visually-hidden">
                      {name} opens{index > 0 ? ' again' : ''}
                    </label>
                    <input
                      id={`t-${day}-${index}-from`}
                      type="time"
                      className={cx(forms.input, styles.time)}
                      value={range.from}
                      aria-invalid={!isRangeValid(range)}
                      aria-describedby={invalid ? errorId : undefined}
                      onChange={(e) =>
                        onChange((h) => {
                          h.ranges[index].from = e.target.value;
                        })
                      }
                    />
                    <span className={styles.to}>to</span>
                    <label htmlFor={`t-${day}-${index}-to`} className="visually-hidden">
                      {name} closes{index > 0 ? ' again' : ''}
                    </label>
                    <input
                      id={`t-${day}-${index}-to`}
                      type="time"
                      className={cx(forms.input, styles.time)}
                      value={range.to}
                      aria-invalid={!isRangeValid(range)}
                      aria-describedby={invalid ? errorId : undefined}
                      onChange={(e) =>
                        onChange((h) => {
                          h.ranges[index].to = e.target.value;
                        })
                      }
                    />
                  </span>
                </Fragment>
              ))}
              {hours.ranges.length > 1 ? (
                <button
                  type="button"
                  className={styles.breakButton}
                  aria-label={`Remove the break on ${name}`}
                  title="Remove the break"
                  onClick={() =>
                    onChange((h) => {
                      h.ranges = [{ from: h.ranges[0].from, to: h.ranges[h.ranges.length - 1].to }];
                    })
                  }
                >
                  <Icon name="minus" size={18} strokeWidth={3} />
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.breakButton}
                  aria-label={`Add a break on ${name}`}
                  title="Add a midday break"
                  onClick={() =>
                    onChange((h) => {
                      h.ranges = splitAroundBreak(h.ranges[0] ?? { from: '11:00', to: '16:00' });
                    })
                  }
                >
                  <Icon name="plus" size={18} strokeWidth={3} />
                </button>
              )}
            </div>
            {invalid && (
              <p id={errorId} className={forms.error}>
                Closing time needs to be after opening time.
              </p>
            )}
          </>
        ) : (
          <span className={styles.closedAllDay}>Closed all day</span>
        )}
      </td>
    </tr>
  );
}

type SpecialDaysProps = {
  specials: SiteContent['hours']['specials'];
  today: string;
  onAdd: (special: SiteContent['hours']['specials'][number]) => void;
  onRemove: (id: string) => void;
};

function SpecialDays({ specials, today, onAdd, onRemove }: SpecialDaysProps) {
  const [date, setDate] = useState('');
  const [label, setLabel] = useState('');
  const [closed, setClosed] = useState(true);
  const [from, setFrom] = useState('11:00');
  const [to, setTo] = useState('16:00');
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    if (!date) {
      setError('Pick a date first.');
      return;
    }
    if (!closed && !isRangeValid({ from, to })) {
      setError('Closing time needs to be after opening time.');
      return;
    }
    onAdd({
      id: newId('special'),
      date,
      label: label.trim() || (closed ? 'Closed' : 'Special hours'),
      closedAllDay: closed,
      ranges: closed ? [] : [{ from, to }],
    });
    setDate('');
    setLabel('');
    setError(null);
  };

  return (
    <DashCard
      titleId="special-h"
      title="Special days & closures"
      description="Holidays, private events or anything that changes your usual hours. They override the regular hours on that day."
    >
      {specials.length === 0 ? (
        <p className={styles.nothing}>Nothing coming up.</p>
      ) : (
        <ul className={styles.specials}>
          {specials.map((special) => (
            <li
              key={special.id}
              className={cx(styles.special, special.date < today && styles.past)}
            >
              <strong className={styles.specialDate}>{formatSpecialDate(special.date)}</strong>
              <span className={styles.specialLabel}>{special.label}</span>
              <span className={styles.specialStatus}>
                {special.closedAllDay
                  ? 'Closed all day'
                  : `Special hours: ${formatRangesLong(special.ranges)}`}
                {special.date < today && ' (past)'}
              </span>
              <button
                type="button"
                className={forms.smallButton}
                onClick={() => onRemove(special.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        className={styles.addSpecial}
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <div className={styles.dateField}>
          <FieldLabel htmlFor="sp-date">Date</FieldLabel>
          <input
            id="sp-date"
            type="date"
            min={today}
            className={forms.input}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className={styles.labelField}>
          <FieldLabel htmlFor="sp-label">What’s happening</FieldLabel>
          <input
            id="sp-label"
            type="text"
            className={forms.input}
            value={label}
            placeholder="e.g. Closed for a private event"
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <Switch checked={closed} onChange={setClosed} label="Closed all day" />
        {!closed && (
          <div className={styles.specialTimes}>
            <label htmlFor="sp-from" className="visually-hidden">
              Opens
            </label>
            <input
              id="sp-from"
              type="time"
              className={cx(forms.input, styles.time)}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <span className={styles.to}>to</span>
            <label htmlFor="sp-to" className="visually-hidden">
              Closes
            </label>
            <input
              id="sp-to"
              type="time"
              className={cx(forms.input, styles.time)}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        )}
        <CartoonButton type="submit" variant="secondary">
          Add
        </CartoonButton>
      </form>
      {error && (
        <p role="alert" className={forms.error}>
          {error}
        </p>
      )}
    </DashCard>
  );
}
