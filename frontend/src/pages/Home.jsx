import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Timeline from "../components/Timeline";
import CaptureModal from "../components/CaptureModal";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import axios from 'axios';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId , setUserId] = useState("riddhi");

  useEffect(() => {
  const fetchPosts = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/get/all/posts/${userId}`);
      const data = res.data;
      
      const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setTimeout(() => {
        setPosts(sortedData);
        setIsLoading(false);
      }, 1000); // 1s fake loading
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  fetchPosts();
}, [userId]);


  const handleCaptureSubmit = async (postData) => {

    const newPost = {
      id: Date.now().toString(),
      user_id : "riddhi",
      username: "riddhi",
      caption: postData.caption,
      imageUrl: postData.imagePreview,  // loading  base 64 string at frontend
      timestamp: new Date().toISOString(),
      likes: 0,
      shares: 0,
      isLiked: false,
    };

    try {

      const form = new FormData();

      form.append("username" , newPost.username)
      form.append("image" , postData.image); // sending complete selected image at backend
      form.append("caption", postData.caption);
      form.append("timestamp" , newPost.timestamp);
      
      console.log(form);

      const res =  await axios.post(`http://localhost:8000/send/new/post/${newPost.user_id}/${newPost.id}`,
        form
      );
        
      if(res.data.message.toLowerCase().includes("inappropriate")){
         toast.error("Inappropriate Image! Cannot be uploaded");
      }
      else{
            setPosts((prevPosts) => [newPost, ...prevPosts]);
      }
      console.log(res.data);
      
    } catch (err) { 
      console.log("Failed to create post  : " , err);
      toast.error("Failed to create post. Please try again.");
    }

  };

  const handleLike = async (id, newLikeCount , newLikedState) => {

    
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post,
            likes : newLikeCount,
            isLiked : newLikedState
          }
           : post
      )
    );

    try {
      
      await axios.patch(`http://localhost:8000/send/likes/count/${id}` , {
         newLikeCount , newLikedState
      })
      console.log("Liked----" , id , newLikeCount , newLikedState);

    } catch (err) {
        
      console.err("Failed to update likes count : " , err);
      //rollback
      setPosts((prevPosts) => 

        prevPosts.map((post) => 
          post.id === id
          ? {
            ...post,
            likes : newLikedState ? newLikeCount-1 :  newLikeCount+1,
            isLiked : !newLikedState
          }
          : post
        )

      )
    }

  };

  const handleShare = async (postId , newShareCount) => {
    
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, shares:newShareCount  } : post
      )
    );

    try {
        await axios.patch(`http://localhost:8000/send/shares/count/${postId}`  ,{ newShareCount});
        console.log("Shared" , postId , newShareCount);
    } catch (err) {
    console.log("Failed to share");
      toast.error("Failed to share");
      //rollback
       setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, shares: newShareCount-1 } : post
      )
    );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-rose-50/30">
      <Header onCaptureClick={() => setIsCaptureModalOpen(true)} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 mb-8"
        >
          <h1
            className="text-4xl sm:text-5xl font-bold text-zinc-800 mb-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Share Your
            <span className="bg-gradient-to-r from-rose-600 to-fuchsia-400 bg-clip-text text-transparent">
              {" "}
              Moments
            </span>
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Discover and share amazing points of interest through beautiful
            photography and engaging stories.
          </p>
        </motion.section>

        {/* Timeline Section */}
        <section id="timeline" className="space-y-8">
          <div className="flex items-center justify-between">
            <h2
              className="text-2xl font-bold text-zinc-800"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Latest Posts
            </h2>

            {console.log("POSTS :::: " ,posts)}
            {posts &&  posts.length > 0 && (
              <span className="text-sm text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden animate-pulse"
                >
                  <div className="p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-zinc-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-zinc-200 rounded w-24" />
                      <div className="h-3 bg-zinc-200 rounded w-16" />
                    </div>
                  </div>
                  <div className="h-80 bg-zinc-200" />
                  <div className="p-4 space-y-3">
                    <div className="flex space-x-4">
                      <div className="h-8 bg-zinc-200 rounded-full w-16" />
                      <div className="h-8 bg-zinc-200 rounded-full w-16" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-zinc-200 rounded w-full" />
                      <div className="h-4 bg-zinc-200 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Timeline
              posts={posts}
              onLike={handleLike}
              onShare={handleShare}
              onCaptureClick={() => setIsCaptureModalOpen(true)}
            />
          )}
        </section>
      </main>

      <Footer />

      <CaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onSubmit={handleCaptureSubmit}
      />
    </div>
  );
};

export default Home;
