import { useMemo } from 'react';
import { 
    ClipboardSignature, 
    Package, 
    Sparkles, 
    CheckCircle2,
    Zap,
    Fuel,
    Orbit,
    Rocket,
    Music
} from 'lucide-react';
import { type Project } from '../../../types/workspace';

interface ContractOverviewCardProps {
    project: Project;
    contractStatus?: string | null;
    currencyFormatter: Intl.NumberFormat;
    numberFormatter: Intl.NumberFormat;
    usedAmount: number;
    usedProducts: number;
    usedEdits: number;
    contractAmountLimit: number | null;
    productLimit: number | null;
    editLimit: number | null;
}

export default function ContractOverviewCard({
    project,
    currencyFormatter,
    numberFormatter,
    usedAmount,
    usedProducts,
    usedEdits,
    contractAmountLimit,
    productLimit,
    editLimit,
}: ContractOverviewCardProps) {
    const formattedContractAmount = useMemo(() => {
        if (typeof project.totalAmount === 'number' && !Number.isNaN(project.totalAmount)) {
            return currencyFormatter.format(project.totalAmount);
        }
        return null;
    }, [project.totalAmount, currencyFormatter]);

    // Xác định payment type và text tương ứng
    const paymentTypeInfo = useMemo(() => {
        const paymentType = project.paymentType?.toUpperCase();
        if (paymentType === 'FULL') {
            return {
                title: 'Nạp Toàn Phần',
                description: 'Phi vụ này đang sử dụng Lộ trình Tiếp Năng Lượng Toàn Phần (FULL). Vui lòng tham khảo các thông số dưới đây khi thiết lập các Trạm Dừng.',
                showPaymentCard: true,
            };
        } else if (paymentType === 'MILESTONE') {
            return {
                title: 'Theo Cột Mốc',
                description: 'Phi vụ này đang sử dụng Lộ trình Tiếp Năng Lượng Theo Cột Mốc (MILESTONE). Vui lòng tham khảo các thông số dưới đây khi thiết lập các Trạm Dừng.',
                showPaymentCard: true,
            };
        }
        return {
            title: 'Thông Tin Hợp Đồng',
            description: 'Vui lòng tham khảo các thông số dưới đây khi thiết lập các Trạm Dừng.',
            showPaymentCard: false,
        };
    }, [project.paymentType]);

    const allocationMetrics = useMemo(() => {
        const metrics: Array<{
            key: string;
            title: string;
            used: string;
            total: string;
            remaining: string | null;
            progress: number;
            usedValue: number;
            totalValue: number;
        }> = [];

        if (typeof contractAmountLimit === 'number') {
            const remainingValue = Math.max(0, contractAmountLimit - usedAmount);
            const progress = contractAmountLimit > 0 ? (usedAmount / contractAmountLimit) * 100 : 0;
            metrics.push({
                key: 'amount',
                title: 'Năng Lượng Đã Phân Bổ',
                used: currencyFormatter.format(usedAmount),
                total: currencyFormatter.format(contractAmountLimit),
                remaining: currencyFormatter.format(remainingValue),
                progress,
                usedValue: usedAmount,
                totalValue: contractAmountLimit,
            });
        }

        if (typeof productLimit === 'number') {
            const remainingValue = Math.max(0, productLimit - usedProducts);
            const progress = productLimit > 0 ? (usedProducts / productLimit) * 100 : 0;
            metrics.push({
                key: 'products',
                title: 'Sản phẩm đã phân bổ',
                used: numberFormatter.format(usedProducts),
                total: numberFormatter.format(productLimit),
                remaining: numberFormatter.format(remainingValue),
                progress,
                usedValue: usedProducts,
                totalValue: productLimit,
            });
        }

        if (typeof editLimit === 'number') {
            const remainingValue = Math.max(0, editLimit - usedEdits);
            const progress = editLimit > 0 ? (usedEdits / editLimit) * 100 : 0;
            metrics.push({
                key: 'edits',
                title: project.paymentType?.toUpperCase() === 'FULL' ? 'Lượt Tinh Chỉnh Đã Dùng' : 'Lượt chỉnh sửa đã dùng',
                used: numberFormatter.format(usedEdits),
                total: numberFormatter.format(editLimit),
                remaining: numberFormatter.format(remainingValue),
                progress,
                usedValue: usedEdits,
                totalValue: editLimit,
            });
        }

        return metrics;
    }, [
        contractAmountLimit,
        productLimit,
        editLimit,
        usedAmount,
        usedProducts,
        usedEdits,
        currencyFormatter,
        numberFormatter,
        project.paymentType,
    ]);

    // Starfield background component
    const StarfieldBackground = () => (
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
            {/* Animated stars */}
            {Array.from({ length: 30 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${Math.random() * 1.5 + 0.3}px`,
                        height: `${Math.random() * 1.5 + 0.3}px`,
                        opacity: Math.random() * 0.4 + 0.15,
                        animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 2}s`,
                    }}
                />
            ))}
            {/* Nebula gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/8 via-purple-900/8 to-blue-900/8" />
        </div>
    );

    // Module 1: Vessel Power Core
    const PowerCoreModule = () => {
        const isFull = paymentTypeInfo.title === 'Nạp Toàn Phần';
        return (
            <div className="relative h-full min-h-[200px] flex flex-col">
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 overflow-hidden h-full flex flex-col justify-between">
                    {/* Animated grid pattern */}
                    <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
                        backgroundSize: '15px 15px',
                    }} />
                    
                    {/* Pulsing core glow */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full ${
                        isFull ? 'bg-cyan-500/15' : 'bg-green-500/15'
                    } blur-xl animate-pulse`} />
                    
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 rounded border ${
                                isFull ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-green-500/20 border-green-500/50'
                            }`}>
                                <Zap className={`w-4 h-4 ${
                                    isFull ? 'text-cyan-400' : 'text-green-400'
                                }`} />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                                Lõi Năng Lượng
                            </span>
                        </div>
                        
                        {/* Hero - Loại Hợp Đồng */}
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
                                    {paymentTypeInfo.title}
                                </div>
                                {formattedContractAmount && (
                                    <div className="text-base text-gray-300 font-mono mt-1">
                                        {formattedContractAmount}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="mt-2">
                            <div className="flex items-center justify-center gap-1.5 text-sm text-green-400/80">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isFull ? 'Đã Nạp Đầy' : 'Đang Hoạt Động'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Module 2: Fuel Reserves Reactor (Circular Plasma Gauge)
    const FuelReactorModule = ({ metric }: { metric: typeof allocationMetrics[0] }) => {
        const circumference = 2 * Math.PI * 50; // radius = 50 (larger for better visibility)
        const strokeDashoffset = circumference - (metric.progress / 100) * circumference;
        const gradientId = `greenGradient-${metric.key}`;
        
        return (
            <div className="relative h-full min-h-[200px] flex flex-col">
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-green-500/30 rounded-lg p-3 overflow-hidden h-full flex flex-col justify-between">
                    <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: 'linear-gradient(green 1px, transparent 1px), linear-gradient(90deg, green 1px, transparent 1px)',
                        backgroundSize: '15px 15px',
                    }} />
                    
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded border bg-green-500/20 border-green-500/50">
                                <Fuel className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                                Kho Nhiên Liệu
                            </span>
                        </div>
                        
                        {/* Hero - Circular Gauge with Big Number */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="relative">
                                <svg className="transform -rotate-90 w-28 h-28">
                                    {/* Background circle */}
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r="50"
                                        fill="none"
                                        stroke="rgba(34, 197, 94, 0.1)"
                                        strokeWidth="8"
                                    />
                                    {/* Progress circle with glow */}
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r="50"
                                        fill="none"
                                        stroke={`url(#${gradientId})`}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        className="transition-all duration-1000 ease-out"
                                        style={{
                                            filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))',
                                        }}
                                    />
                                    <defs>
                                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#22c55e" />
                                            <stop offset="100%" stopColor="#10b981" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                
                                {/* Center readout - Big Number */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-4xl font-bold text-green-400 font-mono">
                                        {Math.round(metric.progress)}%
                                    </div>
                                    <div className="text-base text-white font-mono mt-1">
                                        {metric.used} / {metric.total}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Đã dùng:</span>
                                <span className="text-green-400 font-semibold font-mono">{metric.used}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Còn lại:</span>
                                <span className="text-cyan-400 font-semibold font-mono">{metric.remaining}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Module 3: Payload Acquisition Orbit (Segmented Orbital Ring)
    const PayloadOrbitModule = ({ metric }: { metric: typeof allocationMetrics[0] }) => {
        const segments = metric.totalValue;
        const filledSegments = metric.usedValue;
        
        return (
            <div className="relative h-full min-h-[200px] flex flex-col">
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg p-3 overflow-hidden h-full flex flex-col justify-between">
                    <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: 'linear-gradient(blue 1px, transparent 1px), linear-gradient(90deg, blue 1px, transparent 1px)',
                        backgroundSize: '15px 15px',
                    }} />
                    
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded border bg-blue-500/20 border-blue-500/50">
                                <Orbit className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                                Quỹ Đạo Hàng Hóa
                            </span>
                        </div>
                        
                        {/* Hero - Orbital Visual + Big Number */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                            {/* Orbital Ring Visualization */}
                            <div className="relative mb-2">
                                <div className="relative w-28 h-28">
                                    {/* Central icon */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="p-3 rounded-full bg-blue-500/20 border border-blue-500/50">
                                            <Package className="w-6 h-6 text-blue-400" />
                                        </div>
                                    </div>
                                    
                                    {/* Orbital segments */}
                                    <svg className="absolute inset-0 w-full h-full">
                                        {Array.from({ length: segments }).map((_, i) => {
                                            const angle = (360 / segments) * i;
                                            const isFilled = i < filledSegments;
                                            const radius = 45;
                                            const x = 50 + radius * Math.cos((angle - 90) * Math.PI / 180);
                                            const y = 50 + radius * Math.sin((angle - 90) * Math.PI / 180);
                                            
                                            return (
                                                <circle
                                                    key={i}
                                                    cx={`${x}%`}
                                                    cy={`${y}%`}
                                                    r="4"
                                                    fill={isFilled ? '#3b82f6' : 'none'}
                                                    stroke={isFilled ? '#60a5fa' : 'rgba(59, 130, 246, 0.3)'}
                                                    strokeWidth="2"
                                                    className={isFilled ? 'animate-pulse' : ''}
                                                    style={{
                                                        filter: isFilled ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.8))' : 'none',
                                                    }}
                                                />
                                            );
                                        })}
                                        
                                        {/* Orbital path */}
                                        <circle
                                            cx="50%"
                                            cy="50%"
                                            r="48%"
                                            fill="none"
                                            stroke="rgba(59, 130, 246, 0.2)"
                                            strokeWidth="1"
                                            strokeDasharray="2 2"
                                        />
                                    </svg>
                                </div>
                            </div>
                            
                            {/* Big Number Display */}
                            <div className="text-4xl font-bold text-white font-mono">
                                {metric.used} <span className="text-gray-500">/</span> {metric.total}
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Đã thu thập:</span>
                                <span className="text-blue-400 font-semibold font-mono">{metric.used}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Chờ xử lý:</span>
                                <span className="text-cyan-400/80 font-semibold font-mono">{metric.remaining}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Module 4: Warp Drive Fuel Tank (Scalable Progress Bar)
    const ThrusterChargesModule = ({ metric }: { metric: typeof allocationMetrics[0] }) => {
        const progress = metric.progress;
        
        // Determine color zone
        const getColorZone = () => {
            if (progress < 50) {
                return {
                    gradientFrom: 'from-cyan-500',
                    gradientVia: 'via-blue-500',
                    gradientTo: 'to-cyan-500',
                    rocketColor: 'text-cyan-400',
                    rocketGlow: 'drop-shadow-[0_0_4px_rgba(34,211,238,0.8)]',
                    badgeBg: 'bg-cyan-500/20',
                    badgeBorder: 'border-cyan-500/50',
                    badgeText: 'text-cyan-400',
                    glowShadow: '0 0 12px rgba(34, 211, 238, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.1)',
                    pulse: false,
                };
            } else if (progress < 80) {
                return {
                    gradientFrom: 'from-orange-500',
                    gradientVia: 'via-amber-500',
                    gradientTo: 'to-orange-500',
                    rocketColor: 'text-orange-400',
                    rocketGlow: 'drop-shadow-[0_0_4px_rgba(249,115,22,0.8)]',
                    badgeBg: 'bg-orange-500/20',
                    badgeBorder: 'border-orange-500/50',
                    badgeText: 'text-orange-400',
                    glowShadow: '0 0 12px rgba(249, 115, 22, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.1)',
                    pulse: false,
                };
            } else {
                return {
                    gradientFrom: 'from-red-500',
                    gradientVia: 'via-rose-500',
                    gradientTo: 'to-red-500',
                    rocketColor: 'text-red-400',
                    rocketGlow: 'drop-shadow-[0_0_4px_rgba(239,68,68,0.8)]',
                    badgeBg: 'bg-red-500/20',
                    badgeBorder: 'border-red-500/50',
                    badgeText: 'text-red-400',
                    glowShadow: '0 0 12px rgba(239, 68, 68, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.1)',
                    pulse: true,
                };
            }
        };
        
        const colorZone = getColorZone();
        
        return (
            <div className="relative h-full min-h-[200px] flex flex-col">
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-3 overflow-hidden h-full flex flex-col justify-between">
                    <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: 'linear-gradient(purple 1px, transparent 1px), linear-gradient(90deg, purple 1px, transparent 1px)',
                        backgroundSize: '15px 15px',
                    }} />
                    
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded border bg-purple-500/20 border-purple-500/50">
                                <Rocket className="w-4 h-4 text-purple-400" />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                                Bình Nhiên Liệu
                            </span>
                        </div>
                        
                        {/* Hero - Big Number + Fuel Tank */}
                        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                            {/* Big Number Display */}
                            <div className="text-4xl font-bold font-mono text-white">
                                {metric.used} <span className="text-gray-500">/</span> {metric.total}
                            </div>
                            
                            {/* Fuel Tank Progress Bar */}
                            <div className="w-full relative">
                                {/* Rocket icon attached to fuel line */}
                                <div 
                                    className="absolute -top-1 z-20 transition-all duration-1000 ease-out"
                                    style={{ 
                                        left: `calc(${Math.min(progress, 100)}% - 8px)`,
                                    }}
                                >
                                    <Rocket 
                                        className={`w-4 h-4 ${colorZone.rocketColor} ${colorZone.rocketGlow}`}
                                        style={{ transform: 'rotate(90deg)' }}
                                    />
                                </div>
                                
                                {/* Glass tube container */}
                                <div className="relative h-6 bg-slate-800/50 border border-slate-600/50 rounded-full overflow-hidden backdrop-blur-sm">
                                    {/* Remaining fuel (dark blue background) */}
                                    <div 
                                        className="absolute right-0 top-0 h-full bg-gradient-to-r from-slate-700/50 to-slate-800/50 transition-all duration-1000 ease-out"
                                        style={{ width: `${100 - Math.min(progress, 100)}%` }}
                                    />
                                    
                                    {/* Used fuel (liquid plasma) */}
                                    <div 
                                        className={`absolute left-0 top-0 h-full bg-gradient-to-r ${colorZone.gradientFrom} ${colorZone.gradientVia} ${colorZone.gradientTo} transition-all duration-1000 ease-out ${
                                            colorZone.pulse ? 'animate-pulse' : ''
                                        }`}
                                        style={{ 
                                            width: `${Math.min(progress, 100)}%`,
                                            boxShadow: colorZone.glowShadow,
                                        }}
                                    >
                                        {/* Liquid shimmer effect */}
                                        <div 
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            style={{
                                                animation: 'shimmer 2s ease-in-out infinite',
                                            }}
                                        />
                                    </div>
                                    
                                    {/* Glass reflection */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none rounded-full" />
                                </div>
                                
                                {/* Tick marks / Ruler lines */}
                                <div className="absolute -bottom-1 left-0 right-0 flex justify-between h-2 mt-1">
                                    {[0, 25, 50, 75, 100].map((mark) => (
                                        <div key={mark} className="flex flex-col items-center">
                                            <div className="w-px h-1.5 bg-slate-600/50" />
                                            <span className="text-[8px] text-gray-500 font-mono mt-0.5">{mark}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Percentage Badge */}
                            <div className={`px-3 py-1.5 rounded border ${colorZone.badgeBg} ${colorZone.badgeBorder} ${colorZone.badgeText} ${colorZone.pulse ? 'animate-pulse' : ''}`}>
                                <span className="text-lg font-mono font-bold">
                                    {Math.round(progress)}%
                                </span>
                                <div className="text-[10px] font-mono mt-0.5 opacity-80">
                                    {progress < 50 ? 'AN TOÀN' : progress < 80 ? 'CẢNH BÁO' : 'NGUY HIỂM'}
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="mt-2 flex justify-between items-center text-sm pt-2 border-t border-purple-500/20">
                            <div className="flex items-center gap-1.5">
                                <span className="text-gray-400">Đã dùng:</span>
                                <span className="text-orange-400 font-semibold font-mono">{metric.used}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-gray-400">Còn lại:</span>
                                <span className="text-blue-400 font-semibold font-mono">{metric.remaining}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="mb-2 mt-4">
            {/* Main HUD Panel Container */}
            <div className="relative">
                {/* Outer frame with tech lines */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-lg opacity-15 blur-sm" />
                
                {/* Main glassmorphic panel */}
                <div className="relative bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 md:p-5 overflow-hidden">
                    {/* Starfield background */}
                    <StarfieldBackground />
                    
                    {/* Tech frame corners - smaller */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400/50" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-400/50" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400/50" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-purple-400/50" />
                    
                    {/* Header Section */}
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
                        <div className="flex items-start gap-3">
                            {/* Holographic Icon with Musical Notes */}
                            <div className="relative flex-shrink-0">
                                <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 flex items-center justify-center backdrop-blur-sm">
                                    <ClipboardSignature size={20} className="text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                                    {/* Floating musical notes */}
                                    <Music 
                                        size={9} 
                                        className="absolute -top-0.5 -right-0.5 text-purple-400 animate-pulse" 
                                    />
                                    <Music 
                                        size={8} 
                                        className="absolute -bottom-0.5 -left-0.5 text-cyan-400 animate-pulse" 
                                        style={{ animationDelay: '0.5s' }}
                                    />
                                </div>
                                {/* Holographic glow effect */}
                                <div className="absolute inset-0 bg-cyan-400/15 rounded-lg blur-lg animate-pulse" />
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400">
                                        THÔNG TIN HỢP ĐỒNG
                                    </h2>
                                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                                </div>
                                
                                {/* Description with scanline effect */}
                                <div className="relative">
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        {paymentTypeInfo.description}
                                    </p>
                                    {/* Scanline overlay */}
                                    <div 
                                        className="absolute inset-0 pointer-events-none opacity-[0.03]"
                                        style={{
                                            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 211, 238, 0.08) 2px, rgba(34, 211, 238, 0.08) 4px)',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mission Modules Grid */}
                    <div className={`relative z-10 grid grid-cols-1 md:grid-cols-2 ${
                        paymentTypeInfo.showPaymentCard ? 'xl:grid-cols-4' : 'xl:grid-cols-3'
                    } gap-6`}>
                        {/* Module 1: Vessel Power Core */}
                        {paymentTypeInfo.showPaymentCard && <PowerCoreModule />}

                        {/* Module 2: Fuel Reserves Reactor */}
                        {allocationMetrics.find(m => m.key === 'amount') && (
                            <FuelReactorModule metric={allocationMetrics.find(m => m.key === 'amount')!} />
                        )}

                        {/* Module 3: Payload Acquisition Orbit */}
                        {allocationMetrics.find(m => m.key === 'products') && (
                            <PayloadOrbitModule metric={allocationMetrics.find(m => m.key === 'products')!} />
                        )}

                        {/* Module 4: Navigation Thruster Charges */}
                        {allocationMetrics.find(m => m.key === 'edits') && (
                            <ThrusterChargesModule metric={allocationMetrics.find(m => m.key === 'edits')!} />
                        )}
                    </div>
                </div>
            </div>
            
            {/* Add custom CSS for animations */}
            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.1); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
