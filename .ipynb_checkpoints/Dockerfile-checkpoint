# Use the official Python 3.9.6 image as the base image
FROM python:3.9.6

# Install necessary packages
RUN apt-get update && \
    apt-get install -y wkhtmltopdf && \
    apt-get install libnss3 -y

# Set the working directory in the Docker image
WORKDIR /app

# Create a clean directory for Node.js installation
RUN mkdir /usr/local/nodejs

# Install Node.js version manager "n"
RUN curl -L https://git.io/n-install | N_PREFIX=/usr/local/nodejs bash -s -- -y latest

# Use "n" to install the desired Node.js version
RUN /usr/local/nodejs/bin/n 18.16.1

# Update npm to the desired version
RUN /usr/local/nodejs/bin/npm install -g npm@9.7.2

# Copy your code into the image
COPY . .

# Make the setup.sh script executable and run it
RUN chmod +x setup.sh && ./setup.sh

WORKDIR /app/backend
RUN pip install -r requirements.txt
# ENV PORT 8080

# CMD ["gunicorn","app:app"]
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
