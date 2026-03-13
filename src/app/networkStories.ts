import type { NetworkGridCell, NetworkNodeBubble, NetworkSegment, NetworkStory, NetworkStoryCategory, NetworkStoryId } from "@/app/types";

export const defaultNetworkStoryId: NetworkStoryId = "dhcp";
const networkStoryCategories: { id: NetworkStoryCategory; label: string }[] = [
  { id: "core", label: "Core" },
  { id: "transport", label: "Transport" },
  { id: "switching", label: "Switching" },
  { id: "routing", label: "Routing" },
  { id: "security", label: "Security" },
];

function cell(row: number, col: number): NetworkGridCell {
  return { row, col };
}

function reversePath(cells: readonly NetworkGridCell[]) {
  return [...cells].reverse().map(({ row, col }) => cell(row, col));
}

function segment(
  label: string,
  from: NetworkSegment["from"],
  to: NetworkSegment["to"],
  cells: readonly NetworkGridCell[],
  terminalLineIndex: number,
): NetworkSegment {
  return {
    label,
    from,
    to,
    cells: cells.map(({ row, col }) => cell(row, col)),
    terminalLineIndex,
  };
}

function mergePreviewCells(...paths: readonly NetworkGridCell[][]) {
  const seen = new Set<string>();
  const merged: NetworkGridCell[] = [];

  for (const path of paths) {
    for (const item of path) {
      const key = `${item.row}-${item.col}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      merged.push(cell(item.row, item.col));
    }
  }

  return merged;
}

const nodeCatalog: Record<NetworkNodeBubble["id"], Omit<NetworkNodeBubble, "cell">> = {
  pc: {
    id: "pc",
    emoji: "\u{1F4BB}",
    label: "PC",
    sublabel: "Client",
    ip: "192.168.10.20",
  },
  server: {
    id: "server",
    emoji: "\u{1F5C4}\uFE0F",
    label: "Proxmox",
    sublabel: "Server",
    ip: "192.168.10.10",
  },
  homeRouter: {
    id: "homeRouter",
    emoji: "\u{1F4E1}",
    label: "Home router",
    sublabel: "Gateway",
    ip: "192.168.10.1",
  },
  webRouter: {
    id: "webRouter",
    emoji: "\u{1F310}",
    label: "Web router",
    sublabel: "Upstream",
    ip: "198.51.100.1",
  },
  phone: {
    id: "phone",
    emoji: "\u{1F4F1}",
    label: "Phone",
    sublabel: "Client",
    ip: "192.168.10.34",
  },
};

function node(id: NetworkNodeBubble["id"], row: number, col: number): NetworkNodeBubble {
  return {
    ...nodeCatalog[id],
    cell: cell(row, col),
  };
}

const allNodes = [
  node("server", 0, 0),
  node("webRouter", 0, 2),
  node("homeRouter", 1, 1),
  node("pc", 2, 0),
  node("phone", 2, 2),
];

function cloneNodes() {
  return allNodes.map((item) => ({
    ...item,
    cell: cell(item.cell.row, item.cell.col),
  }));
}

const serverLane = [cell(1, 0)];
const upstreamLane = [cell(0, 1)];
const phoneLane = [cell(1, 2)];
const pcLane = [cell(2, 1)];

const categoryByStoryId: Record<NetworkStoryId, NetworkStoryCategory> = {
  dhcp: "core",
  dns: "core",
  arp: "core",
  ping: "core",
  broadcast: "core",
  ipv4: "core",
  ipv6: "core",
  nat: "core",
  web: "core",
  tcp: "transport",
  udp: "transport",
  telnet: "transport",
  ssh: "transport",
  http: "transport",
  https: "transport",
  ftp: "transport",
  tftp: "transport",
  dot1q: "switching",
  cdp: "switching",
  lldp: "switching",
  lacp: "switching",
  stp: "switching",
  snmp: "routing",
  syslog: "routing",
  ntp: "routing",
  ospf: "routing",
  fhrp: "routing",
  radius: "security",
  tacacs: "security",
  ipsec: "security",
  wpa: "security",
};

function story(
  id: NetworkStoryId,
  label: string,
  title: string,
  summary: string,
  ipRole: string,
  terminalLines: string[],
  previewPaths: readonly NetworkGridCell[][],
  segments: NetworkSegment[],
): NetworkStory {
  return {
    id,
    category: categoryByStoryId[id],
    label,
    title,
    summary,
    ipRole,
    nodes: cloneNodes(),
    terminalLines,
    previewCells: mergePreviewCells(...previewPaths),
    segments,
  };
}

export const networkStories: NetworkStory[] = [
  story(
    "dhcp",
    "DHCP",
    "DHCP hands the phone a lease",
    "The phone asks the LAN for an address, gateway, and DNS settings.",
    "DHCP gives the client usable IP settings before normal traffic starts.",
    [
      "[phone] DHCPDISCOVER -> broadcast",
      "[router] DHCPOFFER -> 192.168.10.34/24",
      "[phone] DHCPREQUEST / ACK saved",
    ],
    [phoneLane],
    [
      segment("DISC", "phone", "homeRouter", phoneLane, 0),
      segment("OFFER", "homeRouter", "phone", reversePath(phoneLane), 1),
      segment("REQ", "phone", "homeRouter", phoneLane, 2),
      segment("ACK", "homeRouter", "phone", reversePath(phoneLane), 2),
    ],
  ),
  story(
    "dns",
    "DNS",
    "DNS resolves a name upstream",
    "The PC asks for a domain lookup, then the router relays it to the upstream resolver.",
    "DNS maps a name to an IP so the host knows where to send traffic.",
    [
      "[pc] DNS query -> router cache",
      "[router] forwards query upstream",
      "[resolver] answer returns with the IP",
    ],
    [pcLane, upstreamLane],
    [
      segment("QUERY", "pc", "homeRouter", pcLane, 0),
      segment("DNS", "homeRouter", "webRouter", upstreamLane, 1),
      segment("ANS", "webRouter", "homeRouter", reversePath(upstreamLane), 2),
      segment("IP", "homeRouter", "pc", reversePath(pcLane), 2),
    ],
  ),
  story(
    "arp",
    "ARP",
    "ARP finds the gateway MAC",
    "The PC resolves the local gateway before it can send an off-subnet packet.",
    "ARP ties an IPv4 address to the next-hop MAC on the local segment.",
    [
      "[pc] who-has 192.168.10.1?",
      "[router] ARP reply with gateway MAC",
      "[pc] frame can now leave the host",
    ],
    [pcLane],
    [
      segment("ARP", "pc", "homeRouter", pcLane, 0),
      segment("MAC", "homeRouter", "pc", reversePath(pcLane), 1),
    ],
  ),
  story(
    "ping",
    "Ping",
    "Ping checks the default gateway",
    "The PC sends an ICMP echo to confirm the gateway answers.",
    "ICMP verifies reachability and basic latency.",
    [
      "[pc] ICMP Echo -> 192.168.10.1",
      "[router] ICMP Echo Reply",
      "[pc] latency measured",
    ],
    [pcLane],
    [
      segment("ECHO", "pc", "homeRouter", pcLane, 0),
      segment("REPLY", "homeRouter", "pc", reversePath(pcLane), 1),
    ],
  ),
  story(
    "broadcast",
    "Bcast",
    "Broadcast stays in the LAN",
    "A local broadcast fans out inside the subnet instead of crossing the internet edge.",
    "Broadcast traffic is scoped to the local network boundary.",
    [
      "[pc] BCAST -> 192.168.10.255",
      "[router] keeps it inside the LAN",
      "[server/phone] local frame received",
    ],
    [pcLane, serverLane, phoneLane],
    [
      segment("BCAST", "pc", "homeRouter", pcLane, 0),
      segment("BCAST", "homeRouter", "server", reversePath(serverLane), 1),
      segment("BCAST", "homeRouter", "phone", reversePath(phoneLane), 2),
    ],
  ),
  story(
    "tcp",
    "TCP",
    "TCP opens a reliable session",
    "The phone builds a connection to the server with ordered, acknowledged delivery.",
    "TCP adds state, sequencing, and retransmission above IP.",
    [
      "[phone] SYN toward the server",
      "[server] SYN-ACK comes back",
      "[phone] ACK completes the session",
    ],
    [phoneLane, serverLane],
    [
      segment("SYN", "phone", "homeRouter", phoneLane, 0),
      segment("SYN", "homeRouter", "server", reversePath(serverLane), 0),
      segment("SYNACK", "server", "homeRouter", serverLane, 1),
      segment("SYNACK", "homeRouter", "phone", reversePath(phoneLane), 1),
      segment("ACK", "phone", "homeRouter", phoneLane, 2),
      segment("ACK", "homeRouter", "server", reversePath(serverLane), 2),
    ],
  ),
  story(
    "udp",
    "UDP",
    "UDP sends without session setup",
    "The PC sends a small message without building a connection first.",
    "UDP trades reliability for lower overhead and fast delivery.",
    [
      "[pc] UDP datagram leaves the host",
      "[router] forwards the packet immediately",
      "[service] receives it without handshake",
    ],
    [pcLane, upstreamLane],
    [
      segment("UDP", "pc", "homeRouter", pcLane, 0),
      segment("UDP", "homeRouter", "webRouter", upstreamLane, 1),
      segment("RX", "webRouter", "homeRouter", reversePath(upstreamLane), 2),
    ],
  ),
  story(
    "ipv4",
    "IPv4",
    "IPv4 decides the next hop",
    "The PC compares the destination with its subnet and sends off-subnet traffic to the gateway.",
    "IPv4 addressing decides whether traffic stays local or goes to the gateway.",
    [
      "[pc] destination is off-subnet",
      "[pc] sends packet to default gateway",
      "[router] forwards toward the next network",
    ],
    [pcLane, upstreamLane],
    [
      segment("IPv4", "pc", "homeRouter", pcLane, 0),
      segment("ROUTE", "homeRouter", "webRouter", upstreamLane, 1),
    ],
  ),
  story(
    "ipv6",
    "IPv6",
    "IPv6 forwards with a global address",
    "The phone uses an IPv6 destination and the router forwards it upstream.",
    "IPv6 gives the host global addressing and next-hop routing without NAT.",
    [
      "[phone] IPv6 packet leaves the LAN",
      "[router] forwards the global route",
      "[upstream] continues native IPv6",
    ],
    [phoneLane, upstreamLane],
    [
      segment("IPv6", "phone", "homeRouter", phoneLane, 0),
      segment("V6", "homeRouter", "webRouter", upstreamLane, 1),
    ],
  ),
  story(
    "dot1q",
    "802.1Q",
    "802.1Q carries a VLAN tag",
    "The router-on-a-stick path keeps the VLAN tag on the trunk side.",
    "802.1Q preserves VLAN identity across the tagged link.",
    [
      "[pc] frame enters the VLAN path",
      "[router] adds or reads the tag",
      "[trunk] keeps VLAN separation intact",
    ],
    [pcLane, serverLane],
    [
      segment("TAG", "pc", "homeRouter", pcLane, 0),
      segment("VLAN", "homeRouter", "server", reversePath(serverLane), 1),
      segment("TAG", "server", "homeRouter", serverLane, 2),
    ],
  ),
  story(
    "cdp",
    "CDP",
    "CDP advertises Cisco neighbors",
    "The router announces itself so the next Cisco device can learn local details.",
    "CDP shares local device identity and capabilities on Cisco links.",
    [
      "[router] CDP advertises locally",
      "[neighbor] learns the Cisco details",
      "[ops] can map the adjacent device",
    ],
    [upstreamLane],
    [
      segment("CDP", "homeRouter", "webRouter", upstreamLane, 0),
      segment("SEEN", "webRouter", "homeRouter", reversePath(upstreamLane), 1),
    ],
  ),
  story(
    "lldp",
    "LLDP",
    "LLDP discovers a standards-based neighbor",
    "The router shares neighbor information using the vendor-neutral discovery protocol.",
    "LLDP exposes local link identity across multi-vendor gear.",
    [
      "[router] LLDP advertises locally",
      "[neighbor] stores the discovery data",
      "[ops] reads the link neighbor table",
    ],
    [upstreamLane],
    [
      segment("LLDP", "homeRouter", "webRouter", upstreamLane, 0),
      segment("MAP", "webRouter", "homeRouter", reversePath(upstreamLane), 1),
    ],
  ),
  story(
    "lacp",
    "LACP",
    "LACP negotiates an EtherChannel",
    "The router and server agree to bundle links into one logical path.",
    "LACP forms and maintains an aggregated link set.",
    [
      "[server] LACP proposal goes out",
      "[router] agrees on the bundle",
      "[bundle] traffic uses the channel",
    ],
    [serverLane],
    [
      segment("LACP", "server", "homeRouter", serverLane, 0),
      segment("BNDL", "homeRouter", "server", reversePath(serverLane), 1),
      segment("UP", "server", "homeRouter", serverLane, 2),
    ],
  ),
  story(
    "stp",
    "STP",
    "Rapid PVST+ keeps the tree loop-free",
    "Bridge protocol messages define the active path and block redundant loops.",
    "STP chooses safe forwarding links and prevents switching loops.",
    [
      "[switch] BPDUs move across the link",
      "[tree] root and roles are selected",
      "[port] looped path stays blocked",
    ],
    [serverLane, upstreamLane],
    [
      segment("BPDU", "server", "homeRouter", serverLane, 0),
      segment("ROOT", "homeRouter", "webRouter", upstreamLane, 1),
      segment("BLK", "webRouter", "homeRouter", reversePath(upstreamLane), 2),
    ],
  ),
  story(
    "telnet",
    "Telnet",
    "Telnet reaches a remote CLI",
    "The PC opens an old plaintext management session to the router.",
    "Telnet connects to a device CLI but does not encrypt credentials or traffic.",
    [
      "[pc] Telnet request leaves the host",
      "[router] opens the remote CLI",
      "[session] management traffic is plaintext",
    ],
    [pcLane],
    [
      segment("TEL", "pc", "homeRouter", pcLane, 0),
      segment("CLI", "homeRouter", "pc", reversePath(pcLane), 1),
    ],
  ),
  story(
    "ssh",
    "SSH",
    "SSH opens an encrypted session",
    "The phone reaches the server with a protected remote shell.",
    "SSH secures management access with encryption and authentication.",
    [
      "[phone] SYN -> 192.168.10.10:22",
      "[router] forwards it inside the LAN",
      "[server] encrypted shell is ready",
    ],
    [phoneLane, serverLane],
    [
      segment("SYN", "phone", "homeRouter", phoneLane, 0),
      segment("SSH", "homeRouter", "server", reversePath(serverLane), 1),
      segment("OK", "server", "homeRouter", serverLane, 2),
      segment("SSH", "homeRouter", "phone", reversePath(phoneLane), 2),
    ],
  ),
  story(
    "http",
    "HTTP",
    "HTTP requests a page in cleartext",
    "The PC sends a web request without transport encryption.",
    "HTTP carries web application data over IP without confidentiality.",
    [
      "[pc] HTTP GET leaves the LAN",
      "[router] forwards it upstream",
      "[web] response comes back in cleartext",
    ],
    [pcLane, upstreamLane],
    [
      segment("GET", "pc", "homeRouter", pcLane, 0),
      segment("HTTP", "homeRouter", "webRouter", upstreamLane, 1),
      segment("200", "webRouter", "homeRouter", reversePath(upstreamLane), 2),
      segment("HTML", "homeRouter", "pc", reversePath(pcLane), 2),
    ],
  ),
  story(
    "https",
    "HTTPS",
    "HTTPS wraps the site in TLS",
    "The same web request now rides in an encrypted session.",
    "HTTPS protects web application data in transit with TLS.",
    [
      "[pc] TLS handshake starts",
      "[router] forwards the secure flow",
      "[site] encrypted content returns",
    ],
    [pcLane, upstreamLane],
    [
      segment("TLS", "pc", "homeRouter", pcLane, 0),
      segment("HTTPS", "homeRouter", "webRouter", upstreamLane, 1),
      segment("200", "webRouter", "homeRouter", reversePath(upstreamLane), 2),
      segment("TLS", "homeRouter", "pc", reversePath(pcLane), 2),
    ],
  ),
  story(
    "ftp",
    "FTP",
    "FTP moves a file to the server",
    "The PC opens a control session and pushes data toward the homelab server.",
    "FTP uses IP to reach the host and separate flows for control and data.",
    [
      "[pc] FTP control starts",
      "[router] forwards the file session",
      "[server] file data lands on storage",
    ],
    [pcLane, serverLane],
    [
      segment("FTP", "pc", "homeRouter", pcLane, 0),
      segment("DATA", "homeRouter", "server", reversePath(serverLane), 1),
      segment("226", "server", "homeRouter", serverLane, 2),
      segment("OK", "homeRouter", "pc", reversePath(pcLane), 2),
    ],
  ),
  story(
    "tftp",
    "TFTP",
    "TFTP pulls a small image quickly",
    "A lightweight file copy uses UDP with minimal overhead.",
    "TFTP is simple and fast for small network-device transfers.",
    [
      "[pc] TFTP RRQ goes out",
      "[router] forwards the block exchange",
      "[server] sends the next file block",
    ],
    [pcLane, serverLane],
    [
      segment("RRQ", "pc", "homeRouter", pcLane, 0),
      segment("BLK", "homeRouter", "server", reversePath(serverLane), 1),
      segment("ACK", "server", "homeRouter", serverLane, 2),
      segment("ACK", "homeRouter", "pc", reversePath(pcLane), 2),
    ],
  ),
  story(
    "snmp",
    "SNMP",
    "SNMP polls router counters",
    "The PC checks interface and device health from the router.",
    "SNMP carries monitoring data and management values over IP.",
    [
      "[pc] SNMP GET polls the router",
      "[router] returns counters and status",
      "[ops] graphing can now update",
    ],
    [pcLane],
    [
      segment("GET", "pc", "homeRouter", pcLane, 0),
      segment("MIB", "homeRouter", "pc", reversePath(pcLane), 1),
    ],
  ),
  story(
    "syslog",
    "Syslog",
    "Syslog sends device logs to the server",
    "The router exports events so they are preserved away from the device.",
    "Syslog centralizes log messages for visibility and retention.",
    [
      "[router] emits a local event",
      "[router] ships the syslog message",
      "[server] stores the log entry",
    ],
    [serverLane],
    [
      segment("LOG", "homeRouter", "server", reversePath(serverLane), 0),
      segment("SAVE", "server", "homeRouter", serverLane, 1),
    ],
  ),
  story(
    "ntp",
    "NTP",
    "NTP synchronizes the clock",
    "The router asks upstream for accurate time so logs and auth stay aligned.",
    "NTP keeps timestamps consistent across devices and services.",
    [
      "[router] sends an NTP request",
      "[upstream] replies with time data",
      "[router] clock adjusts to the source",
    ],
    [upstreamLane],
    [
      segment("NTP", "homeRouter", "webRouter", upstreamLane, 0),
      segment("TIME", "webRouter", "homeRouter", reversePath(upstreamLane), 1),
    ],
  ),
  story(
    "ospf",
    "OSPF",
    "OSPF exchanges routing updates",
    "The router and upstream neighbor share topology information.",
    "OSPF advertises routes and computes the best path through the network.",
    [
      "[router] OSPF hello keeps adjacency up",
      "[neighbor] shares LSAs and routes",
      "[router] installs the best path",
    ],
    [upstreamLane],
    [
      segment("HELLO", "homeRouter", "webRouter", upstreamLane, 0),
      segment("LSA", "webRouter", "homeRouter", reversePath(upstreamLane), 1),
      segment("SPF", "homeRouter", "webRouter", upstreamLane, 2),
    ],
  ),
  story(
    "fhrp",
    "FHRP",
    "FHRP protects the default gateway",
    "The router and standby neighbor maintain a virtual gateway path.",
    "FHRP keeps the first hop available if the active gateway fails.",
    [
      "[active] sends FHRP hellos",
      "[standby] tracks the virtual gateway",
      "[LAN] keeps a stable default gateway",
    ],
    [upstreamLane, pcLane],
    [
      segment("VIRT", "homeRouter", "webRouter", upstreamLane, 0),
      segment("GW", "homeRouter", "pc", reversePath(pcLane), 2),
    ],
  ),
  story(
    "nat",
    "NAT",
    "NAT translates the inside host",
    "The router rewrites the local source before forwarding it upstream.",
    "NAT changes addressing as traffic crosses the edge.",
    [
      "[pc] private source enters the router",
      "[router] translates to a public address",
      "[upstream] sees the translated source",
    ],
    [pcLane, upstreamLane],
    [
      segment("IN", "pc", "homeRouter", pcLane, 0),
      segment("NAT", "homeRouter", "webRouter", upstreamLane, 1),
      segment("OUT", "webRouter", "homeRouter", reversePath(upstreamLane), 2),
      segment("MAP", "homeRouter", "pc", reversePath(pcLane), 2),
    ],
  ),
  story(
    "radius",
    "RADIUS",
    "RADIUS validates remote access",
    "The router checks centralized credentials before allowing entry.",
    "RADIUS centralizes AAA for network access decisions.",
    [
      "[router] sends a RADIUS access-request",
      "[server] validates the user policy",
      "[router] applies the result to access",
    ],
    [serverLane],
    [
      segment("AAA", "homeRouter", "server", reversePath(serverLane), 0),
      segment("ACPT", "server", "homeRouter", serverLane, 1),
    ],
  ),
  story(
    "tacacs",
    "TACACS+",
    "TACACS+ authorizes admin commands",
    "The router asks a central AAA server before allowing privileged actions.",
    "TACACS+ centralizes device administration and command authorization.",
    [
      "[router] sends a TACACS+ request",
      "[server] returns authz and policy",
      "[router] permits the admin command",
    ],
    [serverLane],
    [
      segment("AUTH", "homeRouter", "server", reversePath(serverLane), 0),
      segment("OK", "server", "homeRouter", serverLane, 1),
    ],
  ),
  story(
    "ipsec",
    "IPsec",
    "IPsec protects traffic across the edge",
    "The phone's traffic is encrypted before it heads to the outside network.",
    "IPsec secures packets between network endpoints over untrusted links.",
    [
      "[phone] plain packet enters the gateway",
      "[router] encrypts and encapsulates it",
      "[peer] receives the protected packet",
    ],
    [phoneLane, upstreamLane],
    [
      segment("IPSEC", "phone", "homeRouter", phoneLane, 0),
      segment("ESP", "homeRouter", "webRouter", upstreamLane, 1),
      segment("DEC", "webRouter", "homeRouter", reversePath(upstreamLane), 2),
    ],
  ),
  story(
    "wpa",
    "WPA2/3",
    "WPA secures the wireless client",
    "The phone authenticates to Wi-Fi before it can use the LAN.",
    "WPA2/WPA3 protects wireless access and client traffic.",
    [
      "[phone] starts the Wi-Fi handshake",
      "[router] validates the wireless security",
      "[phone] joins the protected WLAN",
    ],
    [phoneLane],
    [
      segment("WPA", "phone", "homeRouter", phoneLane, 0),
      segment("JOIN", "homeRouter", "phone", reversePath(phoneLane), 1),
    ],
  ),
  story(
    "web",
    "Web",
    "Generic web traffic leaves the LAN",
    "A simple off-subnet web flow still shows the default-gateway path.",
    "IP uses the gateway first whenever the destination is off-subnet.",
    [
      "[pc] GET targets an off-subnet host",
      "[router] sends it to the next hop",
      "[web] upstream routing continues",
    ],
    [pcLane, upstreamLane],
    [
      segment("GET", "pc", "homeRouter", pcLane, 0),
      segment("NAT", "homeRouter", "webRouter", upstreamLane, 1),
      segment("200", "webRouter", "homeRouter", reversePath(upstreamLane), 2),
      segment("HTML", "homeRouter", "pc", reversePath(pcLane), 2),
    ],
  ),
];

const networkWindowStoryIds: NetworkStoryId[] = [
  "dhcp",
  "dns",
  "nat",
  "tcp",
  "udp",
  "ssh",
  "https",
  "tftp",
  "dot1q",
  "stp",
  "lacp",
  "ospf",
  "ipsec",
];

export const networkWindowStories = networkWindowStoryIds
  .map((storyId) => networkStories.find((story) => story.id === storyId))
  .filter((story): story is NetworkStory => Boolean(story));

export const networkWindowStoryCategories = networkStoryCategories.filter((category) =>
  networkWindowStories.some((story) => story.category === category.id),
);
