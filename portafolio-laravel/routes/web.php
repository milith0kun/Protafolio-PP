<?php

use Illuminate\Support\Facades\Route;

// Ruta principal del API del Sistema de Portafolio Docente
Route::get('/', function () {
    return response()->json([
        'message' => 'API del Sistema de Portafolio Docente',
        'version' => '1.0.0',
        'status' => 'active'
    ]);
});

// Rutas del API para el portafolio docente
Route::prefix('api')->group(function () {
    // Rutas de autenticación
    Route::prefix('auth')->group(function () {
        Route::post('login', 'AuthController@login');
        Route::post('logout', 'AuthController@logout');
        Route::get('user', 'AuthController@user');
    });
    
    // Rutas del portafolio
    Route::prefix('portafolio')->group(function () {
        Route::get('/', 'PortafolioController@index');
        Route::post('/', 'PortafolioController@store');
        Route::get('/{id}', 'PortafolioController@show');
        Route::put('/{id}', 'PortafolioController@update');
        Route::delete('/{id}', 'PortafolioController@destroy');
    });
});
