# This file is generated by Nx.
#
# Build the docker image with `npx nx docker-build api-gateway`.
# Tip: Modify "docker-build" options in project.json to change docker build args.
#
# Run the container with `docker run -p 3000:3000 -t api-gateway`.
FROM docker.io/node:lts-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
# RUN npm --prefix api-gateway --omit=dev -f install
RUN npm --omit=dev install

COPY dist/apps/api-gateway api-gateway

CMD [ "node", "api-gateway/main.js" ]
