<?php

namespace Config;

$routes = Services::routes();

// Load the system's routing file first
if (is_file(SYSTEMPATH . 'Config/Routes.php')) {
    require SYSTEMPATH . 'Config/Routes.php';
}

// Dashboard
$routes->get('/', 'Dashboard::index');

// Customers
$routes->group('customers', function($routes) {
    $routes->get('/', 'Customers::index');
    $routes->post('add', 'Customers::add');
    $routes->post('update/(:segment)', 'Customers::update/$1');
    $routes->delete('delete/(:segment)', 'Customers::delete/$1');
    $routes->get('report/(:segment)', 'Customers::report/$1');
});

// Orders
$routes->group('orders', function($routes) {
    $routes->get('/', 'Orders::index');
    $routes->post('add', 'Orders::add');
    $routes->post('update/(:segment)', 'Orders::update/$1');
    $routes->delete('delete/(:segment)', 'Orders::delete/$1');
    $routes->post('upload-image', 'Orders::uploadImage');
    $routes->get('pdf/(:segment)', 'Orders::generatePDF/$1');
});

// Products (Sales)
$routes->group('products', function($routes) {
    $routes->get('/', 'Products::index');
    $routes->post('add', 'Products::add');
    $routes->post('update/(:segment)', 'Products::update/$1');
    $routes->delete('delete/(:segment)', 'Products::delete/$1');
});

// Payments
$routes->group('payments', function($routes) {
    $routes->get('/', 'Payments::index');
    $routes->post('add', 'Payments::add');
    $routes->post('update/(:segment)', 'Payments::update/$1');
    $routes->delete('delete/(:segment)', 'Payments::delete/$1');
});