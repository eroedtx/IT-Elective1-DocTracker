<?php
require_once 'db.php';
$db = Database::getInstance();

// Get departments, document types, and status types for filters
$departments = $db->getDepartments();
$documentTypes = $db->getDocumentTypes();
$statusTypes = $db->getStatusTypes();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DocTracker - Document Tracking</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar">
        <div class="nav-brand">DocTracker</div>
        <div class="nav-links">
            <a href="index.php">Insert Document</a>
            <a href="tracking.php" class="active">Track Document</a>
        </div>
    </nav>

    <main class="container">
        <h1>Document Tracking</h1>

        <div class="search-section">
            <input type="text" id="searchInput" placeholder="Search by document title, ID, or department..." class="search-input">
            <button id="searchBtn" class="search-btn">Search</button>
        </div>

        <div class="filters">
            <select id="statusFilter" class="filter-select">
                <option value="all">All Status</option>
                <?php foreach ($statusTypes as $status): ?>
                    <option value="<?php echo htmlspecialchars($status['status_code']); ?>">
                        <?php echo htmlspecialchars($status['status_name']); ?>
                    </option>
                <?php endforeach; ?>
            </select>

            <select id="departmentFilter" class="filter-select">
                <option value="all">All Departments</option>
                <?php foreach ($departments as $dept): ?>
                    <option value="<?php echo htmlspecialchars($dept['dept_code']); ?>">
                        <?php echo htmlspecialchars($dept['dept_name']); ?>
                    </option>
                <?php endforeach; ?>
            </select>

            <select id="typeFilter" class="filter-select">
                <option value="all">All Types</option>
                <?php foreach ($documentTypes as $type): ?>
                    <option value="<?php echo htmlspecialchars($type['type_code']); ?>">
                        <?php echo htmlspecialchars($type['type_name']); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>

        <div class="documents-table-container">
            <table class="documents-table">
                <thead>
                    <tr>
                        <th>Document ID</th>
                        <th>Title</th>
                        <th>Department</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Date Submitted</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="documentsTableBody">
                    <!-- Table rows will be populated by JavaScript -->
                </tbody>
            </table>
        </div>

        <div id="noResults" class="no-results" style="display: none;">
            No documents found matching your criteria.
        </div>

        <!-- Document Preview Modal -->
        <div id="documentModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modalTitle"></h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="document-info">
                        <div class="info-group">
                            <label>Document ID:</label>
                            <span id="modalId"></span>
                        </div>
                        <div class="info-group">
                            <label>Department:</label>
                            <span id="modalDepartment"></span>
                        </div>
                        <div class="info-group">
                            <label>Type:</label>
                            <span id="modalType"></span>
                        </div>
                        <div class="info-group">
                            <label>Status:</label>
                            <span id="modalStatus"></span>
                        </div>
                        <div class="info-group">
                            <label>Date Submitted:</label>
                            <span id="modalDate"></span>
                        </div>
                    </div>
                    
                    <div class="template-preview">
                        <div id="templateHeader" class="template-header"></div>
                        <div id="templateContent" class="template-content"></div>
                    </div>

                    <div class="document-actions">
                        <select id="statusSelect" class="status-select">
                            <?php foreach ($statusTypes as $status): ?>
                                <option value="<?php echo htmlspecialchars($status['status_code']); ?>">
                                    <?php echo htmlspecialchars($status['status_name']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <button onclick="updateDocumentStatus()" class="action-btn">Update Status</button>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <footer class="footer">
        <p>&copy; <?php echo date('Y'); ?> DocTracker. All rights reserved.</p>
    </footer>

    <script src="script.js"></script>
</body>
</html> 