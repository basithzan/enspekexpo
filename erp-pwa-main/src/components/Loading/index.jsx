import React from "react";

const Loading = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[90vh]">
      <svg className="animate-spin h-8 w-8 text-blue-800" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 004 12H0c0 3.042 1.135 5.824 3 7.938l3-1.647zM12 20c2.485 0 4.709-.895 6.438-2.377l-3-5.196A7.95 7.95 0 0112 16H8.062l3.375 5.852A7.962 7.962 0 0012 20z"
        />
      </svg>
      <div className="font-bold text-base">{title}</div>
    </div>
  );
};

export default Loading;
