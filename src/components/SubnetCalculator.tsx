import type { KeyboardEvent } from "react";
import type { CalculatorResult } from "@/app/types";
import { describeSubnetWindow, formatNumber, octetBitState } from "@/app/utils";

interface SubnetCalculatorProps {
  input: string;
  onInputChange: (value: string) => void;
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  result: CalculatorResult | null;
  error: string | null;
  isBusy: boolean;
}

export function SubnetCalculator({
  input,
  onInputChange,
  onInputKeyDown,
  onSubmit,
  result,
  error,
  isBusy,
}: SubnetCalculatorProps) {
  return (
    <section className="tool-card">
      <div className="tool-card__header">
        <div>
          <p className="eyebrow">Division tool</p>
          <h3>Subnet Calculator</h3>
        </div>
        <div className="tool-card__tag">IPv4 CIDR</div>
      </div>

      <div className="calculator-row">
        <input
          className="answer-input answer-input--compact"
          type="text"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="10.44.199.3/20"
          autoComplete="off"
          spellCheck={false}
        />
        <button className="secondary-button" type="button" onClick={onSubmit} disabled={!input.trim() || isBusy}>
          {isBusy ? "Working..." : "Calculate"}
        </button>
      </div>

      {error ? <p className="error-copy">{error}</p> : null}

      {result ? (
        <>
          <div className="tool-grid">
            <div>
              <p>Network</p>
              <strong>{result.network}</strong>
            </div>
            <div>
              <p>Broadcast</p>
              <strong>{result.broadcast}</strong>
            </div>
            <div>
              <p>First host</p>
              <strong>{result.firstHost}</strong>
            </div>
            <div>
              <p>Last host</p>
              <strong>{result.lastHost}</strong>
            </div>
            <div>
              <p>Usable hosts</p>
              <strong>{formatNumber(result.usableHosts)}</strong>
            </div>
            <div>
              <p>Subnet mask</p>
              <strong>{result.subnetMask}</strong>
            </div>
            <div>
              <p>Wildcard</p>
              <strong>{result.wildcardMask}</strong>
            </div>
            <div>
              <p>Block size</p>
              <strong>{result.blockSize}</strong>
            </div>
            <div>
              <p>Focus octet</p>
              <strong>{result.focusOctet}</strong>
            </div>
            <div>
              <p>Subnet window</p>
              <strong>{describeSubnetWindow(result)}</strong>
            </div>
          </div>

          <div className="calc-binary">
            {result.binarySplit.octets.map((octet, octetIndex) => (
              <div
                className={`binary-octet ${result.focusOctet === octetIndex + 1 ? "binary-octet--focus" : ""}`}
                key={`${octet}-${octetIndex}`}
              >
                {octet.split("").map((bit, bitIndex) => (
                  <span
                    className={`bit bit--${octetBitState(result.prefix, octetIndex, bitIndex)}`}
                    key={`${octetIndex}-${bitIndex}`}
                  >
                    {bit}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="empty-state">Run any CIDR through the calculator for a quick subnet breakdown.</p>
      )}
    </section>
  );
}
