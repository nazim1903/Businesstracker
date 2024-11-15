<?php
// This template is used for generating order PDFs
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .order-details {
            margin-bottom: 30px;
        }
        .customer-info {
            margin-bottom: 30px;
        }
        .product-info {
            margin-bottom: 30px;
        }
        .images {
            text-align: center;
        }
        .image {
            max-width: 300px;
            margin: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Details</h1>
            <p>Order Date: <?= date('F j, Y', strtotime($order['created_at'])) ?></p>
        </div>

        <div class="customer-info">
            <h2>Customer Information</h2>
            <p><strong>Name:</strong> <?= htmlspecialchars($order['customer_name']) ?></p>
        </div>

        <div class="product-info">
            <h2>Product Details</h2>
            <table>
                <tr>
                    <th>Product Name</th>
                    <td><?= htmlspecialchars($order['product_name']) ?></td>
                </tr>
                <tr>
                    <th>Gold Karat</th>
                    <td><?= htmlspecialchars($order['gold_karat']) ?></td>
                </tr>
                <?php if ($order['diamond_carat']): ?>
                <tr>
                    <th>Diamond Carat</th>
                    <td><?= htmlspecialchars($order['diamond_carat']) ?></td>
                </tr>
                <?php endif; ?>
                <?php if ($order['diamond_type']): ?>
                <tr>
                    <th>Diamond Type</th>
                    <td><?= htmlspecialchars($order['diamond_type']) ?></td>
                </tr>
                <?php endif; ?>
                <?php if ($order['size']): ?>
                <tr>
                    <th>Size</th>
                    <td><?= htmlspecialchars($order['size']) ?></td>
                </tr>
                <?php endif; ?>
            </table>

            <h3>Details</h3>
            <p><?= nl2br(htmlspecialchars($order['details'])) ?></p>
        </div>

        <?php if (!empty($order['images'])): ?>
        <div class="images">
            <h2>Product Images</h2>
            <?php foreach ($order['images'] as $image): ?>
            <img src="<?= UPLOAD_DIR . $image ?>" class="image" alt="Product Image">
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
    </div>
</body>
</html>