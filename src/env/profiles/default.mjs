import { secrets } from "./secrets";

class Environments {
  // ---------------------------BACKEND ------
  DB_NAME = 'fit-road-blog';
  FIREBASE_API_KEY= process.env.FIREBASE_API_KEY || secrets?.FIREBASE_API_KEY;
  FIREBASE_APP_ID= process.env.FIREBASE_APP_ID || secrets?.FIREBASE_APP_ID;
  FIREBASE_MESSAGING_SENDER_ID= process.env.FIREBASE_MESSAGING_SENDER_ID || secrets?.FIREBASE_MESSAGING_SENDER_ID;
  // ---------------------------FRONTEND ------
  NEXT_PUBLIC_AUTH_PASS = '022799';
}

export const defaultEnvs = new Environments();
