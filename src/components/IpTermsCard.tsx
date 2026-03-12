import type { QuizQuestion } from "@/app/types";

interface IpTermsCardProps {
  question: QuizQuestion | null;
}

export function IpTermsCard({ question }: IpTermsCardProps) {
  const maxBits = question?.addressFamily === "ipv6" ? 128 : 32;
  const hostBits = question ? Math.max(maxBits - question.prefix, 0) : 0;
  const rows = question
    ? [
        { label: "Subnet ID", value: `${question.network}/${question.prefix}`, copy: "Network address written in CIDR form." },
        { label: "CIDR", value: `/${question.prefix}`, copy: "Prefix length for the subnet." },
        { label: "Network", value: question.network, copy: "First address in the subnet." },
        { label: "Broadcast", value: question.broadcast, copy: "Last address in the subnet." },
        { label: "Address window", value: `${question.network} - ${question.broadcast}`, copy: "Full span covered by the subnet." },
        { label: "Mask", value: question.subnetMask, copy: "Shows network bits vs host bits." },
        { label: "Wildcard", value: question.wildcardMask, copy: "Inverse of the subnet mask." },
        { label: "Wildcard use", value: "ACL / OSPF", copy: "Cisco often uses wildcards for matching." },
        { label: "Network bits", value: String(question.prefix), copy: "Bits reserved for the network portion." },
        { label: "Host bits", value: String(hostBits), copy: "Bits left for hosts or interface IDs." },
        { label: "Block", value: String(question.blockSize), copy: "Jump size in the focus octet." },
        { label: "Focus octet", value: String(question.focusOctet), copy: "Where the subnet boundary changes." },
        { label: "Gateway", value: "Off-subnet next hop", copy: "Used when the destination is outside the local subnet." },
        { label: "Broadcast domain", value: "One VLAN / subnet", copy: "Routers split broadcast domains between networks." },
      ]
    : [];

  return (
    <section className="tool-card tool-card--terms">
      <div className="tool-card__header">
        <div>
          <h3>IP Terms</h3>
        </div>
        {question ? <div className="tool-card__tag">{question.ip}/{question.prefix}</div> : null}
      </div>

      {question ? (
        <div className="helper-card__body">
          <div className="terms-grid">
            {rows.map((row) => (
              <article className="terms-row" key={row.label}>
                <div>
                  <span>{row.label}</span>
                  <p>{row.copy}</p>
                </div>
                <strong>{row.value}</strong>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <p className="empty-state">Generate a question to load the current subnet terms.</p>
      )}
    </section>
  );
}
