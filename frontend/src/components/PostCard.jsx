import React, { useState } from "react";
import { Heart, Share2, User } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";

const PostCard = ({ post, onLike, onShare }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(Number(post.likes) || 0);
  const [shareCount, setShareCount] = useState(Number(post.shares) || 0);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;


    setIsLiking(true);
    const newLikedState = !isLiked;
    const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;

    // Optimistic update
    setIsLiked(newLikedState);
    setLikeCount(newLikeCount);

    try {
      await onLike(post.id , newLikeCount, newLikedState);
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikeCount(likeCount);
      toast.error("Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/post/${post.id}`;

      if (navigator.share) {
        await navigator.share({
          title: "Check out this post on Vistagram",
          text: post.caption,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }

      setShareCount((prev) => prev + 1);
      
      await onShare(post.id  , shareCount + 1);
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error("Failed to share post");
      }
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      {/* Header */}
      <div className="p-4 flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-fuchsia-400 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3
            className="font-semibold text-zinc-800"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {post.username}
          </h3>
          <p className="text-sm text-zinc-500">
            {/* {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })} */}
            {post.timestamp
    ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })
    : "Just now"}
          </p>
        </div>
      </div>

      {/* Image */}
      <div className="relative">
        <img
          src={post.imageUrl}
          alt={post.caption}
          className="w-full h-68 object-contain"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={handleLike}
              disabled={isLiking}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                isLiked
                  ? "bg-rose-50 text-rose-600"
                  : "hover:bg-zinc-100 text-zinc-600"
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-all duration-200 ${
                  isLiked ? "fill-current" : ""
                }`}
              />
              <span className="font-medium">{likeCount}</span>
            </motion.button>

            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-zinc-100 text-zinc-600 transition-all duration-200"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium">{shareCount}</span>
            </motion.button>
          </div>
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <p className="text-zinc-800 leading-relaxed">
            <span className="font-semibold mr-2">{post.username}</span>
            {/* Caption without hashtags */}
    {post.caption ? post.caption.replace(/#\S+/g, "") : ""}
    {/* Hashtags on new line */}
    {post.caption?.match(/#\S+/g)?.length > 0 && (
      <span className="block text-blue-600 mt-1">
        {post.caption.match(/#\S+/g).join(" ")}
      </span>
    )}
          </p>
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;
