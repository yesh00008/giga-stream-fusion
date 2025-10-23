import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-[18px] rounded-bl-[5px] w-fit relative shadow-sm before:absolute before:w-0 before:h-0 before:border-r-[8px] before:border-r-gray-100 before:border-t-[8px] before:border-t-transparent before:border-b-[8px] before:border-b-transparent before:-left-2 before:bottom-0">
      <span className="text-xs text-gray-500 mr-1">typing</span>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
