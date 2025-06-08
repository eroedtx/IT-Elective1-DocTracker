<?php
require_once 'db.php';

header('Content-Type: application/json');

$db = Database::getInstance();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'create_document':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $data['doc_id'] = 'DOC-' . strtoupper(base_convert(time(), 10, 36));
            
            if ($db->createDocument($data)) {
                echo json_encode(['success' => true, 'doc_id' => $data['doc_id']]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to create document']);
            }
        }
        break;

    case 'get_documents':
        $filters = [
            'search' => $_GET['search'] ?? '',
            'department' => $_GET['department'] ?? 'all',
            'type' => $_GET['type'] ?? 'all',
            'status' => $_GET['status'] ?? 'all'
        ];
        
        $documents = $db->getDocuments($filters);
        echo json_encode(['success' => true, 'documents' => $documents]);
        break;

    case 'get_document':
        $doc_id = $_GET['doc_id'] ?? '';
        if ($doc_id) {
            $document = $db->getDocument($doc_id);
            if ($document) {
                echo json_encode(['success' => true, 'document' => $document]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Document not found']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Document ID required']);
        }
        break;

    case 'update_status':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['doc_id']) && isset($data['status'])) {
                if ($db->updateDocumentStatus($data['doc_id'], $data['status'])) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Failed to update status']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Document ID and status required']);
            }
        }
        break;

    case 'get_template':
        $type = $_GET['type'] ?? '';
        if ($type) {
            $template = $db->getTemplate($type);
            if ($template) {
                echo json_encode(['success' => true, 'template' => $template]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Template not found']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Document type required']);
        }
        break;

    case 'get_document_types':
        $types = $db->getDocumentTypes();
        echo json_encode(['success' => true, 'types' => $types]);
        break;

    case 'get_departments':
        $departments = $db->getDepartments();
        echo json_encode(['success' => true, 'departments' => $departments]);
        break;

    case 'get_status_types':
        $statuses = $db->getStatusTypes();
        echo json_encode(['success' => true, 'statuses' => $statuses]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}
?> 