import { secrets } from "./secrets";

class Environments {
  // ---------------------------BACKEND ------
  DB_NAME = 'fit-road-blog';
  NEXT_PUBLIC_FIREBASE_API_KEY= process.env.NEXT_PUBLIC_FIREBASE_API_KEY || secrets?.NEXT_PUBLIC_FIREBASE_API_KEY;
  NEXT_PUBLIC_FIREBASE_APP_ID= process.env.NEXT_PUBLIC_FIREBASE_APP_ID || secrets?.NEXT_PUBLIC_FIREBASE_APP_ID;
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID= process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || secrets?.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  // ---------------------------FRONTEND ------
  NEXT_PUBLIC_AUTH_PASS = '022799';
}

export const defaultEnvs = new Environments();
