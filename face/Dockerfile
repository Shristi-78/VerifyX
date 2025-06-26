# Use the official Node.js 18 image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for installing dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application code into the container
COPY . .
COPY face.html /usr/share/nginx/html/


# Expose the port the app runs on
EXPOSE 3021

# Command to run the application
CMD ["node", "face.js"]
