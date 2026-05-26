import { Link } from "@tanstack/react-router";
import { useState, useEffect, type CSSProperties, type ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// FIND ESTI — community search infographic
// A single-page, mobile-first action board. Every block answers one question:
// "What do I do right now to help find her?" No speculation. No time-wasters.
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  ink: "#1a1f2e",
  paper: "#f4f1ea",
  card: "#ffffff",
  teal: "#0f6e6e",
  tealDeep: "#0a4f4f",
  amber: "#e8820e",
  amberSoft: "#fff3e0",
  red: "#c0392b",
  line: "#e3ddd0",
  muted: "#6b6557",
};

const font = {
  display: "'Libre Franklin', 'Helvetica Neue', sans-serif",
  body: "'Newsreader', Georgia, serif",
};

function useReveal() {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSeen(true), 60);
    return () => clearTimeout(t);
  }, []);
  return seen;
}

const Section = ({
  kicker,
  title,
  children,
  style,
}: {
  kicker?: string;
  title?: string;
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <section style={{ margin: "0 auto", maxWidth: 760, padding: "0 20px 56px", ...style }}>
    {kicker && (
      <div
        style={{
          fontFamily: font.display,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.teal,
          marginBottom: 8,
        }}
      >
        {kicker}
      </div>
    )}
    {title && (
      <h2
        style={{
          fontFamily: font.display,
          fontSize: "clamp(22px, 5vw, 30px)",
          fontWeight: 800,
          lineHeight: 1.1,
          color: C.ink,
          margin: "0 0 22px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
    )}
    {children}
  </section>
);

const Card = ({
  children,
  accent,
  style,
}: {
  children: ReactNode;
  accent?: string;
  style?: CSSProperties;
}) => (
  <div
    style={{
      background: C.card,
      borderRadius: 14,
      padding: "20px 22px",
      border: `1px solid ${C.line}`,
      borderLeft: accent ? `5px solid ${accent}` : `1px solid ${C.line}`,
      boxShadow: "0 1px 2px rgba(26,31,46,0.04)",
      ...style,
    }}
  >
    {children}
  </div>
);

type TimelineEvent = { t: string; h: string; d: string; cold?: boolean };

export function FindEsti() {
  const seen = useReveal();
  const [copied, setCopied] = useState("");

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1600);
  };

  const fade = (delay: number): CSSProperties => ({
    opacity: seen ? 1 : 0,
    transform: seen ? "translateY(0)" : "translateY(12px)",
    transition: `opacity .6s ease ${delay}s, transform .6s ease ${delay}s`,
  });

  return (
    <div
      style={{
        background: C.paper,
        color: C.ink,
        fontFamily: font.body,
        minHeight: "100vh",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;600;700;800;900&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap"
      />

      {/* ── TOP NAV ──────────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: C.ink,
          color: "#fff",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Link
            to="/"
            style={{
              fontFamily: font.display,
              fontWeight: 900,
              fontSize: 15,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#fff",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: C.amber,
                animation: "pulse 2s infinite",
                display: "inline-block",
              }}
            />
            Find Esti
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <Link
              to="/map"
              style={{
                fontFamily: font.display,
                fontWeight: 700,
                fontSize: 13,
                color: "#fff",
                textDecoration: "none",
                padding: "7px 12px",
                borderRadius: 8,
                background: C.teal,
              }}
            >
              Interactive map
            </Link>
            <Link
              to="/stakeout"
              style={{
                fontFamily: font.display,
                fontWeight: 700,
                fontSize: 13,
                color: "#fff",
                textDecoration: "none",
                padding: "7px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              Volunteer stakeout
            </Link>
            <a
              href="tel:6473554148"
              style={{
                fontFamily: font.display,
                fontWeight: 700,
                fontSize: 13,
                color: "#fff",
                textDecoration: "none",
                padding: "7px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              Tip line
            </a>
            <a
              href="tel:911"
              style={{
                fontFamily: font.display,
                fontWeight: 800,
                fontSize: 13,
                color: "#fff",
                textDecoration: "none",
                padding: "7px 12px",
                borderRadius: 8,
                background: C.amber,
              }}
            >
              911
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <header
        style={{
          background: `linear-gradient(160deg, ${C.tealDeep} 0%, ${C.teal} 100%)`,
          color: "#fff",
          padding: "44px 20px 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={fade(0)}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 999,
              padding: "6px 14px",
              fontFamily: font.display,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 22,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: C.amber,
                boxShadow: `0 0 0 0 ${C.amber}`,
                animation: "pulse 2s infinite",
                display: "inline-block",
              }}
            />
            Active search · Updated May 24, 2026
          </div>

          <h1
            style={{
              fontFamily: font.display,
              fontWeight: 900,
              fontSize: "clamp(44px, 13vw, 92px)",
              lineHeight: 0.92,
              margin: "0 0 6px",
              letterSpacing: "-0.03em",
            }}
          >
            FIND ESTI
          </h1>
          <p
            style={{
              fontFamily: font.body,
              fontStyle: "italic",
              fontSize: "clamp(17px, 4.5vw, 22px)",
              opacity: 0.92,
              margin: "0 0 4px",
            }}
          >
            Esther — also known as Sylvia
          </p>
          <p
            style={{
              fontFamily: font.display,
              fontSize: 15,
              fontWeight: 600,
              opacity: 0.85,
              margin: 0,
            }}
          >
            14 years old · Missing from North York since the night of May 15
          </p>
        </div>

        {/* primary actions */}
        <div
          style={{
            ...fade(0.15),
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            marginTop: 26,
          }}
        >
          <a
            href="tel:911"
            style={{
              background: C.amber,
              color: "#fff",
              textDecoration: "none",
              fontFamily: font.display,
              fontWeight: 800,
              fontSize: 15,
              padding: "14px 22px",
              borderRadius: 10,
              boxShadow: "0 4px 14px rgba(232,130,14,0.4)",
            }}
          >
            See her now? Call 911
          </a>
          <a
            href="tel:6473554148"
            style={{
              background: "rgba(255,255,255,0.95)",
              color: C.tealDeep,
              textDecoration: "none",
              fontFamily: font.display,
              fontWeight: 800,
              fontSize: 15,
              padding: "14px 22px",
              borderRadius: 10,
            }}
          >
            Tip line: 647-355-4148
          </a>
          <Link
            to="/map"
            style={{
              background: "rgba(0,0,0,0.22)",
              color: "#fff",
              textDecoration: "none",
              fontFamily: font.display,
              fontWeight: 800,
              fontSize: 15,
              padding: "14px 22px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            Search the shelter map →
          </Link>
        </div>
        <a
          href="https://www.tps.ca/missing/find-esther/"
          target="_blank"
          rel="noreferrer"
          style={{
            ...fade(0.2),
            display: "inline-block",
            marginTop: 16,
            color: "#fff",
            fontFamily: font.display,
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "0.04em",
            opacity: 0.9,
          }}
        >
          Official police page & evidence upload → tps.to/findesther
        </a>
      </header>

      {/* ── REWARD STRIP ─────────────────────────────────────── */}
      <div
        style={{
          background: C.ink,
          color: "#fff",
          textAlign: "center",
          padding: "14px 20px",
          fontFamily: font.display,
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        <span style={{ color: C.amber, fontWeight: 900 }}>$25,000 reward</span> for information
        leading to her safe return.
      </div>

      <main style={{ paddingTop: 44 }}>
        {/* ── WHO TO LOOK FOR ────────────────────────────────── */}
        <Section kicker="Who to look for" title="What Esti looks like">
          {/* Reference video — first impression of how Esti moves and speaks */}
          <figure
            style={{
              margin: "0 0 18px",
              background: C.card,
              border: `1px solid ${C.line}`,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 1px 2px rgba(26,31,46,0.04)",
            }}
          >
            <video
              src={`${import.meta.env.BASE_URL}Esti.mp4`}
              controls
              playsInline
              preload="metadata"
              poster={`${import.meta.env.BASE_URL}${encodeURIComponent("Esti 1.jpg")}`}
              style={{
                display: "block",
                width: "100%",
                background: "#000",
              }}
            >
              Your browser does not support embedded video.
            </video>
            <figcaption
              style={{
                fontFamily: font.display,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: C.muted,
                padding: "8px 10px",
                borderTop: `1px solid ${C.line}`,
                textAlign: "center",
              }}
            >
              Recent video of Esti
            </figcaption>
          </figure>

          {/* Photo gallery — reference images so people can recognise her on the street */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
              marginBottom: 22,
            }}
          >
            {(
              [
                ["Esti 1.jpg", "Recent photo of Esti", "Recent", "center"],
                ["Esti 2.jpg", "Recent close-up of Esti's face", "Recent close-up", "center"],
                [
                  "Esti 3.png",
                  "Esti in the green sweater and grey sweatpants she was last seen wearing",
                  "Last seen wearing",
                  // Source is a tall portrait crop; anchor to the top so her face stays
                  // in the square thumbnail instead of being cropped off above the shoulders.
                  "center top",
                ],
                [
                  "Esti Security Footage.jpg",
                  "Security camera stills of Esti the night she disappeared",
                  "Security footage",
                  "center",
                ],
              ] as [string, string, string, string][]
            ).map(([file, alt, caption, objectPosition]) => (
              <figure
                key={file}
                style={{
                  margin: 0,
                  background: C.card,
                  border: `1px solid ${C.line}`,
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 1px 2px rgba(26,31,46,0.04)",
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}${encodeURIComponent(file)}`}
                  alt={alt}
                  loading="lazy"
                  style={{
                    display: "block",
                    width: "100%",
                    aspectRatio: "1 / 1",
                    objectFit: "cover",
                    objectPosition,
                    background: C.paper,
                  }}
                />
                <figcaption
                  style={{
                    fontFamily: font.display,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: C.muted,
                    padding: "8px 10px",
                    borderTop: `1px solid ${C.line}`,
                    textAlign: "center",
                  }}
                >
                  {caption}
                </figcaption>
              </figure>
            ))}
          </div>

          <Card accent={C.teal}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 16,
              }}
            >
              {[
                ["Age", "14 years old"],
                ["Height", "5'2\" (157 cm)"],
                ["Build", "Medium"],
                ["Hair / eyes", "Brown / brown"],
                ["Appearance", "White; looks like a typical teen"],
                ["May go by", "“Sylvia”"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div
                    style={{
                      fontFamily: font.display,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: C.muted,
                      marginBottom: 3,
                    }}
                  >
                    {k}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 20,
                paddingTop: 18,
                borderTop: `1px solid ${C.line}`,
              }}
            >
              <div
                style={{
                  fontFamily: font.display,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: C.muted,
                  marginBottom: 6,
                }}
              >
                Last seen wearing
              </div>
              <div style={{ fontSize: 17, lineHeight: 1.5 }}>
                A <strong>turquoise / green sweater with words on the front</strong>,{" "}
                <strong>grey sweatpants</strong>, and <strong>no shoes</strong>. She left with no
                phone, money, or coat.
              </div>
            </div>
          </Card>

          <Card
            accent={C.amber}
            style={{ marginTop: 14, background: C.amberSoft, borderColor: "#f3d9b0" }}
          >
            <div style={{ fontSize: 16, lineHeight: 1.55 }}>
              <strong>She is on the autism spectrum.</strong> She is intelligent and social, so a
              stranger likely <em>won't realize she is vulnerable</em>. She may not recognize
              danger. Be gentle, patient, and stay with her while you call for help.
            </div>
          </Card>
        </Section>

        {/* ── CONFIRMED FACTS ────────────────────────────────── */}
        <Section kicker="What we actually know" title="The confirmed timeline">
          <p
            style={{
              fontSize: 16,
              color: C.muted,
              marginTop: -8,
              marginBottom: 22,
              lineHeight: 1.55,
            }}
          >
            Every confirmed sighting is from the <strong>first night</strong>. Anything you've seen
            online after this — a downtown bus, app reports, theories about her name — is{" "}
            <strong>unconfirmed</strong>. Work from facts, not rumours.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {(
              [
                {
                  t: "Fri May 15, ~11:15 PM",
                  h: "Leaves home near Earl Bales Park",
                  d: "Bathurst & Sheppard. Heads northeast on foot — barefoot.",
                },
                {
                  t: "Fri May 15, late night",
                  h: "Inside Popeyes at Bathurst & Wilson",
                  d: "Caught on camera, still barefoot, appearing to talk to someone. This is the clearest image of her — and very early in her path.",
                },
                {
                  t: "Sat May 16, ~12:01 AM",
                  h: "Bathurst & Hotspur Road",
                  d: "Just south of Highway 401. This is the LAST police-confirmed sighting.",
                },
                {
                  t: "After 12:01 AM, May 16",
                  h: "The trail goes cold",
                  d: "Nothing confirmed since. Closing this gap is the whole job.",
                  cold: true,
                },
              ] as TimelineEvent[]
            ).map((e, i, arr) => (
              <div key={i} style={{ display: "flex", gap: 16 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: e.cold ? C.red : C.teal,
                      border: "3px solid #fff",
                      boxShadow: `0 0 0 1px ${e.cold ? C.red : C.teal}`,
                      marginTop: 4,
                    }}
                  />
                  {i < arr.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: C.line, minHeight: 30 }} />
                  )}
                </div>
                <div style={{ paddingBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: font.display,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: e.cold ? C.red : C.teal,
                      textTransform: "uppercase",
                    }}
                  >
                    {e.t}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 4px" }}>{e.h}</div>
                  <div style={{ fontSize: 15.5, color: C.muted, lineHeight: 1.5 }}>{e.d}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── THE STRATEGY ───────────────────────────────────── */}
        <Section
          kicker="The single most important idea"
          title="Stop searching where she was. Saturate where she'd have to go."
        >
          <p style={{ fontSize: 16.5, lineHeight: 1.6, marginTop: -8 }}>
            A barefoot 14-year-old with no money or phone has survived nine days. She has almost
            certainly relied on{" "}
            <strong>warm, indoor, anonymous places where no one needs money</strong> — and on people
            who work with vulnerable youth. Those are the places and people to reach.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
              marginTop: 22,
            }}
          >
            {[
              [
                "🏥",
                "Hospital ERs & walk-in clinics",
                "A barefoot child needing care presents here. Brief triage desks citywide.",
              ],
              [
                "🛏️",
                "Youth shelters & street outreach",
                "Covenant House, Eva's, Streets to Homes. Ask their night staff to watch — they walk these routes.",
              ],
              [
                "🚇",
                "Transit hubs (in person)",
                "Union, Bloor-Yonge, St. George, Kennedy. Make sure staff have her PHOTO, not just a description.",
              ],
              [
                "📚",
                "Public libraries",
                "Warm, free, computers, no questions asked. Brief branch staff, especially downtown.",
              ],
              [
                "🍔",
                "Late-night food spots",
                "Open 24h, warm, you can sit without buying much. She was already seen inside a Popeyes.",
              ],
              [
                "💊",
                "24-hour pharmacies",
                "Another warm, anonymous indoor refuge along the corridor and southward.",
              ],
            ].map(([icon, h, d]) => (
              <Card key={h} style={{ padding: "16px 16px" }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
                <div
                  style={{
                    fontFamily: font.display,
                    fontWeight: 800,
                    fontSize: 15.5,
                    marginBottom: 4,
                  }}
                >
                  {h}
                </div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.45 }}>{d}</div>
              </Card>
            ))}
          </div>

          {/* Interactive shelter & drop-in map */}
          <Link
            to="/map"
            style={{
              display: "block",
              marginTop: 18,
              background: `linear-gradient(160deg, ${C.tealDeep} 0%, ${C.teal} 100%)`,
              color: "#fff",
              textDecoration: "none",
              borderRadius: 14,
              padding: "20px 22px",
            }}
          >
            <div
              style={{
                fontFamily: font.display,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                opacity: 0.85,
                marginBottom: 6,
              }}
            >
              Use the map →
            </div>
            <div
              style={{
                fontFamily: font.display,
                fontWeight: 800,
                fontSize: 19,
                lineHeight: 1.2,
                marginBottom: 6,
              }}
            >
              Interactive shelter & drop-in map
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.92 }}>
              Every youth shelter and drop-in centre in Toronto, mapped — the warm, youth-facing
              places where she might seek refuge. Brief the staff nearest her last-known route.
            </div>
          </Link>
        </Section>

        {/* ── HOW TO SEARCH WELL ─────────────────────────────── */}
        <Section kicker="If you're searching" title="How to actually help">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              [
                "Get your assignment from the command post",
                "Don't self-deploy on a rumour. The command post assigns zones so the city gets covered without 50 people checking the same block.",
              ],
              [
                "Check cameras for the right window",
                "If you have footage near Bathurst (and southward), the most useful window is roughly 12:00–2:00 AM on May 16. Hand it to police — don't try to judge it yourself.",
              ],
              [
                "Put her PHOTO in people's hands",
                "She looks like a typical teen, so a verbal description isn't enough. Show transit staff, drivers, and shopkeepers the actual picture.",
              ],
              [
                "Poster smart, not just often",
                "Use weather-resistant stock. Wrap poles 3× and tape across the middle. Aim for spots outside the Jewish community where fewer people have heard.",
              ],
              [
                "Send leads to ONE place",
                "Real tips go to police (647-355-4148) or the command post — never debated in a group chat. Speed and accuracy beat speculation.",
              ],
            ].map(([h, d]) => (
              <Card key={h} accent={C.teal} style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: C.teal, fontSize: 20, lineHeight: 1.2 }}>✓</span>
                  <div>
                    <div
                      style={{
                        fontFamily: font.display,
                        fontWeight: 800,
                        fontSize: 16,
                        marginBottom: 3,
                      }}
                    >
                      {h}
                    </div>
                    <div style={{ fontSize: 15, color: C.muted, lineHeight: 1.5 }}>{d}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Map CTA — briefing shelters & drop-ins */}
          <Link
            to="/map"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginTop: 18,
              background: C.card,
              border: `1px solid ${C.line}`,
              borderLeft: `5px solid ${C.amber}`,
              borderRadius: 12,
              padding: "16px 18px",
              textDecoration: "none",
              color: C.ink,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: font.display,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: C.amber,
                  marginBottom: 4,
                }}
              >
                Briefing staff next?
              </div>
              <div
                style={{
                  fontFamily: font.display,
                  fontWeight: 800,
                  fontSize: 16,
                  lineHeight: 1.25,
                }}
              >
                Find the shelter or drop-in nearest your route →
              </div>
            </div>
            <span
              style={{
                fontFamily: font.display,
                fontWeight: 800,
                fontSize: 13,
                color: C.tealDeep,
                whiteSpace: "nowrap",
              }}
            >
              Open map
            </span>
          </Link>
        </Section>

        {/* ── DON'T WASTE ENERGY ─────────────────────────────── */}
        <Section kicker="Protect the search" title="Where NOT to spend energy">
          <Card style={{ background: "#faf6ef", borderColor: "#ead9c2" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                [
                  "Debating an Amber Alert",
                  "It legally requires evidence of abduction, which this case doesn't meet. Settled — let it go.",
                ],
                [
                  "Reposting unconfirmed sightings",
                  "“She was on a bus / on an app” reports aren't confirmed. Sharing them as fact sends searchers the wrong way.",
                ],
                [
                  "Playing detective in the chat",
                  "Theories about her name, motives, or who she's with clog the channel people rely on for real coordination.",
                ],
                [
                  "Making the torn-down posters the mission",
                  "Document it, report it, replace them — but the goal is finding Esti, not chasing the vandals.",
                ],
              ].map(([h, d]) => (
                <div key={h} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: C.red, fontSize: 18, fontWeight: 800, lineHeight: 1.3 }}>
                    ✕
                  </span>
                  <div>
                    <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15.5 }}>
                      {h}
                    </div>
                    <div style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.45 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* ── CONTACTS ───────────────────────────────────────── */}
        <Section kicker="Report anything" title="Who to contact">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(
              [
                ["Active sighting — call now", "911", "tel:911", C.amber],
                ["Police tip line", "647-355-4148", "tel:6473554148", C.teal],
                ["Toronto Police (general)", "416-808-3200", "tel:4168083200", C.teal],
                ["Crime Stoppers (anonymous)", "416-222-8477", "tel:4162228477", C.teal],
              ] as [string, string, string, string][]
            ).map(([label, num, href, col]) => (
              <a
                key={num}
                href={href}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: C.card,
                  border: `1px solid ${C.line}`,
                  borderLeft: `5px solid ${col}`,
                  borderRadius: 12,
                  padding: "15px 18px",
                  textDecoration: "none",
                  color: C.ink,
                }}
              >
                <span style={{ fontFamily: font.display, fontWeight: 600, fontSize: 15 }}>
                  {label}
                </span>
                <span
                  style={{ fontFamily: font.display, fontWeight: 800, fontSize: 17, color: col }}
                >
                  {num}
                </span>
              </a>
            ))}

            <button
              onClick={() => copy("https://www.tps.ca/missing/find-esther/", "link")}
              style={{
                background: C.tealDeep,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "15px 18px",
                fontFamily: font.display,
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                marginTop: 4,
              }}
            >
              {copied === "link"
                ? "✓ Link copied — share it everywhere"
                : "Copy the official link to share → tps.to/findesther"}
            </button>
          </div>

          <p
            style={{
              fontSize: 14,
              color: C.muted,
              lineHeight: 1.5,
              marginTop: 18,
              textAlign: "center",
            }}
          >
            Upload dashcam, doorbell, or security footage directly through the official police page.
            Even a partial detail could bring her home.
          </p>
        </Section>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer
        style={{
          background: C.ink,
          color: "rgba(255,255,255,0.8)",
          textAlign: "center",
          padding: "32px 20px 38px",
        }}
      >
        <div
          style={{
            fontFamily: font.display,
            fontWeight: 800,
            fontSize: 18,
            color: "#fff",
            marginBottom: 8,
          }}
        >
          Bring Esti home.
        </div>
        <p style={{ fontSize: 13.5, maxWidth: 460, margin: "0 auto", lineHeight: 1.55 }}>
          Confirmed details are from Toronto Police and public reporting as of May 24, 2026. Please
          verify numbers against the latest official poster before sharing. Share widely —
          especially outside the community, where fewer people have heard.
        </p>
      </footer>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(232,130,14,0.6); }
          70% { box-shadow: 0 0 0 10px rgba(232,130,14,0); }
          100% { box-shadow: 0 0 0 0 rgba(232,130,14,0); }
        }
        * { box-sizing: border-box; }
        a:hover { opacity: 0.92; }
      `}</style>
    </div>
  );
}
