import { twMerge } from "tailwind-merge";

const Button = ({
  children,
  className,
  type = "submit",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  type?: "reset" | "submit" | "button";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={twMerge(
        `rounded-xl bg-[#f1e1b4] shadow-md px-6 py-2 text-black duration-100 ease-in hover:bg-yellow-700`,
        className,
      )}
    >
      {children}
    </button>
  );
};

export default Button;
