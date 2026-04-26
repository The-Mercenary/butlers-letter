export type ConsentKey =
  | "terms"
  | "privacy"
  | "thirdParty"
  | "sensitiveInfo"
  | "ageOver19"
  | "marketing"
  | "sajuAnalysis"
  | "cardDisclosure"
  | "contactDisclosure";

export interface ConsentContent {
  key: ConsentKey;
  title: string;
  body: string;
  required: boolean;
}
