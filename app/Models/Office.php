<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name'])]
class Office extends Model
{
    /** @return HasMany<StaffUser, $this> */
    public function staffAccounts(): HasMany
    {
        return $this->hasMany(StaffUser::class);
    }
}
