/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

/**
 * Vérifie la validité d'une adresse email à l'aide de AbstractAPI.
 * - Vérifie le format, le domaine MX, et la validité SMTP (si possible)
 * - N'envoie PAS de mail réel
 * - Accepte les cas "UNKNOWN" (ex: Gmail, Outlook)
 */
export async function verifyEmail(email: string) {
  try {
    const response = await axios.get(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}&email=${email}`
    );

    const data = response.data;

    // 🧩 1. Vérifie le format syntaxique
    if (!data.is_valid_format.value) {
      return { valid: false, reason: "Format d'adresse email invalide" };
    }

    // 🧩 2. Vérifie la présence d’un serveur mail MX
    if (!data.is_mx_found.value) {
      return { valid: false, reason: "Domaine de messagerie invalide" };
    }

    // 🧩 3. Vérifie l’existence SMTP (si disponible)
    if (data.is_smtp_valid.value === false) {
      return { valid: false, reason: "Adresse email inexistante" };
    }

    // 🧩 4. Si SMTP inconnu (Gmail, Outlook...), on considère valide
    return { valid: true };
  } catch (error: any) {
    console.error("❌ Erreur de vérification AbstractAPI:", error.message);
    return {
      valid: false,
      reason: "Erreur de communication avec le service de vérification",
    };
  }
}
