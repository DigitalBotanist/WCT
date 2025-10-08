import "../aboutus.css";

const AboutUs = () => {
  return (
    <div className="about-container">
      <section className="about-section">
        <div className="about-text">
          <h1>About Us</h1>
          <p>
            Welcome to <span>WildLife AI</span> — an intelligent wildlife discovery and conservation
            platform powered by Agentic AI.
          </p>
        </div>
        <div className="about-image"></div>
      </section>

      <section className="who-section">
        <h2>Who Are We?</h2>
        <p>
          Our goal is to bridge the gap between technology and the natural world by helping users
          explore, understand, and protect wildlife with accurate, real-time information.<br /><br />
          With a single search, users can uncover an animal’s migration patterns, endangered status,
          and threat factors across the globe. Whether you’re a researcher, student, conservationist,
          or simply a wildlife enthusiast, our platform brings deep ecological insights within reach.<br /><br />
          At the heart of our project lies a passion for preserving biodiversity. We believe that
          awareness is the first step toward conservation — and AI can be a powerful ally in that
          mission. By analyzing vast datasets on wildlife movement and threats, our system helps
          identify patterns and trends that humans alone might miss.<br /><br />
          Together, we can turn data into action — helping future generations witness the beauty and
          diversity of wildlife that our planet holds today.
        </p>
      </section>

      <section className="values-section">
        <h2>Our Values</h2>
        <div className="values-grid">
          <div className="value-box">
            <h3>Innovation for Nature</h3>
            <p>Using AI to explore, track, and understand species and natural systems.</p>
          </div>
          <div className="value-box">
            <h3>Transparency</h3>
            <p>Reliable, data-backed insights that empower better decision-making.</p>
          </div>
          <div className="value-box">
            <h3>Education</h3>
            <p>Encouraging curiosity and learning about the living world.</p>
          </div>
          <div className="value-box">
            <h3>Conservation</h3>
            <p>Turning knowledge into actionable steps of sustainability.</p>
          </div>
        </div>
      </section>

      <section className="mission-vision-section">
        {/* <div className="mission">
            <h2>Our Mission</h2>
            <p>To empower people and technology to protect wildlife through knowledge, data, and intelligent insights.</p>
        </div> */}

        <div className="values-grid">
          <div className="value-box">
            <h2>Our Mission</h2>
            <p>To empower people and technology to protect wildlife through knowledge, data, and intelligent insights.</p>
          </div>
          {/* <div className="vision">
            <h2>Our Vision</h2>
            <p>A future where every species thrives — guided by awareness, collaboration, and AI-driven conservation.</p>
        </div> */}
        </div>
      </section>

      <section className="mission-vision-section">
        <div className="values-grid">
          <div className="value-box">
            <h2>Our Vision</h2>
            <p>
              A future where every species thrives — guided by awareness, collaboration, and AI-driven
              conservation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
