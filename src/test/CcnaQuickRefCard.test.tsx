import { render, screen } from "@testing-library/react";
import { CcnaQuickRefCard } from "@/components/CcnaQuickRefCard";

describe("CcnaQuickRefCard", () => {
  it("shows common IP and CCNA values", () => {
    render(<CcnaQuickRefCard />);

    expect(screen.getByText("CCNA Quick Ref")).toBeInTheDocument();
    expect(screen.getByText("Private A")).toBeInTheDocument();
    expect(screen.getByText("10.0.0.0/8")).toBeInTheDocument();
    expect(screen.getByText("SSH")).toBeInTheDocument();
    expect(screen.getByText("22")).toBeInTheDocument();
    expect(screen.getByText("Subnet clues")).toBeInTheDocument();
    expect(screen.getByText("256 addrs / 254 hosts")).toBeInTheDocument();
    expect(screen.getByText("IPv6")).toBeInTheDocument();
    expect(screen.getByText("Link-local")).toBeInTheDocument();
    expect(screen.getByText("FE80::/10")).toBeInTheDocument();
    expect(screen.getByText("OSPF AD")).toBeInTheDocument();
    expect(screen.getByText("110")).toBeInTheDocument();
    expect(screen.getByText("BPDU guard")).toBeInTheDocument();
    expect(screen.getByText("Err-disable edge")).toBeInTheDocument();
    expect(screen.getByText("Longest match")).toBeInTheDocument();
    expect(screen.getByText("Most specific wins")).toBeInTheDocument();
    expect(screen.getByText("show ip route")).toBeInTheDocument();
  });
});
