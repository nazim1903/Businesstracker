<?php
class Customer {
    private $db;

    public function __construct() {
        $this->db = getConnection();
    }

    public function getAll() {
        $result = $this->db->query("SELECT * FROM customers ORDER BY created_at DESC");
        $customers = [];
        while ($row = $result->fetch_assoc()) {
            $customers[] = $row;
        }
        return $customers;
    }

    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM customers WHERE id = ?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO customers (id, name, email, phone, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");
        
        $id = generateUUID();
        $stmt->bind_param("ssss", 
            $id,
            $data['name'],
            $data['email'],
            $data['phone']
        );
        
        return $stmt->execute();
    }

    public function update($id, $data) {
        $stmt = $this->db->prepare("
            UPDATE customers 
            SET name = ?, email = ?, phone = ?
            WHERE id = ?
        ");
        
        $stmt->bind_param("ssss",
            $data['name'],
            $data['email'],
            $data['phone'],
            $id
        );
        
        return $stmt->execute();
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM customers WHERE id = ?");
        $stmt->bind_param("s", $id);
        return $stmt->execute();
    }

    public function getCustomerReport($id) {
        // Get customer details
        $customer = $this->getById($id);
        if (!$customer) return null;

        // Get customer's products
        $stmt = $this->db->prepare("
            SELECT * FROM products 
            WHERE customer_id = ? 
            ORDER BY created_at DESC
        ");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }

        // Get customer's payments
        $stmt = $this->db->prepare("
            SELECT * FROM payments 
            WHERE customer_id = ? 
            ORDER BY date DESC
        ");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $payments = [];
        while ($row = $result->fetch_assoc()) {
            $payments[] = $row;
        }

        // Calculate totals
        $totalSales = array_sum(array_column($products, 'sale_price'));
        $totalPayments = array_sum(array_map(function($payment) {
            return $payment['type'] === 'incoming' ? $payment['amount'] : -$payment['amount'];
        }, $payments));

        return [
            'customer' => $customer,
            'products' => $products,
            'payments' => $payments,
            'totals' => [
                'sales' => $totalSales,
                'payments' => $totalPayments,
                'balance' => $totalSales - $totalPayments
            ]
        ];
    }
}