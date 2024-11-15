<?php
require_once 'config/config.php';

try {
    // Create database connection with explicit charset
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // Set charset to utf8mb4
    $conn->set_charset("utf8mb4");
    
    // Create database if it doesn't exist
    $conn->query("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $conn->select_db(DB_NAME);
    
    // Read and execute SQL file
    $sql = file_get_contents('database.sql');
    
    // Split SQL into individual statements
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            if (!$conn->query($statement)) {
                throw new Exception("Error executing statement: " . $conn->error);
            }
        }
    }

    // Create default admin user if not exists
    $checkAdmin = $conn->query("SELECT id FROM users WHERE username = 'admin'");
    if ($checkAdmin->num_rows === 0) {
        $password_hash = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->bind_param("ss", $username, $password_hash);
        $username = 'admin';
        $stmt->execute();
        $stmt->close();
    }
    
    echo "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background-color: #f0f9ff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>";
    echo "<h2 style='color: #0369a1; margin-bottom: 20px;'>Installation Completed Successfully!</h2>";
    echo "<p style='color: #334155; line-height: 1.6;'>The database has been set up successfully. You can now:</p>";
    echo "<ul style='color: #334155; line-height: 1.6;'>";
    echo "<li>Delete the install.php file for security</li>";
    echo "<li>Log in to the system using the default credentials:</li>";
    echo "<ul style='margin-left: 20px;'>";
    echo "<li>Username: admin</li>";
    echo "<li>Password: admin123</li>";
    echo "</ul>";
    echo "</ul>";
    echo "<a href='login.php' style='display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #0284c7; color: white; text-decoration: none; border-radius: 4px;'>Go to Login Page</a>";
    echo "</div>";
    
} catch(Exception $e) {
    die("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background-color: #fef2f2; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
        <h2 style='color: #dc2626; margin-bottom: 20px;'>Installation Failed</h2>
        <p style='color: #7f1d1d; line-height: 1.6;'><strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "</p>
        <p style='color: #7f1d1d; margin-top: 10px;'>Please check your database credentials in config/config.php</p>
    </div>");
}

// Close connection
$conn->close();