import { render, screen } from "@testing-library/react";
import { CcnaCompareCard } from "@/components/CcnaCompareCard";

describe("CcnaCompareCard", () => {
  it("shows the dedicated CCNA comparison study blocks", () => {
    render(<CcnaCompareCard />);

    expect(screen.getByText("CCNA Compare")).toBeInTheDocument();
    expect(screen.getByText("TCP vs UDP")).toBeInTheDocument();
    expect(screen.getByText("Trunk vs Access")).toBeInTheDocument();
    expect(screen.getByText("Static vs Dynamic")).toBeInTheDocument();
    expect(screen.getByText("NAT vs PAT")).toBeInTheDocument();
    expect(screen.getByText("Std vs Ext ACL")).toBeInTheDocument();
    expect(screen.getByText("HSRP vs VRRP")).toBeInTheDocument();
    expect(
      screen.getByText(
        "TCP adds connection setup, ordering, and retransmission; UDP sends with less overhead and no delivery guarantee.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Use for normal internet access where many users share one public address.")).toBeInTheDocument();
    expect(screen.getByText("Use in mixed-vendor environments where interoperability matters.")).toBeInTheDocument();
  });
});
