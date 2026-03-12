type ComparisonEntry = {
  title: string;
  leftLabel: string;
  rightLabel: string;
  difference: string;
  leftUse: string;
  rightUse: string;
};

const comparisons: ComparisonEntry[] = [
  {
    title: "TCP vs UDP",
    leftLabel: "TCP",
    rightLabel: "UDP",
    difference: "TCP adds connection setup, ordering, and retransmission; UDP sends with less overhead and no delivery guarantee.",
    leftUse: "Use when reliability matters, such as web sessions, SSH, and file transfers.",
    rightUse: "Use when speed and low overhead matter more, such as streaming, voice, and lightweight queries.",
  },
  {
    title: "Trunk vs Access",
    leftLabel: "Trunk",
    rightLabel: "Access",
    difference: "A trunk carries traffic for multiple VLANs with tags, while an access port carries traffic for one VLAN only.",
    leftUse: "Use between switches, routers, or AP uplinks that must transport several VLANs.",
    rightUse: "Use for end devices like PCs, phones, and printers that live in one VLAN.",
  },
  {
    title: "Static vs Dynamic",
    leftLabel: "Static route",
    rightLabel: "Dynamic route",
    difference: "Static routes are manually configured; dynamic routes are learned and updated through routing protocols.",
    leftUse: "Use for simple networks, edge defaults, or tightly controlled paths.",
    rightUse: "Use in larger or changing networks where routes must adapt automatically.",
  },
  {
    title: "NAT vs PAT",
    leftLabel: "NAT",
    rightLabel: "PAT",
    difference: "NAT usually maps one address to another, while PAT lets many inside hosts share one public IP by translating ports.",
    leftUse: "Use when specific one-to-one address mapping is required.",
    rightUse: "Use for normal internet access where many users share one public address.",
  },
  {
    title: "Std vs Ext ACL",
    leftLabel: "Standard ACL",
    rightLabel: "Extended ACL",
    difference: "Standard ACLs match only the source IP; extended ACLs can match source, destination, protocol, and ports.",
    leftUse: "Use when only the source network matters and filtering is simple.",
    rightUse: "Use when you need precise traffic control, such as blocking one service but allowing others.",
  },
  {
    title: "HSRP vs VRRP",
    leftLabel: "HSRP",
    rightLabel: "VRRP",
    difference: "HSRP is Cisco proprietary first-hop redundancy, while VRRP is the standards-based equivalent used across vendors.",
    leftUse: "Use in Cisco-focused environments where HSRP is already standard.",
    rightUse: "Use in mixed-vendor environments where interoperability matters.",
  },
];

export function CcnaCompareCard() {
  return (
    <section className="tool-card tool-card--compare">
      <div className="tool-card__header">
        <div>
          <h3>CCNA Compare</h3>
        </div>
      </div>

      <div className="helper-card__body">
        <div className="compare-card__grid">
          {comparisons.map((entry) => (
            <article className="compare-card__item" key={entry.title}>
              <strong className="compare-card__title">{entry.title}</strong>
              <div className="compare-card__table" role="table" aria-label={entry.title}>
                <div className="compare-card__table-head" role="row">
                  <span className="compare-card__head-cell compare-card__head-cell--label" role="columnheader">
                    Side
                  </span>
                  <span className="compare-card__head-cell" role="columnheader">
                    Best when
                  </span>
                </div>
                <div className="compare-card__split">
                  <div className="compare-card__side" role="row">
                    <span className="compare-card__label" role="cell">{entry.leftLabel}</span>
                    <p className="compare-card__use" role="cell">{entry.leftUse}</p>
                  </div>
                  <div className="compare-card__side" role="row">
                    <span className="compare-card__label" role="cell">{entry.rightLabel}</span>
                    <p className="compare-card__use" role="cell">{entry.rightUse}</p>
                  </div>
                </div>
                <div className="compare-card__difference-row">
                  <span className="compare-card__difference-label">Key difference</span>
                  <p className="compare-card__difference">{entry.difference}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
