import { AlertTriangle, FileText, Binary } from 'lucide-react';

interface IncompleteContractNotificationProps {
  onNavigateToContract?: () => void;
}

const IncompleteContractNotification = ({ onNavigateToContract }: IncompleteContractNotificationProps = {}) => {
  return (
    <div className="w-full flex items-center justify-center min-h-[calc(100vh-200px)] pb-16 px-4 relative overflow-hidden">
      
      <div className="relative z-10 w-full max-w-2xl mb-20">
        <div className="bg-[#0B0E1E] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-6">
            
            {/* 1. ICON VISUALIZATION */}
            <div className="relative group">
              {/* Vòng tròn năng lượng - màu cam */}
              <div className="absolute inset-0 bg-orange-600/20 blur-2xl rounded-full animate-pulse"></div>
              <div className="relative w-28 h-28 rounded-full bg-[#131629] border border-orange-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(251,146,60,0.15)]">
                 <AlertTriangle size={40} className="text-orange-400 relative z-10" />
                 
                 {/* Icon phụ */}
                 <div className="absolute -bottom-1 -right-1 bg-[#1E2138] p-2 rounded-full border border-orange-500/30">
                    <FileText size={16} className="text-orange-400 animate-pulse" />
                 </div>
              </div>

              {/* Decor elements nhỏ */}
              <Binary className="absolute top-0 -right-8 text-white/10 w-6 h-6 animate-bounce delay-75" />
              <Binary className="absolute bottom-0 -left-8 text-white/10 w-4 h-4 animate-bounce delay-100" />
            </div>

            {/* 2. TEXT CONTENT */}
            <div className="space-y-4 w-full">
               <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-200 via-white to-amber-200 bg-clip-text text-transparent">
                 Hợp Đồng Chưa Hoàn Tất
               </h2>
               
               <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                 Trạm chỉ huy phát hiện <span className="text-orange-300 font-medium">Hợp Đồng</span> chưa được hoàn tất. 
                 Vui lòng{' '}
                 <button
                   onClick={() => onNavigateToContract?.()}
                   className="underline font-semibold text-orange-300 hover:text-orange-200 transition-colors"
                 >
                   chuyển sang trang hợp đồng
                 </button>
                 {' '}để hoàn tất hợp đồng trước khi tạo cột mốc.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncompleteContractNotification;

