import { useDeferredValue, useState } from "react";
import type { ReactNode } from "react";
import type { QuizQuestion } from "@/app/types";
import { CcnaCompareCard } from "@/components/CcnaCompareCard";
import { CcnaQuickRefCard } from "@/components/CcnaQuickRefCard";
import { NetworkWindow } from "@/components/NetworkWindow";
import { OsiTcpModelCard } from "@/components/OsiTcpModelCard";
import { RoutingStudyCard } from "@/components/RoutingStudyCard";
import { SecurityServicesCard } from "@/components/SecurityServicesCard";
import { SwitchingControlCard } from "@/components/SwitchingControlCard";
import { WanTechCard } from "@/components/WanTechCard";

type GuideCategory = "all" | "reference" | "models" | "routing" | "wan" | "switching" | "security";

interface NetworkingGuidePageProps {
  question: QuizQuestion | null;
}

interface GuideCardDefinition {
  id: string;
  title: string;
  category: Exclude<GuideCategory, "all">;
  keywords: string[];
  render: (question: QuizQuestion | null) => ReactNode;
}

const guideCategories: { id: GuideCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "reference", label: "Reference" },
  { id: "models", label: "Models" },
  { id: "routing", label: "Routing" },
  { id: "wan", label: "WAN" },
  { id: "switching", label: "Switching" },
  { id: "security", label: "Security" },
];

const guideCards: GuideCardDefinition[] = [
  {
    id: "quickref",
    title: "CCNA Quick Ref",
    category: "reference",
    keywords: ["ports", "ipv4", "ipv6", "admin distance", "commands", "ccna"],
    render: () => <CcnaQuickRefCard />,
  },
  {
    id: "compare",
    title: "CCNA Compare",
    category: "reference",
    keywords: ["tcp", "udp", "nat", "pat", "acl", "hsrp", "vrrp", "compare"],
    render: () => <CcnaCompareCard />,
  },
  {
    id: "osi",
    title: "OSI / TCP-IP 7-Modell",
    category: "models",
    keywords: ["osi", "tcp/ip", "layers", "pdu", "router", "switch"],
    render: () => <OsiTcpModelCard />,
  },
  {
    id: "routing",
    title: "Routing / VLSM",
    category: "routing",
    keywords: ["vlsm", "ospf", "spf", "eigrp", "summarization", "cost"],
    render: (question) => <RoutingStudyCard question={question} />,
  },
  {
    id: "wan",
    title: "WAN / MPLS / PPP",
    category: "wan",
    keywords: ["mpls", "ppp", "frame relay", "dlci", "lcp", "ncp"],
    render: () => <WanTechCard />,
  },
  {
    id: "switching",
    title: "Switching Control",
    category: "switching",
    keywords: ["stp", "rstp", "mst", "vlan", "etherchannel", "lacp", "pagp"],
    render: () => <SwitchingControlCard />,
  },
  {
    id: "security",
    title: "ACL / AAA / NAT",
    category: "security",
    keywords: ["acl", "aaa", "nat", "pat", "radius", "tacacs"],
    render: () => <SecurityServicesCard />,
  },
];

export function NetworkingGuidePage({ question }: NetworkingGuidePageProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<GuideCategory>("all");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const filteredCards = guideCards.filter((card) => {
    const matchesCategory = activeCategory === "all" || card.category === activeCategory;
    const haystack = `${card.title} ${card.keywords.join(" ")}`.toLowerCase();
    const matchesSearch = deferredSearch.length === 0 || haystack.includes(deferredSearch);
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="guide-page">
      <section className="guide-page__hero">
        <div>
          <p className="eyebrow">Networking Guide</p>
          <h2>Reminder, lookup, and visualization deck</h2>
          <p className="guide-page__copy">
            Bilingual helper cards for core network engineering topics, from OSI and VLSM to MPLS, STP, AAA, and WAN design.
          </p>
        </div>
      </section>

      <section className="guide-page__visual">
        <NetworkWindow />
      </section>

      <section className="guide-page__library">
        <div className="guide-page__controls">
          <input
            aria-label="Guide topic search"
            className="answer-input answer-input--compact guide-page__search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search topic, protocol, or concept"
          />
          <div className="guide-page__filters" aria-label="Guide categories">
            {guideCategories.map((category) => (
              <button
                key={category.id}
                className={`chip chip--small ${activeCategory === category.id ? "chip--active" : ""}`}
                type="button"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <p className="guide-page__summary">
          {filteredCards.length} topic block{filteredCards.length === 1 ? "" : "s"} shown
        </p>

        <div className="guide-grid">
          {filteredCards.map((card) => (
            <div key={card.id}>{card.render(question)}</div>
          ))}
        </div>
      </section>
    </main>
  );
}
