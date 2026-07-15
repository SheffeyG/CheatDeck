import { backendClient } from "./backendClient";

export const getHomePath = async (): Promise<string> => {
  return await backendClient.getEnvironmentValue("DECKY_USER_HOME");
};
