import uccLogoImage from "../assets/ucc-logo.webp";

interface UCCLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function UCCLogo({ className = "", size = "md" }: UCCLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-8",
    md: "w-8 h-10",
    lg: "w-10 h-12",
    xl: "w-12 h-16",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${className} flex items-center justify-center`}
    >
      <img
        src={uccLogoImage}
        alt="UCC Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
