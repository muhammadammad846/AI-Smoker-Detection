FROM node:18-slim

# Install Python and build tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    cmake \
    gcc \
    g++ \
    curl \
    build-essential \
    libopenblas-dev \
    liblapack-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
COPY requirements.txt ./

# Install Node.js dependencies
RUN npm install --production

# Install pip
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && \
    python3 get-pip.py --break-system-packages

# Install Python dependencies
# Using --no-cache-dir to reduce image size
RUN python3 -m pip install --no-cache-dir --break-system-packages -r requirements.txt

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port (Fly.io will set PORT env var)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]
