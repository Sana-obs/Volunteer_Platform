<?php

namespace App\Helpers;

class ApiResponse
{
    /**
     * Create a new class instance.
     */
    static function getResponse($data=null,$status=200,$message=""){
        return response()->json([
            'status'=>$status,
            'message'=>$message,
            'data'=>$data,
        ],$status);

    }
}
