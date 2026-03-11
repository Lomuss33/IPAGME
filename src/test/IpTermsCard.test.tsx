import { render, screen } from "@testing-library/react";
import { IpTermsCard } from "@/components/IpTermsCard";
import type { QuizQuestion } from "@/app/types";

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

describe("IpTermsCard", () => {
  it("shows current subnet terms and practical CCNA meanings", () => {
    render(<IpTermsCard question={question} />);

    expect(screen.getByText("IP Terms")).toBeInTheDocument();
    expect(screen.getByText("Subnet ID")).toBeInTheDocument();
    expect(screen.getByText("192.168.10.64/26")).toBeInTheDocument();
    expect(screen.getByText("Address window")).toBeInTheDocument();
    expect(screen.getByText("192.168.10.64 - 192.168.10.127")).toBeInTheDocument();
    expect(screen.getByText("Wildcard use")).toBeInTheDocument();
    expect(screen.getByText("ACL / OSPF")).toBeInTheDocument();
    expect(screen.getByText("Gateway")).toBeInTheDocument();
    expect(screen.getByText("Off-subnet next hop")).toBeInTheDocument();
    expect(screen.getByText("Broadcast domain")).toBeInTheDocument();
    expect(screen.getByText("One VLAN / subnet")).toBeInTheDocument();
  });
});
