<?php
class Order {
    private $db;
    private $uploadDir;

    public function __construct() {
        $this->db = getConnection();
        $this->uploadDir = UPLOAD_DIR;
    }

    public function getAll() {
        $stmt = $this->db->query("
            SELECT o.*, 
                   GROUP_CONCAT(oi.image_path) as images,
                   c.name as customer_name
            FROM orders o
            LEFT JOIN order_images oi ON o.id = oi.order_id
            LEFT JOIN customers c ON o.customer_id = c.id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        ");
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Process images array
        foreach ($orders as &$order) {
            $order['images'] = $order['images'] ? explode(',', $order['images']) : [];
        }
        
        return $orders;
    }

    public function create($data, $images = []) {
        try {
            $this->db->beginTransaction();

            $id = generateUUID();
            $stmt = $this->db->prepare("
                INSERT INTO orders (
                    id, customer_id, product_name, details, gold_karat,
                    diamond_carat, diamond_type, size, deposit, total_price,
                    cost_price, status, created_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            ");
            
            $stmt->execute([
                $id,
                $data['customer_id'],
                $data['product_name'],
                $data['details'],
                $data['gold_karat'],
                $data['diamond_carat'] ?? null,
                $data['diamond_type'] ?? null,
                $data['size'] ?? null,
                $data['deposit'] ?? null,
                $data['total_price'],
                $data['cost_price'],
                $data['status'] ?? 'pending',
                $data['created_at'] ?? date('Y-m-d H:i:s')
            ]);

            // Handle image uploads
            if (!empty($images)) {
                foreach ($images as $image) {
                    $imagePath = $this->uploadImage($image);
                    $imageId = generateUUID();
                    
                    $imageStmt = $this->db->prepare("
                        INSERT INTO order_images (id, order_id, image_path)
                        VALUES (?, ?, ?)
                    ");
                    $imageStmt->execute([$imageId, $id, $imagePath]);
                }
            }

            // If there's a deposit, create a deposit payment
            if (!empty($data['deposit']) && $data['deposit'] > 0) {
                $paymentStmt = $this->db->prepare("
                    INSERT INTO payments (
                        id, customer_id, amount, date, description,
                        type, status, order_id
                    ) VALUES (?, ?, ?, ?, ?, 'deposit', 'completed', ?)
                ");
                
                $paymentStmt->execute([
                    generateUUID(),
                    $data['customer_id'],
                    $data['deposit'],
                    date('Y-m-d H:i:s'),
                    "Deposit for {$data['product_name']}",
                    $id
                ]);
            }

            $this->db->commit();
            return $id;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    private function uploadImage($image) {
        $extension = pathinfo($image['name'], PATHINFO_EXTENSION);
        $filename = generateUUID() . '.' . $extension;
        $targetPath = $this->uploadDir . $filename;

        if (!move_uploaded_file($image['tmp_name'], $targetPath)) {
            throw new Exception("Failed to upload image");
        }

        return $filename;
    }

    public function generatePDF($id) {
        require_once __DIR__ . '/../vendor/autoload.php';
        
        $order = $this->getById($id);
        if (!$order) {
            throw new Exception("Order not found");
        }

        // Create PDF
        $pdf = new Dompdf\Dompdf();
        $pdf->setPaper('A4', 'portrait');

        // Generate HTML content
        ob_start();
        include __DIR__ . '/../templates/order_pdf.php';
        $html = ob_get_clean();
        
        $pdf->loadHtml($html);
        $pdf->render();

        // Generate filename
        $customerName = preg_replace('/[^a-z0-9]/i', '_', $order['customer_name']);
        $productName = preg_replace('/[^a-z0-9]/i', '_', $order['product_name']);
        $date = date('Y-m-d');
        $filename = "{$customerName}_{$productName}_{$date}.pdf";

        return [
            'content' => $pdf->output(),
            'filename' => $filename
        ];
    }
}