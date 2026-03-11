import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PowerTableCard } from "@/components/PowerTableCard";

const rows = Array.from({ length: 32 }, (_, exponent) => ({
  exponent,
  value: 2 ** exponent,
}));

describe("PowerTableCard", () => {
  it("shows only up to 8 bits by default and expands on demand", async () => {
    const user = userEvent.setup();
    const onVisibleBitsChange = vi.fn();

    render(<PowerTableCard rows={rows} visibleBits={8} onVisibleBitsChange={onVisibleBitsChange} />);

    expect(screen.getByText("2^7")).toBeInTheDocument();
    expect(screen.queryByText("2^8")).not.toBeInTheDocument();
    expect(screen.getByText("Wildcard")).toBeInTheDocument();
    expect(screen.getByText("/8")).toBeInTheDocument();
    expect(screen.getByText("Prefix")).toBeInTheDocument();
    expect(screen.getByText("Mask")).toBeInTheDocument();
    expect(screen.getByText("255 - mask")).toBeInTheDocument();
    expect(screen.getByText("255.0.0.0")).toBeInTheDocument();
    expect(screen.getByText("0.255.255.255")).toBeInTheDocument();
    expect(screen.getByText("Host chunk")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "16" }));
    expect(onVisibleBitsChange).toHaveBeenCalledWith(16);
  });
});
