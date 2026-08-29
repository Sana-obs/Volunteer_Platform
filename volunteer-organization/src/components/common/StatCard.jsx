import { useState } from "react";
import { Info } from "lucide-react";
import { useCountUp } from "../../hooks/useCountUp";
import useClickOutside from "../../hooks/useClickOutside";
import {
  CARD_SURFACE,
  CARD_ELEVATION,
} from "../../utils/surfaceStyles";

export default function StatCard({
  number,
  label,
  suffix = "+",
  hint,
  icon: Icon,
}) {
  const { displayValue, elementRef } = useCountUp(number);

  const [isHintOpen, setIsHintOpen] = useState(false);

  const hintRef = useClickOutside(
    isHintOpen,
    () => setIsHintOpen(false)
  );

  return (
    <div
      ref={elementRef}
      className={`${CARD_SURFACE} ${CARD_ELEVATION} relative p-5 text-center sm:p-6`}
    >
      {hint && (
        <div ref={hintRef} className="absolute right-3 top-3">
          <button
            type="button"
            title={hint}
            onClick={() => setIsHintOpen((current) => !current)}
            className="cursor-help rounded text-heading/30 hover:text-heading/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label={hint}
            aria-expanded={isHintOpen}
          >
            <Info size={15} aria-hidden="true" />
          </button>

          {isHintOpen && (
            <div
              role="tooltip"
              className="absolute right-0 z-10 mt-2 w-56 rounded-xl border-2 border-heading/20 bg-field p-3 text-left text-xs font-normal leading-snug text-body shadow-2xl"
            >
              {hint}
            </div>
          )}
        </div>
      )}

      {Icon && (
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Icon
            size={20}
            className="text-primary"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="mb-3 text-3xl font-bold text-primary sm:text-4xl">
        {displayValue}
        {suffix}
      </div>

      <p className="text-sm font-medium leading-relaxed text-heading/70">
        {label}
      </p>
    </div>
  );
}