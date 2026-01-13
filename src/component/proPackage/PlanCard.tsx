import React from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from '../background/AnimatedBackground';

// Định nghĩa props cho PlanCard (Giữ nguyên)
interface PlanCardProps {
    icon: string;
    title: string;
    price: string;
    features: string[];
    buttonText: string;
    isPrimary?: boolean;
    onBuy?: () => void;
    isLoading: boolean;
    isActive: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
    icon,
    title,
    price,
    features,
    buttonText,
    isPrimary = false,
    onBuy,
    isLoading,
    isActive,
}) => {
    const isAvailable = !isActive;

    // Định nghĩa màu sắc neon dựa trên gói
    const neonColor = isPrimary ? '#00f0ff' : '#9d4edd';
    const accentColor = isPrimary ? '#7fffff' : '#c299ff';

    // Style NĂNG LƯỢNG VŨ TRỤ (Cosmic Energy Style) - Đã cập nhật
    const cardStyle: React.CSSProperties = {
        background: isPrimary
            ? 'linear-gradient(135deg, rgba(28, 37, 65, 0.9) 0%, rgba(15, 20, 35, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(20, 25, 40, 0.8) 0%, rgba(10, 15, 25, 0.8) 100%)',

        // Bóng đổ KÉP - Initial State
        border: `1px solid ${neonColor}50`,
        boxShadow: `
      0 0 20px ${neonColor}70,     
      inset 0 0 10px ${neonColor}40,  
      inset 0 0 3px ${accentColor}30  
    `,
        backdropFilter: 'blur(15px)',
        transform: 'translateZ(0)',
    };

    const buttonClass = isPrimary
        ? `bg-[#00f0ff] text-black shadow-[0_0_25px_rgba(0,240,255,0.9)] hover:bg-white/90`
        : `bg-[#9d4edd] text-white shadow-[0_0_25px_rgba(157,77,237,0.9)] hover:bg-[#8e45d1]`;

    return (
        <motion.div
            style={cardStyle}
            className={`
                relative overflow-hidden rounded-[20px] p-4 w-full h-full flex flex-col justify-between
                transition-all duration-500
            `}
            // Hiệu ứng "Nhịp đập Năng lượng" (Energy Pulse) liên tục cho card
            animate={{
                boxShadow: [
                    `0 0 20px ${neonColor}70`, // Mức ban đầu
                    `0 0 25px ${neonColor}A0`, // Mức sáng hơn
                    `0 0 20px ${neonColor}70`, // Quay về mức ban đầu
                ],
            }}
            transition={{ 
                boxShadow: { 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }
            }}
            // Hiệu ứng Hover mạnh mẽ hơn
            whileHover={{
                scale: 1.03,
                y: -5,
                boxShadow: `
                0 0 50px ${neonColor}D0, 
                inset 0 0 20px ${neonColor}80
                `,
                rotate: [0, 0.5, -0.5, 0], // Kim loại rung nhẹ
            }}
            >
            
            <AnimatedBackground/>
            {/* ✨ HIỆU ỨNG 1: Lớp phủ Gradient Động (Aurora Glow) */}
            <motion.div
                className="absolute inset-0 rounded-[20px] pointer-events-none z-0"
                style={{
                    background: `radial-gradient(circle at center, ${neonColor}10 0%, transparent 70%)`,
                }}
                animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* 🌟 HIỆU ỨNG MỚI: BÓNG LOÁNG CHẠY LIÊN TỤC (Persistent Shimmer) */}
            <motion.div
                className="absolute inset-0 rounded-[20px] pointer-events-none z-10"
                initial={{ x: '-150%', opacity: 0.2 }}
                animate={{ x: '150%', opacity: 0.2 }}
                transition={{ 
                    x: { duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 1 }, // Lặp lại vô hạn, có độ trễ
                    opacity: { duration: 0.1 }
                }}
                style={{
                    // Vệt sáng mỏng hơn và góc nghiêng để tạo độ bóng
                    background: `linear-gradient(90deg, transparent 0%, ${accentColor}30 50%, transparent 100%)`,
                    width: '100%',
                    height: '100%',
                    transform: 'rotate(-45deg)', // Nghiêng nhẹ vệt sáng
                    top: 0,
                    left: 0,
                }}
            />
            {/* Lớp phủ lấp lánh cũ (Giữ lại và tăng z-index lên 15) */}
            <motion.div
                className="absolute inset-0 rounded-[20px] pointer-events-none z-15" 
                style={{
                    border: `1px solid ${accentColor}70`,
                    opacity: 0.15,
                }}
                animate={{
                    opacity: [0.15, 0.25, 0.15],
                    scale: [1, 1.01, 1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* 🚀 LỚP PHỦ ÁNH SÁNG PHẢN CHIẾU (Holographic Light Streak - Chỉ khi Hover) */}
            {/* Giữ nguyên để có hiệu ứng phản xạ ánh sáng mạnh khi tương tác */}
            <motion.div
                className="absolute inset-0 rounded-[20px] pointer-events-none z-20"
                initial={{
                    opacity: 0,
                    background: `linear-gradient(135deg, ${accentColor}00 0%, ${accentColor}1A 50%, ${accentColor}00 100%)`,
                    x: '-100%',
                }}
                // Khi Hover: Ánh sáng chạy chéo qua thẻ
                whileHover={{
                    opacity: 1, 
                    x: '100%',
                }}
                transition={{
                    x: { duration: 0.4, ease: "easeOut" }, 
                    opacity: { duration: 0.1 }
                }}
                style={{
                    width: '200%',
                    transform: 'rotate(-45deg) skewX(20deg)',
                    top: '-50%',
                    bottom: '-50%',
                    left: '-50%',
                    right: '-50%',
                }}
            />

            {/* Nội dung (Relative z-30) */}
            <div className="relative z-30 text-center flex-grow flex flex-col justify-start">
                
                {/* ICON & TITLE: ✨ HIỆU ỨNG 2: Nhảy nhẹ khi Hover */}
                <motion.div
                    className="flex flex-col items-center"
                    whileHover={{ 
                        y: [-2, 2, -2, 0], // Nhảy nhẹ
                        rotate: [-1, 1, 0],
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                        duration: 0.5
                    }}
                >
                    {/* ICON */}
                    <span className={`text-4xl block mb-2 opacity-90 transition-transform 
                        ${isPrimary ? 'text-[#00f0ff] drop-shadow-[0_0_10px_#00f0ff]' : 'text-[#ffc300] drop-shadow-[0_0_10px_#ffc300]'}`}>
                        {icon}
                    </span>
                    {/* TITLE */}
                    <h3 className={`text-xl font-extrabold font-['Orbitron',_sans-serif] 
                        ${isPrimary ? 'text-[#00f0ff]' : 'text-[#ffc300]'} tracking-widest uppercase mt-2`}>
                        {title}
                    </h3>
                </motion.div>

                <div className="mt-1 mb-3 shrink-0">
                    <span className="text-sm font-normal opacity-70 block text-white/70">
                        {isPrimary ? 'Chỉ từ' : ''}
                    </span>
                    {/* PRICE */}
                    <span className="text-3xl font-extrabold text-white">
                        {price}
                    </span>
                </div>

                {/* Danh sách tính năng */}
                <ul className="list-none p-0 my-2 space-y-1 flex-grow overflow-auto">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start text-xs text-white/90 pb-0.5 last:border-b-0 text-left">
                            <motion.span
                                className={`mr-2 mt-0.5 text-sm shrink-0 ${isPrimary ? 'text-[#00f0ff]' : 'text-[#9d4edd]'}`}
                                whileHover={{ scale: 1.2, x: 2 }} // Checkmark rung nhẹ khi hover qua tính năng
                            >
                                {index === 0 ? '✔️' : '☆'}
                            </motion.span>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Button CTA (Hiệu ứng ánh sáng mạnh hơn) */}
            <motion.button
                onClick={onBuy}
                disabled={!isAvailable || isLoading}
                className={`
                    w-full py-2 rounded-lg text-base font-bold uppercase shrink-0 mt-3
                    transition-all duration-300 flex justify-center items-center group
                    ${buttonClass}
                    ${!isAvailable && 'bg-gray-600 cursor-not-allowed opacity-70 shadow-none'}
                `}
                whileHover={{
                    scale: isAvailable ? 1.02 : 1,
                    boxShadow: isAvailable ? `0 0 40px ${neonColor}FF` : '' // Tăng cường độ bóng nút khi hover
                }}
                whileTap={{ scale: isAvailable ? 0.98 : 1 }} // Hiệu ứng nhấn (tap)
            >
                {isLoading ? 'Đang tạo link...' : buttonText}
                {isPrimary && <span className="ml-2 text-lg group-hover:translate-x-1 transition-transform">🛰️</span>}
            </motion.button>

            {!isAvailable && (
                <p className="mt-1 text-center text-xs text-yellow-400">Bạn đang sử dụng một gói khác.</p>
            )}
        </motion.div>
    );
};

export default PlanCard;