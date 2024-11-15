<?php
require_once __DIR__ . '/../config/config.php';

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function uploadImage($file) {
    $target_dir = UPLOAD_DIR;
    $imageFileType = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
    $target_file = $target_dir . generateUUID() . '.' . $imageFileType;
    
    // Check if image file is actual image
    $check = getimagesize($file["tmp_name"]);
    if($check === false) {
        throw new Exception("File is not an image.");
    }
    
    // Check file size
    if ($file["size"] > 5000000) {
        throw new Exception("File is too large.");
    }
    
    // Allow certain file formats
    if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "gif" ) {
        throw new Exception("Only JPG, JPEG, PNG & GIF files are allowed.");
    }
    
    if (move_uploaded_file($file["tmp_name"], $target_file)) {
        return basename($target_file);
    } else {
        throw new Exception("Failed to upload file.");
    }
}

function formatMoney($amount) {
    return number_format($amount, 2, '.', ',');
}

function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}