import type { PowerTableRow } from "@/app/types";
import { powerTableSlice, wildcardShortcut } from "@/app/utils";

interface PowerTableCardProps {
  rows: PowerTableRow[];
  visibleBits: number;
  onVisibleBitsChange: (value: number) => void;
}

const options = [8, 16, 24, 32];

export function PowerTableCard({ rows, visibleBits, onVisibleBitsChange }: PowerTableCardProps) {
  const visibleRows = powerTableSlice(rows, visibleBits);
  const wildcardHelper = wildcardShortcut(visibleBits);

  return (
    <section className="tool-card tool-card--power">
      <div className="tool-card__header">
        <div>
          <p className="eyebrow">Helper</p>
          <h3>2^x Table</h3>
        </div>
        <div className="difficulty-picker" aria-label="Power table size">
          {options.map((option) => (
            <button
              key={option}
              className={`chip chip--small ${visibleBits === option ? "chip--active" : ""}`}
              type="button"
              onClick={() => onVisibleBitsChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <p className="tool-copy">Quick powers of two.</p>

      <div className="power-grid">
        {visibleRows.map((row) => (
          <article className="power-row" key={row.exponent}>
            <span>2^{row.exponent}</span>
            <strong>{row.value.toLocaleString("en-US")}</strong>
          </article>
        ))}
      </div>

      <div className="wildcard-helper">
        <h4 className="wildcard-helper__title">Wildcard</h4>
        <div className="wildcard-helper__table">
          <article className="wildcard-helper__row">
            <strong>/{wildcardHelper.prefix}</strong>
            <span>Prefix</span>
          </article>
          <article className="wildcard-helper__row">
            <strong>{wildcardHelper.mask}</strong>
            <span>Mask</span>
          </article>
          <article className="wildcard-helper__row">
            <strong>{wildcardHelper.wildcard}</strong>
            <span>255 - mask</span>
          </article>
          <article className="wildcard-helper__row">
            <strong>{wildcardHelper.focusValue}</strong>
            <span>Host chunk</span>
          </article>
        </div>
      </div>
    </section>
  );
}
