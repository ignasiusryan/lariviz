import type { ReactNode } from "react";

interface Props {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function CardSection({ title, headerRight, children }: Props) {
  return (
    <div
      className="card-section"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "18px",
        padding: "2rem",
        marginBottom: "2rem",
        overflow: "hidden",
        animation: "slideUp 0.5s ease 0.25s both",
      }}
    >
      <div
        className="card-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{title}</h2>
        {headerRight}
      </div>
      {children}
    </div>
  );
}
