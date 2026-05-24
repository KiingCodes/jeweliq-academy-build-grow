import logo from "@/assets/logo.png";

export function Logo({ className = "h-8 w-auto", showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <img
      src={logo}
      alt="JewelIQ Academy"
      className={className}
      style={showWordmark ? undefined : { objectFit: "contain", objectPosition: "left" }}
    />
  );
}
