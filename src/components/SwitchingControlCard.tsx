const stpRows = [
  { standard: "802.1D", name: "STP", reminder: "Original convergence. Stable, but much slower after topology changes." },
  { standard: "802.1w", name: "RSTP", reminder: "Rapid convergence with alternate and backup roles." },
  { standard: "802.1s", name: "MST", reminder: "Maps multiple VLANs to STP instances to scale better in large campus designs." },
] as const;

const vlanRows = [
  { label: "Access port", value: "Carries one VLAN for an endpoint like a PC, printer, or phone edge." },
  { label: "Trunk", value: "Carries multiple VLANs, normally tagged with 802.1Q." },
  { label: "Native VLAN", value: "The untagged VLAN on a trunk; it should match on both ends." },
  { label: "Inter-VLAN", value: "Routing between VLANs needs a router or multilayer switch." },
] as const;

const etherChannelRows = [
  { label: "LACP", value: "Standards-based. `active` and `passive` modes negotiate the bundle." },
  { label: "PAgP", value: "Cisco proprietary. `desirable` and `auto` negotiate the bundle." },
  { label: "On", value: "Forces a static bundle without negotiation." },
  { label: "Match rules", value: "Members must match speed, duplex, trunk/access mode, and VLAN settings." },
] as const;

export function SwitchingControlCard() {
  return (
    <section className="tool-card tool-card--study">
      <div className="tool-card__header">
        <div>
          <h3>Switching Control</h3>
        </div>
      </div>

      <div className="helper-card__body">
        <div className="study-card__stack">
          <article className="study-card__section">
            <strong className="study-card__section-title">STP (802.1D / w / s)</strong>
            <div className="study-card__triple-head">
              <span>Std</span>
              <span>Name</span>
              <span>Reminder</span>
            </div>
            <div className="study-card__stack study-card__stack--tight">
              {stpRows.map((row) => (
                <div className="study-card__triple-row" key={row.standard}>
                  <strong className="study-card__key">{row.standard}</strong>
                  <span className="study-card__subkey">{row.name}</span>
                  <p className="study-card__value">{row.reminder}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="study-card__section">
            <strong className="study-card__section-title">VLAN reminders</strong>
            <div className="study-card__rows">
              {vlanRows.map((row) => (
                <div className="study-card__row" key={row.label}>
                  <strong className="study-card__key">{row.label}</strong>
                  <p className="study-card__value">{row.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="study-card__section">
            <strong className="study-card__section-title">EtherChannel (LACP / PAgP)</strong>
            <div className="study-card__rows">
              {etherChannelRows.map((row) => (
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
