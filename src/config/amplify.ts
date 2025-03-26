import { Amplify } from "aws-amplify";

export function configureAmplify() {
  console.log("Configuring Amplify Auth...");

  Amplify.configure({
    Auth: {
      Cognito: {
        // userPoolId: "us-west-2_voM6eMnSB",
        // userPoolClientId: "15uj23gg14qthp49qvovu23d42",
        userPoolId: "us-east-1_JBLcAR49O",
        userPoolClientId: "4spbgs053dhso1p342rlkb5k8g",
        loginWith: {
          oauth: {
            // domain:
            // "https://us-west-2vom6emnsb.auth.us-west-2.amazoncognito.com",
            domain: "us-east-1jblcar49o.auth.us-east-1.amazoncognito.com",
            scopes: ["email", "profile", "openid"],
            redirectSignIn: [
              "http://localhost:5173/",
              // "http://localhost:3000/_oauth/bridge2ps",
            ],
            redirectSignOut: [
              "http://localhost:5173/",
              "http://localhost:5173/login",
              "http://localhost:3000/_oauth/bridge2ps",
            ],
            responseType: "code",
          },
        },
      },
    },
  });
  console.log("Amplify configured successfully");
}
