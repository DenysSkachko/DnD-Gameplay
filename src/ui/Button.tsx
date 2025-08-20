import { type ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const Button = ({ className = "", variant = "primary", ...props }: Props) => {
  const baseClasses =
    "w-full py-2 rounded-lg transition focus:outline-none";
  const variants = {
    primary: "bg-accent text-white hover:bg-accent-hover",
    secondary: "bg-gray-300 text-gray-700 hover:bg-gray-400",
  };

  return <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props} />;
};

export default Button;
