export type AddressFamily = "ipv4" | "ipv6";
export type Difficulty = "easy" | "medium" | "hard" | "mixed";
export type HelperTab = "visualizer" | "calculator";
export type NetworkStoryCategory = "core" | "transport" | "switching" | "routing" | "security";
export type NetworkStoryId =
  | "arp"
  | "broadcast"
  | "cdp"
  | "dhcp"
  | "dns"
  | "dot1q"
  | "fhrp"
  | "ftp"
  | "http"
  | "https"
  | "ipsec"
  | "ipv4"
  | "ipv6"
  | "lacp"
  | "lldp"
  | "nat"
  | "ntp"
  | "ospf"
  | "ping"
  | "radius"
  | "snmp"
  | "ssh"
  | "stp"
  | "syslog"
  | "tacacs"
  | "tcp"
  | "telnet"
  | "tftp"
  | "udp"
  | "web"
  | "wpa";
export type NetworkNodeId = "pc" | "server" | "homeRouter" | "webRouter" | "phone";

export interface QuizQuestion {
  addressFamily: AddressFamily;
  difficulty: Exclude<Difficulty, "mixed">;
  ip: string;
  prefix: number;
  network: string;
  broadcast: string;
  subnetMask: string;
  wildcardMask: string;
  blockSize: number;
  focusOctet: number;
  binaryOctets: string[];
}

export interface AnswerResult {
  isCorrect: boolean;
  submitted: string;
  normalizedSubmitted: string;
  correctNetwork: string;
  explanation: string;
}

export interface BinarySplit {
  networkBits: number;
  octets: string[];
}

export interface CalculatorResult {
  addressFamily: AddressFamily;
  ip: string;
  prefix: number;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  usableHosts: number;
  subnetMask: string;
  wildcardMask: string;
  blockSize: number;
  focusOctet: number;
  binarySplit: BinarySplit;
}

export interface PowerTableRow {
  exponent: number;
  value: number;
}

export interface SessionStats {
  score: number;
  streak: number;
  correctAnswers: number;
  totalAnswers: number;
  difficulty: Difficulty;
}

export interface NetworkGridCell {
  row: number;
  col: number;
}

export interface NetworkNodeBubble {
  id: NetworkNodeId;
  emoji: string;
  label: string;
  sublabel: string;
  ip: string;
  cell: NetworkGridCell;
}

export interface NetworkSegment {
  label: string;
  from: NetworkNodeId;
  to: NetworkNodeId;
  cells: NetworkGridCell[];
  terminalLineIndex: number;
}

export interface NetworkStory {
  id: NetworkStoryId;
  category: NetworkStoryCategory;
  label: string;
  title: string;
  summary: string;
  ipRole: string;
  nodes: NetworkNodeBubble[];
  terminalLines: string[];
  previewCells: NetworkGridCell[];
  segments: NetworkSegment[];
}
