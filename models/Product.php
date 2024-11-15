<?php
class Product {
    private $db;

    public function __construct() {
        $this->db = getConnection();
    }

    public function getAll() {
        $result = $this->db->query("
            SELECT p.*, 
                   c.name as customer_name
            FROM products p
            LEFT JOIN customers c ON p.customer_id = c.id
            ORDER BY p.created_at DESC
        ");
        
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        return $products;
    }

    public function getById($id) {
        $stmt = $this->db->prepare("
            SELECT p.*, c.name as customer_name
            FROM products p
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE p.id = ?
        ");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO products (
                id, code, product, cost_price, sale_price,
                profit, customer_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $id = generateUUID();
        $profit = $data['sale_price'] - $data['cost_price'];
        $createdAt = $data['created_at'] ?? date('Y-m-d H:i:s');
        
        $stmt->bind_param("sssdddss",
            $id,
            strtoupper($data['code']),
            $data['product'],
            $data['cost_price'],
            $data['sale_price'],
            $profit,
            $data['customer_id'],
            $createdAt
        );
        
        return $stmt->execute() ? $id : false;
    }

    public function update($id, $data) {
        $stmt = $this->db->prepare("
            UPDATE products SET
                code = ?,
                product = ?,
                cost_price = ?,
                sale_price = ?,
                profit = ?,
                modified_at = NOW()
            WHERE id = ?
        ");
        
        $profit = $data['sale_price'] - $data['cost_price'];
        
        $stmt->bind_param("ssddds",
            strtoupper($data['code']),
            $data['product'],
            $data['cost_price'],
            $data['sale_price'],
            $profit,
            $id
        );
        
        return $stmt->execute();
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param("s", $id);
        return $stmt->execute();
    }

    public function getByCustomerId($customerId) {
        $stmt = $this->db->prepare("
            SELECT * FROM products 
            WHERE customer_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->bind_param("s", $customerId);
        $stmt->execute();
        
        $products = [];
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        return $products;
    }
}