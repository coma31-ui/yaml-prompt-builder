import * as React from 'react';
export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={`label ${props.className||''}`} />;
}
