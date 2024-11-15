<?php
require_once '../config/config.php';
require_once '../models/Order.php';

header('Content-Type: application/json');

$order = new Order();

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if (isset($_GET['id'])) {
                if (isset($_GET['pdf'])) {
                    // Generate PDF
                    $pdf = $order->generatePDF($_GET['id']);
                    header('Content-Type: application/pdf');
                    header('Content-Disposition: attachment; filename="' . $pdf['filename'] . '"');
                    echo $pdf['content'];
                    exit;
                }

                $result = $order->getById($_GET['id']);
                if (!$result) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Order not found']);
                    exit;
                }
            } else {
                $result = $order->getAll();
            }
            echo json_encode($result);
            break;

        case 'POST':
            if (isset($_GET['id'])) {
                // Update existing order
                $data = json_decode(file_get_contents('php://input'), true);
                $images = $_FILES['images'] ?? [];
                $success = $order->update($_GET['id'], $data, $images);
                echo json_encode(['success' => $success]);
            } else {
                // Create new order
                $data = json_decode($_POST['data'], true);
                $images = $_FILES['images'] ?? [];
                $id = $order->create($data, $images);
                echo json_encode(['success' => true, 'id' => $id]);
            }
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Order ID is required']);
                exit;
            }

            if (isset($_GET['image'])) {
                // Delete specific image
                $success = $order->deleteImage($_GET['id'], $_GET['image']);
            } else {
                // Delete entire order
                $success = $order->delete($_GET['id']);
            }
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