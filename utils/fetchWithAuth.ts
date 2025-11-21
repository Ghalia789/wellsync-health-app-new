import axios from "axios";

// export async function fetchWithAuth(url: string) {
//   try {
//     const response = await axios.get(url, { withCredentials: true });
//     return response.data;
//   } catch (error: any) {
//     // Si le token est invalide ou expiré
//     if (
//       error.response?.data?.error === "Invalid or expired token!" ||
//       error.response?.status === 401
//     ) {
//       // Lancer une erreur personnalisée pour le frontend
//       throw new Error("SESSION_EXPIRED");
//     }
//     throw error;
//   }
// }
