<?php
require_once '../config/config.php';
require_once '../models/Payment.php';

header('Content-Type: application/json');

$payment = new Payment();

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if (isset($_GET['id'])) {
                $result = $payment->getById($_GET['id']);
                if (!$result) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Payment not found']);
                    exit;
                }
            } elseif (isset($_GET['order_id'])) {
                $result = $payment->getByOrderId($_GET['order_id']);
            } elseif (isset($_GET['customer_id'])) {
                $result = $payment->getByCustomerId($_GET['customer_id']);
            } elseif (isset($_GET['active_deposits'])) {
                $result = $payment->getActiveDeposits();
            } else {
                $result = $payment->getAll();
            }
            echo json_encode($result);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($_GET['id'])) {
                // Update existing payment
                $success = $payment->update($_GET['id'], $data);
                echo json_encode(['success' => $success]);
            } else {
                // Create new payment
                $id = $payment->create($data);
                echo json_encode(['success' => true, 'id' => $id]);
            }
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Payment ID is required']);
                exit;
            }

            $success = $payment->delete($_GET['id']);
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