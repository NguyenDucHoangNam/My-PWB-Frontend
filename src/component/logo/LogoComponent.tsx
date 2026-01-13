import logo from "@/assets/image/logo1.png"
const LogoComponent = () => {
  return (
    <div className="w-20 h-20 rounded-full overflow-hidden animate-spin-slow">
      <img
        src={logo} // 👉 thay bằng đường dẫn logo của bạn
        alt="Logo"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default LogoComponent;

