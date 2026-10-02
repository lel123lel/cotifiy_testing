<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/auth/login', 'auth/login')->name('login');
Route::inertia('/auth/register', 'auth/register')->name('register');
