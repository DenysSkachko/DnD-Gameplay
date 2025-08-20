import React from "react";

type Props = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

const TabButton = ({ active, onClick, children }: Props) => {
  return (
    <button
      className={`flex-1 py-2 ${
        active ? "border-b-2 border-accent  font-bold" : "text-gray-500 cursor-pointer hover:text-accent-hover"
      } transition`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default TabButton;
