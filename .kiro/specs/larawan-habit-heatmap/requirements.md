# Requirements Document

## Introduction

Larawan is a personal consistency heatmap system inspired by GitHub's contribution graph. It is not a habit tracker or task manager — it is a **pattern visualization tool**. Users create named habits, each with a custom color, and log a single daily check-in per habit ("I showed up today"). The system renders each habit's history as a GitHub-style heatmap grid, making long-term consistency visible at a glance.

The philosophy is Kaizen: showing up matters more than perfection. There is no scoring, no streaks, no intensity — just presence over time.

The system is built on Next.js (React 19, Tailwind CSS v4), backed by Supabase for authentication and PostgreSQL storage, and deployed on Vercel.

---

## Glossary

- **Larawan**: The application system described in this document.
- **User**: An authenticated person who has registered and logged into Larawan.
- **Habit**: A named, user-defined activity that a User tracks for consistency. Each Habit has a name and a custom color.
- **Check-in**: A single record indicating that a User showed up for a given Habit on a given calendar date. One Check-in per Habit per day maximum.
- **Heatmap**: A GitHub-style grid visualization where each cell represents one calendar day. A filled cell indicates a Check-in exists for that day; an empty cell indicates no Check-in.
- **Auth_System**: The Supabase-based authentication subsystem responsible for user registration, login, and session management.
- **Habit_Store**: The Supabase PostgreSQL database layer responsible for persisting Habits and Check-ins.
- **Heatmap_Renderer**: The frontend component responsible for rendering the Heatmap grid for a given Habit.
- **Habit_Manager**: The frontend subsystem responsible for creating, listing, and deleting Habits.
- **Check-in_Handler**: The frontend and backend subsystem responsible for recording and preventing duplicate Check-ins.

---

## Requirements

### Requirement 1: User Authentication

**User Story:** As a visitor, I want to register and log in with an email and password, so that my habits and check-ins are private and tied to my account.

#### Acceptance Criteria

1. WHEN a visitor submits a valid email address and password on the registration form, THE Auth_System SHALL create a new User account and redirect the User to the dashboard.
2. WHEN a visitor submits an email address that is already registered, THE Auth_System SHALL display an error message indicating the email is already in use.
3. WHEN a visitor submits a login form with a valid email and password combination, THE Auth_System SHALL authenticate the User and redirect the User to the dashboard.
4. IF a visitor submits a login form with an invalid email or password combination, THEN THE Auth_System SHALL display an error message and SHALL NOT grant access to the dashboard.
5. WHEN an authenticated User requests to log out, THE Auth_System SHALL terminate the User's session and redirect the User to the login page.
6. WHILE a User's session is active, THE Auth_System SHALL maintain the authenticated state across page navigations without requiring re-login.
7. IF an unauthenticated visitor attempts to access a protected route, THEN THE Auth_System SHALL redirect the visitor to the login page.

---

### Requirement 2: Habit Creation

**User Story:** As a User, I want to create a named habit with a custom color, so that I can track multiple distinct activities on separate heatmaps.

#### Acceptance Criteria

1. WHEN a User submits a habit creation form with a non-empty name and a selected color, THE Habit_Manager SHALL persist the new Habit to the Habit_Store and display it on the dashboard.
2. IF a User submits a habit creation form with an empty name, THEN THE Habit_Manager SHALL display a validation error and SHALL NOT persist the Habit.
3. THE Habit_Manager SHALL allow a User to select a custom color for each Habit from a predefined set of color options.
4. THE Habit_Store SHALL associate each Habit exclusively with the User who created it, ensuring no other User can access or modify it.
5. THE Habit_Manager SHALL allow a User to create multiple Habits, each with a unique name within that User's account.
6. IF a User submits a habit creation form with a name that duplicates an existing Habit name within the same account, THEN THE Habit_Manager SHALL display a validation error and SHALL NOT persist the duplicate Habit.

---

### Requirement 3: Dashboard — Habit Listing

**User Story:** As a User, I want to see all my habits listed on a dashboard, so that I can view and interact with each habit's heatmap and check-in button.

#### Acceptance Criteria

1. WHEN an authenticated User navigates to the dashboard, THE Habit_Manager SHALL retrieve and display all Habits belonging to that User from the Habit_Store.
2. THE Habit_Manager SHALL display each Habit with its name, its custom color, a check-in button, and its associated Heatmap.
3. WHILE a User has no Habits, THE Habit_Manager SHALL display an empty-state message prompting the User to create their first Habit.
4. THE Habit_Manager SHALL display Habits in the order they were created, with the most recently created Habit appearing last.

---

### Requirement 4: Daily Check-in

**User Story:** As a User, I want to log that I showed up for a habit today by clicking a button, so that the day is recorded on my heatmap.

#### Acceptance Criteria

1. WHEN a User clicks the check-in button for a Habit on the current calendar date, THE Check-in_Handler SHALL record a Check-in for that Habit and that date in the Habit_Store.
2. WHEN a Check-in is successfully recorded, THE Check-in_Handler SHALL update the Heatmap for that Habit to reflect the new Check-in without requiring a full page reload.
3. IF a User clicks the check-in button for a Habit on a date for which a Check-in already exists, THEN THE Check-in_Handler SHALL display a confirmation message indicating the User has already checked in for that day and SHALL NOT create a duplicate Check-in record.
4. THE Habit_Store SHALL enforce a uniqueness constraint on the combination of User, Habit, and calendar date, ensuring no duplicate Check-in records exist at the data layer.
5. WHILE a User is on the dashboard, THE Check-in_Handler SHALL visually distinguish the check-in button state for Habits that have already been checked in today versus those that have not.

---

### Requirement 5: Heatmap Visualization

**User Story:** As a User, I want to see a heatmap grid for each habit showing which days I showed up, so that I can visually understand my consistency over time.

#### Acceptance Criteria

1. THE Heatmap_Renderer SHALL display a grid where each cell represents one calendar day, spanning the most recent 52 weeks (364 days) up to and including the current date.
2. WHEN a calendar day has a corresponding Check-in record, THE Heatmap_Renderer SHALL render that cell using the Habit's custom color.
3. WHEN a calendar day has no corresponding Check-in record, THE Heatmap_Renderer SHALL render that cell in a neutral empty color.
4. THE Heatmap_Renderer SHALL organize the grid with columns representing weeks and rows representing days of the week (Sunday through Saturday), matching the GitHub contributions layout.
5. THE Heatmap_Renderer SHALL display month labels above the grid to provide temporal orientation.
6. WHEN a User hovers over a cell, THE Heatmap_Renderer SHALL display a tooltip showing the calendar date of that cell and whether a Check-in exists for that day.
7. THE Heatmap_Renderer SHALL render the Heatmap using the Habit's custom color for all filled cells, ensuring visual distinction between different Habits.

---

### Requirement 6: Habit Deletion

**User Story:** As a User, I want to delete a habit I no longer want to track, so that my dashboard stays relevant to my current goals.

#### Acceptance Criteria

1. WHEN a User confirms the deletion of a Habit, THE Habit_Manager SHALL remove the Habit and all associated Check-in records from the Habit_Store.
2. WHEN a Habit is successfully deleted, THE Habit_Manager SHALL remove the Habit and its Heatmap from the dashboard without requiring a full page reload.
3. BEFORE deleting a Habit, THE Habit_Manager SHALL present a confirmation prompt to the User indicating that all Check-in history for that Habit will be permanently removed.
4. IF a User cancels the deletion confirmation prompt, THEN THE Habit_Manager SHALL take no action and the Habit SHALL remain unchanged.

---

### Requirement 7: Data Isolation and Security

**User Story:** As a User, I want my habits and check-ins to be private, so that no other user can view or modify my data.

#### Acceptance Criteria

1. THE Habit_Store SHALL enforce row-level security policies ensuring a User can only read, create, and delete their own Habit records.
2. THE Habit_Store SHALL enforce row-level security policies ensuring a User can only read, create, and delete their own Check-in records.
3. IF an authenticated User attempts to access or modify a Habit or Check-in belonging to another User, THEN THE Habit_Store SHALL reject the operation and return an authorization error.
4. THE Auth_System SHALL use Supabase's built-in JWT-based session tokens for all authenticated API requests to the Habit_Store.
