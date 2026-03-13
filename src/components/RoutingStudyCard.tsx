import type { QuizQuestion } from "@/app/types";

interface RoutingStudyCardProps {
  question: QuizQuestion | null;
}

function getUsableHosts(prefix: number) {
  const hostBits = Math.max(32 - prefix, 0);
  if (hostBits === 0) {
    return 1;
  }
  if (hostBits === 1) {
    return 2;
  }

  return 2 ** hostBits - 2;
}

const vlsmRows = [
  { label: "Order", value: "Allocate largest host requirement first, then work downward." },
  { label: "Prefix pick", value: "Choose the smallest prefix that still fits hosts plus overhead." },
  { label: "Boundary", value: "Move to the next aligned block boundary before placing the next subnet." },
  { label: "Summary", value: "Aggregate only contiguous aligned blocks after the design is stable." },
] as const;

const ospfRows = [
  { label: "Cost", value: "Cost = reference bandwidth / interface bandwidth." },
  { label: "Default ref", value: "Cisco default 100 Mbps means FastE and GigE can both show cost 1 until you raise it." },
  { label: "SPF", value: "Dijkstra picks the lowest cumulative cost path from the LSDB." },
  { label: "Areas", value: "Area 0 is the backbone; ABRs connect non-backbone areas." },
] as const;

const eigrpRows = [
  { label: "Metric", value: "Default K-values use bandwidth and delay for the composite metric." },
  { label: "AD", value: "90 for internal routes, 170 for external routes." },
  { label: "Backup path", value: "A feasible successor must satisfy the feasible condition to stay loop free." },
  { label: "Flow", value: "Neighbor table -> topology table -> routing table." },
] as const;

export function RoutingStudyCard({ question }: RoutingStudyCardProps) {
  const usableHosts = question ? getUsableHosts(question.prefix).toLocaleString("en-US") : null;

  return (
    <section className="tool-card tool-card--study">
      <div className="tool-card__header">
        <div>
          <h3>Routing / VLSM</h3>
        </div>
      </div>

      <div className="helper-card__body">
        <div className="study-card__stack">
          {question ? (
            <article className="study-card__section study-card__section--accent">
              <strong className="study-card__section-title">Current drill</strong>
              <div className="study-card__rows">
                <div className="study-card__row">
                  <strong className="study-card__key">CIDR</strong>
                  <p className="study-card__value">{question.ip}/{question.prefix}</p>
                </div>
                <div className="study-card__row">
                  <strong className="study-card__key">Block jump</strong>
                  <p className="study-card__value">{question.blockSize} in octet {question.focusOctet}</p>
                </div>
                <div className="study-card__row">
                  <strong className="study-card__key">Usable hosts</strong>
                  <p className="study-card__value">{usableHosts}</p>
                </div>
              </div>
            </article>
          ) : null}

          <article className="study-card__section">
            <strong className="study-card__section-title">VLSM order</strong>
            <div className="study-card__rows">
              {vlsmRows.map((row) => (
                <div className="study-card__row" key={row.label}>
                  <strong className="study-card__key">{row.label}</strong>
                  <p className="study-card__value">{row.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="study-card__section">
            <strong className="study-card__section-title">OSPF / SPF-Berechnung</strong>
            <div className="study-card__rows">
              {ospfRows.map((row) => (
                <div className="study-card__row" key={row.label}>
                  <strong className="study-card__key">{row.label}</strong>
                  <p className="study-card__value">{row.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="study-card__section">
            <strong className="study-card__section-title">EIGRP reminder</strong>
            <div className="study-card__rows">
              {eigrpRows.map((row) => (
                <div className="study-card__row" key={row.label}>
                  <strong className="study-card__key">{row.label}</strong>
                  <p className="study-card__value">{row.value}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
