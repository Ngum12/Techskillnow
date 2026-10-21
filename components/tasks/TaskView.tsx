"use client";
import dynamic from "next/dynamic";
import type { Task } from "@/content/types";
import { MultipleChoice } from "./MultipleChoice";
import { FixTheText } from "./FixTheText";
import { MockEmailCompose } from "./MockEmailCompose";
import { MockInbox } from "./MockInbox";
import { MockSignup } from "./MockSignup";

// Larger simulations load on demand, only when a learner reaches that step (small downloads on 3G).
const loading = () => <p className="py-8 text-center text-muted">…</p>;
const RecruiterScan = dynamic(() => import("./RecruiterScan").then((m) => m.RecruiterScan), { loading });
const AdvertHighlighter = dynamic(() => import("./AdvertHighlighter").then((m) => m.AdvertHighlighter), { loading });
const ExperienceMiner = dynamic(() => import("./ExperienceMiner").then((m) => m.ExperienceMiner), { loading });
const SectionOrder = dynamic(() => import("./SectionOrder").then((m) => m.SectionOrder), { loading });
const CvHeaderForm = dynamic(() => import("./CvHeaderForm").then((m) => m.CvHeaderForm), { loading });
const CvProfile = dynamic(() => import("./CvProfile").then((m) => m.CvProfile), { loading });
const BulletBuilder = dynamic(() => import("./BulletBuilder").then((m) => m.BulletBuilder), { loading });
const CvEducationSkills = dynamic(() => import("./CvEducationSkills").then((m) => m.CvEducationSkills), { loading });
const RedPenCV = dynamic(() => import("./RedPenCV").then((m) => m.RedPenCV), { loading });
const CvExport = dynamic(() => import("./CvExport").then((m) => m.CvExport), { loading });
const KeywordMatcher = dynamic(() => import("./KeywordMatcher").then((m) => m.KeywordMatcher), { loading });
const TailorChallenge = dynamic(() => import("./TailorChallenge").then((m) => m.TailorChallenge), { loading });
const CoverLetterBuilder = dynamic(() => import("./CoverLetterBuilder").then((m) => m.CoverLetterBuilder), { loading });
const PortalSimulator = dynamic(() => import("./PortalSimulator").then((m) => m.PortalSimulator), { loading });
const InterviewCards = dynamic(() => import("./InterviewCards").then((m) => m.InterviewCards), { loading });
const MissionBrief = dynamic(() => import("./MissionBrief").then((m) => m.MissionBrief), { loading });

export function TaskView({ task, passed, onPass }: { task: Task; passed: boolean; onPass: () => void }) {
  const props = { passed, onPass };
  switch (task.type) {
    case "multipleChoice":
      return <MultipleChoice task={task} {...props} />;
    case "fixText":
      return <FixTheText task={task} {...props} />;
    case "compose":
      return <MockEmailCompose task={task} {...props} />;
    case "inbox":
      return <MockInbox task={task} {...props} />;
    case "signup":
      return <MockSignup task={task} {...props} />;
    case "recruiterScan":
      return <RecruiterScan task={task} {...props} />;
    case "advertHighlight":
      return <AdvertHighlighter task={task} {...props} />;
    case "experienceMiner":
      return <ExperienceMiner task={task} {...props} />;
    case "sectionOrder":
      return <SectionOrder task={task} {...props} />;
    case "cvHeader":
      return <CvHeaderForm task={task} {...props} />;
    case "cvProfile":
      return <CvProfile task={task} {...props} />;
    case "bulletBuilder":
      return <BulletBuilder task={task} {...props} />;
    case "cvEducationSkills":
      return <CvEducationSkills task={task} {...props} />;
    case "redPen":
      return <RedPenCV task={task} {...props} />;
    case "cvExport":
      return <CvExport task={task} {...props} />;
    case "keywordMatch":
      return <KeywordMatcher task={task} {...props} />;
    case "tailor":
      return <TailorChallenge task={task} {...props} />;
    case "coverLetter":
      return <CoverLetterBuilder task={task} {...props} />;
    case "portal":
      return <PortalSimulator task={task} {...props} />;
    case "interview":
      return <InterviewCards task={task} {...props} />;
    case "missionBrief":
      return <MissionBrief task={task} {...props} />;
  }
}
