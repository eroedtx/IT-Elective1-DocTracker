// Global variables
let currentDocumentId = null;

// Global variable to store original template contents
const originalTemplateContents = {};

// Generate a unique document ID
function generateDocId() {
    return 'DOC-' + Date.now().toString(36).toUpperCase();
}

// API Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        let url = `api.php?action=${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (method === 'GET' && data) {
            const queryParams = new URLSearchParams(data).toString();
            url = `${url}&${queryParams}`;
        } else if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'API call failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        showStatusMessage(error.message, 'error');
        throw error;
    }
}

// Submit document form
const documentForm = document.getElementById('documentForm');
if (documentForm) {
    documentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = {};
        
        // Get all form fields
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Get template-specific fields
        const documentType = data.documentType;
        const templateFields = document.querySelector(`.template-fields.${documentType}-fields`);
        if (templateFields) {
            const inputs = templateFields.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                data[input.name] = input.value;
                // Store the text content for select elements
                if (input.tagName === 'SELECT') {
                    data[input.name + 'Name'] = input.options[input.selectedIndex].textContent;
                }
            });
        }
        
        try {
            const result = await apiCall('create_document', 'POST', data);
        showStatusMessage('Document submitted successfully!', 'success');
        this.reset();
        
        // Hide template fields
        document.querySelectorAll('.template-fields').forEach(field => {
            field.style.display = 'none';
        });
        } catch (error) {
            showStatusMessage('Failed to submit document. Please try again.', 'error');
        }
    });
}

// Update documents table
async function updateDocumentsTable() {
    const tableBody = document.getElementById('documentsTableBody');
    if (!tableBody) return;
    
    try {
    const searchInput = document.getElementById('searchInput');
    const departmentFilter = document.getElementById('departmentFilter');
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');
    
        const filters = {
            search: searchInput ? searchInput.value : '',
            department: departmentFilter ? departmentFilter.value : 'all',
            type: typeFilter ? typeFilter.value : 'all',
            status: statusFilter ? statusFilter.value : 'all'
        };

        const result = await apiCall('get_documents', 'GET', filters);
        const documents = result.documents;
    
    tableBody.innerHTML = '';
    
        if (documents.length === 0) {
        document.getElementById('noResults').style.display = 'block';
        return;
    }
    
    document.getElementById('noResults').style.display = 'none';
    
        documents.forEach(doc => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doc.doc_id}</td>
            <td>${doc.title}</td>
                <td>${doc.dept_name}</td>
                <td>${doc.type_name}</td>
                <td><span class="status-badge ${doc.status_code}">${doc.status_name}</span></td>
            <td>${new Date(doc.date_submitted).toLocaleDateString()}</td>
            <td>
                <button onclick="viewDocument('${doc.doc_id}')" class="view-btn">View</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    } catch (error) {
        console.error('Error updating table:', error);
        showStatusMessage('Failed to load documents. Please refresh the page.', 'error');
    }
}

// View document details
async function viewDocument(docId) {
    try {
        const result = await apiCall(`get_document&doc_id=${docId}`);
        const doc = result.document;
        currentDocumentId = docId;
    
    // Update modal content
        document.getElementById('modalTitle').textContent = doc.title;
        document.getElementById('modalId').textContent = doc.doc_id;
        document.getElementById('modalDepartment').textContent = doc.dept_name;
        document.getElementById('modalType').textContent = doc.type_name;
        document.getElementById('modalStatus').textContent = doc.status_name;
        document.getElementById('modalDate').textContent = new Date(doc.date_submitted).toLocaleDateString();
    
    const templateHeaderDiv = document.getElementById('templateHeader');
    const templateContentDiv = document.getElementById('templateContent');
    
    // Clear previous content
    templateHeaderDiv.innerHTML = '';
    templateContentDiv.innerHTML = '';

        const contentData = JSON.parse(doc.content);
        const docType = doc.type_code;

    let headerHtml = '';
    let mainContent = '';

    switch (docType) {
        case 'contract':
            headerHtml = `
                <h2>${contentData.title || '[CONTRACT TITLE]'}</h2>
                    <p>This agreement is made on <span>${new Date(doc.date_submitted).toLocaleDateString()}</span> between:</p>
                <p><strong>Party A:</strong> <span>${contentData.parties ? contentData.parties.split(' and ')[0] : '[PARTY A NAME]'}</span></p>
                <p><strong>Party B:</strong> <span>${contentData.parties ? contentData.parties.split(' and ')[1] : '[PARTY B NAME]'}</span></p>
            `;
                mainContent = contentData.contractContent || '';
            break;
        case 'report':
            headerHtml = `
                <h2>${contentData.title || '[REPORT TITLE]'}</h2>
                <p>Report Period: <span>${contentData.reportPeriodName || '[PERIOD]'}</span></p>
                <p>Date: <span>${contentData.reportDate || '[DATE]'}</span></p>
                <p>Category: <span>${contentData.reportCategoryName || '[CATEGORY]'}</span></p>
            `;
                mainContent = contentData.reportContent || '';
            break;
        case 'proposal':
            headerHtml = `
                <h2>${contentData.title || '[PROPOSAL TITLE]'}</h2>
                <p>Type: <span>${contentData.proposalTypeName || '[PROPOSAL TYPE]'}</span></p>
                <p>Budget: <span>${contentData.budget ? `$${contentData.budget}` : '[BUDGET]'}</span></p>
                <p>Timeline: <span>${contentData.timeline || '[TIMELINE]'}</span></p>
            `;
                mainContent = contentData.proposalContent || '';
            break;
        case 'policy':
            headerHtml = `
                <h2>${contentData.title || '[POLICY TITLE]'}</h2>
                <p>Version: <span>${contentData.policyVersion || '[VERSION]'}</span></p>
                    <p>Effective Date: <span>${new Date(doc.date_submitted).toLocaleDateString()}</span></p>
                <p>Next Review: <span>${contentData.reviewDate || '[REVIEW DATE]'}</span></p>
            `;
                mainContent = contentData.policyContent || '';
            break;
        default:
            headerHtml = '';
            mainContent = 'No template content available.';
            break;
    }

    templateHeaderDiv.innerHTML = headerHtml;
    templateContentDiv.textContent = mainContent; 

        // Set current status in select
        const statusSelect = document.getElementById('statusSelect');
        if (statusSelect) {
            statusSelect.value = doc.status_code;
        }

    // Show modal
    const modal = document.getElementById('documentModal');
    modal.style.display = 'block';
    } catch (error) {
        console.error('Error viewing document:', error);
        showStatusMessage('Failed to load document details. Please try again.', 'error');
    }
}

// Update document status
async function updateDocumentStatus() {
    if (!currentDocumentId) return;

    const statusSelect = document.getElementById('statusSelect');
    if (!statusSelect) return;

    try {
        await apiCall('update_status', 'POST', {
            doc_id: currentDocumentId,
            status: statusSelect.value
        });

        showStatusMessage('Status updated successfully!', 'success');
        updateDocumentsTable();
    } catch (error) {
        console.error('Error updating status:', error);
        showStatusMessage('Failed to update status. Please try again.', 'error');
    }
}

// Show status message
function showStatusMessage(message, type = 'success') {
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    }
}

// Document type change handler
const documentTypeSelect = document.getElementById('documentType');
if (documentTypeSelect) {
    documentTypeSelect.addEventListener('change', async function() {
        const selectedType = this.value;
        
        // Hide all template fields
        document.querySelectorAll('.template-fields').forEach(field => {
            field.style.display = 'none';
        });
        
        // Show selected template fields
        if (selectedType) {
            try {
                const result = await apiCall(`get_template&type=${selectedType}`);
                const template = result.template;
                
            const selectedFields = document.querySelector(`.template-fields.${selectedType}-fields`);
            if (selectedFields) {
                selectedFields.style.display = 'block';
                    const contentTextarea = selectedFields.querySelector('.template-content');
                    if (contentTextarea && template) {
                        contentTextarea.value = template.template_content;
                    }
                }
            } catch (error) {
                console.error('Error loading template:', error);
                showStatusMessage('Failed to load template. Please try again.', 'error');
            }
        }
    });
}

// Event Listeners for Search and Filters
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const departmentFilter = document.getElementById('departmentFilter');
const typeFilter = document.getElementById('typeFilter');

if (searchBtn) {
    searchBtn.addEventListener('click', updateDocumentsTable);
}

if (searchInput) {
    searchInput.addEventListener('input', updateDocumentsTable);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            updateDocumentsTable();
        }
    });
}

if (statusFilter) {
    statusFilter.addEventListener('change', updateDocumentsTable);
}

if (departmentFilter) {
    departmentFilter.addEventListener('change', updateDocumentsTable);
}

if (typeFilter) {
    typeFilter.addEventListener('change', updateDocumentsTable);
}

// Initialize table if on tracking page
const documentsTableBody = document.getElementById('documentsTableBody');
if (documentsTableBody) {
    updateDocumentsTable();
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('documentModal');
    if (e.target === modal) {
        modal.style.display = 'none';
        currentDocumentId = null;
    }
});

// Close modal button
const closeModal = document.querySelector('.close-modal');
if (closeModal) {
    closeModal.addEventListener('click', () => {
        const modal = document.getElementById('documentModal');
        modal.style.display = 'none';
        currentDocumentId = null;
    });
}

// Function to update Contract template placeholders
function updateContractTemplate() {
    const titleInput = document.getElementById('title');
    const effectiveDateInput = document.getElementById('effectiveDate');
    const expiryDateInput = document.getElementById('expiryDate');
    const partiesInput = document.getElementById('parties');
    
    const contractTitleDisplay = document.getElementById('contractTitle');
    const contractDateDisplay = document.getElementById('contractDate');
    const partyADisplay = document.getElementById('partyA');
    const partyBDisplay = document.getElementById('partyB');
    const contractContentTextarea = document.querySelector('.contract-fields #contractContent');

    if (contractTitleDisplay) contractTitleDisplay.textContent = titleInput.value || '[CONTRACT TITLE]';
    if (contractDateDisplay) contractDateDisplay.textContent = new Date().toLocaleDateString() || '[DATE]';

    if (partiesInput && partyADisplay && partyBDisplay) {
        const partiesValue = partiesInput.value.split(' and ');
        partyADisplay.textContent = partiesValue[0] || '[PARTY A NAME]';
        partyBDisplay.textContent = partiesValue[1] || '[PARTY B NAME]';
    }

    if (contractContentTextarea) {
        // Read the current content of the textarea to preserve user's edits
        let content = contractContentTextarea.value;
        
        // Define placeholders and their corresponding values
        const placeholders = {
            '[CONTRACT TITLE]': titleInput.value || '[CONTRACT TITLE]',
            '[EFFECTIVE DATE]': effectiveDateInput.value || '[EFFECTIVE DATE]',
            '[EXPIRY DATE]': expiryDateInput.value || '[EXPIRY DATE]',
            '[DATE]': new Date().toLocaleDateString() || '[DATE]' // For contractDateDisplay
        };

        const partiesValue = partiesInput.value.split(' and ');
        placeholders['[PARTY A NAME]'] = partiesValue[0] || '[PARTY A NAME]';
        placeholders['[PARTY B NAME]'] = partiesValue[1] || '[PARTY B NAME]';

        // Replace all occurrences of each placeholder
        for (const placeholder in placeholders) {
            content = content.replace(new RegExp(placeholder.replace(/[\[\]]/g, '\\$&'), 'g'), placeholders[placeholder]);
        }

        contractContentTextarea.value = content;
    }
}

// Function to update Report template placeholders
function updateReportTemplate() {
    const titleInput = document.getElementById('title');
    const reportPeriodSelect = document.getElementById('reportPeriod');
    const reportDateInput = document.getElementById('reportDate');
    const reportCategorySelect = document.getElementById('reportCategory');

    const reportTitleDisplay = document.getElementById('reportTitle');
    const periodDisplay = document.getElementById('periodDisplay');
    const dateDisplay = document.getElementById('dateDisplay');
    const categoryDisplay = document.getElementById('categoryDisplay');
    const reportContentTextarea = document.querySelector('.report-fields #reportContent');

    if (reportTitleDisplay) reportTitleDisplay.textContent = titleInput.value || '[REPORT TITLE]';
    if (periodDisplay) periodDisplay.textContent = reportPeriodSelect.value ? reportPeriodSelect.options[reportPeriodSelect.selectedIndex].text : '[PERIOD]';
    if (dateDisplay) dateDisplay.textContent = reportDateInput.value || '[DATE]';
    if (categoryDisplay) categoryDisplay.textContent = reportCategorySelect.value ? reportCategorySelect.options[reportCategorySelect.selectedIndex].text : '[CATEGORY]';

    if (reportContentTextarea) {
        // Read the current content of the textarea to preserve user's edits
        let content = reportContentTextarea.value;

        const placeholders = {
            '[REPORT TITLE]': titleInput.value || '[REPORT TITLE]',
            '[PERIOD]': reportPeriodSelect.value ? reportPeriodSelect.options[reportPeriodSelect.selectedIndex].text : '[PERIOD]',
            '[DATE]': reportDateInput.value || '[DATE]',
            '[CATEGORY]': reportCategorySelect.value ? reportCategorySelect.options[reportCategorySelect.selectedIndex].text : '[CATEGORY]'
        };

        for (const placeholder in placeholders) {
            content = content.replace(new RegExp(placeholder.replace(/[\[\]]/g, '\\$&'), 'g'), placeholders[placeholder]);
        }

        reportContentTextarea.value = content;
    }
}

// Function to update Proposal template placeholders
function updateProposalTemplate() {
    const titleInput = document.getElementById('title');
    const proposalTypeSelect = document.getElementById('proposalType');
    const budgetInput = document.getElementById('budget');
    const timelineInput = document.getElementById('timeline');

    const proposalTitleDisplay = document.getElementById('proposalTitle');
    const typeDisplay = document.getElementById('typeDisplay');
    const budgetDisplay = document.getElementById('budgetDisplay');
    const timelineDisplay = document.getElementById('timelineDisplay');
    const proposalContentTextarea = document.querySelector('.proposal-fields #proposalContent');

    if (proposalTitleDisplay) proposalTitleDisplay.textContent = titleInput.value || '[PROPOSAL TITLE]';
    if (typeDisplay) typeDisplay.textContent = proposalTypeSelect.value ? proposalTypeSelect.options[proposalTypeSelect.selectedIndex].text : '[PROPOSAL TYPE]';
    if (budgetDisplay) budgetDisplay.textContent = budgetInput.value ? `$${budgetInput.value}` : '[BUDGET]';
    if (timelineDisplay) timelineDisplay.textContent = timelineInput.value || '[TIMELINE]';

    if (proposalContentTextarea) {
        // Read the current content of the textarea to preserve user's edits
        let content = proposalContentTextarea.value;

        const placeholders = {
            '[PROPOSAL TITLE]': titleInput.value || '[PROPOSAL TITLE]',
            '[PROPOSAL TYPE]': proposalTypeSelect.value ? proposalTypeSelect.options[proposalTypeSelect.selectedIndex].text : '[PROPOSAL TYPE]',
            '[BUDGET]': budgetInput.value ? `$${budgetInput.value}` : '[BUDGET]',
            '[TIMELINE]': timelineInput.value || '[TIMELINE]'
        };

        for (const placeholder in placeholders) {
            content = content.replace(new RegExp(placeholder.replace(/[\[\]]/g, '\\$&'), 'g'), placeholders[placeholder]);
        }

        proposalContentTextarea.value = content;
    }
}

// Function to update Policy template placeholders
function updatePolicyTemplate() {
    const titleInput = document.getElementById('title');
    const policyTypeSelect = document.getElementById('policyType');
    const policyVersionInput = document.getElementById('policyVersion');
    const reviewDateInput = document.getElementById('reviewDate');

    const policyTitleDisplay = document.getElementById('policyTitle');
    const versionDisplay = document.getElementById('versionDisplay');
    const effectiveDisplay = document.getElementById('effectiveDisplay'); // Assuming effective date is current date
    const reviewDisplay = document.getElementById('reviewDisplay');
    const policyContentTextarea = document.querySelector('.policy-fields #policyContent');

    if (policyTitleDisplay) policyTitleDisplay.textContent = titleInput.value || '[POLICY TITLE]';
    if (versionDisplay) versionDisplay.textContent = policyVersionInput.value || '[VERSION]';
    if (effectiveDisplay) effectiveDisplay.textContent = new Date().toLocaleDateString() || '[EFFECTIVE DATE]';
    if (reviewDisplay) reviewDisplay.textContent = reviewDateInput.value || '[REVIEW DATE]';

    if (policyContentTextarea) {
        // Read the current content of the textarea to preserve user's edits
        let content = policyContentTextarea.value;

        const placeholders = {
            '[POLICY TITLE]': titleInput.value || '[POLICY TITLE]',
            '[VERSION]': policyVersionInput.value || '[VERSION]',
            '[EFFECTIVE DATE]': new Date().toLocaleDateString() || '[EFFECTIVE DATE]',
            '[REVIEW DATE]': reviewDateInput.value || '[REVIEW DATE]'
        };

        for (const placeholder in placeholders) {
            content = content.replace(new RegExp(placeholder.replace(/[\[\]]/g, '\\$&'), 'g'), placeholders[placeholder]);
        }

        policyContentTextarea.value = content;
    }
}

// Master function to update all template fields based on selected document type
function updateTemplateFields() {
    const documentType = document.getElementById('documentType').value;
    switch (documentType) {
        case 'contract':
            updateContractTemplate();
            break;
        case 'report':
            updateReportTemplate();
            break;
        case 'proposal':
            updateProposalTemplate();
            break;
        case 'policy':
            updatePolicyTemplate();
            break;
        default:
            // Clear or hide all template specific displays if no type is selected
            break;
    }
}

// Add event listeners to input fields to trigger template updates
document.addEventListener('DOMContentLoaded', () => {
    // Original template contents are no longer strictly needed for dynamic updating
    // but keeping the `originalTemplateContents` variable and its population might be useful
    // if you want to reset the template to its pristine state at some point.
    document.querySelectorAll('.template-fields .template-content').forEach(textarea => {
        const type = textarea.id.replace('Content', '');
        originalTemplateContents[type] = textarea.value;
    });

    const titleInput = document.getElementById('title');
    const documentTypeSelect = document.getElementById('documentType');

    if (titleInput) {
        titleInput.addEventListener('input', updateTemplateFields);
    }

    if (documentTypeSelect) {
        documentTypeSelect.addEventListener('change', function() {
            const selectedType = this.value;
            // Hide all template fields
            document.querySelectorAll('.template-fields').forEach(field => {
                field.style.display = 'none';
            });
            // Show selected template fields
            if (selectedType) {
                const selectedFields = document.querySelector(`.template-fields.${selectedType}-fields`);
                if (selectedFields) {
                    selectedFields.style.display = 'block';
                    // When changing document type, we should re-initialize the textarea with original content
                    // before applying current input values, to ensure all placeholders are present for modification.
                    const currentTemplateTextarea = selectedFields.querySelector('.template-content');
                    if (currentTemplateTextarea && originalTemplateContents[selectedType]) {
                        currentTemplateTextarea.value = originalTemplateContents[selectedType];
                    }
                    updateTemplateFields(); // Update fields when template visibility changes
                }
            }
        });
    }

    // Add event listeners for specific template input fields
    // Contract Fields
    const contractTypeSelect = document.getElementById('contractType');
    const partiesInput = document.getElementById('parties');
    const effectiveDateInput = document.getElementById('effectiveDate');
    const expiryDateInput = document.getElementById('expiryDate');
    const contractContentTextarea = document.querySelector('.contract-fields #contractContent');

    if (contractTypeSelect) contractTypeSelect.addEventListener('change', updateContractTemplate);
    if (partiesInput) partiesInput.addEventListener('input', updateContractTemplate);
    if (effectiveDateInput) effectiveDateInput.addEventListener('change', updateContractTemplate);
    if (expiryDateInput) expiryDateInput.addEventListener('change', updateContractTemplate);
    // The main content textarea itself should also trigger updates if the user manually changes it
    // This is important to ensure that if the user deletes a placeholder, it doesn't reappear on other field changes
    if (contractContentTextarea) contractContentTextarea.addEventListener('input', updateContractTemplate);

    // Report Fields
    const reportPeriodSelect = document.getElementById('reportPeriod');
    const reportDateInput = document.getElementById('reportDate');
    const reportCategorySelect = document.getElementById('reportCategory');
    const reportContentTextarea = document.querySelector('.report-fields #reportContent');

    if (reportPeriodSelect) reportPeriodSelect.addEventListener('change', updateReportTemplate);
    if (reportDateInput) reportDateInput.addEventListener('change', updateReportTemplate);
    if (reportCategorySelect) reportCategorySelect.addEventListener('change', updateReportTemplate);
    if (reportContentTextarea) reportContentTextarea.addEventListener('input', updateReportTemplate);

    // Proposal Fields
    const proposalTypeSelect = document.getElementById('proposalType');
    const budgetInput = document.getElementById('budget');
    const timelineInput = document.getElementById('timeline');
    const proposalContentTextarea = document.querySelector('.proposal-fields #proposalContent');

    if (proposalTypeSelect) proposalTypeSelect.addEventListener('change', updateProposalTemplate);
    if (budgetInput) budgetInput.addEventListener('input', updateProposalTemplate);
    if (timelineInput) timelineInput.addEventListener('input', updateProposalTemplate);
    if (proposalContentTextarea) proposalContentTextarea.addEventListener('input', updateProposalTemplate);

    // Policy Fields
    const policyTypeSelect = document.getElementById('policyType');
    const policyVersionInput = document.getElementById('policyVersion');
    const reviewDateInput = document.getElementById('reviewDate');
    const policyContentTextarea = document.querySelector('.policy-fields #policyContent');

    if (policyTypeSelect) policyTypeSelect.addEventListener('change', updatePolicyTemplate);
    if (policyVersionInput) policyVersionInput.addEventListener('input', updatePolicyTemplate);
    if (reviewDateInput) reviewDateInput.addEventListener('change', updatePolicyTemplate);
    if (policyContentTextarea) policyContentTextarea.addEventListener('input', updatePolicyTemplate);

    // Initial update in case a document type is pre-selected or to set initial placeholders
    updateTemplateFields();
}); 