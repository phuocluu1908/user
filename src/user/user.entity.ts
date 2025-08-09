export class User {
  id: number;
  email: string;
  password: string; // In production, store hashed passwords!
  name?: string;
}
