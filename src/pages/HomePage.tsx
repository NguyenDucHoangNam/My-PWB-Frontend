import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, UserPlus, ArrowRight } from "lucide-react";
import TargetAudienceSection from "../component/feature/TargetAudienceSection";
import FeaturesIntroductionSection from "../component/feature/FeaturesIntroductionSection";
import IndividualFeatureSection from "../component/feature/IndividualFeatureSection";
import BackgroundVideo from "../component/background/BackgroundVideo";
import { smoothScrollToElement } from "@/utils/scrollUtils";
// Import section components

const HomePage: React.FC = () => {
  const location = useLocation();
  useEffect(() => {
    // Scroll animation effect
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-active");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);
  useEffect(() => {
    if (location.state?.scrollTo) {
      const sectionId = location.state.scrollTo;
      // Cho trang có thời gian render rồi mới scroll
      setTimeout(() => {
        smoothScrollToElement(sectionId, 150);
      }, 400);
    }
  }, [location.state]);
  return (
    <div className="bg-aurora text-white min-h-screen font-sans relative overflow-hidden">
      {/* Hero Section */}
      <section className=" h-screen w-full relative flex items-center justify-center text-center p-4 flex-col overflow-hidden">
        {/* Background Video - Full Screen */}
        <BackgroundVideo />

        {/* Dark Overlay for better text readability */}
        {/* <div
          className="absolute inset-0 bg-black/50"
          style={{ zIndex: 2 }}
        ></div> */}

        {/* Gradient Overlay for better visual effect */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"
          style={{ zIndex: 3 }}
        ></div>

        {/* Content Overlay */}
        <div className="animate-fade-in space-y-10 max-w-6xl relative z-10">
          {/* Main Title */}
          <div className="text-center space-y-8">
            <h1 className="flex items-center justify-center flex-wrap text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
              <span className="relative text-purple-500 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]">
                PRODUCER WORKBENCH
                {/* ✨ Hiệu ứng neon ánh sáng mờ xung quanh */}
                {/* <span className="absolute inset-0 blur-lg opacity-40 bg-purple-500 rounded-lg"></span> */}
              </span>

              {/* 🪐 Icon cùng hàng */}
              <span className="ml-3 text-4xl md:text-5xl lg:text-6xl animate-float inline-flex items-center drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]">
                🪐
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-gray-200/90 max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
              Hợp tác trực quan, quản lý chuyên nghiệp, thanh toán an toàn.{" "}
              <br />
              Nền tảng tất cả trong một dành cho Music Producer.
            </p>

            <div className="mx-auto w-32 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-70" />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            <Link
              to="/listProducer"
              className="group relative inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white 
       bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500
       rounded-xl shadow-lg 
       transition-all duration-300 hover:scale-105 hover:brightness-110"
            >
              <Search className="w-6 h-6 " />
              🚀 Tìm Producer Ngay
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/proPackage"
              className="group relative inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white 
       bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500
       rounded-xl shadow-lg
       transition-all duration-300 hover:scale-105 hover:brightness-110"
            >
              <UserPlus className="w-6 h-6" />
              🧑‍🚀 Tham gia với tư cách Producer
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <TargetAudienceSection />

      {/* Features Introduction Section */}
      <FeaturesIntroductionSection />

      {/* Individual Feature Sections */}
      <IndividualFeatureSection />
    </div>
  );
};

export default HomePage;
