<?php
require_once 'config.php';

class Database {
    private $conn;
    private static $instance = null;

    private function __construct() {
        try {
            $this->conn = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
                DB_USER,
                DB_PASS,
                array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'")
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            echo "Connection failed: " . $e->getMessage();
            exit;
        }
    }

    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }

    // Document Operations
    public function createDocument($data) {
        try {
            $sql = "INSERT INTO documents (doc_id, title, department_id, document_type_id, status_id, content) 
                    VALUES (:doc_id, :title, :department_id, :document_type_id, :status_id, :content)";
            
            $stmt = $this->conn->prepare($sql);
            
            // Get department_id
            $deptStmt = $this->conn->prepare("SELECT dept_id FROM departments WHERE dept_code = :dept_code");
            $deptStmt->execute(['dept_code' => $data['department']]);
            $department_id = $deptStmt->fetchColumn();

            // Get document_type_id
            $typeStmt = $this->conn->prepare("SELECT type_id FROM document_types WHERE type_code = :type_code");
            $typeStmt->execute(['type_code' => $data['documentType']]);
            $document_type_id = $typeStmt->fetchColumn();

            // Get status_id (default to pending)
            $statusStmt = $this->conn->prepare("SELECT status_id FROM status_types WHERE status_code = 'pending'");
            $statusStmt->execute();
            $status_id = $statusStmt->fetchColumn();

            $stmt->execute([
                'doc_id' => $data['doc_id'],
                'title' => $data['title'],
                'department_id' => $department_id,
                'document_type_id' => $document_type_id,
                'status_id' => $status_id,
                'content' => json_encode($data)
            ]);

            return true;
        } catch(PDOException $e) {
            error_log("Error creating document: " . $e->getMessage());
            return false;
        }
    }

    public function getDocuments($filters = []) {
        try {
            $sql = "SELECT d.*, 
                    dept.dept_name, dept.dept_code,
                    dt.type_name, dt.type_code,
                    s.status_name, s.status_code
                    FROM documents d
                    JOIN departments dept ON d.department_id = dept.dept_id
                    JOIN document_types dt ON d.document_type_id = dt.type_id
                    JOIN status_types s ON d.status_id = s.status_id
                    WHERE 1=1";
            
            $params = [];

            if (!empty($filters['search'])) {
                $sql .= " AND (d.title LIKE :search OR d.doc_id LIKE :search OR dept.dept_name LIKE :search)";
                $params['search'] = "%{$filters['search']}%";
            }

            if (!empty($filters['department']) && $filters['department'] !== 'all') {
                $sql .= " AND dept.dept_code = :department";
                $params['department'] = $filters['department'];
            }

            if (!empty($filters['type']) && $filters['type'] !== 'all') {
                $sql .= " AND dt.type_code = :type";
                $params['type'] = $filters['type'];
            }

            if (!empty($filters['status']) && $filters['status'] !== 'all') {
                $sql .= " AND s.status_code = :status";
                $params['status'] = $filters['status'];
            }

            $sql .= " ORDER BY d.date_submitted DESC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Error getting documents: " . $e->getMessage());
            return [];
        }
    }

    public function getDocument($doc_id) {
        try {
            $sql = "SELECT d.*, 
                    dept.dept_name, dept.dept_code,
                    dt.type_name, dt.type_code,
                    s.status_name, s.status_code
                    FROM documents d
                    JOIN departments dept ON d.department_id = dept.dept_id
                    JOIN document_types dt ON d.document_type_id = dt.type_id
                    JOIN status_types s ON d.status_id = s.status_id
                    WHERE d.doc_id = :doc_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute(['doc_id' => $doc_id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Error getting document: " . $e->getMessage());
            return null;
        }
    }

    public function updateDocumentStatus($doc_id, $status_code) {
        try {
            $sql = "UPDATE documents d
                    JOIN status_types s ON s.status_code = :status_code
                    SET d.status_id = s.status_id
                    WHERE d.doc_id = :doc_id";
            
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([
                'doc_id' => $doc_id,
                'status_code' => $status_code
            ]);
        } catch(PDOException $e) {
            error_log("Error updating document status: " . $e->getMessage());
            return false;
        }
    }

    // Template Operations
    public function getTemplate($document_type) {
        try {
            $sql = "SELECT t.* 
                    FROM templates t
                    JOIN document_types dt ON t.document_type_id = dt.type_id
                    WHERE dt.type_code = :type_code";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute(['type_code' => $document_type]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Error getting template: " . $e->getMessage());
            return null;
        }
    }

    // Get all document types
    public function getDocumentTypes() {
        try {
            $stmt = $this->conn->query("SELECT * FROM document_types");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Error getting document types: " . $e->getMessage());
            return [];
        }
    }

    // Get all departments
    public function getDepartments() {
        try {
            $stmt = $this->conn->query("SELECT * FROM departments");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Error getting departments: " . $e->getMessage());
            return [];
        }
    }

    // Get all status types
    public function getStatusTypes() {
        try {
            $stmt = $this->conn->query("SELECT * FROM status_types");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Error getting status types: " . $e->getMessage());
            return [];
        }
    }
}
?> 