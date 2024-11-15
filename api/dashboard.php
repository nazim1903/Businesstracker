<?php
require_once '../config/config.php';
require_once '../models/Customer.php';
require_once '../models/Product.php';
require_once '../models/Payment.php';
require_once '../models/Order.php';

header('Content-Type: application/json');

try {
    $customerModel = new Customer();
    $productModel = new Product();
    $paymentModel = new Payment();
    $orderModel = new Order();

    $data = [
        'customers' => $customerModel->getAll(),
        'products' => $productModel->getAll(),
        'payments' => $paymentModel->getAll(),
        'orders' => $orderModel->getAll(),
        'activeDeposits' => $paymentModel->getActiveDeposits()
    ];

    echo json_encode($data);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}