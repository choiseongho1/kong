FROM openjdk:17-jdk-slim AS build
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew clean bootJar -x test  # ✅ bootJar로 변경

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/build/libs/kong_back.jar kong_back.jar
EXPOSE 8080
CMD ["java", "-jar", "kong_back.jar"]
