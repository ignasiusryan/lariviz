/**
 * Official "Connect with Strava" button.
 *
 * Follows Strava brand guidelines:
 * https://developers.strava.com/guidelines/
 *  - Orange #FC4C02 background
 *  - White Strava logo on the left
 *  - "CONNECT WITH STRAVA" text, uppercase, white
 *  - No modifications to colors, type, or proportions
 */

interface Props {
  href?: string;
  size?: "small" | "large";
}

export function ConnectStravaButton({
  href = "/api/auth/login",
  size = "large",
}: Props) {
  const isLarge = size === "large";
  const padding = isLarge ? "0.85rem 1.5rem" : "0.55rem 1.1rem";
  const fontSize = isLarge ? "0.95rem" : "0.78rem";
  const iconSize = isLarge ? 22 : 18;
  const gap = isLarge ? "0.7rem" : "0.5rem";

  return (
    <a
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap,
        padding,
        background: "#FC4C02",
        color: "#FFFFFF",
        fontFamily: "var(--font-sans)",
        fontSize,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        textDecoration: "none",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        transition: "filter 0.15s, transform 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = "brightness(1.08)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "brightness(1)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={iconSize}
        height={iconSize}
        fill="#FFFFFF"
        aria-hidden="true"
      >
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
      Connect with Strava
    </a>
  );
}
