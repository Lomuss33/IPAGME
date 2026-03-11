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

  it("renders the ARP-focused default story, compact picker, controls, and 3x3 board", () => {
    render(<NetworkWindow />);

    expect(screen.getByText("Network Window")).toBeInTheDocument();
    expect(screen.getByText("How IP moves traffic")).toBeInTheDocument();
    expect(screen.getByText("IP role: ARP ties an IPv4 address to the next-hop MAC on the local segment.")).toBeInTheDocument();
    expect(screen.getByText("ARP finds the gateway MAC")).toBeInTheDocument();
    expect(screen.getByText("The PC resolves the local gateway before it can send an off-subnet packet.")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Protocol story" })).toHaveValue("arp");
    expect(screen.getByRole("option", { name: "DHCP" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "SSH" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "OSPF" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "RADIUS" })).toBeInTheDocument();
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

  it("starts playback at the first ARP frame", () => {
    setViewportWidth(1280);
    render(<NetworkWindow />);

    click(screen.getByTestId("network-play"));

    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "2-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("ARP");
    expect(screen.getByTestId("device-status-pc")).toHaveTextContent("TX ARP");
    expect(screen.getByTestId("device-status-homeRouter")).toHaveTextContent("RX ARP");
    expect(screen.getByTestId("active-terminal-line")).toHaveTextContent("[pc] who-has 192.168.10.1?");
  });

  it("restarts the selected protocol when play is clicked again", () => {
    render(<NetworkWindow />);

    click(screen.getByTestId("network-play"));

    advance(800);

    click(screen.getByTestId("network-play"));

    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "2-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("ARP");
  });

  it("interrupts the current protocol when switching to another one", () => {
    render(<NetworkWindow />);

    click(screen.getByTestId("network-play"));

    advance(300);

    changeStory("web");

    expect(screen.getByText("Generic web traffic leaves the LAN")).toBeInTheDocument();
    expect(screen.getByText("Web router")).toBeInTheDocument();
    expect(screen.queryByTestId("active-packet")).not.toBeInTheDocument();

    click(screen.getByTestId("network-play"));

    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "2-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("GET");
  });

  it("runs one slow pass and stops on the final frame", () => {
    render(<NetworkWindow />);

    changeStory("web");
    click(screen.getByTestId("network-play"));

    let reachedFinalFrame = false;

    for (let index = 0; index < 20; index += 1) {
      advance(200);

      const packet = screen.getByTestId("active-packet");
      const coord = packet.getAttribute("data-coord");
      const label = screen.getByTestId("active-packet-label").textContent ?? "";

      if (coord === "2-1" && label === "HTML") {
        reachedFinalFrame = true;
        break;
      }
    }

    expect(reachedFinalFrame).toBe(true);
    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "2-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("HTML");

    advance(1200);

    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "2-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("HTML");
  });

  it("advances one frame at a time with the next button", () => {
    setViewportWidth(1280);
    render(<NetworkWindow />);

    changeStory("web");

    click(screen.getByTestId("network-step"));
    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "2-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("GET");
    expect(screen.getByTestId("active-terminal-line")).toHaveTextContent("[pc] GET targets an off-subnet host");

    click(screen.getByTestId("network-step"));
    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "0-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("NAT");
    expect(screen.getByTestId("active-terminal-line")).toHaveTextContent("[router] sends it to the next hop");

    click(screen.getByTestId("network-step"));
    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "0-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("200");
    expect(screen.getByTestId("active-terminal-line")).toHaveTextContent("[web] upstream routing continues");

    click(screen.getByTestId("network-step"));
    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "2-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("HTML");
    expect(screen.getByTestId("active-terminal-line")).toHaveTextContent("[web] upstream routing continues");

    click(screen.getByTestId("network-step"));
    expect(screen.getByTestId("active-packet")).toHaveAttribute("data-coord", "2-1");
    expect(screen.getByTestId("active-packet-label")).toHaveTextContent("GET");
    expect(screen.getByTestId("active-terminal-line")).toHaveTextContent("[pc] GET targets an off-subnet host");
  });

  it("falls back to shorter terminal explanations when the panel is tight", () => {
    setViewportWidth(700);
    render(<NetworkWindow />);

    click(screen.getByTestId("network-play"));

    expect(screen.getByTestId("active-terminal-line")).toHaveTextContent("[pc] who-has 192.168.10.1?");
    expect(screen.getByTestId("active-terminal-line").textContent).not.toContain("This opening step shows");
  });

  it("restores the last selected protocol from storage", () => {
    window.localStorage.setItem("ipagme-network-window", JSON.stringify({ selectedStoryId: "web" }));

    render(<NetworkWindow />);

    expect(screen.getByRole("combobox", { name: "Protocol story" })).toHaveValue("web");
    expect(screen.getByText("Generic web traffic leaves the LAN")).toBeInTheDocument();
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
