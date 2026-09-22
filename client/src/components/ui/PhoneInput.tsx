import { useState, useEffect, useRef } from 'react';
import { Input } from './Input';
import { cn } from '../../lib/utils';

interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const CODE_PATTERN = /^\+\d{1,3}/;

// "+91 9876543210" -> { countryCode: "+91", number: "9876543210" }
function splitPhone(value: string) {
  const trimmed = (value ?? '').trim();
  const codeMatch = trimmed.match(CODE_PATTERN);
  const countryCode = codeMatch ? codeMatch[0] : '+91';
  const rest = codeMatch ? trimmed.slice(codeMatch[0].length) : trimmed;
  const number = rest.replace(/\D/g, '').slice(0, 10);
  return { countryCode, number };
}

// Always "+" followed by up to 3 digits.
function normalizeCode(raw: string) {
  return `+${raw.replace(/\D/g, '').slice(0, 3)}`;
}

function combine(countryCode: string, number: string) {
  if (!number) return '';
  const digits = countryCode.replace(/\D/g, '');
  return `${digits ? `+${digits}` : '+91'} ${number}`;
}

// Stored as one string, edited as two boxes. The boxes keep their own draft state
// (otherwise clearing the country code snaps it back to +91) and only resync
// when `value` changes from outside.
export function PhoneInput({ id, value, onChange, required, placeholder = '10-digit number', className }: PhoneInputProps) {
  const initial = splitPhone(value);
  const [countryCode, setCountryCode] = useState(initial.countryCode);
  const [number, setNumber] = useState(initial.number);
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value === lastEmitted.current) return;
    const parsed = splitPhone(value);
    setCountryCode(parsed.countryCode);
    setNumber(parsed.number);
    lastEmitted.current = value;
  }, [value]);

  function handleCodeChange(raw: string) {
    const next = normalizeCode(raw);
    setCountryCode(next);
    const combined = combine(next, number);
    lastEmitted.current = combined;
    onChange(combined);
  }

  function handleNumberChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    setNumber(digits);
    const combined = combine(countryCode, digits);
    lastEmitted.current = combined;
    onChange(combined);
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Input
        aria-label="Country code"
        value={countryCode}
        onChange={(e) => handleCodeChange(e.target.value)}
        className="w-16 shrink-0 px-2 text-center"
        maxLength={4}
        placeholder="+91"
      />
      <Input
        id={id}
        aria-label="Phone number"
        inputMode="numeric"
        autoComplete="tel-national"
        value={number}
        onChange={(e) => handleNumberChange(e.target.value)}
        placeholder={placeholder}
        maxLength={10}
        required={required}
      />
    </div>
  );
}
