import { Amplify } from "aws-amplify";
// import { cognitoUserPoolsTokenProvider } from "@aws-amplify/auth/cognito";

export function configureAmplify() {
  console.log("Configuring Amplify Auth...");

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: "us-east-1_JBLcAR49O",
        userPoolClientId: "4spbgs053dhso1p342rlkb5k8g",
        // identityPoolId: "YOUR_IDENTITY_POOL_ID", // Optional - only if you've set up an identity pool
        loginWith: {
          oauth: {
            domain: "us-east-1jblcar49o.auth.us-east-1.amazoncognito.com",
            scopes: ["email", "profile", "openid"],
            redirectSignIn: ["http://localhost:5173/"],
            redirectSignOut: ["http://localhost:5173/"],
            responseType: "code",
          },
        },
      },
    },
  });
  console.log("Amplify configured successfully");
}
