# Use the latest Node.js image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy all files from the current directory to the container
COPY . .

# Install dependencies
RUN npm install --force

# Run the development server
CMD ["npm", "run", "dev"]
