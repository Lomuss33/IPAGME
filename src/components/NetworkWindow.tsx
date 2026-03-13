import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { defaultNetworkStoryId, networkWindowStories, networkWindowStoryCategories } from "@/app/networkStories";
import { loadSelectedNetworkStory, saveSelectedNetworkStory } from "@/app/storage";
import type { NetworkGridCell, NetworkSegment, NetworkStory } from "@/app/types";

interface PlaybackFrame {
  label: string;
  cell: NetworkGridCell;
  from: NetworkSegment["from"];
  to: NetworkSegment["to"];
  terminalLineIndex: number;
  isSegmentEnd: boolean;
}

const GRID_SIZE = 3;
const FRAME_DELAY_MS = 540;
const SEGMENT_DELAY_MS = 760;
const LONG_TERMINAL_COPY_MIN_WIDTH = 1040;

function findStory(storyId: NetworkStory["id"]) {
  return networkWindowStories.find((story) => story.id === storyId) ?? networkWindowStories[0];
}

function keyForCell(cell: NetworkGridCell) {
  return `${cell.row}-${cell.col}`;
}

function expandSegmentToFrames(segment: NetworkSegment): PlaybackFrame[] {
  return segment.cells.map((cell, index) => ({
    label: segment.label,
    cell,
    from: segment.from,
    to: segment.to,
    terminalLineIndex: segment.terminalLineIndex,
    isSegmentEnd: index === segment.cells.length - 1,
  }));
}

function buildFrames(story: NetworkStory) {
  return story.segments.flatMap(expandSegmentToFrames);
}

function buildBoardCells() {
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({
    row: Math.floor(index / GRID_SIZE),
    col: index % GRID_SIZE,
  }));
}

function getNextFrameIndex(currentIndex: number, totalFrames: number) {
  if (totalFrames === 0) {
    return -1;
  }

  if (currentIndex < 0 || currentIndex >= totalFrames - 1) {
    return 0;
  }

  return currentIndex + 1;
}

function getExpandedTerminalCopy(line: string, index: number, totalLines: number) {
  if (totalLines <= 1) {
    return `${line}. This single step captures the whole exchange on the path.`;
  }

  if (index === 0) {
    return `${line}. This opening step shows which device starts the exchange and what action leaves first.`;
  }

  if (index === totalLines - 1) {
    return `${line}. This final step shows the outcome, reply, or state that remains after the exchange completes.`;
  }

  return `${line}. This middle step shows how the packet is forwarded, handled, or answered while it crosses the path.`;
}

export function NetworkWindow() {
  const [selectedStoryId, setSelectedStoryId] = useState(() => loadSelectedNetworkStory(defaultNetworkStoryId));
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFrameIndex, setActiveFrameIndex] = useState(-1);
  const [runKey, setRunKey] = useState(0);
  const [availableCopyWidth, setAvailableCopyWidth] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  const selectedStory = useMemo(() => findStory(selectedStoryId), [selectedStoryId]);
  const frames = useMemo(() => buildFrames(selectedStory), [selectedStory]);
  const boardCells = useMemo(() => buildBoardCells(), []);
  const storyGroups = useMemo(
    () =>
      networkWindowStoryCategories
        .map((category) => ({
          ...category,
          stories: networkWindowStories.filter((story) => story.category === category.id),
        }))
        .filter((group) => group.stories.length > 0),
    [],
  );
  const previewCellKeys = useMemo(
    () => new Set(selectedStory.previewCells.map((cell) => keyForCell(cell))),
    [selectedStory],
  );
  const deviceByCellKey = useMemo(
    () => new Map(selectedStory.nodes.map((node) => [keyForCell(node.cell), node])),
    [selectedStory],
  );

  const activeFrame = activeFrameIndex >= 0 ? frames[activeFrameIndex] : null;
  const activeCellKey = activeFrame ? keyForCell(activeFrame.cell) : "";
  const activeTerminalLineIndex = activeFrame?.terminalLineIndex ?? -1;
  const useExpandedTerminalCopy = availableCopyWidth >= LONG_TERMINAL_COPY_MIN_WIDTH;
  const terminalLines = useMemo(
    () =>
      selectedStory.terminalLines.map((line, index, allLines) =>
        useExpandedTerminalCopy ? getExpandedTerminalCopy(line, index, allLines.length) : line,
      ),
    [selectedStory, useExpandedTerminalCopy],
  );

  function clearPlaybackTimer() {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(() => clearPlaybackTimer, []);

  useEffect(() => {
    function measureAvailableCopyWidth() {
      const measuredWidth = panelRef.current?.getBoundingClientRect().width ?? 0;
      setAvailableCopyWidth(measuredWidth > 0 ? measuredWidth : window.innerWidth);
    }

    measureAvailableCopyWidth();
    window.addEventListener("resize", measureAvailableCopyWidth);

    return () => {
      window.removeEventListener("resize", measureAvailableCopyWidth);
    };
  }, []);

  useEffect(() => {
    saveSelectedNetworkStory(selectedStoryId);
  }, [selectedStoryId]);

  useEffect(() => {
    clearPlaybackTimer();

    if (!isPlaying || activeFrameIndex < 0 || frames.length === 0) {
      return;
    }

    if (activeFrameIndex >= frames.length - 1) {
      setIsPlaying(false);
      return;
    }

    const currentFrame = frames[activeFrameIndex];
    const delay = currentFrame.isSegmentEnd ? SEGMENT_DELAY_MS : FRAME_DELAY_MS;

    timeoutRef.current = setTimeout(() => {
      setActiveFrameIndex((currentIndex) => {
        if (currentIndex === -1 || currentIndex >= frames.length - 1) {
          return currentIndex;
        }

        return currentIndex + 1;
      });
    }, delay);

    return clearPlaybackTimer;
  }, [activeFrameIndex, frames, isPlaying, runKey]);

  function resetPlayback(nextStoryId: NetworkStory["id"]) {
    clearPlaybackTimer();
    setSelectedStoryId(nextStoryId);
    setIsPlaying(false);
    setActiveFrameIndex(-1);
    setRunKey((current) => current + 1);
  }

  function handleStorySelect(storyId: NetworkStory["id"]) {
    resetPlayback(storyId);
  }

  function handleStoryChange(event: ChangeEvent<HTMLSelectElement>) {
    handleStorySelect(event.target.value as NetworkStory["id"]);
  }

  function handlePlay() {
    clearPlaybackTimer();
    setRunKey((current) => current + 1);
    setIsPlaying(true);
    setActiveFrameIndex(0);
  }

  function handleStep() {
    clearPlaybackTimer();
    setRunKey((current) => current + 1);
    setIsPlaying(false);
    setActiveFrameIndex((currentIndex) => getNextFrameIndex(currentIndex, frames.length));
  }

  return (
    <section className="network-window">
      <div className="network-window__header">
        <div>
          <p className="eyebrow">Network Window</p>
          <h3>How IP moves traffic</h3>
        </div>
      </div>

      <div className="network-window__body">
        <aside className="network-window__panel" ref={panelRef}>
          <span className="network-window__role">IP role: {selectedStory.ipRole}</span>
          <h4 className="network-window__story-title">{selectedStory.title}</h4>
          <p className="network-window__summary">{selectedStory.summary}</p>

          <div className="network-window__terminal" aria-label="Protocol terminal">
            {terminalLines.map((line, index) => (
              <div
                className={`network-window__terminal-line ${
                  index === activeTerminalLineIndex ? "network-window__terminal-line--active" : ""
                }`}
                data-testid={index === activeTerminalLineIndex ? "active-terminal-line" : undefined}
                key={line}
              >
                {line}
              </div>
            ))}
          </div>

          <div className="network-window__footer">
            <div className="network-window__storybar">
              <label className="network-window__storybar-label" htmlFor="network-story-select">
                Protocol flow
              </label>
              <select
                id="network-story-select"
                aria-label="Protocol story"
                className="network-window__story-select"
                value={selectedStoryId}
                onChange={handleStoryChange}
              >
                {storyGroups.map((group) => (
                  <optgroup key={group.id} label={group.label}>
                    {group.stories.map((story) => (
                      <option key={story.id} value={story.id}>
                        {story.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="network-window__actions">
              <button
                className="secondary-button network-window__play"
                data-testid="network-play"
                type="button"
                onClick={handlePlay}
              >
                Start
              </button>

              <button
                className="secondary-button network-window__next"
                data-testid="network-step"
                type="button"
                onClick={handleStep}
              >
                Next
              </button>
            </div>
          </div>
        </aside>

        <div className="network-window__board" aria-label="Protocol board">
          {boardCells.map((cell) => {
            const cellKey = keyForCell(cell);
            const device = deviceByCellKey.get(cellKey);
            const isActive = activeCellKey === cellKey;
            const isPreview = !device && !isActive && previewCellKeys.has(cellKey);
            const isSender = Boolean(device && activeFrame && device.id === activeFrame.from);
            const isReceiver = Boolean(device && activeFrame && device.id === activeFrame.to);

            const className = [
              "network-window__cell",
              device ? "network-window__cell--device" : "",
              isSender ? "network-window__cell--source" : "",
              isReceiver ? "network-window__cell--target" : "",
              isPreview ? "network-window__cell--route network-window__cell--preview" : "",
              isActive ? "network-window__cell--route network-window__cell--active" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={cellKey}
                aria-hidden={device ? undefined : true}
                className={className}
                data-coord={cellKey}
                data-testid={isActive ? "active-packet" : "network-window-cell"}
              >
                {device ? (
                  <>
                    {activeFrame && (isSender || isReceiver) ? (
                      <span
                        className={`network-window__device-status ${
                          isSender ? "network-window__device-status--source" : "network-window__device-status--target"
                        }`}
                        data-testid={`device-status-${device.id}`}
                      >
                        {isSender ? "TX" : "RX"} {activeFrame.label}
                      </span>
                    ) : null}
                    <span className="network-window__emoji" aria-hidden="true">
                      {device.emoji}
                    </span>
                    <span className="network-window__device-label">{device.label}</span>
                  </>
                ) : null}

                {isActive && activeFrame ? (
                  <>
                    <span className="network-window__emoji" aria-hidden="true">
                      {"\u26A1"}
                    </span>
                    <span className="network-window__packet-label" data-testid="active-packet-label">
                      {activeFrame.label}
                    </span>
                  </>
                ) : null}

                {isPreview ? (
                  <span className="network-window__emoji network-window__emoji--preview" aria-hidden="true">
                    {"\u{1FAE7}"}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
