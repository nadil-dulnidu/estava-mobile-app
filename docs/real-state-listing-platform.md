3. Domain Explanation

The real estate domain focuses on buying, selling, or renting properties such as:

- houses
- apartments
- lands
- villas
- commercial buildings

In the traditional process, customers often need to physically visit locations, speak to multiple agents, and manually compare options. A real estate mobile application solves these issues by offering a centralized platform where users can:

- browse available properties
- search using filters
- check images and property details
- save preferred properties
- contact agents directly
- schedule visits
- leave reviews
- receive updates through notifications

This makes the property searching process faster, easier, and more user-friendly.

4. Main Actors in the System

4.1 Buyer / Renter

The buyer or renter uses the app to:

- search for properties
- view property details
- add favorites
- send inquiries
- book visits
- write reviews

4.2 Agent / Seller

The agent or seller uses the app to:

- add and manage properties
- respond to customer inquiries
- manage appointments
- maintain property information

4.3 Admin

The admin can supervise the platform by monitoring listings, reviews, inquiries, and overall system data.

Note: User management is considered a common module and is excluded from the 6 assigned member modules.

5. Overall System Objectives

The main objectives of the project are:

- to create a mobile platform for property listing and searching
- to allow users to view detailed property information
- to help users connect with property agents
- to provide convenient features such as favorites and visit booking
- to improve user experience through reviews and notifications
- to demonstrate full-stack mobile development with proper CRUD functionality

6. Proposed Main Modules

Since the group has 6 members, the system can be divided into the following 6 main CRUD modules:

1. Property Management
2. Favorites / Wishlist Management
3. Inquiry / Contact Management
4. Appointment / Visit Booking Management
5. Reviews & Ratings Management
6. Notification Management

7. Detailed Module Explanation

Module 1: Property Management

7.1 Module Overview

This is the core module of the application. It handles all operations related to property listings. It combines:

- property listing management
- property image/media handling
- property category and feature management

Instead of separating those into multiple modules, they are grouped into one complete Property Management module.

7.2 Purpose

The purpose of this module is to allow agents or admins to create and manage property records with complete details, images, categories, and features.

7.3 Main Functions

- add new properties
- upload property images
- assign categories and features
- view all listed properties
- edit property details
- remove properties

7.4 CRUD Features

Create

- add a new property listing
- upload one or more images
- assign property type and features

Read

- view all properties
- view a single property in detail
- view property images and features

Update

- update title, description, price, location, and features
- replace or add images
- change status such as available, sold, or rented

Delete

- delete a property listing
- remove property images or features if necessary

7.5 Example Data Fields

- propertyId
- title
- description
- price
- location
- propertyType
- bedrooms
- bathrooms
- landSize / floorArea
- features
- imageUrls
- listingStatus
- createdAt

7.6 Importance

This is the most important module because the platform is built around property data.

Module 2: Favorites / Wishlist Management

7.7 Module Overview

This module allows users to save properties they are interested in for later viewing.

7.8 Purpose

The purpose of this module is to help users keep track of preferred properties without needing to search again.

7.9 Main Functions

- save a property to favorites
- view saved properties
- remove saved items
- manage personal wishlist

7.10 CRUD Features

Create

- add a property to the user's favorites list

Read

- display all favorite properties of a user

Update

- optionally update personal note, tag, or priority for a saved property

Delete

- remove a property from favorites

7.11 Example Data Fields

- favoriteId
- userId
- propertyId
- savedDate
- note
- priorityLevel

7.12 Importance

This module improves user convenience and creates a better user experience.

Module 3: Inquiry / Contact Management

7.13 Module Overview

This module handles communication between users and agents regarding specific properties.

7.14 Purpose

Its purpose is to allow users to ask questions and request more information about listed properties.

7.15 Main Functions

- send inquiry messages
- view inquiry history
- respond to inquiries
- manage inquiry status

7.16 CRUD Features

Create

- send a new inquiry about a property

Read

- view all inquiries
- view inquiry details for a specific property or user

Update

- update inquiry message
- change inquiry status such as pending, replied, or closed

Delete

- delete an inquiry if necessary

7.17 Example Data Fields

- inquiryId
- propertyId
- senderUserId
- agentId
- subject
- message
- contactNumber
- inquiryStatus
- createdAt

7.18 Importance

This module is essential because users need a direct way to communicate with agents.

Module 4: Appointment / Visit Booking Management

7.19 Module Overview

This module allows users to book visits for properties they are interested in.

7.20 Purpose

The purpose is to make it easier for buyers or renters to schedule property visits through the mobile app.

7.21 Main Functions

- create booking requests
- view appointments
- reschedule visits
- cancel bookings

7.22 CRUD Features

Create

- create a new appointment or visit request

Read

- view all bookings
- view booking details for a user or agent

Update

- change visit date or time
- update appointment status such as pending, confirmed, completed, or cancelled

Delete

- cancel or remove an appointment

7.23 Example Data Fields

- appointmentId
- propertyId
- userId
- agentId
- date
- time
- visitPurpose
- appointmentStatus
- createdAt

7.24 Importance

This module gives the system a practical real-world feature beyond just browsing properties.

Module 5: Reviews & Ratings Management

7.25 Module Overview

This module allows users to provide feedback on properties or agents.

7.26 Purpose

Its purpose is to increase trust and help future users make better decisions.

7.27 Main Functions

- add ratings and reviews
- view reviews
- edit review content
- remove reviews

7.28 CRUD Features

Create

- submit a review and rating

Read

- display reviews for a property or agent
- calculate average rating

Update

- edit rating or review comment

Delete

- remove a review

7.29 Example Data Fields

- reviewId
- userId
- propertyId or agentId
- rating
- comment
- reviewDate

7.30 Importance

This module improves credibility and gives more value to the platform.

Module 6: Notification Management

7.31 Module Overview

This module handles system-generated alerts and messages for users.

7.32 Purpose

The purpose is to keep users informed about important actions and updates within the application.

7.33 Main Functions

- generate notifications
- display user notifications
- mark notifications as read
- delete notifications

7.34 CRUD Features

Create

- create a new notification when an important action happens

Read

- display all notifications for a user

Update

- mark notification as read or unread

Delete

- remove a notification

7.35 Example Data Fields

- notificationId
- userId
- title
- message
- type
- status
- createdAt

7.36 Importance

This module makes the application feel more complete and interactive.