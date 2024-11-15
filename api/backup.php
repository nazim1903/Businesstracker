<?php
require_once '../config/config.php';
require_once '../models/Customer.php';
require_once '../models/Product.php';
require_once '../models/Payment.php';
require_once '../models/Order.php';

try {
    $action = $_GET['action'] ?? '';

    switch ($action) {
        case 'export':
            $customerModel = new Customer();
            $productModel = new Product();
            $paymentModel = new Payment();
            $orderModel = new Order();

            $data = [
                'customers' => $customerModel->getAll(),
                'products' => $productModel->getAll(),
                'payments' => $paymentModel->getAll(),
                'orders' => $orderModel->getAll(),
                'version' => '1.0.0'
            ];

            header('Content-Type: application/json');
            header('Content-Disposition: attachment; filename="business_manager_backup_' . date('Y-m-d') . '.json"');
            echo json_encode($data, JSON_PRETTY_PRINT);
            break;

        case 'import':
            if (!isset($_FILES['backup']) || $_FILES['backup']['error'] !== UPLOAD_ERROR_OK) {
                throw new Exception('No file uploaded or upload error');
            }

            $content = file_get_contents($_FILES['backup']['tmp_name']);
            $data = json_decode($content, true);

            if (!$data || !isset($data['version'])) {
                throw new Exception('Invalid backup file format');
            }

            $db = getConnection();
            $db->beginTransaction();

            try {
                // Clear existing data
                $db->exec('SET FOREIGN_KEY_CHECKS = 0');
                $db->exec('TRUNCATE TABLE customers');
                $db->exec('TRUNCATE TABLE products');
                $db->exec('TRUNCATE TABLE payments');
                $db->exec('TRUNCATE TABLE orders');
                $db->exec('TRUNCATE TABLE order_images');
                $db->exec('SET FOREIGN_KEY_CHECKS = 1');

                // Import data
                foreach ($data['customers'] as $customer) {
                    $stmt = $db->prepare('INSERT INTO customers (id, name, email, phone, created_at) VALUES (?, ?, ?, ?, ?)');
                    $stmt->execute([$customer['id'], $customer['name'], $customer['email'], $customer['phone'], $customer['created_at']]);
                }

                foreach ($data['products'] as $product) {
                    $stmt = $db->prepare('INSERT INTO products (id, code, product, cost_price, sale_price, profit, customer_id, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
                    $stmt->execute([
                        $product['id'], $product['code'], $product['product'],
                        $product['cost_price'], $product['sale_price'], $product['profit'],
                        $product['customer_id'], $product['created_at'], $product['modified_at']
                    ]);
                }

                foreach ($data['orders'] as $order) {
                    $stmt = $db->prepare('INSERT INTO orders (id, customer_id, product_name, details, gold_karat, diamond_carat, diamond_type, size, deposit, total_price, cost_price, status, deposit_transferred, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                    $stmt->execute([
                        $order['id'], $order['customer_id'], $order['product_name'],
                        $order['details'], $order['gold_karat'], $order['diamond_carat'],
                        $order['diamond_type'], $order['size'], $order['deposit'],
                        $order['total_price'], $order['cost_price'], $order['status'],
                        $order['deposit_transferred'], $order['created_at'], $order['modified_at']
                    ]);

                    if (!empty($order['images'])) {
                        foreach ($order['images'] as $image) {
                            $stmt = $db->prepare('INSERT INTO order_images (id, order_id, image_path) VALUES (?, ?, ?)');
                            $stmt->execute([generateUUID(), $order['id'], $image]);
                        }
                    }
                }

                foreach ($data['payments'] as $payment) {
                    $stmt = $db->prepare('INSERT INTO payments (id, customer_id, amount, date, description, type, status, order_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
                    $stmt->execute([
                        $payment['id'], $payment['customer_id'], $payment['amount'],
                        $payment['date'], $payment['description'], $payment['type'],
                        $payment['status'], $payment['order_id'], $payment['created_at']
                    ]);
                }

                $db->commit();
                header('Location: ../index.php?page=dashboard&message=import_success');
            } catch (Exception $e) {
                $db->rollBack();
                throw $e;
            }
            break;

        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}