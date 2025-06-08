# DocTracker - IT Elective 1 Final Project

A simple, minimalist web application for tracking documents across different departments. This project demonstrates client-side interactivity with server-side data persistence using PHP and MySQL.

## Features

-   **Document Management**: Insert, track, and view documents.
-   **Departmental Templates**: Dynamically generated forms based on document type.
-   **Search & Filter**: Efficiently find documents by title, ID, department, type, or status.
-   **Status Tracking**: Documents can have statuses like Pending, In Review, Approved, Rejected.
-   **Responsive Design**: Optimized for both desktop and mobile devices.

## Pages

1.  **Document Insertion (`index.php`)**: Form for submitting new documents with dynamic templates.
2.  **Document Tracking (`tracking.php`)**: Dashboard to search, filter, and view document details.

## Technical Stack

-   **Frontend**: HTML5, CSS3, ES6+ JavaScript
-   **Backend**: PHP
-   **Database**: MySQL
-   **Data Persistence**: Server-side storage via MySQL.

## Cloud Integration

-   **Cloud Repository**: Hosted on [GitHub](https://github.com/eroedtx/IT-Elective1-DocTracker) for version control and collaboration.
-   **Cloud Deployment**: Planned for deployment on a cloud platform like AWS Lightsail (using a LAMP stack) for persistent web access and database hosting.

## Getting Started

### Prerequisites

-   A web server with PHP (e.g., Apache)
-   MySQL database
-   Composer (optional, for PHP dependency management if you expand)

### Local Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/eroedtx/IT-Elective1-DocTracker.git
    cd IT-Elective1-DocTracker
    ```
2.  **Database Setup**:
    *   Create a MySQL database named `doctracker_db`.
    *   Import the SQL schema and initial data (provided in a `database.sql` file, which you should create).
    *   Update `config.php` with your MySQL credentials (DB_USER, DB_PASS).
3.  **Server Configuration**: Place the project files in your web server's document root (e.g., `htdocs` for XAMPP).
4.  **Access**: Open `http://localhost/IT-Elective1-DocTracker/index.php` (adjust path as per your setup).

### Deployment (High-Level)

The project can be deployed to any hosting environment supporting PHP and MySQL, such as AWS Lightsail, DigitalOcean, or a shared hosting provider.

## Future Improvements

-   User authentication and authorization
-   Document version control
-   Advanced search capabilities
-   Document preview functionality directly in the browser
-   Export/Import features for documents

## License

MIT License - feel free to use this project for your own purposes.

## Contributors

-   Generoso, Merwin M.
-   Diaz, Lashawn Railey H.
-   Corales, Zedryl Hershey B.
