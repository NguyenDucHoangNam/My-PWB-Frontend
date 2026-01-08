import { useEffect } from "react";
import {
  FaInstagram,
  FaYoutube,
  FaSpotify,
  FaApple,
  FaStar,
  FaRegStar,
  FaUserPlus,
  FaCommentDots,
  FaPlayCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const portfolioData = {
  producerName: "Alex Thorne",
  tagline: "Sonic Architect & Beatmaker",
  avatarUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  coverUrl:
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800",
  stats: {
    totalProjects: "120+",
    systemProjects: "42",
    averageRating: "4.9 ★",
  },
  personalProjects: [
    {
      id: 1,
      name: "Cosmic Drift",
      genre: "Lo-fi Beat",
      description:
        "An atmospheric track perfect for late-night study sessions.",
      imageUrl:
        "https://images.unsplash.com/photo-1516269613936-48c93545d4f3?w=400",
      audioUrl: "#",
    },
    {
      id: 2,
      name: "Neon Pulse",
      genre: "Synthwave",
      description: "A high-energy retro track inspired by 80s cinema.",
      imageUrl:
        "https://images.unsplash.com/photo-1554232456-8727a6c34a21?w=400",
      audioUrl: "#",
    },
    {
      id: 3,
      name: "Urban Echoes",
      genre: "Boom Bap",
      description: "Classic hip-hop instrumental with a modern twist.",
      imageUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
      audioUrl: "#",
    },
  ],
  clientProjects: [
    {
      id: 1,
      name: 'Vocal Mix for "Starlight"',
      client: "Luna",
      rating: 5,
      feedback:
        '"Alex transformed my track! The clarity and punch are incredible. A true professional with a great ear."',
      date: "2025-08-15",
      imageUrl:
        "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400",
    },
    {
      id: 2,
      name: "Lo-fi Beat Pack",
      client: "ChillVibes Records",
      rating: 5,
      feedback:
        '"Fast delivery and top-notch quality. The beats are exactly what we were looking for. Highly recommended!"',
      date: "2025-07-22",
      imageUrl:
        "https://images.unsplash.com/photo-1612036782180-6f0b6cd84627?w=400",
    },
  ],
  clients: [
    {
      name: "Spotify",
      logoUrl:
        "https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png",
    },
    {
      name: "Universal Music",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Universal_Music_Group_logo.svg/2560px-Universal_Music_Group_logo.svg.png",
    },
  ],
  socials: [
    { icon: <FaInstagram size={24} />, url: "#" },
    { icon: <FaYoutube size={24} />, url: "#" },
  ],
  certifications: [
    {
      name: "Advanced Audio Engineering",
      issuer: "Berklee Online",
      year: "2024",
    },
  ],
  musicPlatforms: [
    { icon: <FaSpotify size={32} />, name: "Spotify", url: "#" },
    { icon: <FaApple size={32} />, name: "Apple Music", url: "#" },
  ],
  skills: ["Mixing", "Mastering", "Sound Design", "Vocal Tuning"],
};

const StarRating = ({ rating }: { rating: number }) => {
  const totalStars = 5;
  return (
    <div className="flex">
      {[...Array(totalStars)].map((_, index) =>
        index < rating ? (
          <FaStar key={index} className="text-yellow-400" />
        ) : (
          <FaRegStar key={index} className="text-gray-500" />
        )
      )}
    </div>
  );
};

function PortfolioPage() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
    });
  }, []);
  return (
    <div className="bg-white text-gray-900 dark:bg-dark-bg dark:text-text-primary font-inter overflow-x-hidden">
      <header className="relative h-screen flex items-center justify-center p-8 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-fade-in"
          style={{
            backgroundImage: `url(${portfolioData.coverUrl})`,
            filter: "brightness(0.4)",
          }}
        ></div>
        <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="relative col-span-1 flex justify-center md:justify-start">
            <div className="relative">
              <img
                src={portfolioData.avatarUrl}
                alt="Producer Avatar"
                className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-accent shadow-2xl object-cover"
              />
            </div>
          </div>
          <div className="col-span-2 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white dark:text-white animate-fade-in">
              {portfolioData.producerName}
            </h1>
            <p
              className="text-xl md:text-2xl text-accent font-medium mt-2 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              {portfolioData.tagline}
            </p>
            <div
              className="flex justify-center md:justify-start space-x-4 mt-6 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              {portfolioData.socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="text-gray-600 dark:text-text-secondary hover:text-accent transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="absolute w-full flex justify-center bottom-10 md:bottom-auto">
            <div className="flex space-x-8 bg-white/60 dark:bg-dark-surface/50 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-border-color">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {portfolioData.stats.totalProjects}
                </p>
                <p className="text-xs text-gray-600 dark:text-text-secondary">
                  Total Projects
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {portfolioData.stats.systemProjects}
                </p>
                <p className="text-xs text-gray-600 dark:text-text-secondary">
                  Workbench Projects
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {portfolioData.stats.averageRating}
                </p>
                <p className="text-xs text-gray-600 dark:text-text-secondary">
                  Average Rating
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-4 p-4">
          <button className="bg-accent text-white font-bold tracking-widest uppercase [writing-mode:vertical-rl] py-4 px-3 rounded-md hover:bg-opacity-80 transition-all text-sm">
            Hire Me
          </button>
          <button className="bg-white dark:bg-dark-surface p-3 rounded-full text-gray-600 dark:text-text-secondary hover:text-accent transition-colors border border-gray-200 dark:border-border-color">
            <FaUserPlus size={20} title="Kết bạn" />
          </button>
          <button className="bg-white dark:bg-dark-surface p-3 rounded-full text-gray-600 dark:text-text-secondary hover:text-accent transition-colors border border-gray-200 dark:border-border-color">
            <FaCommentDots size={20} title="Nhắn tin" />
          </button>
        </div>
      </header>
      <main className="relative z-10 bg-white dark:bg-dark-surface -mt-20 rounded-t-[40px] border-t-2 border-gray-200 dark:border-border-color">
        <section className="py-24 px-8">
          <h2
            className="text-4xl font-bold text-center mb-12"
            data-aos="fade-up"
          >
            Personal Projects
          </h2>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {portfolioData.personalProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white dark:bg-dark-bg p-4 rounded-xl border border-gray-200 dark:border-border-color transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="relative mb-4">
                  <img
                    src={project.imageUrl}
                    alt={project.name}
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <a
                    href={project.audioUrl}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaPlayCircle
                      size={48}
                      className="text-white transform group-hover:scale-110 transition-transform"
                    />
                  </a>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {project.name}
                </h3>
                <p className="text-sm font-medium text-accent mb-2">
                  {project.genre}
                </p>
                <p className="text-gray-600 dark:text-text-secondary text-sm">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="py-24 px-8 bg-gray-50 dark:bg-dark-bg">
          <h2 className="text-4xl font-bold text-center mb-12">
            Client Projects & Feedback
          </h2>
          <div className="space-y-12 max-w-4xl mx-auto">
            {portfolioData.clientProjects.map((project) => (
              <div
                key={project.id}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
                data-aos={project.id % 2 === 0 ? "fade-left" : "fade-right"}
              >
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  className="w-full h-full object-cover rounded-lg md:col-span-1"
                />
                <div className="md:col-span-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-text-secondary">
                        Client:{" "}
                        <span className="font-medium text-accent">
                          {project.client}
                        </span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <StarRating rating={project.rating} />
                      <p className="text-xs text-gray-600 dark:text-text-secondary mt-1">
                        {project.date}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-800 dark:text-text-primary mt-4 italic border-l-2 border-accent pl-4 text-sm">
                    "{project.feedback}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="py-16 px-8 text-center" data-aos="flip-left">
          <h3 className="text-sm uppercase tracking-widest text-text-secondary mb-8">
            Trusted By
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {portfolioData.clients.map((client) => (
              <img
                key={client.name}
                src={client.logoUrl}
                alt={client.name}
                className="h-6 md:h-8 object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all"
              />
            ))}
          </div>
        </section>
        <section
          className="py-24 px-8"
          data-aos="fade-up"
          data-aos-duration="3000"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start">
            <div className="col-span-2">
              <img
                src={portfolioData.avatarUrl}
                alt="Producer portrait"
                className="rounded-xl w-full object-cover shadow-2xl"
              />
            </div>
            <div className="col-span-3">
              <h2 className="text-4xl font-bold mb-4">About Me</h2>
              <p className="text-text-secondary leading-relaxed mb-8">
                With over a decade of experience, I help artists find their
                unique sound.
              </p>
              <h3 className="text-2xl font-bold mb-4">Certifications</h3>
              <div className="space-y-3">
                {portfolioData.certifications.map((cert, index) => (
                  <div key={index}>
                    <p className="font-bold text-text-primary">{cert.name}</p>
                    <p className="text-sm text-text-secondary">
                      {cert.issuer} - {cert.year}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 px-8 text-center border-t border-b border-gray-200 dark:border-border-color">
          <h2 className="text-2xl font-bold text-center mb-8">
            Listen on Streaming Platforms
          </h2>
          <div className="flex justify-center items-center space-x-8">
            {portfolioData.musicPlatforms.map((platform, index) => (
              <a
                key={index}
                href={platform.url}
                title={platform.name}
                className="text-gray-600 dark:text-text-secondary hover:text-accent transition-colors"
              >
                {platform.icon}
              </a>
            ))}
          </div>
        </section>
        <section className="py-24 px-8 text-center">
          <h2 className="text-4xl font-bold mb-12">Skills & Tools</h2>
          <div className="flex flex-wrap justify-center items-center gap-4 max-w-4xl mx-auto">
            {portfolioData.skills.map((skill, index) => (
              <div
                key={index}
                className="bg-dark-surface border border-border-color rounded-lg px-5 py-2 text-white dark:text-text-secondary dark:hover:text-accent hover:border-accent hover:text-accent transition-all cursor-pointer"
              >
                {skill}
              </div>
            ))}
          </div>
        </section>
        <section className="py-24 px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Let's Create Something Amazing.
          </h2>
          <p className="text-gray-600 dark:text-text-secondary max-w-2xl mx-auto mb-8">
            Have a project in mind? Let's talk.
          </p>
          <Link to={"/createProject"}>
            <button className="bg-accent text-white font-bold py-4 px-8 rounded-lg hover:bg-opacity-80 transition-transform hover:scale-105">
              Start Your Project
            </button>
          </Link>
        </section>
        <footer className="text-center py-8 text-gray-600 dark:text-text-secondary text-sm border-t border-gray-200 dark:border-border-color">
          &copy; {new Date().getFullYear()} {portfolioData.producerName}. All
          rights reserved.
        </footer>
      </main>
    </div>
  );
}

export default PortfolioPage;
