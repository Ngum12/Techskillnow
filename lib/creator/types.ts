export type ProjectField = 'title' | 'audience' | 'outcome' | 'experience' | 'demand' | 'outline' | 'draft' | 'verification' | 'review' | 'description' | 'price' | 'storeUrl' | 'launch';
export type CreatorProject = Record<ProjectField, string>;
export type CreatorLabTask = {
  type: 'creatorLab';
  stage: string;
  instruction: string;
  image?: string;
  fields?: { key: ProjectField; label: string; hint: string; min: number }[];
  rounds?: { scene: string; customer?: string; options: { text: string; feedback: string; correct: boolean }[] }[];
  order?: { items: { id: string; label: string; why: string }[]; answer: string[] };
  checklist?: string[];
  tools?: { label: string; url: string; why: string }[];
  success: string;
};
export const emptyProject: CreatorProject = { title:'', audience:'', outcome:'', experience:'', demand:'', outline:'', draft:'', verification:'', review:'', description:'', price:'', storeUrl:'', launch:'' };
