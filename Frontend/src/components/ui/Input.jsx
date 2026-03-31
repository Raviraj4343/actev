import React from 'react'

export default function Input({ id, label, type = 'text', value, onChange, required = false, name, placeholder = ' ', hint = '', className = '', ...props }){
  const ariaLabel = label || name || undefined
  const resolvedPlaceholder = label ? ' ' : placeholder
  return (
    <div className={`field ${className}`}>
      <input id={id} name={name} type={type} value={value} onChange={onChange} placeholder={resolvedPlaceholder} required={required} aria-label={ariaLabel} aria-required={required} {...props} />
      {label && <label htmlFor={id}>{label}</label>}
      {hint ? <div className="field-hint">{hint}</div> : null}
    </div>
  )
}
