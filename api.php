header('Content-Type: application/json; charset=utf-8');
<?php
header('Content-Type: application/json; charset=utf-8');

// اتصال به دیتابیس
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Content-Type: application/json');

// دریافت درخواست
 $method = $_SERVER['REQUEST_METHOD'];
 $input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $action = $input['action'];

    if ($action === 'login') {
        $email = $input['email'];
        $password = $input['password'];

        // اینجا منطق ورود کاربر را با دیتابیس خود چک کنید
        // مثلاً: بررسی ایمیل و رمز عبور
        // اگر معتبر بود، یک توکن (JWT) ایجاد کرده و به کاربر برگردانید
    }

    if ($action === 'register') {
        // منطق ثبت‌نام کاربر جدید
    }

    if ($action === 'placeOrder') {
        // منطق سفارش محصول
    }

    // ارسال پاسخ به صورت JSON
    echo json_encode(['success' => true, 'message' => 'عملیات با موفقیت انجام شد.']);
} else {
    // ارسال خطا به صورت JSON
    echo json_encode(['success' => false, 'message' => 'درخواست ناموفق بود.']);
    }
} else {
    // برای درخواست‌های دیگر (مثل جستجو)
}
}
?>