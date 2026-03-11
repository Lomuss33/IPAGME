import { render, screen } from "@testing-library/react";
import { SubnetCalculator } from "@/components/SubnetCalculator";

describe("SubnetCalculator", () => {
  it("renders the extended subnet breakdown fields", () => {
    render(
      <SubnetCalculator
        input="10.44.199.3/20"
        onInputChange={() => {}}
        onInputKeyDown={() => {}}
        onSubmit={() => {}}
        error={null}
        isBusy={false}
        result={{
          addressFamily: "ipv4",
          ip: "10.44.199.3",
          prefix: 20,
          network: "10.44.192.0",
          broadcast: "10.44.207.255",
          firstHost: "10.44.192.1",
          lastHost: "10.44.207.254",
          usableHosts: 4094,
          subnetMask: "255.255.240.0",
          wildcardMask: "0.0.15.255",
          blockSize: 16,
          focusOctet: 3,
          binarySplit: {
            networkBits: 20,
            octets: ["00001010", "00101100", "11000111", "00000011"],
          },
        }}
      />,
    );

    expect(screen.getByText("255.255.240.0")).toBeInTheDocument();
    expect(screen.getByText("0.0.15.255")).toBeInTheDocument();
    expect(screen.getByText("10.44.192.0 - 10.44.207.255")).toBeInTheDocument();
  });
});
