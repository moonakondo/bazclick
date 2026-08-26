// app/data-scraper/components/SourceTooltip.tsx
'use client';

import { useRef, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface SourceCoverageInfoProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  note: ReactNode;
}

// A self-contained "checkbox row + info popup" unit. Rendered via a portal
// straight onto document.body with position: fixed, computed from the info
// icon's actual on-screen position — this sidesteps any ancestor CSS
// (transforms, overflow, stacking contexts) that previously broke the
// simple absolute-positioned tooltip. The checkbox itself lives in the
// normal row AND is duplicated inside the popup; toggling either one closes
// the popup automatically.
export function SourceCoverageInfo({ label, name, checked, onChange, note }: SourceCoverageInfoProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLButtonElement>(null);

  const PANEL_WIDTH = 320;

  function openPanel() {
    const rect = iconRef.current?.getBoundingClientRect();
    if (rect) {
      // Prefer opening ABOVE the icon (per your request); fall back to
      // below if there isn't enough room near the top of the viewport.
      const estimatedPanelHeight = 320;
      const top =
        rect.top > estimatedPanelHeight + 16
          ? rect.top - estimatedPanelHeight - 8
          : rect.bottom + 8;

      const left = Math.max(
        8,
        Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 8)
      );

      setPos({ top, left });
    }
    setOpen(true);
  }

  function handleToggleFromPanel(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e);
    setOpen(false); // auto-close once the user actually ticks/unticks
  }

  return (
    <>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        {label}
        <button
          ref={iconRef}
          type="button"
          onClick={() => (open ? setOpen(false) : openPanel())}
          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300"
          aria-label={`${label} coverage info`}
        >
          i
        </button>
      </label>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            {/* transparent overlay: click anywhere outside the panel to close it */}
            <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
            <div
              className="fixed z-[101] overflow-y-auto rounded-lg bg-gray-900 p-3 text-white shadow-2xl"
              style={{ top: pos.top, left: pos.left, width: PANEL_WIDTH, maxHeight: 320 }}
            >
              {note}
              <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-white/10 pt-3 text-xs text-white">
                <input
                  type="checkbox"
                  name={name}
                  checked={checked}
                  onChange={handleToggleFromPanel}
                  className="rounded border-slate-400"
                />
                {checked ? `Turn off ${label}` : `Turn on ${label}`}
              </label>
            </div>
          </>,
          document.body
        )}
    </>
  );
}

const REGION_BLOCK = 'mb-2 last:mb-0';
const REGION_LABEL = 'text-[10px] font-bold uppercase tracking-wide text-blue-300';
const REGION_LIST = 'text-[11px] leading-snug text-gray-200';

export const YELP_COVERAGE_NOTE = (
  <div>
    <p className="mb-2 text-xs font-semibold text-white">Countries Covered</p>

    <div className={REGION_BLOCK}>
      <div className={REGION_LABEL}>North America</div>
      <div className={REGION_LIST}>United States, Canada, Mexico</div>
    </div>

    <div className={REGION_BLOCK}>
      <div className={REGION_LABEL}>Europe</div>
      <div className={REGION_LIST}>
        UK, France, Germany, Italy, Spain, Ireland, Austria, Switzerland, Netherlands,
        Belgium, Poland, Portugal, Denmark, Finland, Norway, Sweden, Czech Republic, Turkey
      </div>
    </div>

    <div className={REGION_BLOCK}>
      <div className={REGION_LABEL}>Latin America</div>
      <div className={REGION_LIST}>Argentina, Brazil, Chile</div>
    </div>

    <div className={REGION_BLOCK}>
      <div className={REGION_LABEL}>Asia-Pacific</div>
      <div className={REGION_LIST}>
        Australia, New Zealand, Japan, Singapore, Hong Kong, Taiwan, Malaysia, Philippines
      </div>
    </div>

    <p className="mt-2 border-t border-white/10 pt-2 text-[10px] text-gray-400">
      Locations outside these countries may return inaccurate or empty results.
    </p>
  </div>
);

export const YELLOW_PAGES_COVERAGE_NOTE = (
  <div>
    <p className="mb-1 text-xs font-semibold text-white">Countries Covered</p>
    <p className={REGION_LIST}>United States only.</p>
    <p className="mt-2 border-t border-white/10 pt-2 text-[10px] text-gray-400">
      "Yellow Pages" is run separately per country (e.g. Canada has its own yellowpages.ca) —
      this tool only scrapes the US site, so non-US searches will return 0 results.
    </p>
  </div>
);
