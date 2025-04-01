import { addSwaggerConfigToMain } from "./addSwaggerConfigToMain";
import { createSwaggerConstants } from "./createSwaggerConstants";

export const addSwagger = () => {
  addSwaggerConfigToMain();
  createSwaggerConstants();
};
