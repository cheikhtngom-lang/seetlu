import { cx } from '@/lib/cx';
import { useId, type InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; aide?: string; erreur?: string | null };

export function Input({ label, aide, erreur, className, id, ...reste }: Props) {
  const auto = useId();
  const champ = id ?? auto;
  const note = erreur ? `${champ}-erreur` : aide ? `${champ}-aide` : undefined;
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={champ} className="text-[13px] font-medium text-encre-2">
        {label}
      </label>
      <input
        id={champ}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={note}
        className={cx(
          'h-10 rounded-md border bg-surface px-3 text-sm text-encre placeholder:text-encre-3',
          'transition-[border-color,box-shadow] duration-150',
          'focus:outline-none focus:border-bain-2 focus:shadow-[0_0_0_3px_var(--surface-2)]',
          erreur ? 'border-rouge' : 'border-filet-fort',
        )}
        {...reste}
      />
      {erreur ? (
        <p id={note} className="text-[13px] text-rouge">
          {erreur}
        </p>
      ) : aide ? (
        <p id={note} className="text-[13px] text-encre-3">
          {aide}
        </p>
      ) : null}
    </div>
  );
}
