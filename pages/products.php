<?php
require_once 'models/Product.php';
require_once 'models/Customer.php';
require_once 'models/Payment.php';

$productModel = new Product();
$customerModel = new Customer();
$paymentModel = new Payment();

$products = $productModel->getAll();
$customers = $customerModel->getAll();

// Get editing product if ID is provided
$editingProduct = null;
if (isset($_GET['edit'])) {
    $editingProduct = $productModel->getById($_GET['edit']);
}
?>

<div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Sales</h1>
    
    <!-- Product Form -->
    <form id="productForm" class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <input type="hidden" name="id" value="<?= $editingProduct ? htmlspecialchars($editingProduct['id']) : '' ?>">
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                </label>
                <select name="customer_id" required class="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    <?= $editingProduct ? 'disabled' : '' ?>>
                    <option value="">Select a customer</option>
                    <?php foreach ($customers as $customer): ?>
                        <option value="<?= htmlspecialchars($customer['id']) ?>"
                            <?= ($editingProduct && $editingProduct['customer_id'] === $customer['id']) ? 'selected' : '' ?>>
                            <?= htmlspecialchars($customer['name']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Product Code
                </label>
                <input type="text" name="code" required
                    value="<?= $editingProduct ? htmlspecialchars($editingProduct['code']) : '' ?>"
                    class="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    placeholder="PRD001">
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                </label>
                <div class="relative">
                    <i class="icon-package absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input type="text" name="product" required
                        value="<?= $editingProduct ? htmlspecialchars($editingProduct['product']) : '' ?>"
                        class="pl-10 w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter product name">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price ($)
                </label>
                <input type="number" name="cost_price" required step="0.01" min="0"
                    value="<?= $editingProduct ? htmlspecialchars($editingProduct['cost_price']) : '' ?>"
                    class="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00">
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Sale Price ($)
                </label>
                <input type="number" name="sale_price" required step="0.01" min="0"
                    value="<?= $editingProduct ? htmlspecialchars($editingProduct['sale_price']) : '' ?>"
                    class="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00">
            </div>

            <?php if (!$editingProduct): ?>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Date
                </label>
                <input type="date" name="created_at" required
                    value="<?= date('Y-m-d') ?>"
                    class="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <?php endif; ?>
        </div>

        <div class="mt-4 flex justify-end">
            <?php if ($editingProduct): ?>
                <button type="button" onclick="cancelEdit()"
                    class="mr-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    Cancel
                </button>
            <?php endif; ?>
            <button type="submit"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2">
                <i class="icon-<?= $editingProduct ? 'pencil' : 'plus' ?>"></i>
                <?= $editingProduct ? 'Update Product' : 'Add Product' ?>
            </button>
        </div>
    </form>

    <!-- Products List -->
    <div id="productsList"></div>
</div>

<script>
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const url = data.id ? `api/products.php?id=${data.id}` : 'api/products.php';
        const response = await fetchApi(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.success) {
            window.location.href = 'index.php?page=products';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save product');
    }
});

function cancelEdit() {
    window.location.href = 'index.php?page=products';
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetchApi(`api/products.php?id=${id}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            window.location.reload();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete product');
    }
}

async function loadProducts() {
    try {
        const response = await fetchApi('api/products.php');
        const products = response;
        
        // Render products list
        const productsList = document.getElementById('productsList');
        // Implementation of rendering logic...
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load products');
    }
}

// Load products on page load
loadProducts();
</script>