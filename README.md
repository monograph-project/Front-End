Simple Collaboration Environment for Final Year Project

Project Description

Simple Collaboration Environment for Final Year Project is a software system designed for managing and supporting final-year projects inside a specific faculty of a university. The main purpose of this project is to provide one connected environment where students, supervisors, and faculty administrators can manage academic projects, collaborate with team members, track project progress, review work, and publish final project results.

This project is inspired by Git. It allows users to track changes on their local computer, commit their work, clone an existing project, push changes to a remote repository, fetch and pull updates from other team members, and merge changes. These version-control features help students collaborate more safely and clearly while working on shared final-year project files.

In addition to version control, the system also includes a web-based management platform. This platform supports user management, student and teacher management, project registration, team management, notifications, blogs, public project publishing, and administrative workflows for the faculty.


Problem Statement

Final-year projects usually involve several people, including students, group members, supervisors, department staff, and faculty administrators. In many universities, this process is still managed through manual methods such as paper forms, messaging applications, email attachments, and informal file sharing.

These methods create several problems. Students may lose track of file changes, team members may overwrite each other's work, supervisors may not know who contributed to which part of the project, and faculty administrators may not have a central system for managing students, teachers, groups, and project results.

Another problem is the lack of a simple collaboration tool designed specifically for academic final-year projects. Existing version-control systems are powerful, but they are often too general or too complex for many students and faculty workflows. This project solves that issue by providing a simpler environment focused on the needs of a faculty final-year project process.


Solution Provided by the Project

This project provides a complete collaboration environment for final-year projects. It combines local version control, remote collaboration, project management, user management, notifications, and publication features in one system.

Students can work on their project files locally using the CLI or desktop application. They can track changes, commit work, push updates, pull updates from teammates, and merge changes. Teachers and supervisors can monitor project progress through the web platform. Faculty administrators can manage users, groups, departments, students, teachers, and project records from one dashboard.

The system also allows final project results to be published publicly, so approved projects can be shown on the public website of the platform.


Main Parts of the Project

The project is divided into three main parts.

1. Front-End Application

The front-end application is the web interface of the system. It is developed for students, teachers, administrators, authors, and public users. Through the front-end, users can log in, access dashboards, manage projects, view repositories, receive notifications, write blogs, and browse public project results.

Administrators can manage students, teachers, employees, departments, groups, projects, reports, blogs, and settings. Students can access their workspace, manage repositories, view tasks and milestones, create pull requests, and receive project notifications. Teachers can supervise projects, review repository progress, and manage project-related work. Public users can browse published blogs, public projects, documentation, and downloads.

2. Back-End Application

The back-end application is developed using a microservice architecture with Spring Boot and Spring Cloud. Instead of building one large application, the system is divided into smaller services. Each service is responsible for a specific part of the system, such as authentication, faculty management, files, blogs, notifications, or version control.

This architecture makes the system easier to maintain, extend, and improve. New features can be added to one service without affecting the whole application. It also makes the system more organized and suitable for future development.

3. CLI and Desktop Application

The CLI application is developed in Go. It provides local version-control commands similar to Git. Users can initialize repositories, track changes, add files, commit changes, clone repositories, push, pull, fetch, merge, and check repository status.

The desktop application is developed using the Wails framework. It uses the Go CLI logic behind a graphical interface. This allows users who do not want to use terminal commands to still perform version-control operations through a desktop application.


Front-End Description

The front-end is built as a modern single-page web application. It provides the visual interface for all user roles. It communicates with the back-end through the API gateway and handles authentication, routing, protected pages, notifications, forms, dashboards, and repository views.

The front-end includes public pages and private dashboards. Public pages allow users to view blogs, projects, documentation, and downloads. Private dashboards are protected by authentication and role-based access control.

The main front-end roles are administrator, student, teacher, author, staff, and dean. Each role has access to the pages and features related to its responsibility.


Back-End Description

The back-end is a microservice-based system. It uses Spring Boot for building services and Spring Cloud for service communication, configuration, discovery, and gateway routing.

The main services are:

Config Service: This service manages centralized configuration for other services.

Eureka Service: This service provides service discovery so that microservices can find and communicate with each other.

Gateway Service: This service is the main entry point for front-end requests. It routes requests to the correct back-end service.

Auth Service: This service manages authentication, users, roles, permissions, Keycloak integration, and Google OAuth.

Faculty Service: This service manages faculty-related data such as universities, faculties, departments, batches, semesters, students, teachers, employees, groups, and final-year projects.

File Service: This service handles file upload and download operations, including profile images, logos, blog media, CLI releases, and other related files.

Blog Service: This service manages articles, drafts, publishing, comments, likes, shares, and author content.

Notification Service: This service manages in-app notifications, email notifications, websocket delivery, and event-based messages.

Version-Control Service: This service manages repositories, commits, tree browsing, file history, pull requests, merge conflicts, tasks, milestones, contributors, invitations, statistics, and document-related repository features.


CLI Application Description

The CLI application is one of the most important parts of the project because collaboration starts from the user's local computer. It allows students to work locally on their project files and then synchronize their changes with the remote server.

The CLI supports commands for repository initialization, file tracking, commits, branches, cloning, pushing, fetching, pulling, merging, logs, status checking, authentication, and remote configuration.

This makes the project similar to a simplified Git-based workflow, but designed for the specific needs of final-year project collaboration.


Desktop Application Description

The desktop application provides a graphical interface for the version-control features. It is built using Wails, which allows Go logic to be combined with a modern web-based desktop interface.

The desktop application uses the same core logic as the CLI application. This means the desktop application is powered by the CLI functionality, but users can interact with it through buttons, screens, and forms instead of terminal commands.


Technology Stack

Front-End Technologies

The front-end uses React for building the user interface. Vite is used as the development and build tool. React Router is used for routing. Axios is used for API communication. Tailwind CSS is used for styling. Radix UI and Lucide React are used for UI components and icons. TanStack React Query is used for data fetching and caching. Syncfusion components are used for document, PDF, spreadsheet, and rich text features. STOMP and SockJS are used for websocket communication. i18next is used for localization.

Back-End Technologies

The back-end uses Java 17 and Spring Boot. Spring Cloud Config is used for centralized configuration. Spring Cloud Gateway is used as the API gateway. Netflix Eureka is used for service discovery. Spring Security and OAuth2 Resource Server are used for security. Keycloak is used for identity and access management. MongoDB and PostgreSQL are used for data storage. Redis is used for caching and rate-related features. Kafka and RabbitMQ are used for messaging and event-based communication. MinIO is used for object storage. Flyway is used for database migration. Resilience4j is used for fault tolerance. WebSocket and STOMP are used for real-time communication. OpenAPI and Swagger are used for API documentation.

CLI and Desktop Technologies

The CLI is developed using Go. Cobra is used for building command-line commands. The desktop application is developed using Wails. The desktop interface uses React, TypeScript, Vite, and Tailwind CSS. WebSocket support and diff utilities are used for remote communication and change tracking.

Infrastructure Technologies

The infrastructure uses Docker Compose, PostgreSQL, pgAdmin, Redis, Kafka, Zookeeper, RabbitMQ, Keycloak, MinIO, OnlyOffice document server, and MongoDB.


Core Collaboration Flow

First, a student or teacher creates or joins a final-year project. Then a repository is created for that project. Team members can clone the repository using the CLI or desktop application. After cloning, they work on files locally and track their changes.

When a user completes a part of the work, the changes are committed locally. The user can then push the changes to the remote server. Other team members can fetch or pull the latest changes. If different branches or contributions need to be combined, the system supports merging.

Teachers and supervisors can review progress through pull requests, tasks, milestones, file history, and repository statistics. Notifications inform users about invitations, updates, comments, and repository activities. Finally, completed project results can be published and displayed on the public website.


Key Features

The system provides Git-inspired local and remote collaboration. It supports repository creation, cloning, pushing, pulling, fetching, and merging. It supports task and milestone management for tracking project progress. It provides pull request and merge conflict support. It includes role-based dashboards for administrators, students, teachers, authors, staff, and deans.

The system also provides faculty-specific final-year project management, student group management, supervisor workflow, blog and article publishing, public project result publishing, file upload and download, real-time notifications, email notifications, centralized authentication, authorization, and an API gateway for unified back-end access.


Why This Architecture Was Chosen

The project uses three connected applications because each part solves a different problem.

The CLI and desktop application handle local project work. This is important because students write and edit files on their own computers. They need a tool that can track local changes and synchronize work with the remote system.

The back-end stores data, secures the system, coordinates services, manages collaboration events, and provides APIs for all clients.

The front-end provides dashboards, management screens, review tools, public pages, and user workflows. It makes the system accessible to administrators, students, teachers, authors, and public visitors.

The microservice architecture was selected because the system contains many independent domains. Authentication, faculty management, files, blogs, notifications, and version control are separate concerns. By separating them into services, the system becomes easier to maintain and extend.


Project Goal

The goal of this project is to provide a simple but complete collaboration environment for final-year projects inside a university faculty. It brings version control, project supervision, team collaboration, administrative management, and project publication into one system.

This project helps students collaborate more effectively, helps teachers supervise project progress, and helps faculty administrators manage the final-year project process in a more organized and modern way.
