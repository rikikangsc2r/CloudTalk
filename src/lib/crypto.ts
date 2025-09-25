import CryptoJS from 'crypto-js';

// WARNING: This is NOT a secure way to manage secrets in a real application.
// This key is hardcoded and easily extractable from the client-side code.
// For true security, you would need a robust key management system,
// likely involving a server and a database.
const SECRET_KEY = 'your-super-secret-key-that-is-not-so-secret';

export const encryptMessage = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptMessage = (ciphertext: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption results in an empty string, it might be an old, unencrypted message
    // or a decryption failure. Return the original ciphertext to display something.
    return originalText || ciphertext;
  } catch (error) {
    // If decryption fails, it's likely an old, unencrypted message.
    // Return the original text.
    return ciphertext;
  }
};
