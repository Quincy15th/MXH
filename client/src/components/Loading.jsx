import React from "react";
import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-purple-500 shadow-purple-400 shadow-md"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Loading;
