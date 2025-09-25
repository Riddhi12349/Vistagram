import React, { useState, useRef, useEffect } from "react";
import { X, Camera, Upload, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";

const CaptureModal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [caption, setCaption] = useState("");
  const [hashtags, setHashTags] = useState([]);
  const [captionSuggestions, setCaptionSuggestions] = useState([]);
  const [hashTagSuggestions, setHashTagSuggestions] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingAIHash, setIsGeneratingAIHash] = useState(false);

  // For desktop webcam
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  // Detect mobile
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const getImageData = async () => {
    const formData = new FormData();
    formData.append("image", selectedImage); // raw file

    const res = await axios.post(
      "http://localhost:8000/api/ai/analyze/image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage || !caption.trim()) {
      toast.error("Please select an image and add a caption");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        image: selectedImage,
        caption: caption.trim(),
        imagePreview,
      });
      resetForm();
      onClose();
      toast.success("Post shared successfully!");
    } catch (error) {
      toast.error("Failed to share post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCaption("");
    setSelectedImage(null);
    setImagePreview(null);
    setIsWebcamActive(false);
    setCaptionSuggestions([]);
    setHashTagSuggestions([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (isWebcamActive && !isMobile) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Webcam error:", err));
    }

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isWebcamActive, isMobile]);

  const captureFromWebcam = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, 300, 200);
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setImagePreview(dataUrl);

    // Convert base64 → File
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "webcam-photo.png", {
          type: "image/png",
        });
        setSelectedImage(file);
      });

    setIsWebcamActive(false); // close webcam preview after capture
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200">
              <h2 className="text-xl font-bold text-zinc-800">
                Share a Moment
              </h2>
              <button
                onClick={handleClose}
                className="p-2 bg-zinc-500 text-white rounded-full hover:bg-zinc-600 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-zinc-700">
                    Choose Image
                  </label>

                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-contain rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={resetForm}
                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : isWebcamActive && !isMobile ? (
                    <div className="flex flex-col items-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 rounded-xl bg-black"
                      />
                      <button
                        type="button"
                        onClick={captureFromWebcam}
                        className="mt-3 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                      >
                        Capture
                      </button>
                      <canvas
                        ref={canvasRef}
                        width="300"
                        height="200"
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          isMobile
                            ? cameraInputRef.current?.click()
                            : setIsWebcamActive(true)
                        }
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 rounded-xl hover:border-rose-400 hover:bg-rose-50 transition-all duration-200"
                      >
                        <Camera className="w-8 h-8 text-zinc-400 mb-2" />
                        <span className="text-sm font-medium text-zinc-600">
                          Camera
                        </span>
                      </button>

                      {/* Gallery Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all duration-200"
                      >
                        <ImageIcon className="w-8 h-8 text-zinc-400 mb-2" />
                        <span className="text-sm font-medium text-zinc-600">
                          Gallery
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Hidden inputs for mobile & gallery */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                {/* Caption */}
                <div className="space-y-2 relative">
                  <label
                    htmlFor="caption"
                    className="block text-sm font-medium text-zinc-700"
                  >
                    Caption
                  </label>

                  {/* Textarea with AI button */}
                  <div className="relative">
                    {/* Caption Suggestions */}
                    {captionSuggestions?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {captionSuggestions
                          .filter((c) => c.length <= 120) // only short ones
                          .map((c, i) => (
                            <button
                              key={i}
                              type="button"
                              className="px-3 py-1 text-sm bg-gray-100 hover:bg-rose-100 
                         border rounded-full text-zinc-700"
                              onClick={() => setCaption(c)}
                            >
                              {c}
                            </button>
                          ))}
                      </div>
                    )}

                    <textarea
                      id="caption"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Share what makes this moment special..."
                      rows={4}
                      className="w-full mt-4 px-4 py-2 border border-zinc-300 rounded-xl 
                 focus:ring-2 focus:ring-rose-500 focus:border-transparent 
                 resize-none text-base text-zinc-800 leading-relaxed"
                      maxLength={500}
                    />

                    <button
                      type="button"
                      className="absolute mt-6 bottom-3 right-3 bg-rose-500 hover:bg-rose-600 
                 text-white text-xs px-3 py-1.5 rounded-lg shadow transition-all"
                      onClick={async () => {
                        if (!selectedImage) {
                          toast.error("Please select an image first!");
                          return;
                        }
                        try {
                          setIsGeneratingAI(true);
                          toast.info("Generating captions with AI...");
                          const data = await getImageData();
                          if (data?.captionArray) {
                            setCaptionSuggestions(data.captionArray);
                            setHashTagSuggestions(data.hashtags);
                            toast.success("AI captions ready!");
                          }
                          else if(data?.message.toLowerCase().includes("inappropriate")){
                             toast.error("Inappropriate Image");
                          }
                           else {
                            toast.error("AI failed to generate caption");
                          }
                        } catch (err) {
                          console.error(err);
                          toast.error("Something went wrong");
                        } finally {
                          setIsGeneratingAI(false); // stop loader
                        }
                      }}
                    >
                      {isGeneratingAI ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Generate with AI"
                      )}
                    </button>
                  </div>

                  {/* Hashtag Suggestions */}
                  {hashTagSuggestions?.length > 0 && (
                    <div className="mt-2">
                      {hashTagSuggestions.map((tag, i) => (
                        <button
                          key={i}
                          type="button"
                          className="px-2 py-1 text-xs bg-gray-200 hover:bg-teal-200 rounded-full text-teal-700"
                          onClick={() => setCaption((prev) => `${prev} ${tag}`)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Generate Hashtags Button */}
                  <div className="mt-3">
                    <button
                      type="button"
                      className="bg-teal-500 hover:bg-teal-600 text-white 
                 px-3 py-1.5 rounded-lg shadow transition-all text-xs"
                      onClick={async () => {
                        setIsGeneratingAIHash(true);
                        if(hashTagSuggestions.length == 0){
                          const data = await getImageData();
                          if (data?.hashtags) {
                            setHashTagSuggestions(data.hashtags || []);
                            toast.info("Choose hashtags to add");
                          } else {
                             toast.error("No hashtags available");
                        }}
                         setIsGeneratingAIHash(false);
                      }}
                    >
                      {isGeneratingAIHash ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Generate Hashtags"
                      )}
                    </button>
                  </div>

                  {/* Char count */}
                  <div className="text-right text-xs text-zinc-900">
                    {caption?.length || 0}/500
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!selectedImage || !caption.trim() || isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-rose-600 to-fuchsia-400 text-white py-3 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Share Post</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CaptureModal;
