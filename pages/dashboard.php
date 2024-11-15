<?php
require_once 'models/Customer.php';
require_once 'models/Product.php';
require_once 'models/Payment.php';
require_once 'models/Order.php';

$customerModel = new Customer();
$productModel = new Product();
$paymentModel = new Payment();
$orderModel = new Order();

$customers = $customerModel->getAll();
$products = $productModel->getAll();
$payments = $paymentModel->getAll();
$orders = $orderModel->getAll();
$activeDeposits = $paymentModel->getActiveDeposits();

// Calculate totals for cash flow
$completedPayments = array_filter($payments, fn($p) => $p['status'] === 'completed');

$totalIncoming = array_reduce(
    array_filter($completedPayments, fn($p) => $p['type'] === 'incoming' || $p['type'] === 'deposit'),
    fn($sum, $p) => $sum + $p['amount'],
    0
);

$totalOutgoing = array_reduce(
    array_filter($completedPayments, fn($p) => $p['type'] === 'outgoing'),
    fn($sum, $p) => $sum + $p['amount'],
    0
);

$totalCompanyPayments = array_reduce(
    array_filter($completedPayments, fn($p) => $p['type'] === 'company_payment'),
    fn($sum, $p) => $sum + $p['amount'],
    0
);

$totalPersonalPayments = array_reduce(
    array_filter($completedPayments, fn($p) => $p['type'] === 'personal_account'),
    fn($sum, $p) => $sum + $p['amount'],
    0
);

$currentBalance = $totalIncoming - $totalOutgoing - $totalCompanyPayments - $totalPersonalPayments;
?>

<div class="space-y-6">
    <!-- Data Backup Section -->
    <div class="flex justify-end gap-2 mb-4">
        <form action="api/backup.php?action=export" method="post">
            <button type="submit"
                class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                <i class="icon-download"></i>
                Export Data
            </button>
        </form>
        <form action="api/backup.php?action=import" method="post" enctype="multipart/form-data" id="importForm">
            <input type="file" name="backup" accept=".json" class="hidden" id="importInput">
            <button type="button" onclick="document.getElementById('importInput').click()"
                class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <i class="icon-upload"></i>
                Import Data
            </button>
        </form>
    </div>

    <!-- Cash Flow Section -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
                <i class="icon-wallet text-blue-600"></i>
                <h2 class="text-xl font-semibold text-gray-900">Cash Flow</h2>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <!-- Current Balance -->
            <div class="bg-blue-50 rounded-lg p-4">
                <div class="text-blue-600 text-sm font-medium">Current Balance</div>
                <div class="text-2xl font-bold text-blue-900">
                    $<?= number_format($currentBalance, 2) ?>
                </div>
            </div>

            <!-- Total Income -->
            <div class="bg-green-50 rounded-lg p-4">
                <div class="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <i class="icon-arrow-up-right"></i>
                    Total Income
                </div>
                <div class="text-2xl font-bold text-green-900">
                    $<?= number_format($totalIncoming, 2) ?>
                </div>
            </div>

            <!-- Total Expenses -->
            <div class="bg-red-50 rounded-lg p-4">
                <div class="flex items-center gap-2 text-red-600 text-sm font-medium">
                    <i class="icon-arrow-down-right"></i>
                    Total Expenses
                </div>
                <div class="text-2xl font-bold text-red-900">
                    $<?= number_format($totalOutgoing, 2) ?>
                </div>
            </div>

            <!-- Company Payments -->
            <div class="bg-purple-50 rounded-lg p-4">
                <div class="flex items-center gap-2 text-purple-600 text-sm font-medium">
                    <i class="icon-building-2"></i>
                    Notte Payments
                </div>
                <div class="text-2xl font-bold text-purple-900">
                    $<?= number_format($totalCompanyPayments, 2) ?>
                </div>
            </div>
        </div>

        <!-- Active Deposits Section -->
        <?php if (!empty($activeDeposits)): ?>
        <div class="bg-amber-50 rounded-lg p-4">
            <div class="flex items-center gap-2 text-amber-600 text-sm font-medium">
                <i class="icon-clipboard-list"></i>
                Active Orders & Deposits
            </div>
            <div class="text-2xl font-bold text-amber-900">
                $<?= number_format(array_sum(array_column($activeDeposits, 'amount')), 2) ?>
            </div>
            <div class="mt-2 text-sm text-amber-600 max-h-20 overflow-y-auto">
                <?php foreach ($activeDeposits as $deposit): ?>
                <div class="flex justify-between">
                    <span><?= htmlspecialchars($deposit['product_name']) ?></span>
                    <span>$<?= number_format($deposit['amount'], 2) ?></span>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endif; ?>
    </div>
</div>

<script>
document.getElementById('importInput').addEventListener('change', function() {
    if (this.files.length > 0) {
        document.getElementById('importForm').submit();
    }
});
</script>