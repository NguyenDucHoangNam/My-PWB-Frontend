const LoadingSearch = () => (
  <div className="flex flex-col items-center justify-center text-center text-gray-400 p-10 col-span-full">
    <div className="flex items-end justify-center h-16 space-x-2">
      <div
        className="w-4 bg-purple-500 animate-equalizer"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="w-4 bg-purple-500 animate-equalizer"
        style={{ animationDelay: "0.1s" }}
      ></div>
      <div
        className="w-4 bg-purple-500 animate-equalizer"
        style={{ animationDelay: "0.2s" }}
      ></div>
      <div
        className="w-4 bg-purple-500 animate-equalizer"
        style={{ animationDelay: "0.3s" }}
      ></div>
      <div
        className="w-4 bg-purple-500 animate-equalizer"
        style={{ animationDelay: "0.4s" }}
      ></div>
    </div>
    <p className="mt-4 text-lg font-semibold">Đang tìm kiếm producer...</p>
    <p className="text-sm">Vui lòng đợi trong giây lát.</p>
  </div>
);
export default LoadingSearch