<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['image', 'title', 'category', 'posted_by', 'date', 'body', 'event_date', 'start_time', 'end_time', 'location'])]
class Announcement extends Model
{
    protected $table = 'announcement';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'event_date' => 'date',
        ];
    }
}
