export interface PRFile {
  filename: string;
  language?: string;
  additions: number;
  deletions: number;
  patch: string;
}

export interface PRCommit {
  sha: string;
  message: string;
  author: string;
  timestamp: Date;
}

export interface PRData {
  title: string;
  author: string;
  repository: string;
  url: string;
  baseRef: string;
  headRef: string;
  description: string;
  files: PRFile[];
  commits: PRCommit[];
  createdAt: Date;
  updatedAt: Date;
  stats: {
    additions: number;
    deletions: number;
    filesChanged: number;
  };
}
