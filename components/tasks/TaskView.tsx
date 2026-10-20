"use client";
import type { Task } from "@/content/types";
import { MultipleChoice } from "./MultipleChoice";
import { FixTheText } from "./FixTheText";
import { MockEmailCompose } from "./MockEmailCompose";
import { MockInbox } from "./MockInbox";
import { MockSignup } from "./MockSignup";

export function TaskView({ task, passed, onPass }: { task: Task; passed: boolean; onPass: () => void }) {
  switch (task.type) {
    case "multipleChoice":
      return <MultipleChoice task={task} passed={passed} onPass={onPass} />;
    case "fixText":
      return <FixTheText task={task} passed={passed} onPass={onPass} />;
    case "compose":
      return <MockEmailCompose task={task} passed={passed} onPass={onPass} />;
    case "inbox":
      return <MockInbox task={task} passed={passed} onPass={onPass} />;
    case "signup":
      return <MockSignup task={task} passed={passed} onPass={onPass} />;
  }
}
