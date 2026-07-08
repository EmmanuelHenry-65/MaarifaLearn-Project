import { useState } from 'react';

const KEYS = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '=', '+', 'C'];

/** Evaluates a basic arithmetic expression of the form `12+3×4` (÷/× as friendlier aliases for /,*). */
function evaluateExpression(expression: string): string {
  const sanitized = expression.replace(/÷/g, '/').replace(/×/g, '*');
  if (!/^[0-9+\-*/.\s]*$/.test(sanitized) || sanitized.trim() === '') return 'Error';
  try {
    // eslint-disable-next-line no-new-func -- sanitized to digits/operators only above.
    const result = Function(`"use strict"; return (${sanitized})`)();
    if (typeof result !== 'number' || !Number.isFinite(result)) return 'Error';
    return String(Math.round(result * 1e10) / 1e10);
  } catch {
    return 'Error';
  }
}

export default function SimpleCalculator({ className }: { className?: string }) {
  const [expression, setExpression] = useState('');

  function pressKey(key: string) {
    if (key === 'C') {
      setExpression('');
      return;
    }
    if (key === '=') {
      setExpression((prev) => evaluateExpression(prev));
      return;
    }
    setExpression((prev) => (prev === 'Error' ? key : prev + key));
  }

  return (
    <div className={className}>
      <div className="mb-2 px-3 py-2 rounded-lg bg-black/20 text-right font-mono text-sm text-cyan-400 min-h-[2.25rem] overflow-x-auto whitespace-nowrap">
        {expression || '0'}
      </div>
      <div className="grid grid-cols-4 gap-2 max-w-xs">
        {KEYS.map((key) => (
          <button
            key={key}
            onClick={() => pressKey(key)}
            className={`h-9 rounded-lg font-bold ${
              key === 'C'
                ? 'bg-red-500/10 border border-red-500/20 text-red-500'
                : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-600'
            }`}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
