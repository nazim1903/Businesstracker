<?php
class Payment {
    private $db;

    public function __construct() {
        $this->db = getConnection();
    }

    public function getAll() {
        $stmt = $this->db->query("
            SELECT p.*, 
                   c.name as customer_name,
                   o.product_name as order_product
            FROM payments p
            LEFT JOIN customers c ON p.customer_id = c.id
            LEFT JOIN orders o ON p.order_id = o.id
            ORDER BY p.date DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $stmt = $this->db->prepare("
            SELECT p.*, 
                   c.name as customer_name,
                   o.product_name as order_product
            FROM payments p
            LEFT JOIN customers c ON p.customer_id = c.id
            LEFT JOIN orders o ON p.order_id = o.id
            WHERE p.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        try {
            $this->db->beginTransaction();

            $id = generateUUID();
            $stmt = $this->db->prepare("
                INSERT INTO payments (
                    id, customer_id, amount, date, description,
                    type, status, order_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $id,
                $data['customer_id'],
                $data['amount'],
                $data['date'],
                $data['description'],
                $data['type'],
                $data['status'],
                $data['order_id'] ?? null
            ]);

            // If this is a completed payment for an order
            if ($data['order_id'] && $data['status'] === 'completed') {
                $orderStmt = $this->db->prepare("
                    SELECT * FROM orders WHERE id = ?
                ");
                $orderStmt->execute([$data['order_id']]);
                $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

                if ($order) {
                    // Create a new product entry for completed sale
                    $productStmt = $this->db->prepare("
                        INSERT INTO products (
                            id, code, product, cost_price, sale_price,
                            profit, customer_id, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ");

                    $costPrice = $data['cost_price'] ?? ($order['total_price'] * 0.7);
                    $profit = $order['total_price'] - $costPrice;

                    $productStmt->execute([
                        generateUUID(),
                        'SALE-' . $order['id'],
                        $order['product_name'],
                        $costPrice,
                        $order['total_price'],
                        $profit,
                        $order['customer_id'],
                        $order['created_at']
                    ]);

                    // Update order status
                    $updateOrderStmt = $this->db->prepare("
                        UPDATE orders 
                        SET status = 'completed',
                            deposit_transferred = true,
                            modified_at = NOW()
                        WHERE id = ?
                    ");
                    $updateOrderStmt->execute([$data['order_id']]);
                }
            }

            $this->db->commit();
            return $id;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function update($id, $data) {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                UPDATE payments SET
                    amount = ?,
                    date = ?,
                    description = ?,
                    type = ?,
                    status = ?
                WHERE id = ?
            ");
            
            $stmt->execute([
                $data['amount'],
                $data['date'],
                $data['description'],
                $data['type'],
                $data['status'],
                $id
            ]);

            // If status changed to completed and it's an order payment
            if ($data['status'] === 'completed') {
                $paymentStmt = $this->db->prepare("
                    SELECT order_id FROM payments WHERE id = ?
                ");
                $paymentStmt->execute([$id]);
                $payment = $paymentStmt->fetch(PDO::FETCH_ASSOC);

                if ($payment && $payment['order_id']) {
                    $orderStmt = $this->db->prepare("
                        UPDATE orders 
                        SET status = 'completed',
                            deposit_transferred = true,
                            modified_at = NOW()
                        WHERE id = ?
                    ");
                    $orderStmt->execute([$payment['order_id']]);
                }
            }

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function delete($id) {
        try {
            $this->db->beginTransaction();

            // Check if it's a deposit payment
            $stmt = $this->db->prepare("
                SELECT order_id, type FROM payments WHERE id = ?
            ");
            $stmt->execute([$id]);
            $payment = $stmt->fetch(PDO::FETCH_ASSOC);

            // Delete the payment
            $stmt = $this->db->prepare("DELETE FROM payments WHERE id = ?");
            $stmt->execute([$id]);

            // If it was a deposit payment, update the order
            if ($payment && $payment['type'] === 'deposit' && $payment['order_id']) {
                $orderStmt = $this->db->prepare("
                    UPDATE orders 
                    SET deposit = NULL,
                        deposit_transferred = false,
                        modified_at = NOW()
                    WHERE id = ?
                ");
                $orderStmt->execute([$payment['order_id']]);
            }

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getByOrderId($orderId) {
        $stmt = $this->db->prepare("
            SELECT p.*, c.name as customer_name
            FROM payments p
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE p.order_id = ?
            ORDER BY p.date DESC
        ");
        $stmt->execute([$orderId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByCustomerId($customerId) {
        $stmt = $this->db->prepare("
            SELECT p.*, o.product_name as order_product
            FROM payments p
            LEFT JOIN orders o ON p.order_id = o.id
            WHERE p.customer_id = ?
            ORDER BY p.date DESC
        ");
        $stmt->execute([$customerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getActiveDeposits() {
        $stmt = $this->db->query("
            SELECT p.*, 
                   o.product_name,
                   c.name as customer_name
            FROM payments p
            JOIN orders o ON p.order_id = o.id
            JOIN customers c ON p.customer_id = c.id
            WHERE p.type = 'deposit'
            AND p.status = 'completed'
            AND o.deposit_transferred = false
            ORDER BY p.date DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}