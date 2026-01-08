import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiXCircle, FiArrowRight } from "react-icons/fi";
import AOS from "aos";
import "aos/dist/aos.css";

const features = [
  { name: "Số lượng dự án", free: "Giới hạn 3", pro: "Không giới hạn", pro_strong: true },
  { name: "Dung lượng lưu trữ", free: "5 GB", pro: "100 GB", pro_strong: true },
  { name: "Soạn thảo Hợp đồng", free: "Mẫu cơ bản", pro: "Toàn bộ mẫu & Chữ ký điện tử", pro_strong: true },
  { name: "Ví tiền Dự án", free: false, pro: true, pro_strong: true },
  { name: "Quản lý Phân chia (Split Sheet)", free: false, pro: true, pro_strong: true },
  { name: "Thành viên/dự án", free: "Tối đa 2", pro: "Không giới hạn", pro_strong: false },
  { name: "Hỗ trợ Ưu tiên", free: false, pro: true, pro_strong: true },
];

const testimonials = [
  { quote: "Workbench Pro đã thay đổi hoàn toàn cách tôi làm việc. Tính năng Ví tiền và Hợp đồng giúp tôi trông chuyên nghiệp hơn rất nhiều.", name: "Luna", role: "Vocalist & Songwriter" },
  { quote: "Không còn phải lo lắng về việc lưu trữ hay giới hạn dự án. Tôi có thể tập trung hoàn toàn vào âm nhạc.", name: "Kai", role: "Music Producer" },
];

const faqs = [
  { q: "Tôi có thể hủy gói Pro bất cứ lúc nào không?", a: "Có, bạn có thể hủy đăng ký bất kỳ lúc nào. Bạn sẽ giữ lại quyền truy cập các tính năng Pro cho đến cuối chu kỳ thanh toán hiện tại của mình." },
  { q: "Phương thức thanh toán được chấp nhận là gì?", a: "Chúng tôi chấp nhận thanh toán qua Momo, ZaloPay, thẻ tín dụng/ghi nợ (Visa, Mastercard), và chuyển khoản ngân hàng qua mã VNQR." },
  { q: "Dữ liệu của tôi có được an toàn không?", a: "Tuyệt đối. Chúng tôi sử dụng các tiêu chuẩn mã hóa hàng đầu để đảm bảo tất cả các file và dữ liệu dự án của bạn luôn được an toàn và bảo mật." },
];

function UpdateProducer(props: React.HTMLAttributes<HTMLDivElement>) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: false });
  }, []);

  return (
    <div
      {...props}
      className={`bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#1e1b4b] dark:to-[#0f172a]
                  font-inter text-gray-900 dark:text-white antialiased transition-colors duration-300 ${props.className || ""}`}
    >
      <div className="w-full p-4 sm:p-6 lg:p-8">
        {/* Hero */}
        <section className="text-center py-16 sm:py-24">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter">
            Giải phóng Toàn bộ Sức mạnh của bạn
          </h1>
          <p className="w-full mt-6 text-lg text-gray-700 dark:text-gray-300">
            Truy cập các công cụ chuyên nghiệp, không giới hạn dự án và các tính năng hợp tác cao cấp được thiết kế dành riêng cho producer.
          </p>
        </section>

        {/* Features Table */}
        <section className="bg-white dark:bg-[#1e293b] p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="font-bold text-gray-900 dark:text-white text-left">Tính năng</div>
            <div className="font-bold text-gray-900 dark:text-white">Miễn phí</div>
            <div className="font-bold text-purple-400 border-2 border-purple-400 rounded-lg py-1">PRO</div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 mt-4">
            {features.map((feature) => (
              <div key={feature.name} className="grid grid-cols-3 gap-4 py-4 items-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{feature.name}</div>
                <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
                  {typeof feature.free === "boolean"
                    ? feature.free
                      ? <FiCheckCircle className="mx-auto text-green-500" />
                      : <FiXCircle className="mx-auto text-gray-500" />
                    : feature.free}
                </div>
                <div className={`text-center font-semibold text-sm ${feature.pro_strong ? "text-purple-500 dark:text-purple-400" : "text-gray-900 dark:text-white"}`}>
                  {typeof feature.pro === "boolean"
                    ? feature.pro
                      ? <FiCheckCircle className="mx-auto text-green-500" />
                      : <FiXCircle className="mx-auto text-gray-500" />
                    : feature.pro}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="my-16 sm:my-24" data-aos="zoom-in">
          <div className="max-w-md mx-auto bg-white dark:bg-[#1e293b] p-8 rounded-2xl border border-gray-200 dark:border-gray-700 text-center shadow-2xl transition-colors duration-300">
            <div className="flex justify-center items-center mb-6">
              <span className={`font-medium ${billingCycle === "monthly" ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>Tháng</span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="mx-4 relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent bg-gray-300 dark:bg-gray-600"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${billingCycle === "yearly" ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
              <span className={`font-medium ${billingCycle === "yearly" ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>Năm</span>
              <span className="ml-3 text-xs font-bold bg-green-500/20 text-green-400 py-1 px-2 rounded-md">TIẾT KIỆM 20%</span>
            </div>

            {billingCycle === "monthly" ? (
              <p className="text-4xl font-bold">500,000 <span className="text-lg font-medium text-gray-400">VNĐ / tháng</span></p>
            ) : (
              <p className="text-4xl font-bold">5,000,000 <span className="text-lg font-medium text-gray-400">VNĐ / năm</span></p>
            )}

            <button
              onClick={() => setPaymentModalOpen(true)}
              className="w-full bg-purple-500 text-white font-bold py-3 rounded-lg mt-8 hover:bg-purple-600 transition-transform hover:scale-105"
            >
              Nâng cấp lên Pro ngay
            </button>
          </div>
        </section>

        {/* Testimonials */}
        <section className="my-16 sm:my-24">
          <h2 className="text-3xl font-bold text-center mb-12">Được tin dùng bởi các Producer hàng đầu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-aos="flip-left">
            {testimonials.map((t) => (
              <figure key={t.name} className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <blockquote className="italic text-gray-700 dark:text-gray-300">"{t.quote}"</blockquote>
                <figcaption className="mt-4 flex items-center space-x-3">
                  <div className="font-bold">{t.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="my-16 sm:my-24 w-full" data-aos="fade-up">
          <h2 className="text-3xl font-bold text-center mb-12">Câu hỏi Thường gặp</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="bg-white dark:bg-[#1e293b] p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <summary className="font-semibold flex justify-between items-center">
                  {faq.q}
                  <FiArrowRight className="transform transition-transform duration-200 group-open:rotate-90" />
                </summary>
                <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 p-8 relative transition-colors duration-300">
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2">Xác nhận Nâng cấp</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Bạn đang nâng cấp lên <span className="font-bold text-purple-400">Producer Workbench Pro</span> ({billingCycle === "yearly" ? "Gói Năm" : "Gói Tháng"}).
            </p>

            <div className="h-48 flex items-center justify-center bg-gray-100 dark:bg-[#0f172a] rounded-lg">
              <p className="text-gray-600 dark:text-gray-300">Giao diện thanh toán...</p>
            </div>

            <button className="w-full bg-purple-500 text-white font-bold py-3 rounded-lg mt-6 hover:bg-purple-600">
              Thanh toán & Kích hoạt Pro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateProducer;
