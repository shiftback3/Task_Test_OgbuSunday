<?php

namespace App\Helpers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ApiHelper
{
    public static function problemResponse(?string $message = null, int $status_code, ?Request $request = null, ?Exception $trace = null)
    {
        $code = !empty($status_code) ? $status_code : null;
        $traceMsg = empty($trace) ? null : $trace->getMessage();

        $body = [
            'message' => $message,
            'code' => $code,
            'success' => false,
            'error_debug' => $traceMsg,
        ];

        !empty($trace) ? logger($trace->getMessage(), $trace->getTrace()) : null;
        return response()->json($body)->setStatusCode($code);
    }

    /** Return error api response */
    public static function inputErrorResponse(?string $message = null, ?int $status_code = null, ?Request $request = null, ?ValidationException $trace = null)
    {
        $code = ($status_code != null) ? $status_code : ApiConstants::VALIDATION_ERROR_CODE;
        $traceMsg = empty($trace) ? null : $trace->getMessage();

        $body = [
            'message' => $message,
            'code' => $code,
            'success' => false,
            'errors' => empty($trace) ? null : $trace->errors(),
        ];

        return response()->json($body)->setStatusCode($code);
    }

    /** Return valid api response */
    public static function validResponse(?string $message = null, mixed $data = null, mixed $request = null)
    {
        if (is_null($data) || empty($data)) {
            $data = null;
        }
        $body = [
            'message' => $message,
            'data' => $data,
            'success' => true,
            'code' => ApiConstants::GOOD_REQ_CODE,
        ];
        return response()->json($body);
    }

    /** Return created response */
    public static function createdResponse(?string $message = null, mixed $data = null, mixed $request = null)
    {
        $body = [
            'message' => $message,
            'data' => $data,
            'success' => true,
            'code' => ApiConstants::CREATED_CODE,
        ];
        return response()->json($body, ApiConstants::CREATED_CODE);
    }

    /** Return no content response */
    public static function noContentResponse()
    {
        return response()->json(null, ApiConstants::NO_CONTENT_CODE);
    }

    /** Return unauthorized response */
    public static function unauthorizedResponse(string $message = 'Unauthorized')
    {
        return response()->json([
            'message' => $message,
            'success' => false,
            'code' => ApiConstants::UNAUTHORIZED_CODE,
        ], ApiConstants::UNAUTHORIZED_CODE);
    }

    /** Return forbidden response */
    public static function forbiddenResponse(string $message = 'Forbidden')
    {
        return response()->json([
            'message' => $message,
            'success' => false,
            'code' => ApiConstants::FORBIDDEN_CODE,
        ], ApiConstants::FORBIDDEN_CODE);
    }

    /** Return not found response */
    public static function notFoundResponse(string $message = 'Resource not found')
    {
        return response()->json([
            'message' => $message,
            'success' => false,
            'code' => ApiConstants::NOT_FOUND_CODE,
        ], ApiConstants::NOT_FOUND_CODE);
    }
}
