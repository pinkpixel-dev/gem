export interface Repo {
  id: string;
  name: string;
  owner: string;
  description?: string;
  primaryLanguage?: string;
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt?: string;
  createdAt?: string;
  homepage?: string;
  latestReleaseName?: string;
  latestReleasePublishedAt?: string;
  whySurfaced?: string;
  score: number;
  collection: string;
  scannedAt: string;
  hasReadme: number;
  hasHomepage: number;
  hasRelease: number;
  starGrowth7d: number;
  forkGrowth7d: number;
}

export interface CollectionCount {
  name: string;
  count: number;
}

export interface SavedSearch {
  id: number;
  query: string;
  lastScannedAt?: string;
}

export interface Preference {
  id: number;
  keyType: string;
  keyName: string;
  weight: number;
}
