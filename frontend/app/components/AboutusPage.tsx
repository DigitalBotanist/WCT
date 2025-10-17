import Navbar from "./Navbar";

const AboutUs = () => {
  return (
    <div className="font-[Segoe_UI] text-white bg-[#0e1b2c] m-0 p-0 box-border">
      <Navbar />
      <section className="bg-[#16293a] bg-[url('../app/assets/wildlifeimg.jpg')] bg-no-repeat bg-cover py-16 px-10 flex flex-wrap items-center justify-between gap-8 max-md:flex-col max-md:text-center max-md:py-12 max-md:px-6">
        <div className="about-text">
          <h1 className="text-[#2bb89d] text-[5rem] font-semibold mb-4 transition-colors duration-300 hover:text-[#3ed1b3]">
            About Us
          </h1>
          <p className="text-gray-300 text-[1.1rem] max-w-[600px] leading-relaxed max-md:max-w-full">
            Welcome to <span className="font-semibold">WildLife AI</span> — an intelligent wildlife
            discovery and conservation platform powered by Agentic AI.
          </p>
        </div>
        <div className="flex-shrink-0 w-80 h-48 bg-[url('../app/assets/wildlifeimg.jpg')] bg-no-repeat bg-cover rounded-md max-md:w-full max-md:h-40"></div>
      </section>

      <section className="bg-[#0b1828] text-center py-20 px-10 max-md:py-12 max-md:px-6">
        <h2 className="text-[#2bb89d] text-[1.8rem] font-semibold mb-8 transition-colors duration-300 hover:text-[#3ed1b3]">
          Who Are We?
        </h2>
        <p className="text-slate-300 text-base leading-8 max-w-[900px] mx-auto">
          Our goal is to bridge the gap between technology and the natural world by helping users
          explore, understand, and protect wildlife with accurate, real-time information.<br /><br />
          With a single search, users can uncover an animal’s migration patterns, endangered status,
          and threat factors across the globe. Whether you’re a researcher, student, conservationist,
          or simply a wildlife enthusiast, our platform brings deep ecological insights within
          reach.<br /><br />
          At the heart of our project lies a passion for preserving biodiversity. We believe that
          awareness is the first step toward conservation — and AI can be a powerful ally in that
          mission. By analyzing vast datasets on wildlife movement and threats, our system helps
          identify patterns and trends that humans alone might miss.<br /><br />
          Together, we can turn data into action — helping future generations witness the beauty and
          diversity of wildlife that our planet holds today.
        </p>
      </section>

      <section className="bg-[#16293a] text-center py-20 px-10 max-md:py-12 max-md:px-6">
        <h2 className="text-[#2bb89d] text-[1.8rem] font-semibold mb-12 transition-colors duration-300 hover:text-[#3ed1b3]">
          Our Values
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-10 max-w-[1100px] mx-auto text-gray-300">
          {[
            {
              title: "Innovation for Nature",
              desc: "Using AI to explore, track, and understand species and natural systems.",
            },
            {
              title: "Transparency",
              desc: "Reliable, data-backed insights that empower better decision-making.",
            },
            {
              title: "Education",
              desc: "Encouraging curiosity and learning about the living world.",
            },
            {
              title: "Conservation",
              desc: "Turning knowledge into actionable steps of sustainability.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#1c3c54]"
            >
              <h3 className="text-[#2bb89d] font-semibold mb-2 transition-colors duration-300 hover:text-[#3ed1b3]">
                {item.title}
              </h3>
              <p className="text-[0.95rem] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-[50px] p-[50px] bg-[#0e1b2c]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-10 max-w-[1100px] mx-auto text-gray-300">
          <div className="p-4 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#1c3c54] bg-[#182133]">
            <h2 className="text-[#1dd195] mb-2 font-semibold transition-colors duration-300 hover:text-[#3ed1b3]">
              Our Mission
            </h2>
            <p className="text-[#1dd195] leading-relaxed">
              To empower people and technology to protect wildlife through knowledge, data, and
              intelligent insights.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-[50px] p-[50px] bg-[#0e1b2c]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-10 max-w-[1100px] mx-auto text-gray-300">
          <div className="p-4 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#1c3c54] bg-[#182133]">
            <h2 className="text-[#1dd195] mb-2 font-semibold transition-colors duration-300 hover:text-[#3ed1b3]">
              Our Vision
            </h2>
            <p className="text-[#1dd195] leading-relaxed">
              A future where every species thrives — guided by awareness, collaboration, and
              AI-driven conservation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
