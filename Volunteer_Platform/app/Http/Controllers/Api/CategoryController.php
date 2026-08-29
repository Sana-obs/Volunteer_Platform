<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index()
    {
        $categories = Category::latest()->get();

        return ApiResponse::getResponse(
            CategoryResource::collection($categories),
            Response::HTTP_OK,
        );
    }

    /**
     * Store a newly created category.
     */
    public function store(CategoryRequest $request)
    {
        $category = Category::create($request->validated());

        return ApiResponse::getResponse(
            new CategoryResource($category),
            Response::HTTP_CREATED,
            'Category created successfully'
        );
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category)
    {
        return ApiResponse::getResponse(
            new CategoryResource($category),
            Response::HTTP_OK,
        );
    }

    /**
     * Update the specified category.
     */
    public function update(CategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return ApiResponse::getResponse(
            new CategoryResource($category),
            Response::HTTP_OK,
            'Category updated successfully'
        );
    }

    /**
     * Remove the specified category.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return ApiResponse::getResponse(
            null,
            Response::HTTP_OK,
            'Category deleted successfully'
        );
    }
}
