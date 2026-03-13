const layerRows = [
  { osi: "L7 App", tcpip: "Application", focus: "HTTP, DNS, SSH, user services" },
  { osi: "L6 Pres", tcpip: "Application", focus: "TLS, formats, encryption, encoding" },
  { osi: "L5 Sess", tcpip: "Application", focus: "RPC, checkpoints, session control" },
  { osi: "L4 Trans", tcpip: "Transport", focus: "TCP, UDP, ports, reliability" },
  { osi: "L3 Net", tcpip: "Internet", focus: "IP, ICMP, OSPF, routing" },
  { osi: "L2 Data", tcpip: "Network access", focus: "Ethernet, MAC, VLAN, STP" },
  { osi: "L1 Phys", tcpip: "Network access", focus: "Bits on copper, fiber, RF" },
] as const;

const pduRows = [
  { label: "Data", value: "Upper-layer payload before transport encapsulation." },
  { label: "Segment / Datagram", value: "Transport PDU with TCP or UDP headers." },
  { label: "Packet", value: "Layer-3 IP view used by routers." },
  { label: "Frame", value: "Layer-2 delivery unit with MAC addresses." },
  { label: "Bits", value: "Electrical, optical, or radio signaling on the medium." },
] as const;

const deviceRows = [
  { label: "Switch", value: "Mostly L2. Learns MACs and forwards frames inside the VLAN." },
  { label: "Router", value: "L3 boundary. Chooses the next hop by longest prefix match." },
  { label: "Firewall", value: "L3-L7 depending on feature set and inspection depth." },
] as const;

export function OsiTcpModelCard() {
  return (
    <section className="tool-card tool-card--study">
      <div className="tool-card__header">
        <div>
          <h3>OSI / TCP-IP 7-Modell</h3>
        </div>
      </div>

      <div className="helper-card__body">
        <div className="study-card__stack">
          <article className="study-card__section">
            <strong className="study-card__section-title">Layer map</strong>
            <div className="study-card__triple-head">
              <span>OSI</span>
              <span>TCP/IP</span>
              <span>Reminder</span>
            </div>
            <div className="study-card__stack study-card__stack--tight">
              {layerRows.map((row) => (
                <div className="study-card__triple-row" key={row.osi}>
                  <strong className="study-card__key">{row.osi}</strong>
                  <span className="study-card__subkey">{row.tcpip}</span>
                  <p className="study-card__value">{row.focus}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="study-card__section">
            <strong className="study-card__section-title">PDU trail</strong>
            <div className="study-card__rows">
              {pduRows.map((row) => (
                <div className="study-card__row" key={row.label}>
                  <strong className="study-card__key">{row.label}</strong>
                  <p className="study-card__value">{row.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="study-card__section">
            <strong className="study-card__section-title">Device focus</strong>
            <div className="study-card__rows">
              {deviceRows.map((row) => (
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
