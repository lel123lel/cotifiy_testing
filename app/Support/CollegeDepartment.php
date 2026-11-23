<?php

namespace App\Support;

final class CollegeDepartment
{
    /**
     * @var array<string, list<string>>
     */
    private const COURSES_BY_DEPARTMENT = [
        'College of Education' => ['BEEd', 'BTLEd', 'BSEd', 'DipPE'],
        'College of Engineering' => ['BSIE', 'BSME', 'BSCE', 'BSEE', 'BSCpE'],
        'College of Technology' => ['BSIT', 'BSMx', 'BIT-Comp', 'BIT-Draft', 'BIT-Elec', 'BIT-Electronics'],
        'College of Management and Entrepreneurship' => ['BSHM', 'BSTM', 'BSBA'],
    ];

    /**
     * @var list<string>
     */
    private const LEGACY_COURSES = ['BSCS', 'BSIS', 'ACT'];

    public static function forCourse(?string $course): ?string
    {
        if ($course === null) {
            return null;
        }

        foreach (self::COURSES_BY_DEPARTMENT as $department => $courses) {
            if (in_array($course, $courses, true)) {
                return $department;
            }
        }

        return null;
    }

    public static function forOffice(?string $office): ?string
    {
        if ($office === null) {
            return null;
        }

        $normalizedOffice = preg_replace('/[^a-z0-9]/', '', mb_strtolower(trim($office))) ?? '';
        $officeAliases = [
            'cot' => 'College of Technology',
            'cotdepartment' => 'College of Technology',
            'itdepartment' => 'College of Technology',
            'technology' => 'College of Technology',
            'technologydepartment' => 'College of Technology',
            'education' => 'College of Education',
            'educationdepartment' => 'College of Education',
            'engineering' => 'College of Engineering',
            'engineeringdepartment' => 'College of Engineering',
            'managementandentrepreneurship' => 'College of Management and Entrepreneurship',
            'cme' => 'College of Management and Entrepreneurship',
        ];

        if (isset($officeAliases[$normalizedOffice])) {
            return $officeAliases[$normalizedOffice];
        }

        foreach (array_keys(self::COURSES_BY_DEPARTMENT) as $department) {
            $normalizedDepartment = preg_replace('/[^a-z0-9]/', '', mb_strtolower($department)) ?? '';

            if (str_starts_with($normalizedOffice, $normalizedDepartment)) {
                return $department;
            }
        }

        return null;
    }

    /**
     * @return list<string>
     */
    public static function coursesFor(?string $department): array
    {
        return self::COURSES_BY_DEPARTMENT[$department] ?? [];
    }

    /**
     * @return list<string>
     */
    public static function allCourses(): array
    {
        return array_values(array_unique([
            ...self::LEGACY_COURSES,
            ...array_merge(...array_values(self::COURSES_BY_DEPARTMENT)),
        ]));
    }

    /**
     * @return list<string>
     */
    public static function allDepartments(): array
    {
        return array_keys(self::COURSES_BY_DEPARTMENT);
    }
}
