<?php

use App\Http\Controllers\XenditWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// / Rute ini otomatis akan menjadi: /api/webhook/xendit/invoice
Route::post('/webhook/xendit/invoice', [XenditWebhookController::class, 'handleInvoice']);