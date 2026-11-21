<?php

namespace App\Models;

use App\Support\CollegeDepartment;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Carbon;
use Spatie\LaravelMarkdown\MarkdownRenderer;

/**
 * @property Carbon $date
 * @property Carbon|null $event_date
 * @property Carbon|null $event_end_date
 */
#[Fillable(['image', 'title', 'category', 'posted_by', 'target_department', 'date', 'body', 'event_date', 'event_end_date', 'start_time', 'end_time', 'location', 'attachments', 'author_staff_id', 'author_admin_id', 'status', 'is_urgent', 'urgent_days', 'urgent_until'])]
class Announcement extends Model
{
    protected $table = 'announcement';

    public $timestamps = false;

    /** @return BelongsTo<StaffUser, $this> */
    public function staffAuthor(): BelongsTo
    {
        return $this->belongsTo(StaffUser::class, 'author_staff_id');
    }

    /** @return BelongsTo<AdminUser, $this> */
    public function adminAuthor(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'author_admin_id');
    }

    /** @return HasMany<DatabaseNotification, $this> */
    public function notifications(): HasMany
    {
        return $this->hasMany(DatabaseNotification::class);
    }

    /**
     * @param  Builder<Announcement>  $query
     * @return Builder<Announcement>
     */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        $department = CollegeDepartment::forCourse($user->course);

        return $query->where(function (Builder $query) use ($department): void {
            $query->whereNull('target_department');

            if ($department !== null) {
                $query->orWhere('target_department', $department);
            }
        });
    }

    public function isVisibleTo(User $user): bool
    {
        return $this->target_department === null
            || $this->target_department === CollegeDepartment::forCourse($user->course);
    }

    /**
     * @return Builder<User>
     */
    public function notificationRecipients(): Builder
    {
        $recipients = User::query();

        if ($this->target_department !== null) {
            $recipients->whereIn('course', CollegeDepartment::coursesFor($this->target_department));
        }

        return $recipients;
    }

    /** @return BelongsToMany<User, $this> */
    public function readers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'announcement_reads')
            ->withTimestamps();
    }

    /** @return BelongsToMany<User, $this> */
    public function savedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'announcement_user')
            ->withTimestamps();
    }

    /** @return HasManyThrough<Message, $this> */
    public function messages(): HasManyThrough
    {
        return $this->hasManyThrough(
            Message::class,
            Conversation::class,
            'announcement_id',
            'conversation_id',
        );
    }

    public function bodyAsHtml(): string
    {
        return app(MarkdownRenderer::class)
            ->commonmarkOptions(array_merge(config('markdown.commonmark_options', []), [
                'html_input' => 'strip',
            ]))
            ->toHtml($this->body);
    }

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'event_date' => 'date',
            'event_end_date' => 'date',
            'attachments' => 'array',
            'is_urgent' => 'boolean',
            'urgent_days' => 'integer',
            'urgent_until' => 'datetime',
            'views_count' => 'integer',
        ];
    }

    public static function archiveExpiredUrgent(): int
    {
        return static::query()
            ->where('is_urgent', true)
            ->where('status', 'Published')
            ->whereNotNull('urgent_until')
            ->where('urgent_until', '<=', now())
            ->update(['status' => 'Archived']);
    }
}
