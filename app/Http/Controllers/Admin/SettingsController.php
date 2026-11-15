<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Office;
use App\Models\StaffUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/settings', [
            'offices' => Office::query()
                ->orderBy('name')
                ->get(['id', 'name']),
            'staffAccounts' => StaffUser::query()
                ->select(['id', 'name', 'email', 'office_id'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function storeOffice(Request $request): RedirectResponse
    {
        $this->persistOffice($request);

        return back();
    }

    public function updateOffice(Request $request, Office $office): RedirectResponse
    {
        $this->persistOffice($request, $office);

        return back();
    }

    public function staffIndex(Request $request): Response
    {
        return Inertia::render('admin/settings', [
            'staffMode' => true,
            'staffName' => $request->user('staff')->name,
        ]);
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string', 'current_password:admin'],
            'password' => ['required', 'string', Password::default(), 'confirmed'],
        ], [
            'current_password.current_password' => __('The provided password does not match your current password.'),
        ]);

        $request->user('admin')->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        return back();
    }

    public function updateStaffPassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string', 'current_password:staff'],
            'password' => ['required', 'string', Password::default(), 'confirmed'],
        ], [
            'current_password.current_password' => __('The provided password does not match your current password.'),
        ]);

        $request->user('staff')->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        return back();
    }

    private function persistOffice(Request $request, ?Office $office = null): void
    {
        $request->merge([
            'name' => trim((string) $request->input('name')),
        ]);

        $nameRules = ['required', 'string', 'max:255'];
        $nameRules[] = $office === null
            ? Rule::unique('offices', 'name')
            : Rule::unique('offices', 'name')->ignore($office->id);

        $validated = $request->validate([
            'name' => $nameRules,
            'staff_account_ids' => ['required', 'array', 'max:5'],
            'staff_account_ids.*' => ['integer', 'distinct', Rule::exists('staff_users', 'id')],
        ]);

        DB::transaction(function () use ($validated, $office): void {
            $staffAccountIds = $validated['staff_account_ids'];
            $alreadyLinked = StaffUser::query()
                ->whereIn('id', $staffAccountIds)
                ->whereNotNull('office_id');

            if ($office !== null) {
                $alreadyLinked->where('office_id', '!=', $office->id);
            }

            if ($staffAccountIds !== [] && $alreadyLinked->exists()) {
                throw ValidationException::withMessages([
                    'staff_account_ids' => 'Each staff account can only be linked to one office.',
                ]);
            }

            $office ??= new Office;
            $office->name = $validated['name'];
            $office->save();

            StaffUser::query()->where('office_id', $office->id)->update(['office_id' => null]);

            if ($staffAccountIds !== []) {
                StaffUser::query()->whereIn('id', $staffAccountIds)->update(['office_id' => $office->id]);
            }
        });
    }
}
