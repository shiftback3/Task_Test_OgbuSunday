<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned to the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });


/**
 *
 * Load the auth routes to be processed first
 */
require __DIR__ . '/allapiroutes/auth.php';

/**
 * include all route files in the allapiroutes folder except auth.php
 *
 */
$api_folder = __DIR__ . '/allapiroutes';
$dir = new DirectoryIterator($api_folder);
foreach ($dir as $file) {
    if ($file->isFile() && str_contains($file->getFilename(), '.php') && $file->getFilename() !== 'auth.php') {
        require __DIR__ . '/allapiroutes/' . $file->getFilename();
    }
}
