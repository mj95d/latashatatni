import { useState, useEffect } from "react";

export interface BiometricCredential {
  credentialId: string;
  email: string;
}

export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    // Check if WebAuthn is available
    const checkAvailability = async () => {
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsAvailable(available);
        
        // Check if user has enrolled biometric credentials
        const savedCredential = localStorage.getItem("biometric_credential");
        setIsEnrolled(!!savedCredential);
      }
    };
    
    checkAvailability();
  }, []);

  const enrollBiometric = async (email: string): Promise<boolean> => {
    if (!isAvailable) return false;

    try {
      // Generate a challenge (in production, this should come from server)
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "لا تشتتني",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(email),
          name: email,
          displayName: email,
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },  // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "none",
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions,
      }) as PublicKeyCredential;

      if (credential) {
        const credentialData: BiometricCredential = {
          credentialId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
          email,
        };
        
        localStorage.setItem("biometric_credential", JSON.stringify(credentialData));
        setIsEnrolled(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error enrolling biometric:", error);
      return false;
    }
  };

  const authenticateWithBiometric = async (): Promise<string | null> => {
    if (!isAvailable || !isEnrolled) return null;

    try {
      const savedCredential = localStorage.getItem("biometric_credential");
      if (!savedCredential) return null;

      const { credentialId, email }: BiometricCredential = JSON.parse(savedCredential);

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [
          {
            id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)),
            type: "public-key",
          },
        ],
        timeout: 60000,
        userVerification: "required",
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyOptions,
      });

      if (assertion) {
        return email;
      }

      return null;
    } catch (error) {
      console.error("Error authenticating with biometric:", error);
      return null;
    }
  };

  const removeBiometric = () => {
    localStorage.removeItem("biometric_credential");
    setIsEnrolled(false);
  };

  return {
    isAvailable,
    isEnrolled,
    enrollBiometric,
    authenticateWithBiometric,
    removeBiometric,
  };
};
