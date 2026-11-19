import type { ChangeEvent, ReactNode } from 'react';
import { cx } from '../../lib/utils';
import { cartoonClass, type CartoonSize, type CartoonVariant } from '../ui';
import styles from './forms.module.css';

type FieldLabelProps = {
  htmlFor: string;
  children: ReactNode;
  /** Lighter text after the label, such as “(optional)”. */
  hint?: ReactNode;
  className?: string;
};

export function FieldLabel({ htmlFor, children, hint, className }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={cx(styles.label, className)}>
      {children}
      {hint && <span className={styles.hint}> {hint}</span>}
    </label>
  );
}

type PriceInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
};

/** “$” field for prices. Blank means the price is hidden on the website. */
export function PriceInput({ id, value, onChange, ariaLabel, className }: PriceInputProps) {
  return (
    <div className={cx(styles.price, className)}>
      <span aria-hidden="true" className={styles.priceSign}>
        $
      </span>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        placeholder="0.00"
        aria-label={ariaLabel}
        className={styles.priceInput}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

type FileButtonProps = {
  children: ReactNode;
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  variant?: CartoonVariant;
  size?: CartoonSize;
  className?: string;
};

/** A cartoon button that opens the photo picker (camera or library on phones). */
export function FileButton({
  children,
  onFiles,
  multiple = false,
  disabled = false,
  variant = 'secondary',
  size = 'md',
  className,
}: FileButtonProps) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length) onFiles(files);
  };
  return (
    <label
      className={cartoonClass(variant, size, styles.fileButton, disabled && styles.busy, className)}
    >
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        disabled={disabled}
        className="visually-hidden"
        onChange={onChange}
      />
      {children}
    </label>
  );
}
