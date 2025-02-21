FROM ubuntu:focal

RUN apt-get update && apt-get install -y curl git openjdk-11-jdk \
    && curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && apt-get upgrade -y

RUN node -v
RUN npm -v
RUN java -version
RUN javac -version


WORKDIR /app

COPY entrypoint.sh entrypoint.sh

RUN chmod +x entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]
