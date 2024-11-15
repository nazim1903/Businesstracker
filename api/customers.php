<?php
require_once '../config/config.php';
require_once '../models/Customer.php';

header('Content-Type: application/json');

$customer = new Customer();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (isset($_GET['id'])) {
            $result = $customer->getById($_GET['id']);
        } elseif (isset($_GET['report'])) {
            $result = $customer->getCustomerReport($_GET['report']);
        } else {
            $result = $customer->getAll();
        }
        echo json_encode($result);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($_GET['id'])) {
            // Update
            $success = $customer->update($_GET['id'], $data);
            echo json_encode(['success' => $success]);
        } else {
            // Create
            $success = $customer->create($data);
            echo json_encode(['success' => $success]);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $success = $customer->delete($_GET['id']);
            echo json_encode(['success' => $success]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}