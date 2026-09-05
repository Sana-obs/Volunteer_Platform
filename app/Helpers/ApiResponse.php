<?php

namespace App\Helpers;

use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;

class ApiResponse
{
    static function getResponse($data = null, $status = 200, $message = "")
    {
        $response = ['status' => $status, 'message' => $message, 'data' => $data];

        if ($data instanceof AnonymousResourceCollection
            && $data->resource instanceof LengthAwarePaginator) {

            $paginator = $data->resource;
            $response['data'] = $data->collection->values();
            $response['meta'] = [
                'currentPage' => $paginator->currentPage(),
                'lastPage'    => $paginator->lastPage(),
                'perPage'     => $paginator->perPage(),
                'total'       => $paginator->total(),
            ];
            $response['links'] = [
                'first' => $paginator->url(1),
                'last'  => $paginator->url($paginator->lastPage()),
                'prev'  => $paginator->previousPageUrl(),
                'next'  => $paginator->nextPageUrl(),
            ];
        }

        return response()->json($response, $status);
    }
}
