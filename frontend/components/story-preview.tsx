type StoryPreviewProps = {
  locale: "fr" | "en";
};


export function StoryPreview({ locale }: StoryPreviewProps) {
  return (
    <div className="story-frame story-glow">
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(191,106,69,0.28), transparent 48%), url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80') center/cover"
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(15,17,22,0.06), rgba(15,17,22,0.6))"
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "28px 24px auto",
          display: "grid",
          gap: 8,
          color: "white"
        }}
      >
        <h3
          style={{
            margin: 0,
            maxWidth: 280,
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            lineHeight: 1.02
          }}
        >
          {locale === "fr" ? "Une story verticale prête en quelques instants." : "A vertical story, ready within moments."}
        </h3>
      </div>
      <div className="story-track-card">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background:
                "url('https://i.scdn.co/image/ab67616d0000b273648cf2f0e978c5d5a4ef0b2b') center/cover"
            }}
          />
          <div style={{ display: "grid", gap: 4 }}>
            <strong>Birthday</strong>
            <span style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.92rem" }}>
              Disclosure, Kehlani, Syd
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
