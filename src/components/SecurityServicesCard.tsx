const aclRows = [
  { label: "Standard ACL", value: "Matches source only. Usually place it closer to the destination." },
  { label: "Extended ACL", value: "Matches source, destination, protocol, and ports. Usually place it closer to the source." },
  { label: "Wildcard", value: "`0` must match, `1` can vary. Cisco ACL logic is inverse mask logic." },
  { label: "Implicit rule", value: "Every ACL ends with an invisible `deny any`, so plan permits explicitly." },
] as const;

const aaaRows = [
  { label: "Authentication", value: "Proves identity: who are you?" },
  { label: "Authorization", value: "Defines permissions: what may you do?" },
  { label: "Accounting", value: "Logs activity: what did you do?" },
  { label: "RADIUS / TACACS+", value: "RADIUS is common for network access; TACACS+ is stronger for device administration and command control." },
] as const;

const natRows = [
  { label: "Inside local", value: "The private address of the internal host before translation." },
  { label: "Inside global", value: "The translated public-facing address of that internal host." },
  { label: "Static / Dynamic", value: "Static maps one fixed address; dynamic uses a pool." },
  { label: "PAT", value: "Many inside hosts share one public IP by translating ports." },
] as const;

export function SecurityServicesCard() {
  return (
    <section className="tool-card tool-card--study">
      <div className="tool-card__header">
        <div>
          <h3>ACL / AAA / NAT</h3>
        </div>
      </div>

      <div className="helper-card__body">
        <div className="study-card__stack">
          <article className="study-card__section">
            <strong className="study-card__section-title">ACL reminders</strong>
            <div className="study-card__rows">
              {aclRows.map((row) => (
                <div className="study-card__row" key={row.label}>
                  <strong className="study-card__key">{row.label}</strong>
                  <p className="study-card__value">{row.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="study-card__section">
            <strong className="study-card__section-title">AAA flow</strong>
            <div className="study-card__rows">
              {aaaRows.map((row) => (
                <div className="study-card__row" key={row.label}>
                  <strong className="study-card__key">{row.label}</strong>
                  <p className="study-card__value">{row.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="study-card__section">
            <strong className="study-card__section-title">NAT / PAT view</strong>
            <div className="study-card__rows">
              {natRows.map((row) => (
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
