<?php
require_once 'models/Customer.php';
$customer = new Customer();
$customers = $customer->getAll();
?>

<div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Customers</h1>

    <!-- Add Customer Form -->
    <form id="customerForm" class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                </label>
                <div class="relative">
                    <i class="icon-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input type="text" name="name" required
                        class="pl-10 w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Email (optional)
                </label>
                <div class="relative">
                    <i class="icon-mail absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input type="email" name="email"
                        class="pl-10 w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@example.com">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Phone (optional)
                </label>
                <div class="relative">
                    <i class="icon-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input type="tel" name="phone"
                        class="pl-10 w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 000-0000">
                </div>
            </div>
        </div>

        <div class="mt-4 flex justify-end">
            <button type="submit"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2">
                <i class="icon-user-plus"></i>
                Add Customer
            </button>
        </div>
    </form>

    <!-- Customers List -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="bg-gray-50">
                        <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Products</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total Revenue ($)</th>
                        <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <?php foreach ($customers as $customer): ?>
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4">
                            <div class="text-sm font-medium text-gray-900"><?= htmlspecialchars($customer['name']) ?></div>
                            <div class="text-sm text-gray-500">
                                Added <?= date('M j, Y', strtotime($customer['created_at'])) ?>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm text-gray-900"><?= htmlspecialchars($customer['email'] ?? '-') ?></div>
                            <?php if ($customer['phone']): ?>
                            <div class="text-sm text-gray-500"><?= htmlspecialchars($customer['phone']) ?></div>
                            <?php endif; ?>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-1">
                                <i class="icon-package text-gray-400"></i>
                                <span class="text-sm text-gray-900">
                                    <?= $customer['product_count'] ?? 0 ?>
                                </span>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <span class="text-sm text-gray-900">
                                $<?= number_format($customer['total_revenue'] ?? 0, 2) ?>
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right space-x-2">
                            <button onclick="editCustomer('<?= $customer['id'] ?>')"
                                class="text-blue-600 hover:text-blue-800">
                                <i class="icon-pencil"></i>
                            </button>
                            <button onclick="viewReport('<?= $customer['id'] ?>')"
                                class="text-green-600 hover:text-green-800">
                                <i class="icon-file-text"></i>
                            </button>
                            <button onclick="deleteCustomer('<?= $customer['id'] ?>')"
                                class="text-red-600 hover:text-red-800">
                                <i class="icon-trash-2"></i>
                            </button>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetchApi('api/customers.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.success) {
            window.location.reload();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add customer');
    }
});

async function editCustomer(id) {
    // Implementation will be added
}

async function viewReport(id) {
    // Implementation will be added
}

async function deleteCustomer(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
        const response = await fetchApi(`api/customers.php?id=${id}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            window.location.reload();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete customer');
    }
}
</script>