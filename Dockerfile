# bee: 1.16.1, typescript

FROM node:18

RUN npm install --global @ethersphere/swarm-cli && \
    npm install --global typescript && \
    npm install --global ts-node

RUN apt-get update && \
    apt-get install -y curl && \
    apt-get install -y alien && \
    rm -rf /var/lib/apt/lists/* 

RUN curl -o /tmp/bee.rpm -L "https://github.com/ethersphere/bee/releases/download/v1.16.1/bee-1.16.1.aarch64.rpm" && \
    cd /tmp && alien -d bee.rpm && \
    dpkg -i /tmp/bee_1.16.1-2_arm64.deb && \
    rm /tmp/bee.rpm && \
    rm /tmp/bee_1.16.1-2_arm64.deb

EXPOSE 1633 1635 3000
