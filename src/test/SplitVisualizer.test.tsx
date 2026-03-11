import { render, screen } from "@testing-library/react";
import { SplitVisualizer } from "@/components/SplitVisualizer";

describe("SplitVisualizer", () => {
  it("renders the current question subnet details", () => {
    render(
      <SplitVisualizer
        question={{
          addressFamily: "ipv4",
          difficulty: "easy",
          ip: "192.168.54.201",
          prefix: 26,
          network: "192.168.54.192",
          broadcast: "192.168.54.255",
          subnetMask: "255.255.255.192",
          wildcardMask: "0.0.0.63",
          blockSize: 64,
          focusOctet: 4,
          binaryOctets: ["11000000", "10101000", "00110110", "11001001"],
        }}
      />,
    );

    expect(screen.getByText("192.168.54.201/26")).toBeInTheDocument();
    expect(screen.getByText("255.255.255.192")).toBeInTheDocument();
    expect(screen.getByText("192.168.54.192 - 192.168.54.255")).toBeInTheDocument();
  });
});
