<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'];

if ($action === 'register') {
    $name = $input['name'];
    $email = $input['email'];
    $password = $input['password'];

    // 1. اعتبار ساده بودن ایمیل
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'ایمیل نامعتبر نیست.']);
        exit;
    }

    // 2. اعتبار رمز عبور
    if (strlen($password) < 8) {
        echo json_encode(['success' => false, 'رمز عبور باید حداقل ۸ کاراکتر باشد.']);
        exit;
    }

    // 3. بررسی آیا نام کاربری قبلا
    // در اینجا شما باید منطق بررسی کنید که آیا نام کاربر قبلا وجود دارد

    // 4. هش کردن رمز عبور (مثلاً با `password_hash`)
    $hashed_password = password_hash($password);

    // 5. ذخیره کاربر در دیتابیس
    // ...

    // 6. ارسال پاسخ موفقیت به کاربر
    echo json_encode(['success' => true, 'ثبت‌نام با موفقیت انجام شد.']);

} elseif ($action === 'login') {
    $email = $input['email'];
    $password = $input['password'];

    // 1. دریافت کاربر از دیتابیس بر اساس ایمیل
    // 2. بررسی رمز عبور با هش شده
    // 3. اگر درست بود، یک توکن (JWT) ایجاد کرده و به کاربر برگردانید

    // 4. ارسال پاسخ موفقیت به کاربر
}