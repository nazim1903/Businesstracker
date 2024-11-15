<?php
require_once 'config/config.php';

$page = isset($_GET['page']) ? $_GET['page'] : 'dashboard';
$allowed_pages = ['dashboard', 'customers', 'orders', 'products', 'payments'];

if (!in_array($page, $allowed_pages)) {
    $page = 'dashboard';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Manager</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/font/lucide.min.css" rel="stylesheet">
</head>
<body class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex">
                    <a href="index.php" class="flex items-center px-4 text-gray-900 hover:text-blue-600">
                        <i class="icon-layout mr-2"></i>
                        <span class="font-semibold">Business Manager</span>
                    </a>
                </div>
                <div class="flex space-x-4">
                    <a href="?page=dashboard" class="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                        <i class="icon-home mr-1"></i>
                        Dashboard
                    </a>
                    <a href="?page=customers" class="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                        <i class="icon-users mr-1"></i>
                        Customers
                    </a>
                    <a href="?page=products" class="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                        <i class="icon-package mr-1"></i>
                        Sales
                    </a>
                    <a href="?page=orders" class="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                        <i class="icon-clipboard-list mr-1"></i>
                        Orders
                    </a>
                    <a href="?page=payments" class="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                        <i class="icon-credit-card mr-1"></i>
                        Payments
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <main class="py-6 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
            <?php include "pages/{$page}.php"; ?>
        </div>
    </main>

    <script src="js/app.js"></script>
</body>
</html>