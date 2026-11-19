import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { cartoonClass, type CartoonSize, type CartoonVariant } from './cartoonClass';

type Look = { variant?: CartoonVariant; size?: CartoonSize };

/**
 * Chunky button: 3px ink border, 16px corners and a solid drop.
 * Primary = purple with cream text · secondary = aqua · tertiary = cream.
 */
export function CartoonButton({
  variant,
  size,
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & Look) {
  return <button type={type} className={cartoonClass(variant, size, className)} {...rest} />;
}

type CartoonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  Look & {
    /** An in-app route. Use `href` for tel:, mailto: and other sites. */
    to?: string;
  };

/** The same look on a link. */
export function CartoonLink({ variant, size, className, to, children, ...rest }: CartoonLinkProps) {
  const classes = cartoonClass(variant, size, className);
  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a className={classes} {...rest}>
      {children}
    </a>
  );
}
