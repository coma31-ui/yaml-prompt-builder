import * as React from 'react';
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'secondary' };
export function Button({ variant='default', className='', ...props }: Props) {
  const base = 'btn';
  const style = variant==='secondary' ? 'bg-white/80 border border-slate-300' : 'bg-slate-900 text-white';
  return <button className={`${base} ${style} ${className}`} {...props} />;
}
