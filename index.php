<?php
require_once 'db.php';
$db = Database::getInstance();

// Get departments and document types for the form
$departments = $db->getDepartments();
$documentTypes = $db->getDocumentTypes();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DocTracker - Document Insertion</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar">
        <div class="nav-brand">DocTracker</div>
        <div class="nav-links">
            <a href="index.php" class="active">Insert Document</a>
            <a href="tracking.php">Track Document</a>
        </div>
    </nav>

    <main class="container">
        <h1>Document Insertion</h1>
        
        <form id="documentForm" class="document-form">
            <div class="form-group">
                <label for="department">Department</label>
                <select id="department" name="department" required>
                    <option value="">Select Department</option>
                    <?php foreach ($departments as $dept): ?>
                        <option value="<?php echo htmlspecialchars($dept['dept_code']); ?>">
                            <?php echo htmlspecialchars($dept['dept_name']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="form-group">
                <label for="documentType">Document Type</label>
                <select id="documentType" name="documentType" required>
                    <option value="">Select Document Type</option>
                    <?php foreach ($documentTypes as $type): ?>
                        <option value="<?php echo htmlspecialchars($type['type_code']); ?>">
                            <?php echo htmlspecialchars($type['type_name']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="form-group">
                <label for="title">Document Title</label>
                <input type="text" id="title" name="title" required>
            </div>

            <!-- Dynamic Template Fields -->
            <div id="templateFields">
                <!-- Contract Template -->
                <div class="template-fields contract-fields" style="display: none;">
                    <div class="form-group">
                        <label for="contractType">Contract Type</label>
                        <select id="contractType" name="contractType">
                            <option value="service">Service Agreement</option>
                            <option value="employment">Employment Contract</option>
                            <option value="nda">Non-Disclosure Agreement</option>
                            <option value="vendor">Vendor Agreement</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="parties">Involved Parties</label>
                        <input type="text" id="parties" name="parties" placeholder="e.g., Company A and Company B">
                    </div>
                    <div class="form-group">
                        <label for="effectiveDate">Effective Date</label>
                        <input type="date" id="effectiveDate" name="effectiveDate">
                    </div>
                    <div class="form-group">
                        <label for="expiryDate">Expiry Date</label>
                        <input type="date" id="expiryDate" name="expiryDate">
                    </div>
                    <div class="form-group">
                        <label for="contractContent">Contract Content</label>
                        <div class="template-editor">
                            <div class="template-header">
                                <h2 id="contractTitle">[CONTRACT TITLE]</h2>
                                <p>This agreement is made on <span id="contractDate">[DATE]</span> between:</p>
                                <p><strong>Party A:</strong> <span id="partyA">[PARTY A NAME]</span></p>
                                <p><strong>Party B:</strong> <span id="partyB">[PARTY B NAME]</span></p>
                            </div>
                            <textarea id="contractContent" name="contractContent" rows="15" class="template-content"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Report Template -->
                <div class="template-fields report-fields" style="display: none;">
                    <div class="form-group">
                        <label for="reportPeriod">Report Period</label>
                        <select id="reportPeriod" name="reportPeriod">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annual">Annual</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="reportDate">Report Date</label>
                        <input type="date" id="reportDate" name="reportDate">
                    </div>
                    <div class="form-group">
                        <label for="reportCategory">Report Category</label>
                        <select id="reportCategory" name="reportCategory">
                            <option value="financial">Financial</option>
                            <option value="operational">Operational</option>
                            <option value="performance">Performance</option>
                            <option value="compliance">Compliance</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="reportContent">Report Content</label>
                        <div class="template-editor">
                            <div class="template-header">
                                <h2 id="reportTitle">[REPORT TITLE]</h2>
                                <p>Report Period: <span id="periodDisplay">[PERIOD]</span></p>
                                <p>Date: <span id="dateDisplay">[DATE]</span></p>
                                <p>Category: <span id="categoryDisplay">[CATEGORY]</span></p>
                            </div>
                            <textarea id="reportContent" name="reportContent" rows="15" class="template-content"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Proposal Template -->
                <div class="template-fields proposal-fields" style="display: none;">
                    <div class="form-group">
                        <label for="proposalType">Proposal Type</label>
                        <select id="proposalType" name="proposalType">
                            <option value="project">Project Proposal</option>
                            <option value="business">Business Proposal</option>
                            <option value="research">Research Proposal</option>
                            <option value="partnership">Partnership Proposal</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="budget">Proposed Budget</label>
                        <input type="number" id="budget" name="budget" placeholder="Enter amount">
                    </div>
                    <div class="form-group">
                        <label for="timeline">Proposed Timeline</label>
                        <input type="text" id="timeline" name="timeline" placeholder="e.g., 3 months, Q2 2025">
                    </div>
                    <div class="form-group">
                        <label for="proposalContent">Proposal Content</label>
                        <div class="template-editor">
                            <div class="template-header">
                                <h2 id="proposalTitle">[PROPOSAL TITLE]</h2>
                                <p>Type: <span id="typeDisplay">[PROPOSAL TYPE]</span></p>
                                <p>Budget: <span id="budgetDisplay">[BUDGET]</span></p>
                                <p>Timeline: <span id="timelineDisplay">[TIMELINE]</span></p>
                            </div>
                            <textarea id="proposalContent" name="proposalContent" rows="15" class="template-content"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Policy Template -->
                <div class="template-fields policy-fields" style="display: none;">
                    <div class="form-group">
                        <label for="policyType">Policy Type</label>
                        <select id="policyType" name="policyType">
                            <option value="hr">HR Policy</option>
                            <option value="security">Security Policy</option>
                            <option value="compliance">Compliance Policy</option>
                            <option value="operational">Operational Policy</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="policyVersion">Policy Version</label>
                        <input type="text" id="policyVersion" name="policyVersion" placeholder="e.g., 1.0, 2.1">
                    </div>
                    <div class="form-group">
                        <label for="reviewDate">Next Review Date</label>
                        <input type="date" id="reviewDate" name="reviewDate">
                    </div>
                    <div class="form-group">
                        <label for="policyContent">Policy Content</label>
                        <div class="template-editor">
                            <div class="template-header">
                                <h2 id="policyTitle">[POLICY TITLE]</h2>
                                <p>Version: <span id="versionDisplay">[VERSION]</span></p>
                                <p>Effective Date: <span id="effectiveDisplay">[EFFECTIVE DATE]</span></p>
                                <p>Next Review: <span id="reviewDisplay">[REVIEW DATE]</span></p>
                            </div>
                            <textarea id="policyContent" name="policyContent" rows="15" class="template-content"></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="description">Additional Notes</label>
                <textarea id="description" name="description" rows="3" placeholder="Add any additional notes or comments here"></textarea>
            </div>

            <button type="submit" class="submit-btn">Submit Document</button>
        </form>

        <div id="statusMessage" class="status-message"></div>
    </main>

    <footer class="footer">
        <p>&copy; <?php echo date('Y'); ?> DocTracker. All rights reserved.</p>
    </footer>

    <script src="script.js"></script>
</body>
</html> 