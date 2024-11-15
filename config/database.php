<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'ttsubpmy_nazim1903');
define('DB_PASS', 'Ananinami-1');
define('DB_NAME', 'ttsubpmy_business_manager');

function getConnection() {
    try {
        $conn = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
            DB_USER,
            DB_PASS,
            array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
        );
        return $conn;
    } catch(PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}