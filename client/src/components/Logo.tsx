interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export default function Logo({
  className = "",
  size = "md",
  showText = true,
}: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg overflow-hidden`}
      >
        {/* UCC Logo - using coat of arms styling */}
        <div className="w-full h-full bg-gradient-to-b from-red-600 via-red-500 to-blue-600 relative">
          {/* Eagle at top */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-yellow-400">
            <i className="fas fa-crown text-xs"></i>
          </div>
          {/* Shield design */}
          <div className="absolute inset-1 bg-gradient-to-b from-red-500 to-blue-700 rounded-sm">
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
      </div>
      {showText && (
        <div className="text-white">
          <span className={`font-bold ${textSizeClasses[size]}`}>
            Sasakawa Restaurant
          </span>
          {size !== "sm" && (
            <span className="hidden sm:block text-primary-100 text-sm">
              Service Request System
            </span>
          )}
        </div>
      )}
    </div>
  );
}
