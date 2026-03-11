import type { QuizQuestion } from "@/app/types";
import { buildMaskBits, describeSubnetWindow, octetBitState } from "@/app/utils";

interface SplitVisualizerProps {
  question: QuizQuestion | null;
}

function BitRow({
  octets,
  prefix,
  focusOctet,
  rowLabel,
  type,
}: {
  octets: string[];
  prefix: number;
  focusOctet: number;
  rowLabel: string;
  type: "ip" | "mask";
}) {
  return (
    <div className="binary-row">
      <div className="binary-row__label">{rowLabel}</div>
      <div className="binary-row__octets">
        {octets.map((octet, octetIndex) => (
          <div
            className={`binary-octet ${focusOctet === octetIndex + 1 ? "binary-octet--focus" : ""}`}
            key={`${rowLabel}-${octetIndex}`}
          >
            {octet.split("").map((bit, bitIndex) => (
              <span
                className={`bit bit--${type === "mask" ? (bit === "1" ? "network" : "host") : octetBitState(prefix, octetIndex, bitIndex)}`}
                key={`${rowLabel}-${octetIndex}-${bitIndex}`}
              >
                {bit}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SplitVisualizer({ question }: SplitVisualizerProps) {
  if (!question) {
    return (
      <section className="tool-card">
        <div className="tool-card__header">
          <p className="eyebrow">Division tool</p>
          <h3>Split Visualizer</h3>
        </div>
        <p className="empty-state">Generate a question to inspect the binary split.</p>
      </section>
    );
  }

  const maskBits = buildMaskBits(question.prefix);
  const maskOctets = [
    maskBits.slice(0, 8).join(""),
    maskBits.slice(8, 16).join(""),
    maskBits.slice(16, 24).join(""),
    maskBits.slice(24, 32).join(""),
  ];

  return (
    <section className="tool-card">
      <div className="tool-card__header">
        <div>
          <p className="eyebrow">Division tool</p>
          <h3>Split Visualizer</h3>
        </div>
        <div className="tool-card__tag">{question.ip}/{question.prefix}</div>
      </div>

      <p className="tool-copy">Binary split for the current host.</p>

      <div className="legend-row">
        <span className="legend-pill legend-pill--network">Network bits</span>
        <span className="legend-pill legend-pill--host">Host bits</span>
      </div>

      <BitRow octets={question.binaryOctets} prefix={question.prefix} focusOctet={question.focusOctet} rowLabel="IP" type="ip" />
      <BitRow octets={maskOctets} prefix={question.prefix} focusOctet={question.focusOctet} rowLabel="Mask" type="mask" />

      <div className="tool-grid">
        <div>
          <p>Subnet mask</p>
          <strong>{question.subnetMask}</strong>
        </div>
        <div>
          <p>Wildcard</p>
          <strong>{question.wildcardMask}</strong>
        </div>
        <div>
          <p>Block size</p>
          <strong>{question.blockSize}</strong>
        </div>
        <div>
          <p>Subnet window</p>
          <strong>{describeSubnetWindow(question)}</strong>
        </div>
      </div>
    </section>
  );
}
