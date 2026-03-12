const sections = [
  {
    title: "IPv4 ranges",
    rows: [
      { label: "Private A", value: "10.0.0.0/8" },
      { label: "Private B", value: "172.16.0.0/12" },
      { label: "Private C", value: "192.168.0.0/16" },
      { label: "APIPA", value: "169.254.0.0/16" },
      { label: "Loopback", value: "127.0.0.0/8" },
      { label: "Multicast", value: "224.0.0.0/4" },
    ],
  },
  {
    title: "Ports",
    rows: [
      { label: "HTTP", value: "80" },
      { label: "SSH", value: "22" },
      { label: "Telnet", value: "23" },
      { label: "DNS", value: "53" },
      { label: "DHCP", value: "67 / 68" },
      { label: "TFTP", value: "69" },
      { label: "SNMP", value: "161 / 162" },
      { label: "HTTPS", value: "443" },
    ],
  },
  {
    title: "Subnet clues",
    rows: [
      { label: "/24", value: "256 addrs / 254 hosts" },
      { label: "/25", value: "128 addrs / 126 hosts" },
      { label: "/26", value: "64 addrs / 62 hosts" },
      { label: "/27", value: "32 addrs / 30 hosts" },
      { label: "/30", value: "4 addrs / 2 hosts" },
      { label: "/31", value: "P2P links" },
    ],
  },
  {
    title: "IPv6",
    rows: [
      { label: "Loopback", value: "::1/128" },
      { label: "Link-local", value: "FE80::/10" },
      { label: "Unique local", value: "FC00::/7" },
      { label: "Multicast", value: "FF00::/8" },
    ],
  },
  {
    title: "Admin distance",
    rows: [
      { label: "Connected", value: "0" },
      { label: "Static", value: "1" },
      { label: "eBGP", value: "20" },
      { label: "EIGRP", value: "90" },
      { label: "OSPF AD", value: "110" },
      { label: "RIP", value: "120" },
    ],
  },
  {
    title: "Switching",
    rows: [
      { label: "Native VLAN", value: "1" },
      { label: "802.1Q", value: "Tagged trunk" },
      { label: "STP root", value: "Lowest BID" },
      { label: "LACP", value: "Active / Passive" },
      { label: "Access port", value: "Single VLAN" },
      { label: "BPDU guard", value: "Err-disable edge" },
    ],
  },
  {
    title: "Routing",
    rows: [
      { label: "Default route", value: "0.0.0.0/0" },
      { label: "OSPF metric", value: "Cost" },
      { label: "RIP metric", value: "Hop count" },
      { label: "EIGRP metric", value: "BW + delay" },
      { label: "FHRP goal", value: "First-hop redundancy" },
      { label: "Longest match", value: "Most specific wins" },
    ],
  },
  {
    title: "ACL / NAT",
    rows: [
      { label: "Wildcard bit 0", value: "Must match" },
      { label: "Wildcard bit 1", value: "Ignore bit" },
      { label: "Inbound ACL", value: "Closer to source" },
      { label: "Outbound ACL", value: "Closer to dest" },
      { label: "PAT key", value: "Uses port translation" },
      { label: "Inside local", value: "Private host address" },
    ],
  },
  {
    title: "Troubleshooting",
    rows: [
      { label: "ping", value: "Reachability / ICMP" },
      { label: "traceroute", value: "Hop-by-hop path" },
      { label: "show ip int br", value: "Interface summary" },
      { label: "show vlan brief", value: "Access VLANs" },
      { label: "show ip route", value: "Routing table" },
      { label: "show cdp nei", value: "Direct neighbors" },
    ],
  },
  {
    title: "CCNA hits",
    rows: [
      { label: "Broadcast", value: "255.255.255.255" },
      { label: "Wildcard", value: "0=match, 255=ignore" },
      { label: "PAT", value: "Many-to-one NAT" },
      { label: "HSRP", value: "Virtual gateway" },
      { label: "Syslog", value: "UDP 514" },
      { label: "NTP", value: "UDP 123" },
    ],
  },
] as const;

export function CcnaQuickRefCard() {
  return (
    <section className="tool-card tool-card--quickref">
      <div className="tool-card__header">
        <div>
          <h3>CCNA Quick Ref</h3>
        </div>
      </div>

      <div className="helper-card__body">
        <div className="quickref-grid">
          {sections.map((section) => (
            <article className="quickref-group" key={section.title}>
              <strong className="quickref-group__title">{section.title}</strong>
              <div className="quickref-group__rows">
                {section.rows.map((row) => (
                  <div className="quickref-row" key={row.label}>
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
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
