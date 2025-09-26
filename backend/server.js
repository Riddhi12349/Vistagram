import express from "express";
import mongoose from "mongoose";
import { createClient } from "redis";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./ApiReq.js";
import dotenv from "dotenv";
import { extractTextFromImage, checkIsValidText } from "./ApiReq.js";
import fs from "fs";

import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const upload = multer({ storage  : multer.memoryStorage()});

const CLOUDINARY_URL='cloudinary://571416742376674:**********@ddwggceng'


cloudinary.config({
    cloud_name : 'ddwggceng' ,
    api_key : '571416742376674',
    api_secret :  'urxYi0QnwkCPJTDUY_rFhs_LKms'    
  });


const UploadImage = (fileBuffer, imgName) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { public_id: imgName, resource_type: "image" },
      (error, uploadResult) => {
        if (error) {
          console.error("Cloudinary upload failed:", error);
          return reject(error);
        }
        console.log(`Buffer upload_stream success - ${uploadResult.public_id}`);
        resolve(uploadResult);  // ✅ resolve the result
      }
    ).end(fileBuffer);  // raw buffer from multer
  });
};




const BASE_URL = process.env.BASE_URL || "http://localhost:8000";

// const BASE_URL = "http://localhost:8000";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api", apiRoutes);



const client = createClient({ url: process.env.REDIS_CLIENT_URL });

client.on("error", (err) => {
  console.log("Redis client error ", err);
});

await client.connect();
console.log("Redis - Client is Ready ? ", client.isReady);

const postSchema = new mongoose.Schema({
  id: String,
  user_id: String,
  username: String,
  caption: String,
  imageUrl: String,
  timestamp: String,
  likes: Number,
  shares: Number,
  isLiked: Boolean,
});

const postModel = new mongoose.model("postModel", postSchema);

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("MongoDB connected!!");
});


app.get("/get/all/posts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userRedisKey = `user-${userId}:posts_id`;

    const isExists = await client.exists(userRedisKey);
    if (isExists) {
      const postIds = await client.lRange(userRedisKey, 0, -1);
      const posts = [];

      for (const postId of postIds) {
        const postsRedisKey = `post_id-${postId}:post`;
        const post = await client.hGetAll(postsRedisKey);
        post.likes = Number(post.likes);
        post.shares = Number(post.shares);
        post.isLiked = post.isLiked === "true";
        posts.push(post);
      }

      res.send(posts);
    } else {
      const posts = await postModel.find({ user_id: userId });

      for (const post of posts) {
        client.rPush(userRedisKey, post.id);
        client.hSet(post.id, {
          id,
          user_id: userId,
          username,
          caption,
          timestamp,
          likes: post.likes.toString(),
          shares: post.shares.toString(),
          isLiked: post.isLiked.toString(),
          imageUrl,
        });
      }

      res.send(posts);
    }
  } catch (err) {
    console.log("Error fething posts : ", err);
    res.send({ error: "Failed to fetch posts" });
  }
});

app.post("/send/new/post/:userId/:postId", upload.single("image"), async (req, res) => {
    try {
      const { userId, postId } = req.params;
      const { username, caption, timestamp } = req.body;
   
      const fileBase64 = req.file.buffer.toString("base64")
      const imgDescr = await extractTextFromImage(fileBase64);

      const isInvalid = checkIsValidText(imgDescr);

      if (isInvalid) {
        return res.send({ message: "Inappropriate Image , Cannot be saved to DB" });
      }

      const userRedisKey = `user-${userId}:posts_id`;
      const postsRedisKey = `post_id-${postId}:post`;

      //UPLOADING AT CLOUDIFY , OUR IMAGE , AND GETTING THE URL OF  UPLOADED IMAGE
      const imageUrl =  await UploadImage(req.file.buffer , `${Date.now()}-${req.file.originalname}`);
       
      // console.log("imageUrl : " , imageUrl);

      const imageUploadUrl = req.file ? imageUrl.url : req.body.imageUrl;
     
      await client.rPush(userRedisKey, postId);
      await client.hSet(postsRedisKey, {
        id: postId,
        user_id: userId,
        username,
        caption,
        timestamp,
        likes: "0",
        shares: "0",
        isLiked: "false",
        imageUrl: imageUploadUrl,
      });

      const post = new postModel({
        id: postId,
        user_id: userId,
        username,
        caption,
        timestamp,
        likes: 0,
        shares: 0,
        isLiked: false,
        imageUrl: imageUploadUrl,
      });

      await post.save();

      console.log({ body: req.body, file: req.file });

      return res.send({
        message: "Post saved successfully !!",
        body: req.body,
        file: req.file,
        // text,
      });
    } catch (err) {
      console.log("Failed to save posts : ", err);
      return res.send({ error: "Failed to save post", err });
    }
  }
);

app.patch("/send/likes/count/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { newLikeCount, newLikedState } = req.body;

    const postsRedisKey = `post_id-${postId}:post`;

    const updatedPost = await postModel.findOneAndUpdate(
      { id: postId },
      { $set: { likes: newLikeCount, isLiked: newLikedState } },
      { new: true }
    );
    if (!updatedPost) {
      return res.send({ message: "Post not found" });
    }

    await client.hSet(postsRedisKey, {
      likes: newLikeCount.toString(),
      isLiked: newLikedState.toString(),
    });

    res.send(updatedPost);
  } catch (err) {
    console.log("Failed to update post : ", err);
    res.send({ message: "Failed to update post", err });
  }
});

app.patch("/send/shares/count/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { newShareCount } = req.body;

    const postsRedisKey = `post_id-${postId}:post`;

    const updatedPost = await postModel.findOneAndUpdate(
      { id: postId },
      { $set: { shares: newShareCount } },
      { new: true }
    );

    await client.hSet(postsRedisKey, {
      shares: newShareCount.toString(),
    });

    res.send(updatedPost);
  } catch (err) {
    console.log("Failed to update post", err);
    res.send({ message: "Failed to update post", err });
  }
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log("Server is listening on port : ", port);
});
