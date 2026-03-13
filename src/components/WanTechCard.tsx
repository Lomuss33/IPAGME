const wanSections = [
  {
    title: "MPLS",
    rows: [
      { label: "Core idea", value: "Label at the edge, label swap in the core, IP lookup again at the egress edge." },
      { label: "Terms", value: "LER on the edge, LSR in the provider core, LSP as the label-switched path." },
      { label: "Exam cue", value: "Think provider WAN, L3VPNs, traffic engineering, and VRF separation." },
    ],
  },
  {
    title: "PPP",
    rows: [
      { label: "Flow", value: "LCP brings the link up, authentication happens, then NCP opens Layer-3 protocols." },
      { label: "Auth", value: "CHAP is stronger than PAP because credentials are not sent in clear text." },
      { label: "Exam cue", value: "Think point-to-point serial encapsulation and negotiation on WAN links." },
    ],
  },
  {
    title: "Frame Relay",
    rows: [
      { label: "Identifier", value: "A DLCI identifies the PVC locally; it has only local significance." },
      { label: "Control", value: "LMI reports PVC status and keeps the management view updated." },
      { label: "Exam cue", value: "Classic hub-and-spoke plus split-horizon problems with distance-vector routing." },
    ],
  },
] as const;

export function WanTechCard() {
  return (
    <section className="tool-card tool-card--study">
      <div className="tool-card__header">
        <div>
          <h3>WAN / MPLS / PPP</h3>
        </div>
      </div>

      <div className="helper-card__body">
        <div className="study-card__stack">
          {wanSections.map((section) => (
            <article className="study-card__section" key={section.title}>
              <strong className="study-card__section-title">{section.title}</strong>
              <div className="study-card__rows">
                {section.rows.map((row) => (
                  <div className="study-card__row" key={row.label}>
                    <strong className="study-card__key">{row.label}</strong>
                    <p className="study-card__value">{row.value}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
