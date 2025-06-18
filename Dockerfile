# ------------ Stage 1: Build ------------
FROM maven:3.9.6-eclipse-temurin-21 AS builder

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Build the project and skip tests
RUN mvn clean package -DskipTests

# ------------ Stage 2: Run ------------
FROM openjdk:21-jdk-slim

# Set working directory
WORKDIR /app

# Copy the JAR from builder stage
COPY --from=builder /app/target/video-conferencing-app-0.0.1-SNAPSHOT.jar app.jar

# Expose port used by the application
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
