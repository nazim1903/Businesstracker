<?php
require_once '../config/config.php';
require_once '../models/Product.php';

header('Content-Type: application/json');

$product = new Product();

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if (isset($_GET['id'])) {
                $result = $product->getById($_GET['id']);
                if (!$result) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Product not found']);
                    exit;
                }
                
                if (isset($_GET['with_payments'])) {
                    $result['payments'] = $product->getRelatedPayments($result['id']);
                }
            } elseif (isset($_GET['customer_id'])) {
                $result = $product->getByCustomerId($_GET['customer_id']);
            } else {
                $result = $product->getAll();
            }
            echo json_encode($result);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($_GET['id'])) {
                // Update existing product
                $success = $product->update($_GET['id'], $data);
                echo json_encode(['success' => $success]);
            } else {
                // Create new product
                $id = $product->create($data);
                echo json_encode(['success' => true, 'id' => $id]);
            }
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Product ID is required']);
                exit;
            }

            $success = $product->delete($_GET['id']);
            echo json_encode(['success' => $success]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}