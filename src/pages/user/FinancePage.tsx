import { useNavigate } from "react-router-dom";
import { ROUTER } from "../../routes/router";

const FinancePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white pt-24 md:pt-28 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/80">
                Trung tâm tài chính
              </p>
              <h1 className="text-3xl md:text-4xl font-bold">
                Quản lý dòng tiền
              </h1>
              <p className="text-slate-200/80 max-w-2xl">
                Kiểm tra số dư, lịch sử giao dịch và thực hiện các thao tác rút
                tiền. Tiếp tục để truy cập trang Rút tiền.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate(ROUTER.USER.WITHDRAWALS)}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                Đi tới trang Rút tiền
              </button>
              <button
                onClick={() => navigate(ROUTER.USER.TAX)}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                Thuế & thu nhập
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
