import React, { useState, useEffect, useMemo, useCallback } from "react";

/* ============================================================
   ABBOTT MAJORS TRACKER
   Baseline data verified Aug 3, 2026 from official race sites
   and current running press. "projected" = pattern-based, not
   yet announced by the race organizer.
   ============================================================ */

const DATA_VERSION = "2026-08-03";
const STORAGE_KEY = "wmm_tracker_data_v1";

const BASELINE = {
  asOf: "2026-08-03",
  races: [
    {
      id: "tokyo",
      name: "Tokyo",
      full: "Tokyo Marathon",
      flag: "🇯🇵",
      site: "marathon.tokyo",
      applyUrl: "https://www.marathon.tokyo/en/entry/",
      editions: [
        { year: 2026, date: "2026-03-01", label: "Sun, Mar 1, 2026", status: "completed" },
        { year: 2027, date: "2027-03-07", label: "Sun, Mar 7, 2027", status: "confirmed" },
        { year: 2028, date: "2028-03-05", label: "Early Mar 2028", status: "projected" },
      ],
      entry: {
        method: "Public lottery",
        forYear: 2027,
        windows: [
          { label: "ONE TOKYO GLOBAL member entry", open: "2026-07-31", close: "2026-08-13", results: "2026-09-01", status: "confirmed" },
          { label: "General entry lottery", open: "2026-08-14", close: "2026-08-28", results: "2026-09-18", status: "confirmed" },
        ],
        odds: "Under 10% in the general lottery (300,000+ applicants for ~38,000 spots)",
        other: "Charity bids (¥100,000+ minimum), official tour operators, RUN as ONE virtual challenges",
      },
      qt: null,
      qtNote: "No age-group time qualifier — only a semi-elite program (~280 spots, roughly sub-2:21 men / sub-2:52 women, varies by year). Lottery or charity are the realistic routes.",
      charity: {
        min: "$640",
        minNote: "Floor is ¥100,000 (~$640 at current rates); some partner orgs set higher minimums up to ¥350,000 (~$2,230)",
        deadline: "2027-07-09",
        deadlineLabel: "Charity Runner window closes (2028 cycle, projected — follows the same late-Jun–early-Jul pattern)",
        status: "projected",
      },
    },
    {
      id: "boston",
      name: "Boston",
      full: "Boston Marathon",
      flag: "🇺🇸",
      site: "baa.org",
      applyUrl: "https://www.baa.org/races/boston-marathon/enter",
      editions: [
        { year: 2026, date: "2026-04-20", label: "Mon, Apr 20, 2026", status: "completed" },
        { year: 2027, date: "2027-04-19", label: "Mon, Apr 19, 2027", status: "confirmed" },
        { year: 2028, date: "2028-04-17", label: "Mon, Apr 17, 2028", status: "projected" },
      ],
      entry: {
        method: "Time qualifier — no lottery",
        forYear: 2027,
        windows: [
          { label: "Registration week (2027 race)", open: "2026-09-14", close: "2026-09-18", results: "2026-10-05", status: "confirmed" },
        ],
        odds: "Qualifiers accepted fastest-first. 2026 cutoff: 4:34 under standard. ~1,000 extra spots go to a random draw among near-miss qualifiers.",
        other: "BQ window for 2027: Sep 13, 2025 – Sep 18, 2026. The 2028 window opens Sep 19, 2026. New for 2027: downhill-course times get +5:00 to +10:00 penalties. Charity and tour entries also available.",
      },
      qt: {
        basis: "Age on race day · marathon only",
        M: { "40-44": "3:05:00", "45-49": "3:15:00" },
        W: { "40-44": "3:35:00", "45-49": "3:45:00" },
      },
      qtNote: "Meeting the standard lets you apply; plan on ~5 minutes under it to clear the cutoff.",
      charity: {
        min: "$5,000",
        minNote: "Official program floor; most of the ~200 partner charities set $8,000–$15,000+, a few name/legacy causes go lower",
        deadline: "2026-09-15",
        deadlineLabel: "Charity partner applications typically open (~2wk window, projected for 2027 cycle)",
        status: "projected",
      },
    },
    {
      id: "london",
      name: "London",
      full: "TCS London Marathon",
      flag: "🇬🇧",
      site: "londonmarathonevents.co.uk",
      applyUrl: "https://www.tcslondonmarathon.com/en-gb/enter",
      editions: [
        { year: 2026, date: "2026-04-26", label: "Sun, Apr 26, 2026", status: "completed" },
        { year: 2027, date: "2027-04-24", label: "Sat–Sun, Apr 24–25, 2027", status: "confirmed" },
        { year: 2028, date: "2028-04-23", label: "Late Apr 2028", status: "projected" },
      ],
      entry: {
        method: "Public ballot",
        forYear: 2028,
        windows: [
          { label: "2027 ballot (closed — results out Jul 9, 2026)", open: "2026-04-24", close: "2026-05-01", results: "2026-07-09", status: "confirmed" },
          { label: "2028 ballot", open: "2027-04-26", close: "2027-05-03", results: "2027-07-09", status: "projected" },
        ],
        odds: "~1.3% — the 2027 ballot drew a record 1,338,544 applications for ~18,000 ballot places",
        other: "Good for Age (UK residents, apps open Oct 2026), charity (£2,500+ fundraising), club ballot, official tour operators. 2027 is a two-day, 100,000-runner edition.",
      },
      qt: {
        basis: "Good for Age · UK residents · age when you ran the time",
        M: { "40-44": "2:57:00", "45-49": "3:02:00" },
        W: { "40-44": "3:43:00", "45-49": "3:46:00" },
      },
      qtNote: "GFA window for 2027: Oct 1, 2025 – Sep 30, 2026. 6,000 places, fastest-first, not guaranteed.",
      charity: {
        min: "$2,700",
        minNote: "Floor is £2,000 (~$2,700 at current rates); most partner charities cluster £2,300–£2,800 (~$3,100–$3,770), ballot-place runners fundraising for a charity have no set minimum",
        deadline: "2026-08-31",
        deadlineLabel: "Most charity places open for application after ballot results (Jul 9, 2026) — apply early, spots go fast",
        status: "confirmed",
      },
    },
    {
      id: "capetown",
      name: "Cape Town",
      full: "Sanlam Cape Town Marathon",
      flag: "🇿🇦",
      site: "capetownmarathon.com",
      applyUrl: "https://www.capetownmarathon.com/entries/",
      editions: [
        { year: 2026, date: "2026-05-24", label: "Sun, May 24, 2026", status: "completed" },
        { year: 2027, date: "2027-05-23", label: "Sun, May 23, 2027", status: "confirmed" },
        { year: 2028, date: "2028-05-21", label: "Late May 2028", status: "projected" },
      ],
      entry: {
        method: "Public ballot",
        forYear: 2027,
        windows: [
          { label: "2027 ballot (closed)", open: "2026-06-10", close: "2026-06-24", results: "2026-06-26", status: "confirmed" },
          { label: "2028 ballot", open: "2027-06-09", close: "2027-06-23", results: "2027-06-25", status: "projected" },
        ],
        odds: "Not published. Two-thirds of the field is reserved for African runners; internationals compete for the remaining third.",
        other: "Confirmed as the 8th Major on Jun 10, 2026 — the first in Africa. 2027 is its first edition with full Major status. Charity partners (~$2,000–5,000+) and tour operators also available.",
      },
      qt: null,
      qtNote: "No qualifying-time entry — ballot, charity, or tour operator only.",
      charity: {
        min: "$2,000",
        minNote: "Partner-set, typically $2,000–$5,000+; newest Major so the program is still growing",
        deadline: "2027-06-23",
        deadlineLabel: "Runs alongside the public ballot window (projected)",
        status: "projected",
      },
    },
    {
      id: "sydney",
      name: "Sydney",
      full: "TCS Sydney Marathon",
      flag: "🇦🇺",
      site: "tcssydneymarathon.com",
      applyUrl: "https://www.tcssydneymarathon.com/register",
      editions: [
        { year: 2026, date: "2026-08-30", label: "Sun, Aug 30, 2026", status: "confirmed" },
        { year: 2027, date: "2027-08-29", label: "Late Aug 2027", status: "projected" },
        { year: 2028, date: "2028-08-27", label: "Late Aug 2028", status: "projected" },
      ],
      entry: {
        method: "Public ballot + time qualifier",
        forYear: 2027,
        windows: [
          { label: "2027 ballot & time-qualifier registration", open: "2026-09-23", close: "2026-10-16", results: "2026-10-28", status: "projected" },
        ],
        odds: "~33% in the 2026 ballot (123,000+ applications for ~40,000 spots) — the most forgiving Major ballot, but tightening fast",
        other: "Time qualifiers are fastest-first (not guaranteed); unsuccessful qualifiers roll into the ballot. Charity partners and tour operators also available.",
      },
      qt: {
        basis: "Age on race day · fastest-first, not guaranteed",
        M: { "40-44": "2:58:00", "45-49": "3:05:00" },
        W: { "40-44": "3:26:00", "45-49": "3:38:00" },
      },
      qtNote: "Times must come from an AIMS-certified marathon with less than 457 m of net drop.",
      charity: {
        min: "$3,000",
        minNote: "Program is young and growing fast; some named partner spots have run as high as $4,000+",
        deadline: "2026-10-16",
        deadlineLabel: "Applications typically close with the ballot/time-qualifier window (projected)",
        status: "projected",
      },
    },
    {
      id: "berlin",
      name: "Berlin",
      full: "BMW Berlin Marathon",
      flag: "🇩🇪",
      site: "bmw-berlin-marathon.com",
      applyUrl: "https://www.bmw-berlin-marathon.com/en/registration/",
      editions: [
        { year: 2026, date: "2026-09-27", label: "Sun, Sep 27, 2026", status: "confirmed" },
        { year: 2027, date: "2027-09-26", label: "Sun, Sep 26, 2027", status: "confirmed" },
        { year: 2028, date: "2028-09-24", label: "Sun, Sep 24, 2028", status: "projected" },
      ],
      entry: {
        method: "Public lottery",
        forYear: 2027,
        windows: [
          { label: "2027 lottery registration", open: "2026-09-25", close: "2026-11-06", results: "2026-11-27", status: "projected" },
        ],
        odds: "~20% (widely cited estimate; Berlin doesn't publish figures)",
        other: "Fast-runner qualification gives GUARANTEED entry. Jubilee Club after 10 finishes. Charity partners and tour operators also available.",
      },
      qt: {
        basis: "Guaranteed entry · brackets are ≤44 and 45–59 · time within past 2 years",
        M: { "40-44": "2:45:00", "45-49": "2:55:00" },
        W: { "40-44": "3:10:00", "45-49": "3:30:00" },
      },
      qtNote: "Hardest standards of any Major with age-group entry — but hitting them guarantees a bib.",
      charity: {
        min: "$1,150",
        minNote: "Floor is €1,000 (~$1,150 at current rates) with smaller partner orgs; larger/name causes typically run €2,500–€4,000 (~$2,880–$4,610)",
        deadline: "2026-11-06",
        deadlineLabel: "Runs alongside the lottery registration window (projected)",
        status: "projected",
      },
    },
    {
      id: "chicago",
      name: "Chicago",
      full: "Bank of America Chicago Marathon",
      flag: "🇺🇸",
      site: "chicagomarathon.com",
      applyUrl: "https://www.chicagomarathon.com/apply/",
      editions: [
        { year: 2026, date: "2026-10-11", label: "Sun, Oct 11, 2026", status: "confirmed" },
        { year: 2027, date: "2027-10-10", label: "Sun, Oct 10, 2027", status: "confirmed" },
        { year: 2028, date: "2028-10-08", label: "Sun, Oct 8, 2028", status: "projected" },
      ],
      entry: {
        method: "Public lottery + time qualifier",
        forYear: 2027,
        windows: [
          { label: "2027 drawing & guaranteed-entry application", open: "2026-10-21", close: "2026-11-18", results: "2026-12-10", status: "projected" },
        ],
        odds: "~20–25% in the drawing (200,000+ applicants) — the friendliest big-race lottery after Sydney",
        other: "Time qualifier = GUARANTEED entry, no cutoff buffer. Also: legacy entry (5 finishes in 10 years), Distance Series (Shamrock Shuffle + Chicago 13.1 + Marathon), charity, tours.",
      },
      qt: {
        basis: "Age on race day · guaranteed entry · certified marathon since Jan 1, 2024",
        M: { "40-44": "3:00:00", "45-49": "3:10:00" },
        W: { "40-44": "3:30:00", "45-49": "3:40:00" },
      },
      qtNote: "Standards were tightened in 2025 — faster than Boston's for many groups, but guaranteed if you hit them.",
      charity: {
        min: "$2,200",
        minNote: "Official program-wide floor, the same for every partner org — one of the few Majors with a fixed minimum",
        deadline: "2027-09-14",
        deadlineLabel: "Charity program closes (first-come-first-served, or when partner caps fill — projected for 2027 cycle)",
        status: "projected",
      },
    },
    {
      id: "nyc",
      name: "New York City",
      full: "TCS New York City Marathon",
      flag: "🇺🇸",
      site: "nyrr.org",
      applyUrl: "https://www.nyrr.org/tcsnycmarathon/enter",
      editions: [
        { year: 2026, date: "2026-11-01", label: "Sun, Nov 1, 2026", status: "confirmed" },
        { year: 2027, date: "2027-11-07", label: "Sun, Nov 7, 2027", status: "confirmed" },
        { year: 2028, date: "2028-11-05", label: "Sun, Nov 5, 2028", status: "projected" },
      ],
      entry: {
        method: "Non-guaranteed drawing",
        forYear: 2027,
        windows: [
          { label: "2027 drawing application", open: "2027-02-04", close: "2027-02-25", results: "2027-03-04", status: "projected" },
        ],
        odds: "~3–4% in the open drawing (125,000+ applicants)",
        other: "NYRR 9+1 program (9 races + 1 volunteer shift in 2026 = guaranteed 2027 entry), time qualifiers, charity ($3,000–4,500+), 15-year legacy, tours.",
      },
      qt: {
        basis: "Age on race day · limited spots, fastest-first · window Jan 1 – Dec 31, 2026",
        M: { "40-44": "2:58:00", "45-49": "3:05:00" },
        W: { "40-44": "3:26:00", "45-49": "3:38:00" },
      },
      qtNote: "Non-NYRR qualifying times must come from a certified full marathon (no halves). NYRR races also count via their own standards.",
      charity: {
        min: "$3,000",
        minNote: "Official Bronze-tier floor; Silver-tier and legacy partners (Team for Kids, Fred's Team) often set $3,500+",
        deadline: "2026-09-01",
        deadlineLabel: "Official Charity Partner Program applications typically open (individual partner deadlines vary — check the specific charity)",
        status: "projected",
      },
    },
  ],
};

/* ---------- helpers ---------- */
const DAY = 86400000;
const parseDate = (s) => new Date(s + "T12:00:00");
const fmtShort = (s) => {
  const d = parseDate(s);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
const fmtNoYear = (s) => parseDate(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function windowState(w, now) {
  const open = parseDate(w.open);
  const close = new Date(parseDate(w.close).getTime() + DAY - 1);
  if (now < open) return { key: "upcoming", days: Math.ceil((open - now) / DAY) };
  if (now <= close) return { key: "open", days: Math.ceil((close - now) / DAY) };
  return { key: "closed" };
}

function buildTimeline(data, now) {
  const ev = [];
  data.races.forEach((r) => {
    r.entry.windows.forEach((w) => {
      const st = windowState(w, now);
      if (st.key === "open") {
        ev.push({ t: parseDate(w.close), race: r, label: `${r.name}: ${w.label} closes`, kind: "open", status: w.status, sub: w.label });
      } else if (st.key === "upcoming") {
        ev.push({ t: parseDate(w.open), race: r, label: `${r.name}: ${w.label} opens`, kind: "upcoming", status: w.status, sub: w.label });
      }
    });
    r.editions.forEach((e) => {
      if (e.status !== "completed" && parseDate(e.date) > now) {
        ev.push({ t: parseDate(e.date), race: r, label: `${r.name} race day`, kind: "race", status: e.status, sub: e.label });
      }
    });
  });
  return ev.sort((a, b) => a.t - b.t);
}

function useCountdown(target) {
  const [ms, setMs] = useState(target ? target - new Date() : 0);
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setMs(target - new Date()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (!target || ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(ms / DAY),
    h: Math.floor((ms % DAY) / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
  };
}

/* ---------- refresh via Claude + web search ---------- */
async function fetchUpdates(currentData) {
  const prompt = `You are updating a marathon-entry tracker. Today's date matters — search the web for the CURRENT status of Abbott World Marathon Majors entry windows and race dates.

For each of these races — Tokyo, Boston, London, Cape Town, Sydney, Berlin, Chicago, New York City — check whether the organizer has OFFICIALLY announced (1) race dates for 2027 or 2028 and (2) lottery/ballot/registration windows that are currently marked "projected" in my data.

My current data (JSON): ${JSON.stringify(
    currentData.races.map((r) => ({
      id: r.id,
      editions: r.editions,
      windows: r.entry.windows,
    }))
  )}

Respond with ONLY a JSON object, no markdown fences, no preamble, in this exact shape:
{"updates":[{"raceId":"berlin","type":"window","windowIndex":0,"open":"YYYY-MM-DD","close":"YYYY-MM-DD","results":"YYYY-MM-DD","status":"confirmed"},{"raceId":"sydney","type":"edition","year":2027,"date":"YYYY-MM-DD","label":"Sun, Aug 29, 2027","status":"confirmed"}],"summary":"one sentence describing what changed, or 'No newly confirmed dates found.'"}

Only include an update if you found an OFFICIAL confirmation that differs from or upgrades my data (projected → confirmed, or a changed date). If nothing new is confirmed, return {"updates":[],"summary":"No newly confirmed dates found."}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });
  if (!response.ok) throw new Error("API request failed (" + response.status + ")");
  const data = await response.json();
  const text = (data.content || [])
    .map((b) => (b.type === "text" ? b.text : ""))
    .filter(Boolean)
    .join("\n");
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Could not parse update response");
  return JSON.parse(clean.slice(start, end + 1));
}

function applyUpdates(data, updates) {
  const next = JSON.parse(JSON.stringify(data));
  (updates || []).forEach((u) => {
    const race = next.races.find((r) => r.id === u.raceId);
    if (!race) return;
    if (u.type === "edition" && u.year && u.date) {
      const ed = race.editions.find((e) => e.year === u.year);
      if (ed) {
        ed.date = u.date;
        if (u.label) ed.label = u.label;
        ed.status = u.status || "confirmed";
      }
    } else if (u.type === "window" && typeof u.windowIndex === "number") {
      const w = race.entry.windows[u.windowIndex];
      if (w) {
        if (u.open) w.open = u.open;
        if (u.close) w.close = u.close;
        if (u.results) w.results = u.results;
        w.status = u.status || "confirmed";
      }
    }
  });
  return next;
}

/* ---------- UI atoms ---------- */
const C = {
  bg: "#0E1626",
  card: "#16233A",
  cardUp: "#1B2A45",
  line: "#28395A",
  paper: "#EEF3FB",
  slate: "#8CA0BF",
  amber: "#FFB525",
  green: "#3CD98F",
  blue: "#6FA8FF",
  red: "#FF6B6B",
};

const fontDisplay = "'Barlow Condensed', 'Arial Narrow', sans-serif";
const fontBody = "'Barlow', 'Helvetica Neue', sans-serif";
const fontMono = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace";

function StatusPill({ status }) {
  const map = {
    confirmed: { txt: "CONFIRMED", color: C.green, bg: "rgba(60,217,143,0.12)" },
    projected: { txt: "PROJECTED", color: C.blue, bg: "rgba(111,168,255,0.12)" },
    completed: { txt: "COMPLETED", color: C.slate, bg: "rgba(140,160,191,0.12)" },
  };
  const s = map[status] || map.projected;
  return (
    <span
      style={{
        fontFamily: fontDisplay,
        fontWeight: 600,
        letterSpacing: "0.08em",
        fontSize: 10,
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.color}33`,
        borderRadius: 3,
        padding: "1px 6px",
        whiteSpace: "nowrap",
      }}
    >
      {s.txt}
    </span>
  );
}

function WindowPill({ state }) {
  if (state.key === "open")
    return (
      <span style={{ fontFamily: fontDisplay, fontWeight: 700, letterSpacing: "0.08em", fontSize: 11, color: "#08110A", background: C.green, borderRadius: 3, padding: "2px 7px", whiteSpace: "nowrap" }}>
        OPEN · {state.days}D LEFT
      </span>
    );
  if (state.key === "upcoming")
    return (
      <span style={{ fontFamily: fontDisplay, fontWeight: 700, letterSpacing: "0.08em", fontSize: 11, color: C.amber, background: "rgba(255,181,37,0.12)", border: `1px solid ${C.amber}44`, borderRadius: 3, padding: "2px 7px", whiteSpace: "nowrap" }}>
        OPENS IN {state.days}D
      </span>
    );
  return (
    <span style={{ fontFamily: fontDisplay, fontWeight: 600, letterSpacing: "0.08em", fontSize: 11, color: C.slate, border: `1px solid ${C.line}`, borderRadius: 3, padding: "2px 7px", whiteSpace: "nowrap" }}>
      CLOSED
    </span>
  );
}

function Toggle({ options, value, onChange, ariaLabel }) {
  return (
    <div role="group" aria-label={ariaLabel} style={{ display: "inline-flex", border: `1px solid ${C.line}`, borderRadius: 6, overflow: "hidden" }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            fontFamily: fontDisplay,
            fontWeight: 600,
            letterSpacing: "0.06em",
            fontSize: 14,
            padding: "7px 16px",
            border: "none",
            cursor: "pointer",
            color: value === o.value ? "#0E1626" : C.slate,
            background: value === o.value ? C.amber : "transparent",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ClockDigits({ d, h, m, s }) {
  const cell = (v, lbl) => (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: fontMono,
          fontWeight: 600,
          fontSize: "clamp(30px, 7.5vw, 54px)",
          lineHeight: 1,
          color: C.amber,
          textShadow: "0 0 18px rgba(255,181,37,0.45)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(v).padStart(2, "0")}
      </div>
      <div style={{ fontFamily: fontDisplay, fontSize: 11, letterSpacing: "0.2em", color: C.slate, marginTop: 4 }}>{lbl}</div>
    </div>
  );
  const colon = <div style={{ fontFamily: fontMono, fontSize: "clamp(24px, 5vw, 40px)", color: `${C.amber}66`, paddingBottom: 16 }}>:</div>;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(8px, 2vw, 18px)", justifyContent: "center" }}>
      {cell(d, "DAYS")}
      {colon}
      {cell(h, "HRS")}
      {colon}
      {cell(m, "MIN")}
      {colon}
      {cell(s, "SEC")}
    </div>
  );
}

/* ---------- main ---------- */
export default function MajorsTracker() {
  const [data, setData] = useState(BASELINE);
  const [lastChecked, setLastChecked] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState(null);
  const [gender, setGender] = useState("M");
  const [age, setAge] = useState("40-44");
  const [expanded, setExpanded] = useState(null);
  const now = new Date();

  // load persisted data — uses window.storage inside claude.ai artifacts,
  // falls back to localStorage when self-hosted (e.g. on GitHub Pages)
  useEffect(() => {
    (async () => {
      try {
        if (window.storage) {
          const saved = await window.storage.get(STORAGE_KEY);
          if (saved && saved.value) {
            const parsed = JSON.parse(saved.value);
            if (parsed.version === DATA_VERSION && parsed.data) {
              setData(parsed.data);
              setLastChecked(parsed.lastChecked || null);
            }
          }
        } else if (window.localStorage) {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.version === DATA_VERSION && parsed.data) {
              setData(parsed.data);
              setLastChecked(parsed.lastChecked || null);
            }
          }
        }
      } catch (e) {
        /* no saved data yet — baseline is fine */
      }
      setLoadingStorage(false);
    })();
  }, []);

  const persist = useCallback(async (d, checked) => {
    const payload = JSON.stringify({ version: DATA_VERSION, data: d, lastChecked: checked });
    try {
      if (window.storage) {
        await window.storage.set(STORAGE_KEY, payload);
      } else if (window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, payload);
      }
    } catch (e) {
      /* storage unavailable — keep going in memory */
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const result = await fetchUpdates(data);
      const merged = applyUpdates(data, result.updates);
      const checked = new Date().toISOString();
      setData(merged);
      setLastChecked(checked);
      setRefreshMsg({ ok: true, text: result.summary || "Checked — no changes." });
      await persist(merged, checked);
    } catch (e) {
      setRefreshMsg({
        ok: false,
        text: window.storage
          ? "Update check failed — showing last saved data. Try again in a moment."
          : "Update check needs a Claude-hosted environment (it calls the Anthropic API). Data below is still accurate as of the baseline date.",
      });
    }
    setRefreshing(false);
  };

  const handleReset = async () => {
    setData(BASELINE);
    setLastChecked(null);
    setRefreshMsg({ ok: true, text: "Reset to the verified Aug 3, 2026 baseline data." });
    try {
      if (window.storage) {
        await window.storage.delete(STORAGE_KEY);
      } else if (window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      /* nothing persisted yet — fine */
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const timeline = useMemo(() => buildTimeline(data, now), [data, lastChecked]);
  const nextEvent = timeline.find((e) => e.kind !== "race") || timeline[0];
  const cd = useCountdown(nextEvent ? nextEvent.t : null);

  const upcomingStrip = timeline.filter((e) => e !== nextEvent).slice(0, 4);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.paper, fontFamily: fontBody, paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        button:focus-visible { outline: 2px solid ${C.amber}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
        .row-hover:hover { background: ${C.cardUp}; }
      `}</style>

      {/* header */}
      <header style={{ borderBottom: `1px solid ${C.line}`, padding: "16px clamp(14px, 4vw, 36px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "clamp(22px, 4vw, 30px)", letterSpacing: "0.06em", lineHeight: 1 }}>
            MAJORS TRACKER
          </div>
          <div style={{ fontFamily: fontDisplay, fontSize: 12, letterSpacing: "0.18em", color: C.slate, marginTop: 4 }}>
            ABBOTT WORLD MARATHON MAJORS · 8 STARS · 2026–2028
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontFamily: fontMono, fontSize: 11, color: C.slate, textAlign: "right" }}>
            <div>baseline {fmtShort(data.asOf)}</div>
            <div>{lastChecked ? "checked " + new Date(lastChecked).toLocaleDateString() : "not yet re-checked"}</div>
          </div>
          <button
            onClick={handleReset}
            disabled={refreshing}
            title="Discard saved/fetched data and restore the verified Aug 3, 2026 baseline"
            style={{
              fontFamily: fontDisplay,
              fontWeight: 700,
              letterSpacing: "0.1em",
              fontSize: 13,
              color: C.slate,
              background: "transparent",
              border: `1px solid ${C.line}`,
              borderRadius: 6,
              padding: "10px 14px",
              cursor: refreshing ? "wait" : "pointer",
            }}
          >
            RESET
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              fontFamily: fontDisplay,
              fontWeight: 700,
              letterSpacing: "0.1em",
              fontSize: 13,
              color: refreshing ? C.slate : "#0E1626",
              background: refreshing ? C.line : C.amber,
              border: "none",
              borderRadius: 6,
              padding: "10px 18px",
              cursor: refreshing ? "wait" : "pointer",
            }}
          >
            {refreshing ? "CHECKING THE WEB…" : "CHECK FOR UPDATES"}
          </button>
        </div>
      </header>

      {refreshMsg && (
        <div style={{ margin: "12px clamp(14px, 4vw, 36px) 0", padding: "10px 14px", borderRadius: 6, fontSize: 13, background: refreshMsg.ok ? "rgba(60,217,143,0.1)" : "rgba(255,107,107,0.1)", border: `1px solid ${refreshMsg.ok ? C.green : C.red}44`, color: refreshMsg.ok ? C.green : C.red }}>
          {refreshMsg.text}
        </div>
      )}

      {/* gantry clock */}
      {nextEvent && (
        <section
          style={{
            margin: "22px clamp(14px, 4vw, 36px) 0",
            border: `1px solid ${C.line}`,
            borderTop: `3px solid ${C.amber}`,
            borderRadius: 10,
            background: `linear-gradient(180deg, ${C.cardUp} 0%, ${C.card} 100%)`,
            padding: "22px 18px 20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `repeating-linear-gradient(90deg, ${C.amber} 0 14px, transparent 14px 28px)`, opacity: 0.5 }} />
          <div style={{ textAlign: "center", fontFamily: fontDisplay, fontSize: 12, letterSpacing: "0.24em", color: C.slate }}>
            NEXT ENTRY DEADLINE
          </div>
          <div style={{ textAlign: "center", fontFamily: fontDisplay, fontWeight: 700, fontSize: "clamp(18px, 3.4vw, 26px)", letterSpacing: "0.04em", margin: "6px 0 16px" }}>
            {nextEvent.race.flag} {nextEvent.label.toUpperCase()}
            <span style={{ marginLeft: 10, verticalAlign: "middle" }}>
              <StatusPill status={nextEvent.status} />
            </span>
          </div>
          <ClockDigits {...cd} />
          <div style={{ textAlign: "center", fontFamily: fontMono, fontSize: 12, color: C.slate, marginTop: 14 }}>
            {nextEvent.t.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
          </div>
        </section>
      )}

      {/* upcoming strip */}
      {upcomingStrip.length > 0 && (
        <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "14px clamp(14px, 4vw, 36px) 4px" }}>
          {upcomingStrip.map((e, i) => (
            <div key={i} style={{ minWidth: 210, flex: "0 0 auto", border: `1px solid ${C.line}`, borderRadius: 8, background: C.card, padding: "10px 12px" }}>
              <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 14, letterSpacing: "0.04em" }}>
                {e.race.flag} {e.label}
              </div>
              <div style={{ fontFamily: fontMono, fontSize: 12, color: C.amber, marginTop: 4 }}>{e.t.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
              <div style={{ marginTop: 6 }}>
                <StatusPill status={e.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* controls */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", padding: "16px clamp(14px, 4vw, 36px) 6px" }}>
        <div style={{ fontFamily: fontDisplay, fontSize: 12, letterSpacing: "0.2em", color: C.slate }}>QUALIFYING TIMES FOR</div>
        <Toggle ariaLabel="Division" value={gender} onChange={setGender} options={[{ value: "M", label: "MEN" }, { value: "W", label: "WOMEN" }]} />
        <Toggle ariaLabel="Age group" value={age} onChange={setAge} options={[{ value: "40-44", label: "40–44" }, { value: "45-49", label: "45–49" }]} />
      </div>

      {/* master table */}
      <section style={{ margin: "10px clamp(14px, 4vw, 36px) 0", border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", background: C.card }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1180 }}>
            <thead>
              <tr style={{ background: C.cardUp }}>
                {["RACE", "2026", "2027", "2028", "ENTRY WINDOW (NEXT)", `QUALIFYING · ${gender === "M" ? "MEN" : "WOMEN"} ${age}`, "CHARITY BIB", "APPLY"].map((h, i) => (
                  <th key={i} style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 12, letterSpacing: "0.14em", color: C.slate, textAlign: "left", padding: "12px 14px", borderBottom: `1px solid ${C.line}`, whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.races.map((r) => {
                const isOpen = expanded === r.id;
                const nextWin =
                  r.entry.windows.find((w) => windowState(w, now).key === "open") ||
                  r.entry.windows.find((w) => windowState(w, now).key === "upcoming") ||
                  r.entry.windows[r.entry.windows.length - 1];
                const winSt = windowState(nextWin, now);
                const qtVal = r.qt ? r.qt[gender][age] : null;
                return (
                  <React.Fragment key={r.id}>
                    <tr
                      className="row-hover"
                      onClick={() => setExpanded(isOpen ? null : r.id)}
                      style={{ cursor: "pointer", borderBottom: isOpen ? "none" : `1px solid ${C.line}` }}
                    >
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 18, marginRight: 8 }}>{r.flag}</span>
                        <span style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 18, letterSpacing: "0.03em" }}>{r.name.toUpperCase()}</span>
                        <span style={{ color: C.slate, marginLeft: 8, fontSize: 12 }}>{isOpen ? "▾" : "▸"}</span>
                      </td>
                      {r.editions.map((e) => (
                        <td key={e.year} style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                          <div style={{ fontFamily: fontMono, fontSize: 13, color: e.status === "completed" ? C.slate : C.paper, textDecoration: e.status === "completed" ? "line-through" : "none" }}>
                            {e.status === "projected" ? "~ " : ""}
                            {fmtNoYear(e.date)}
                          </div>
                          <div style={{ marginTop: 3 }}>
                            <StatusPill status={e.status} />
                          </div>
                        </td>
                      ))}
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ fontFamily: fontMono, fontSize: 13 }}>
                          {nextWin.status === "projected" ? "~ " : ""}
                          {fmtNoYear(nextWin.open)} – {fmtShort(nextWin.close)}
                        </div>
                        <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
                          <WindowPill state={winSt} />
                          <StatusPill status={nextWin.status} />
                        </div>
                      </td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        {qtVal ? (
                          <span style={{ fontFamily: fontMono, fontWeight: 600, fontSize: 16, color: C.amber }}>{qtVal}</span>
                        ) : (
                          <span style={{ fontFamily: fontMono, fontSize: 13, color: C.slate }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        {r.charity ? (
                          <>
                            <div style={{ fontFamily: fontMono, fontWeight: 600, fontSize: 14, color: C.paper }}>{r.charity.min}+</div>
                            <div style={{ fontFamily: fontMono, fontSize: 11, color: C.slate, marginTop: 2 }}>
                              {r.charity.status === "projected" ? "~ " : ""}
                              by {fmtShort(r.charity.deadline)}
                            </div>
                          </>
                        ) : (
                          <span style={{ fontFamily: fontMono, fontSize: 13, color: C.slate }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                        {r.applyUrl ? (
                          <a
                            href={r.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-block",
                              fontFamily: fontDisplay,
                              fontWeight: 700,
                              letterSpacing: "0.04em",
                              fontSize: 12,
                              color: "#0E1626",
                              background: C.amber,
                              borderRadius: 5,
                              padding: "7px 12px",
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Apply to {r.name} Marathon
                          </a>
                        ) : (
                          <span style={{ fontFamily: fontMono, fontSize: 13, color: C.slate }}>—</span>
                        )}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                        <td colSpan={8} style={{ padding: "0 14px 16px", background: "rgba(0,0,0,0.14)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, paddingTop: 14 }}>
                            <div>
                              <div style={{ fontFamily: fontDisplay, fontSize: 11, letterSpacing: "0.2em", color: C.slate, marginBottom: 6 }}>HOW ENTRY WORKS</div>
                              <div style={{ fontSize: 13, lineHeight: 1.55 }}>
                                <strong>{r.entry.method}.</strong> {r.entry.odds}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontFamily: fontDisplay, fontSize: 11, letterSpacing: "0.2em", color: C.slate, marginBottom: 6 }}>ENTRY WINDOWS</div>
                              {r.entry.windows.map((w, i) => (
                                <div key={i} style={{ fontSize: 13, lineHeight: 1.55, marginBottom: 6 }}>
                                  <span style={{ fontFamily: fontMono, color: C.paper }}>
                                    {w.status === "projected" ? "~ " : ""}
                                    {fmtShort(w.open)} → {fmtShort(w.close)}
                                  </span>
                                  <span style={{ color: C.slate }}> · {w.label}</span>
                                  {w.results && <span style={{ color: C.slate }}> · results {fmtShort(w.results)}</span>}
                                </div>
                              ))}
                            </div>
                            <div>
                              <div style={{ fontFamily: fontDisplay, fontSize: 11, letterSpacing: "0.2em", color: C.slate, marginBottom: 6 }}>QUALIFYING · YOUR GROUP</div>
                              {r.qt ? (
                                <div style={{ fontSize: 13, lineHeight: 1.55 }}>
                                  <span style={{ fontFamily: fontMono, fontWeight: 600, color: C.amber, fontSize: 15 }}>{r.qt[gender][age]}</span>
                                  <span style={{ color: C.slate }}> ({gender === "M" ? "men" : "women"} {age})</span>
                                  <div style={{ color: C.slate, marginTop: 4 }}>{r.qt.basis}</div>
                                  <div style={{ marginTop: 4 }}>{r.qtNote}</div>
                                </div>
                              ) : (
                                <div style={{ fontSize: 13, lineHeight: 1.55, color: C.slate }}>{r.qtNote}</div>
                              )}
                            </div>
                            <div>
                              <div style={{ fontFamily: fontDisplay, fontSize: 11, letterSpacing: "0.2em", color: C.slate, marginBottom: 6 }}>OTHER WAYS IN</div>
                              <div style={{ fontSize: 13, lineHeight: 1.55 }}>{r.entry.other}</div>
                              <div style={{ fontFamily: fontMono, fontSize: 12, color: C.blue, marginTop: 8 }}>{r.site}</div>
                            </div>
                            <div>
                              <div style={{ fontFamily: fontDisplay, fontSize: 11, letterSpacing: "0.2em", color: C.slate, marginBottom: 6 }}>CHARITY BIB</div>
                              {r.charity ? (
                                <div style={{ fontSize: 13, lineHeight: 1.55 }}>
                                  <span style={{ fontFamily: fontMono, fontWeight: 600, color: C.amber, fontSize: 15 }}>{r.charity.min}+ minimum</span>
                                  <div style={{ color: C.slate, marginTop: 4 }}>{r.charity.minNote}</div>
                                  <div style={{ marginTop: 6 }}>
                                    <span style={{ fontFamily: fontMono, color: C.paper }}>
                                      {r.charity.status === "projected" ? "~ " : ""}
                                      Submit by {fmtShort(r.charity.deadline)}
                                    </span>
                                    <span style={{ marginLeft: 6, verticalAlign: "middle" }}>
                                      <StatusPill status={r.charity.status} />
                                    </span>
                                  </div>
                                  <div style={{ color: C.slate, marginTop: 4 }}>{r.charity.deadlineLabel}</div>
                                </div>
                              ) : (
                                <div style={{ fontSize: 13, lineHeight: 1.55, color: C.slate }}>No charity program listed.</div>
                              )}
                            </div>
                            <div>
                              <div style={{ fontFamily: fontDisplay, fontSize: 11, letterSpacing: "0.2em", color: C.slate, marginBottom: 6 }}>APPLY</div>
                              {r.applyUrl ? (
                                <a
                                  href={r.applyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    display: "inline-block",
                                    fontFamily: fontDisplay,
                                    fontWeight: 700,
                                    letterSpacing: "0.06em",
                                    fontSize: 13,
                                    color: "#0E1626",
                                    background: C.amber,
                                    borderRadius: 6,
                                    padding: "9px 16px",
                                    textDecoration: "none",
                                  }}
                                >
                                  Apply to {r.full} →
                                </a>
                              ) : (
                                <div style={{ fontSize: 13, color: C.slate }}>No direct entry link yet.</div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* footnotes */}
      <footer style={{ padding: "20px clamp(14px, 4vw, 36px) 0", fontSize: 12.5, lineHeight: 1.7, color: C.slate, maxWidth: 980 }}>
        <p style={{ margin: "0 0 8px" }}>
          <span style={{ color: C.blue }}>~ PROJECTED</span> dates follow the race's most recent confirmed cycle and haven't been announced by the organizer yet — always verify on the official site before a window opens. Tap "Check for updates" about once a month; the app searches the web for newly announced dates and saves anything that has been officially confirmed.
        </p>
        <p style={{ margin: "0 0 8px" }}>
          Age brackets: Boston, Chicago, NYC, and Sydney use your age on race day (a 44-year-old racing at 45 uses the 45–49 standard). London Good for Age uses your age when you ran the time and is UK residents only. Berlin's brackets are ≤44 and 45–59, so its "40–44" and "45–49" figures shown here are those two brackets. Berlin and Chicago qualifiers get guaranteed entry; Boston, NYC, Sydney, and London are fastest-first.
        </p>
        <p style={{ margin: 0 }}>
          Cape Town became the 8th Major in June 2026 (first edition with full status: May 2027). The Six Star medal still covers the original six; a Nine Star medal arrives once Shanghai completes its candidacy. One more route: the AbbottWMM Race Draws at worldmarathonmajors.com — a members-only lottery for runners with 3–5 stars.
        </p>
        <p style={{ margin: "8px 0 0" }}>
          Charity bib minimums are the typical floor across each race's official partner program, converted to USD at current exchange rates — individual charities routinely set higher minimums, and a few (Boston, London especially) have partners well above $10,000. Submit-by dates are approximate and follow each program's usual yearly rhythm unless marked CONFIRMED. Apply links go to each race's official English-language entry page — always confirm the current route (lottery, charity, time qualifier) before paying anything.
        </p>
      </footer>
    </div>
  );
}
