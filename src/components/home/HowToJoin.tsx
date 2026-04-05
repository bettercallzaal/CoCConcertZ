export default function HowToJoin() {
  const steps = [
    { num: "01", title: "ENTER THE VENUE", desc: "Hit the button above or scroll to the embedded venue on this page." },
    { num: "02", title: "CREATE AN ACCOUNT", desc: "Sign up for free on Spatial — takes less than a minute." },
    { num: "03", title: "EXPLORE & ENJOY", desc: "Walk around the virtual venue, meet other fans, and vibe to the music." },
  ];

  return (
    <section className="reveal" style={{ marginTop: 100 }}>
      <span className="section-label">Getting Started</span>
      <h2>HOW TO JOIN</h2>
      <p style={{ marginBottom: 24 }}>Getting into the metaverse is easy — and completely free.</p>
      <div className="steps">
        {steps.map((step, i) => (
          <div key={step.num} className={`step reveal reveal-delay-${i + 1}`}>
            <span className="step-number">{step.num}</span>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
