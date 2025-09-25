import { GoogleGenAI } from "@google/genai";
import Express from "express";
import multer from "multer";
import fetch from "node-fetch";
import dotenv from "dotenv";


dotenv.config();

const router = Express.Router();

const clientAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

//temporary storage
const upload = multer({ storage: multer.memoryStorage() });


function cleanCaptions(rawText) {
  let captions = rawText.replace(/\*\*(\d+)\.\s*/g, "\n");

  let individualCaptions = captions
    .split(/\n\n|!|\n|\./)
    .map((c) => c.trim())
    .filter((c) => c.length);

  const captionArray = [];
  const hashtags = [];

  individualCaptions.forEach((line, index) => {
    if (index === 0) return; // Skip intro

    const cleanLine = line
      .replace(/["*>:]/g, "")
      .replace(/\n\n/g, " ")
      .replace(/\n/g, " ")
      .replace(/[()]/g, " ") 
      .replace(/\d+/g, "")
      .trim();

    if (!cleanLine) return;

    if (cleanLine.startsWith("#")) {
      cleanLine.split(/\s+/).forEach((tag) => {
        if (tag.startsWith("#")) hashtags.push(tag);
      });
    }
    else if (/^[\p{Emoji}\s]+$/u.test(cleanLine)) {
      if (captionArray.length) {
        captionArray[captionArray.length - 1] += " " + cleanLine;
      }
    } 
    else {
      captionArray.push(cleanLine);
    }
  });

  return { captionArray, hashtags };
}

export async function extractTextFromImage(imageData) {

  
const contents = [
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: imageData,
    },
  },
  { text: "Describe the image in words in 2-3 sentences highlighting only Important Points." },
];


  const response = await clientAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents : contents
  });

  return response.text;
}

export function checkIsValidText(imgDescr){

  const bannedWords = [
  "porn", "nudity", "sex", "violence", "drugs", "gore",
  "blood", "weapon", "abuse", "kill"
];

 const normalizedText = imgDescr.toLowerCase();
  console.log(normalizedText);
 return bannedWords.some(word => normalizedText.includes(word));
}

router.post("/ai/analyze/image", upload.single("image"), async (req, res) => {

  console.log({ body : req.body , file :  req.file })
  const imgDescr = await extractTextFromImage(req.file.buffer.toString("base64"));
  const isInvalid = checkIsValidText(imgDescr);

  if(isInvalid===true){
    return res.send({  message : "Inappropriate Image , Cannot be saved to DB."});
  }

  const prompt = `Generate 6 creative Instagram short captions for image 
                 : ${imgDescr}  with Emojis. DO NOT put anything like NO EMOJI in front of captions starting with (#)HASH ONLY.`;

  try {
    
    const aiRes = await clientAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents : prompt
    });

    // let rawText = aiRes.candidates[0].content.parts[0].text;
    let rawText = aiRes.text;

    const { captionArray, hashtags } = cleanCaptions(rawText);

        
    return res.send({  captionArray, hashtags });

  } catch (err) {
    
    return res.send({ error: err.message });
  
  }
});

export default router;


