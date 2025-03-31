import { promises as fs } from "fs";
import { join } from "path";
import chalk from "chalk";

async function addDockerFiles(projectPath: string) {
  const dockerfileContent = `# Use a lightweight Node.js image for building
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml before running install
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN corepack enable && pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm build

# Use a lightweight Node.js image for production
FROM node:20-alpine AS runtime

# Set the working directory
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# Set the command to run the application
CMD ["node", "dist/main.js"]`;

  const dockerignoreContent = `node_modules
dist
pnpm-lock.yaml
.DS_Store
.git
.gitignore
.env`;

  try {
    await fs.writeFile(join(projectPath, "Dockerfile"), dockerfileContent);
    await fs.writeFile(join(projectPath, ".dockerignore"), dockerignoreContent);
    console.log(
      chalk.green("Dockerfile and .dockerignore added successfully!")
    );
  } catch (error) {
    console.error(chalk.red("Error adding Docker files:"), error);
  }
}

export { addDockerFiles };
