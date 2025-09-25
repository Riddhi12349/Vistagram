import React from "react";
import { motion } from "framer-motion";
import PostCard from "./PostCard";
import { Camera } from "lucide-react";

const Timeline = ({ posts = [], onLike, onShare, onCaptureClick }) => {
  return  (posts && posts.length > 0) ? (
    // Posts timeline
    <div className="space-y-6">
      {posts.map((post, index) => (
        <motion.div
          key={post.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PostCard post={post} onLike={onLike} onShare={onShare} />
        </motion.div>
      ))}
    </div>
    
  ) : (
    // Empty state
    <div className="text-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-fuchsia-100 rounded-full flex items-center justify-center mx-auto">
          <Camera className="w-12 h-12 text-rose-400" />
        </div>
        <div className="space-y-2">
          <h3
            className="text-xl font-bold text-zinc-800"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            No posts yet
          </h3>
          <p className="text-zinc-600 max-w-md mx-auto">
            Be the first to share a moment! Capture something interesting and
            start the conversation.
          </p>
        </div>
        <motion.button
          onClick={onCaptureClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-rose-600 to-fuchsia-400 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-2"
        >
          <Camera className="w-5 h-5" />
          <span>Share Your First Post</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Timeline;
