export interface OAuthProfile {
  id: string;
  emails?: { value: string }[];
  displayName: string;
  username?: string;
  photos?: { value: string }[];
}
