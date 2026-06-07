export interface OAuthProfile {
  id: string;
  emails?: { value: string }[] | undefined;
  displayName: string;
  username?: string | undefined;
  photos?: { value: string }[] | undefined;
}
