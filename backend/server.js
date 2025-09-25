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

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", apiRoutes);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const prefix = Date.now();
    cb(null, prefix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

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

app.post("/send/new/post/:userId/:postId",
  upload.single("image"),
  async (req, res) => {
    try {
      const { userId, postId } = req.params;
      const { username, caption, timestamp } = req.body;
   
      const fileBase64 = fs.readFileSync(req.file.path, { encoding: "base64" });
      const imgDescr = await extractTextFromImage(fileBase64);

      const isInvalid = checkIsValidText(imgDescr);

      if (isInvalid) {
        return res.send({ message: "Inappropriate Image , Cannot be saved to DB.ser" });
      }

      const userRedisKey = `user-${userId}:posts_id`;
      const postsRedisKey = `post_id-${postId}:post`;

      const imageUrl = `http://localhost:${process.env.PORT}/uploads/${req.file.filename}`;

      const imageUploadUrl = req.file ? imageUrl : req.body.imageUrl;

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
