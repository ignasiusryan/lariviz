"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { StravaAttribution } from "@/components/StravaAttribution";
import { ConnectStravaButton } from "@/components/ConnectStravaButton";

const features = [
  {
    title: "Heatmaps",
    subtitle: "See your consistency at a glance",
    description:
      "Beautiful GitHub-style heatmaps that show your running streak, daily distance, and year-over-year progress.",
    aspect: "16/9",
    image: "/landing/heatmaps.png",
  },
  {
    title: "Route Facets",
    subtitle: "Discover your running patterns",
    description:
      "Every route rendered as a mini-map. See the shape of your favorite loops, trails, and races side by side.",
    aspect: "16/9",
    image: "/landing/routes.png",
  },
  {
    title: "Pace Insights",
    subtitle: "Track your speed across distances",
    description:
      "Scatter plots of pace vs distance, with trend lines and year-over-year comparison to track your progress.",
    aspect: "16/9",
    image: "/landing/insights.png",
  },
  {
    title: "Stickers & Share Cards",
    subtitle: "Create beautiful shareable visuals",
    description:
      "Generate race recaps, streak counters, monthly wraps, and more — ready to share on social media.",
    aspect: "1",
    image: "/landing/stickers.png",
  },
  {
    title: "Map Posters",
    subtitle: "Turn your favorite run into wall art",
    description:
      "Select any run and render it as a clean, minimalist poster with your stats and route overlaid on a map.",
    aspect: "3/4",
    image: "/landing/poster.png",
  },
  {
    title: "Personal Records",
    subtitle: "Celebrate your fastest splits",
    description:
      "Track your PRs at every distance — from 1K to marathon — with dates, times, and pace breakdowns.",
    aspect: "16/9",
    image: "/landing/records.png",
  },
];

const steps = [
  { number: "1", title: "Connect Strava", description: "One-click OAuth — we never see your password" },
  { number: "2", title: "Explore your data", description: "Heatmaps, routes, pace charts, and more" },
  { number: "3", title: "Share & celebrate", description: "Download stickers, posters, and share cards" },
];

export function LandingPage() {
  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--orange-5)",
              fontFamily: "var(--font-mono)",
            }}
          >
            LARIVIZ
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <ThemeToggle />
            <ConnectStravaButton size="small" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-text">
            <h1 className="landing-hero-title">
              Visualize every mile.
            </h1>
            <p className="landing-hero-subtitle">
              Turn your Strava data into stunning heatmaps, route art, pace
              insights, and shareable stickers.
            </p>
            <ConnectStravaButton size="large" />
          </div>
          <div className="landing-hero-visual">
            <img
              src="/landing/hero.png"
              alt="Lariviz heatmap dashboard preview"
              className="landing-image"
              style={{ aspectRatio: "16/9" }}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        {features.map((feat, i) => (
          <div
            key={feat.title}
            className={`landing-feature ${i % 2 === 1 ? "reverse" : ""}`}
          >
            <div className="landing-feature-text">
              <div className="landing-feature-label">{feat.subtitle}</div>
              <h2 className="landing-feature-title">{feat.title}</h2>
              <p className="landing-feature-desc">{feat.description}</p>
            </div>
            <div className="landing-feature-visual">
              <img
                src={feat.image}
                alt={`${feat.title} preview`}
                className="landing-image"
                style={{ aspectRatio: feat.aspect }}
              />
            </div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="landing-steps-section">
        <h2 className="landing-section-title">How it works</h2>
        <div className="landing-steps">
          {steps.map((step) => (
            <div key={step.number} className="landing-step">
              <div className="landing-step-number">{step.number}</div>
              <h3 className="landing-step-title">{step.title}</h3>
              <p className="landing-step-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-final-cta">
        <h2 className="landing-section-title">Ready to visualize your runs?</h2>
        <ConnectStravaButton size="large" />
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--text-dim)",
            marginTop: "1rem",
          }}
        >
          OAuth only — we never see your password
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <StravaAttribution />
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>Built with care for runners</p>
        <StravaAttribution />
      </footer>
    </div>
  );
}
