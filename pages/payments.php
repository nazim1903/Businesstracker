<?php
require_once 'models/Payment.php';
require_once 'models/Customer.php';
require_once 'models/Order.php';

$paymentModel = new Payment();
$customerModel = new Customer();
$orderModel = new Order();

$payments = $paymentModel->getAll();
$customers = $customerModel->getAll();
$orders = $orderModel->getAll();

// Get editing payment if ID is provided
$editingPayment = null;
if (isset($_GET['edit'])) {
    $editingPayment = $paymentModel->getById($_GET['edit']);
}
?>

<div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Payments</h1>
    
    <!-- Payment Form -->
    <form id="paymentForm" class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <input type="hidden" name="id" value="<?= $editingPayment ? htmlspecialchars($editingPayment['id']) : '' ?>">
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Form fields will be added here -->
        </div>

        <div class="mt-4 flex justify-end">
            <?php if ($editingPayment): ?>
                <button type="button" onclick="cancelEdit()"
                    class="mr-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    Cancel
                </button>
            <?php endif; ?>
            <button type="submit"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2">
                <i class="icon-<?= $editingPayment ? 'pencil' : 'plus' ?>"></i>
                <?= $editingPayment ? 'Update Payment' : 'Add Payment' ?>
            </button>
        </div>
    </form>

    <!-- Payments List -->
    <div id="paymentsList"></div>
</div>

<script>
// JavaScript for form handling will be added here
</script>