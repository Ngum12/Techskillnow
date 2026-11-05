import type { CreatorProject } from "./types";
export type WorkshopMode =
  | "tour"
  | "offer"
  | "account"
  | "chat"
  | "review"
  | "design"
  | "files"
  | "price"
  | "store"
  | "payments"
  | "launch"
  | "handover";
export type CreatorWorkshopTask = {
  type: "creatorWorkshop";
  mode: WorkshopMode;
  tool?: "ChatGPT" | "Canva" | "Selar" | "Google Drive";
  phase?: string;
  title: string;
  learn: {
    heading: string;
    explanation: string;
    example: string;
    takeaway: string;
  }[];
  instruction: string;
  hint: string;
  success: string;
  prompt?: {
    starter: string;
    model: string;
    requirements: { label: string; words: string[] }[];
    response: string;
    save?: keyof CreatorProject;
  };
};
export const PROJECT_KEY = "tsn_creator_project_v1";
export const sample = {
  title: "Photograph Your First Cake with an Android Phone",
  audience: "Home bakers using an Android phone and daylight",
  outcome:
    "Create three clear cake photos ready for a WhatsApp product listing",
  experience:
    "A phone with a working camera, a clean lens, a stable surface, a plain background and a place with indirect daylight. Use a practice cake or another object you own. This guide covers simple presentation and photography, not food preparation or guaranteed sales.",
  outline:
    "1. Prepare your phone and workspace\n2. Find soft daylight\n3. Frame the whole cake\n4. Capture a useful detail\n5. Choose, check and export your photos\n6. Troubleshooting and final checklist",
  draft:
    "PREPARE\nUse your own subject, a clean phone lens, a plain background and a stable surface. Turn off the flash for this daylight exercise. Avoid showing private customer details.\n\n1. FIND THE LIGHT\nPlace the cake near a window with indirect daylight. Look at the shadow on the opposite side. Move the subject or use a white card to gently reflect available light if the shadow hides detail. Check that highlights still show texture.\n\n2. SHOW THE WHOLE PRODUCT\nHold the phone steadily and include the entire cake with space around it. Tap the subject on the camera screen to focus. Take a photo, then open it and inspect the edges and sharpness. Retake it if the top or base is cut off.\n\n3. SHOW A DETAIL\nMove closer to one decoration without hiding what the product is. Avoid excessive digital zoom. Compare the detail photo with the full view: does it add useful information?\n\n4. CHECK AND CHOOSE\nReview the images at normal size and zoom in to check focus. Remove images that are blurry, too dark or misleading. Keep one full view, one angle and one detail. Use your own photos and keep colours faithful to the real product.\n\nTROUBLESHOOTING\nDark photo: find a brighter position without direct glare. Blurry photo: stabilise your hands or the phone and retake. Busy background: remove distracting objects. Cropped cake: step back and check every edge.\n\nFINAL CHECKLIST\nThe whole product is visible. Important details are sharp. The background is simple. Colours represent the real product. No private details are visible. Keep the original files in your product folder.",
};
