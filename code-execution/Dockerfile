FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y curl git ca-certificates && \
    apt-get upgrade -y

RUN apt-get install -y openjdk-17-jdk
RUN java -version
RUN javac -version

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs
RUN node -v
RUN npm -v

WORKDIR /app
COPY entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh
ENTRYPOINT [ "/app/entrypoint.sh" ]
