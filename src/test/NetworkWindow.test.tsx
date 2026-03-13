import { act, fireEvent, render, screen } from "@testing-library/react";
import { NetworkWindow } from "@/components/NetworkWindow";

const defaultInnerWidth = window.innerWidth;

function click(element: HTMLElement) {
  act(() => {
    fireEvent.click(element);
  });
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
    writable: true,
  });

  act(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

function changeStory(storyId: string) {
  act(() => {
    fireEvent.change(screen.getByRole("combobox", { name: "Protocol story" }), {
      target: { value: storyId },
    });
  });
}

describe("NetworkWindow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    setViewportWidth(defaultInnerWidth);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    window.localStorage.clear();
    setViewportWidth(defaultInnerWidth);
  });

  it("renders the DHCP-focused default story, curated picker, controls, and 3x3 board", () => {
    render(<NetworkWindow />);

    expect(screen.getByText("Network Window")).toBeInTheDocument();
    expect(screen.getByText("How IP moves traffic")).toBeInTheDocument();
    expect(screen.getByText("IP role: DHCP gives the client usable IP settings before normal traffic starts.")).toBeInTheDocument();
    expect(screen.getByText("DHCP hands the phone a lease")).toBeInTheDocument();
    expect(screen.getByText("The phone asks the LAN for an address, gateway, and DNS settings.")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Protocol story" })).toHaveValue("dhcp");
    expect(screen.getByRole("option", { name: "DHCP" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "SSH" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "OSPF" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "IPsec" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Ping" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Web" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "RADIUS" })).not.toBeInTheDocument();
    expect(screen.getByTestId("network-play")).toBeInTheDocument();
    expect(screen.getByTestId("network-step")).toBeInTheDocument();
    expect(screen.getAllByTestId("network-window-cell")).toHaveLength(9);
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(screen.getByText("PC")).toBeInTheDocument();
    expect(screen.getByText("Proxmox")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("Home router")).toBeInTheDocument();
    expect(screen.getByText("Web router")).toBeInTheDocument();
  });

  it("updates content on protocol selection but stays idle until start", () => {
    render(<NetworkWindow />);

    changeStory("ssh");

    expect(screen.getByText("SSH opens an encrypted session")).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes("[phone] SYN -> 192.168.10.10:22"))).toBeInTheDocument();
    expect(screen.queryByTestId("active-packet")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".network-window__cell--preview").length).toBeGreaterThan(0);
  });

  it("switches to newly added CCNA protocol stories", () => {
    render(<NetworkWindow />);

    changeStory("dns");
    expect(screen.getByText("DNS resolves a name upstream")).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes("[pc] DNS query -> router cache"))).toBeInTheDocument();

    changeStory("ospf");
    expect(screen.getByText("OSPF exchanges routing updates")).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes("[router] OSPF hello keeps adjacency up"))).toBeInTheDocument();
  });

  it("starts playback at the first DHCP frame", () => {
    setViewportWidth(1280);
    render(<NetworkWindow />);

    click(screen.getByTestId("network-play"));

    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "1-2");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("DISC");
    expect(screen.getByTestId("device-status-phone")).toHaveTextContent("TX DISC");
    expect(screen.getByTestId("device-status-homeRouter")).toHaveTextContent("RX DISC");
    expect(screen.getByTestId("active-terminal-line")).toHaveTextContent("[phone] DHCPDISCOVER -> broadcast");
  });

  it("restarts the selected protocol when play is clicked again", () => {
    render(<NetworkWindow />);

    click(screen.getByTestId("network-play"));

    advance(800);

    click(screen.getByTestId("network-play"));

    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "1-2");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("DISC");
  });

  it("interrupts the current protocol when switching to another one", () => {
    render(<NetworkWindow />);

    click(screen.getByTestId("network-play"));

    advance(300);

    changeStory("nat");

    expect(screen.getByText("NAT translates the inside host")).toBeInTheDocument();
    expect(screen.getByText("Web router")).toBeInTheDocument();
    expect(screen.queryByTestId("active-packet")).not.toBeInTheDocument();

    click(screen.getByTestId("network-play"));

    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "2-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("IN");
  });

  it("runs one slow pass and stops on the final frame", () => {
    render(<NetworkWindow />);

    changeStory("nat");
    click(screen.getByTestId("network-play"));

    let reachedFinalFrame = false;

    for (let index = 0; index < 20; index += 1) {
      advance(200);

      const packet = screen.getByTestId("active-packet");
      const coord = packet.getAttribute("data-coord");
      const label = screen.getByTestId("active-packet-label").textContent ?? "";

      if (coord === "2-1" && label === "MAP") {
        reachedFinalFrame = true;
        break;
      }
    }

    expect(reachedFinalFrame).toBe(true);
    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "2-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("MAP");

    advance(1200);

    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "2-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("MAP");
  });

  it("advances one frame at a time with the next button", () => {
    setViewportWidth(1280);
    render(<NetworkWindow />);

    changeStory("nat");

    click(screen.getByTestId("network-step"));
    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "2-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("IN");
    expect(screen.getByTestId("active-terminal-line")).toHaveTextContent("[pc] private source enters the router");

    click(screen.getByTestId("network-step"));
    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "0-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("NAT");
    expect(screen.getByTestId("active-terminal-line")).toHaveTextContent("[router] translates to a public address");

    click(screen.getByTestId("network-step"));
    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "0-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("OUT");
    expect(screen.getByTestId("active-terminal-line")).toHaveTextContent("[upstream] sees the translated source");

    click(screen.getByTestId("network-step"));
    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "2-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("MAP");
    expect(screen.getByTestId("active-terminal-line")).toHaveTextContent("[upstream] sees the translated source");

    click(screen.getByTestId("network-step"));
    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "2-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("IN");
    expect(screen.getByTestId("active-terminal-line")).toHaveTextContent("[pc] private source enters the router");
  });

  it("falls back to shorter terminal explanations when the panel is tight", () => {
    setViewportWidth(700);
    render(<NetworkWindow />);

    click(screen.getByTestId("network-play"));

    expect(screen.getByTestId("active-terminal-line")).toHaveTextContent("[phone] DHCPDISCOVER -> broadcast");
    expect(screen.getByTestId("active-terminal-line").textContent).not.toContain("This opening step shows");
  });

  it("restores the last selected protocol from storage", () => {
    window.localStorage.setItem("ipagme-network-window", JSON.stringify({ selectedStoryId: "nat" }));

    render(<NetworkWindow />);

    expect(screen.getByRole("combobox", { name: "Protocol story" })).toHaveValue("nat");
    expect(screen.getByText("NAT translates the inside host")).toBeInTheDocument();
    expect(screen.getByText("Web router")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
  });

  it("keeps the protocol picker compact while the message panel stays dominant", () => {
    render(<NetworkWindow />);

    const picker = screen.getByRole("combobox", { name: "Protocol story" });
    expect(picker).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Core" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Transport" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Security" })).not.toBeInTheDocument();
  });
});
