<?php
require_once 'models/Order.php';
require_once 'models/Customer.php';
require_once 'models/Payment.php';

$orderModel = new Order();
$customerModel = new Customer();
$paymentModel = new Payment();

$orders = $orderModel->getAll();
$customers = $customerModel->getAll();
$payments = $paymentModel->getAll();

// Get editing order if ID is provided
$editingOrder = null;
if (isset($_GET['edit'])) {
    $editingOrder = $orderModel->getById($_GET['edit']);
}
?>

<div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Orders</h1>
    
    <!-- Order Form -->
    <form id="orderForm" class="bg-white rounded-xl shadow-sm p-6 mb-6" enctype="multipart/form-data">
        <input type="hidden" name="id" value="<?= $editingOrder ? htmlspecialchars($editingOrder['id']) : '' ?>">
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Form fields will be added here -->
        </div>

        <div class="mt-4 flex justify-end">
            <?php if ($editingOrder): ?>
                <button type="button" onclick="cancelEdit()"
                    class="mr-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    Cancel
                </button>
            <?php endif; ?>
            <button type="submit"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2">
                <i class="icon-<?= $editingOrder ? 'pencil' : 'plus' ?>"></i>
                <?= $editingOrder ? 'Update Order' : 'Create Order' ?>
            </button>
        </div>
    </form>

    <!-- Orders List -->
    <div id="ordersList"></div>
</div>

<script>
// JavaScript for form handling will be added here
</script>