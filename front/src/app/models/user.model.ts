export interface User {
    id: number;
    username: string;
    email: string;
    kidcoins: number;
    // autres propriétés selon vos besoins
  }
  
export interface AuthResponse {
    user: User;  // L'objet utilisateur retourné
    token: string; // Le token JWT (si ton backend envoie un token)
  }
  