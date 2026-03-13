import { render, screen } from "@testing-library/react";
import type { QuizQuestion } from "@/app/types";
import { OsiTcpModelCard } from "@/components/OsiTcpModelCard";
import { RoutingStudyCard } from "@/components/RoutingStudyCard";
import { SecurityServicesCard } from "@/components/SecurityServicesCard";
import { SwitchingControlCard } from "@/components/SwitchingControlCard";
import { WanTechCard } from "@/components/WanTechCard";

const question: QuizQuestion = {
  addressFamily: "ipv4",
  difficulty: "easy",
  ip: "192.168.10.77",
  prefix: 26,
  network: "192.168.10.64",
  broadcast: "192.168.10.127",
  subnetMask: "255.255.255.192",
  wildcardMask: "0.0.0.63",
  blockSize: 64,
  focusOctet: 4,
  binaryOctets: ["11000000", "10101000", "00001010", "01001101"],
};

describe("expanded networking study cards", () => {
  it("shows the OSI and TCP/IP layer map", () => {
    render(<OsiTcpModelCard />);

    expect(screen.getByText("OSI / TCP-IP 7-Modell")).toBeInTheDocument();
    expect(screen.getByText("L3 Net")).toBeInTheDocument();
    expect(screen.getByText("Internet")).toBeInTheDocument();
    expect(screen.getByText("IP, ICMP, OSPF, routing")).toBeInTheDocument();
    expect(screen.getByText("PDU trail")).toBeInTheDocument();
  });

  it("shows VLSM, OSPF/SPF, and EIGRP reminders with the current drill", () => {
    render(<RoutingStudyCard question={question} />);

    expect(screen.getByText("Routing / VLSM")).toBeInTheDocument();
    expect(screen.getByText("Current drill")).toBeInTheDocument();
    expect(screen.getByText("192.168.10.77/26")).toBeInTheDocument();
    expect(screen.getByText("OSPF / SPF-Berechnung")).toBeInTheDocument();
    expect(screen.getByText("Cost = reference bandwidth / interface bandwidth.")).toBeInTheDocument();
    expect(screen.getByText("EIGRP reminder")).toBeInTheDocument();
    expect(screen.getByText("90 for internal routes, 170 for external routes.")).toBeInTheDocument();
  });

  it("shows MPLS, PPP, and Frame Relay WAN cues", () => {
    render(<WanTechCard />);

    expect(screen.getByText("WAN / MPLS / PPP")).toBeInTheDocument();
    expect(screen.getByText("MPLS")).toBeInTheDocument();
    expect(screen.getByText("PPP")).toBeInTheDocument();
    expect(screen.getByText("Frame Relay")).toBeInTheDocument();
    expect(screen.getByText("A DLCI identifies the PVC locally; it has only local significance.")).toBeInTheDocument();
  });

  it("shows switching reminders for STP, VLANs, and EtherChannel", () => {
    render(<SwitchingControlCard />);

    expect(screen.getByText("Switching Control")).toBeInTheDocument();
    expect(screen.getByText("STP (802.1D / w / s)")).toBeInTheDocument();
    expect(screen.getByText("802.1w")).toBeInTheDocument();
    expect(screen.getByText("RSTP")).toBeInTheDocument();
    expect(screen.getByText("VLAN reminders")).toBeInTheDocument();
    expect(screen.getByText("EtherChannel (LACP / PAgP)")).toBeInTheDocument();
  });

  it("shows ACL, AAA, and NAT/PAT reminders", () => {
    render(<SecurityServicesCard />);

    expect(screen.getByText("ACL / AAA / NAT")).toBeInTheDocument();
    expect(screen.getByText("ACL reminders")).toBeInTheDocument();
    expect(screen.getByText("AAA flow")).toBeInTheDocument();
    expect(screen.getByText("NAT / PAT view")).toBeInTheDocument();
    expect(screen.getByText("RADIUS is common for network access; TACACS+ is stronger for device administration and command control.")).toBeInTheDocument();
  });
});
