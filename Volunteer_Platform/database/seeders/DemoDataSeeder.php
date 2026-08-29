<?php

namespace Database\Seeders;

use App\Enum\OrganizationStatus;
use App\Models\Category;
use App\Models\Governorate;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\Skill;
use App\Models\User;
use App\Models\Volunteer;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $governorateIds = Governorate::pluck('id')->all();
        $categoryIds = Category::pluck('id')->all();
        $skillIds = Skill::pluck('id')->all();

        if (empty($governorateIds) || empty($categoryIds) || empty($skillIds)) {
            $this->command->warn(
                'يجب تشغيل السيدرز الأساسية أولاً باستخدام php artisan db:seed.'
            );

            return;
        }

        /*
         * 10 منظمات تجريبية:
         * 8 Verified
         * 1 Pending
         * 1 Rejected
         *
         * المنظمتان Pending و Rejected لا تملكان فرصًا.
         */
        $orgNames = [
            'Syrian Arab Red Crescent',
            'Syria Trust for Development',
            'Syrian Society for Social Development',
            'Ihsan for Relief and Development',
            'Shafak Organization',
            'Basma Association',
            'Juthour Association',
            'Nama Development Association',
            'Al-Bir and Al-Ihsan Charity Association',
            'Nour Foundation for Relief and Development',
        ];

        $orgDescriptions = [
            'Humanitarian organization supporting communities through relief, emergency response and volunteer initiatives.',
            'Development organization supporting education, community development and local empowerment initiatives.',
            'Organization focused on social development, humanitarian support and community-based programs.',
            'Humanitarian and development organization supporting vulnerable communities and local initiatives.',
            'Humanitarian organization supporting vulnerable communities through relief and volunteer programs.',
            'Community association supporting children, families and local volunteer initiatives.',
            'Organization supporting inclusion, rehabilitation and community care programs.',
            'Development association supporting education, youth and community development initiatives.',
            'Charity association providing social support and community services.',
            'Organization supporting relief, education and community development projects.',
        ];

        $contactPersons = [
            'Ahmad Khalil',
            'Sara Hassan',
            'Omar Mahmoud',
            'Rana Ali',
            'Khaled Saleh',
            'Nour Hamdan',
            'Maya Ahmad',
            'Samer Youssef',
            'Lina Qassem',
            'Hiba Nasser',
        ];

        $organizations = collect($orgNames)->map(
            function ($name, $i) use (
                $governorateIds,
                $orgDescriptions,
                $contactPersons
            ) {
                $user = User::firstOrCreate(
                    ['email' => "org{$i}@demo.test"],
                    [
                        'organization_name' => $name,
                        'phone_number' => '09' . str_pad($i + 1, 8, '0', STR_PAD_LEFT),
                        'password' => Hash::make('password123'),
                        'email_verified_at' => now(),
                    ]
                );

                $user->forceFill([
                    'organization_name' => $name,
                    'password' => Hash::make('password123'),
                ])->save();

                $user->assignRole('organization');

                $status = match ($i) {
                    8 => OrganizationStatus::Pending,
                    9 => OrganizationStatus::Rejected,
                    default => OrganizationStatus::Verified,
                };

                return Organization::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'name' => $name,
                        'governorate_id' => $governorateIds[$i % count($governorateIds)],
                        'description' => $orgDescriptions[$i],
                        'contact_person' => $contactPersons[$i],
                        'website' => 'https://example.org',
                        'status' => $status,
                        'reviewed_at' => $status === OrganizationStatus::Pending
                            ? null
                            : now(),
                    ]
                );
            }
        );

        $volunteerNames = [
            ['Ahmad', 'Halabi'], ['Sara', 'Abdullah'], ['Youssef', 'Masri'],
            ['Lina', 'Shami'], ['Karim', 'Najjar'], ['Rahaf', 'Khatib'],
            ['Mohammad', 'Diab'], ['Nour', 'Hassan'], ['Omar', 'Qassem'],
            ['Yasmin', 'Ahmad'], ['Khaled', 'Saleh'], ['Reem', 'Sheikh'],
            ['Tarek', 'Ali'], ['Heba', 'Zaidan'], ['Samer', 'Youssef'],
            ['Dima', 'Jundi'], ['Wael', 'Hamdan'], ['Maya', 'Shehade'],
            ['Basel', 'Rifai'], ['Joud', 'Issa'], ['Rami', 'Kassem'],
            ['Layla', 'Homsi'], ['Fadi', 'Nasser'], ['Salma', 'Barakat'],
            ['Ziad', 'Mansour'], ['Hanan', 'Idlibi'], ['Nabil', 'Sarraf'],
            ['Rana', 'Akkad'], ['Hussam', 'Faris'], ['Ola', 'Turkmani'],
            ['Firas', 'Btaish'], ['Nadia', 'Homsi'],
        ];

        $educationLevels = ['High School', 'Diploma', "Bachelor's Degree"];

        $aboutTexts = [
            'Interested in community service and humanitarian activities.',
            'Active volunteer interested in education and youth initiatives.',
            'Interested in environmental and community development projects.',
            'Enjoys supporting local awareness and social initiatives.',
            'Interested in humanitarian work and supporting vulnerable communities.',
        ];

        $volunteers = collect($volunteerNames)->map(
            function ($nameParts, $i) use (
                $governorateIds,
                $skillIds,
                $educationLevels,
                $aboutTexts
            ) {
                [$first, $last] = $nameParts;

                $user = User::firstOrCreate(
                    ['email' => "volunteer{$i}@demo.test"],
                    [
                        'first_name' => $first,
                        'last_name' => $last,
                        'phone_number' => '09' . str_pad($i + 101, 8, '0', STR_PAD_LEFT),
                        'password' => Hash::make('password123'),
                        'email_verified_at' => now(),
                    ]
                );

                $user->forceFill([
                    'first_name' => $first,
                    'last_name' => $last,
                    'password' => Hash::make('password123'),
                ])->save();

                $user->assignRole('volunteer');

                $volunteer = Volunteer::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'gender' => $i % 2 === 0 ? 'male' : 'female',
                        'governorate_id' => $governorateIds[$i % count($governorateIds)],
                        'education_level' => $educationLevels[$i % count($educationLevels)],
                        'birth_date' => Carbon::now()
                            ->subYears(20 + ($i % 15))
                            ->format('Y-m-d'),
                        'about' => $aboutTexts[$i % count($aboutTexts)],
                    ]
                );

                $skillCount = min(3, count($skillIds));
                $start = $i % count($skillIds);

                $randomSkills = collect(range(0, $skillCount - 1))
                    ->map(fn ($offset) => $skillIds[($start + $offset) % count($skillIds)])
                    ->all();

                $volunteer->skills()->sync($randomSkills);

                return $volunteer;
            }
        );

        /*
         * 13 فرصة تجريبية: 7 مكتملة، 3 جارية، 3 مفتوحة للتسجيل.
         * جميع الفرص مرتبطة بالمنظمات الموثقة فقط.
         */
        $opportunityData = [
            ['title' => 'Food Aid Distribution', 'timing' => 'completed'],
            ['title' => 'Community Awareness Campaign', 'timing' => 'completed'],
            ['title' => 'Educational Support for Children', 'timing' => 'completed'],
            ['title' => 'Public Park Cleanup Campaign', 'timing' => 'completed'],
            ['title' => 'Winter Clothes Distribution', 'timing' => 'completed'],
            ['title' => 'Orphan Support Initiative', 'timing' => 'completed'],
            ['title' => 'Tree Planting Campaign', 'timing' => 'completed'],
            ['title' => 'Health Awareness Event', 'timing' => 'ongoing'],
            ['title' => 'Digital Literacy Workshop', 'timing' => 'ongoing'],
            ['title' => 'First Aid Training Workshop', 'timing' => 'ongoing'],
            ['title' => 'Elderly Assistance Program', 'timing' => 'open'],
            ['title' => 'Blood Donation Campaign', 'timing' => 'open'],
            ['title' => 'Ramadan Food Baskets Program', 'timing' => 'open'],
        ];

        $verifiedOrganizations = $organizations
            ->filter(fn ($organization) => $organization->status === OrganizationStatus::Verified)
            ->values();

        $opportunities = collect($opportunityData)->map(
            function ($data, $i) use (
                $verifiedOrganizations,
                $categoryIds,
                $governorateIds,
                $skillIds
            ) {
                $timing = $data['timing'];

                [$start, $end, $registerStart, $registerEnd] = match ($timing) {
                    'completed' => [
                        now()->subDays(25 - ($i * 2)),
                        now()->subDays(23 - ($i * 2)),
                        now()->subDays(40 - ($i * 2)),
                        now()->subDays(27 - ($i * 2)),
                    ],
                    'ongoing' => [
                        now()->subHours(2 + ($i * 2)),
                        now()->addHours(4 + $i),
                        now()->subDays(12),
                        now()->subDay(),
                    ],
                    'open' => [
                        now()->addDays(8 + $i),
                        now()->addDays(10 + $i),
                        now()->subDays(2),
                        now()->addDays(6 + $i),
                    ],
                };

                $organization = $verifiedOrganizations[$i % $verifiedOrganizations->count()];

                /*
                 * العنوان وحده هو مفتاح المطابقة (وليس العنوان+المنظمة) —
                 * يضمن عدم تكرار نفس الفرصة إطلاقاً حتى لو تغيّر منطق
                 * تعيين المنظمة مستقبلاً، بدل خطر إنشاء سجل جديد بنفس
                 * العنوان لمنظمة مختلفة.
                 */
                $opportunity = Opportunity::updateOrCreate(
                    ['title' => $data['title']],
                    [
                        'organization_id' => $organization->id,
                        'category_id' => $categoryIds[$i % count($categoryIds)],
                        'governorate_id' => $governorateIds[$i % count($governorateIds)],
                        'description' => 'A structured volunteering opportunity designed to support the local community through practical and supervised activities.',
                        'start_date' => $start,
                        'end_date' => $end,
                        'register_start_at' => $registerStart,
                        'register_end_at' => $registerEnd,
                        'min_hours' => 2,
                        'max_hours' => 6,
                        'total_hours' => 4,
                        'min_volunteers' => 3,
                        'max_volunteers' => 15,
                        'registration_closed_manually' => false,
                        'is_group' => true,
                    ]
                );

                $skillCount = min(2, count($skillIds));
                $startSkill = $i % count($skillIds);

                $opportunitySkills = collect(range(0, $skillCount - 1))
                    ->map(fn ($offset) => $skillIds[($startSkill + $offset) % count($skillIds)])
                    ->all();

                $opportunity->skills()->sync($opportunitySkills);

                $opportunity->setAttribute('_timing', $timing);

                return $opportunity;
            }
        );

        $this->seedParticipations($volunteers, $opportunities);

        $this->command->info(
            'تمت تعبئة بيانات العرض: '
            . $organizations->count() . ' منظمات، '
            . $volunteers->count() . ' متطوعين، '
            . $opportunities->count() . ' فرص، '
            . \App\Models\Participation::count() . ' مشاركة.'
        );
    }

    private function seedParticipations($volunteers, $opportunities): void
    {
        $completed = $opportunities->filter(fn ($o) => $o->_timing === 'completed')->values();
        $ongoing = $opportunities->filter(fn ($o) => $o->_timing === 'ongoing')->values();
        $open = $opportunities->filter(fn ($o) => $o->_timing === 'open')->values();

        foreach ($completed as $index => $opportunity) {
            $participants = [
                $volunteers[$index % $volunteers->count()],
                $volunteers[($index + 1) % $volunteers->count()],
                $volunteers[($index + 2) % $volunteers->count()],
                $volunteers[($index + 5) % $volunteers->count()],
            ];

            foreach ($participants as $participantIndex => $volunteer) {
                \App\Models\Participation::updateOrCreate(
                    ['opportunity_id' => $opportunity->id, 'volunteer_id' => $volunteer->user_id],
                    [
                        'status' => 'accepted',
                        'committed_hours' => $participantIndex === 0 ? 4 : 3,
                        'hours_logged' => $participantIndex === 0 ? 4 : 2 + ($participantIndex % 3),
                        'participated_at' => $opportunity->start_date,
                    ]
                );
            }

            if ($index === 1) {
                \App\Models\Participation::updateOrCreate(
                    ['opportunity_id' => $opportunity->id, 'volunteer_id' => $volunteers[10]->user_id],
                    [
                        'status' => 'withdrawn',
                        'committed_hours' => 3,
                        'hours_logged' => null,
                        'withdrawn_date' => $opportunity->start_date->copy()->subDays(2)->toDateString(),
                        'participated_at' => null,
                    ]
                );
            }

            if ($index === 2) {
                \App\Models\Participation::updateOrCreate(
                    ['opportunity_id' => $opportunity->id, 'volunteer_id' => $volunteers[20]->user_id],
                    [
                        'status' => 'rejected',
                        'committed_hours' => 3,
                        'hours_logged' => null,
                        'rejection_reason' => 'The volunteer limit was reached before the request was reviewed.',
                        'participated_at' => null,
                    ]
                );
            }
        }

        foreach ($ongoing as $index => $opportunity) {
            $accepted = [
                $volunteers[8 + ($index * 2)],
                $volunteers[9 + ($index * 2)],
                $volunteers[15 + $index],
            ];

            foreach ($accepted as $volunteer) {
                \App\Models\Participation::updateOrCreate(
                    ['opportunity_id' => $opportunity->id, 'volunteer_id' => $volunteer->user_id],
                    [
                        'status' => 'accepted',
                        'committed_hours' => 4,
                        'hours_logged' => null,
                        'participated_at' => now()->subHours(1),
                    ]
                );
            }

            \App\Models\Participation::updateOrCreate(
                ['opportunity_id' => $opportunity->id, 'volunteer_id' => $volunteers[20 + $index]->user_id],
                [
                    'status' => 'pending',
                    'committed_hours' => 3,
                    'hours_logged' => null,
                    'participated_at' => null,
                ]
            );

            if ($index === 0) {
                \App\Models\Participation::updateOrCreate(
                    ['opportunity_id' => $opportunity->id, 'volunteer_id' => $volunteers[25]->user_id],
                    [
                        'status' => 'withdrawn',
                        'committed_hours' => 4,
                        'hours_logged' => null,
                        'withdrawn_date' => now()->subDay()->toDateString(),
                        'participated_at' => null,
                    ]
                );
            }
        }

        foreach ($open as $index => $opportunity) {
            $pendingVolunteers = [
                $volunteers[4 + ($index * 3)],
                $volunteers[11 + ($index * 2)],
            ];

            foreach ($pendingVolunteers as $volunteer) {
                \App\Models\Participation::updateOrCreate(
                    ['opportunity_id' => $opportunity->id, 'volunteer_id' => $volunteer->user_id],
                    [
                        'status' => 'pending',
                        'committed_hours' => 3,
                        'hours_logged' => null,
                        'participated_at' => null,
                    ]
                );
            }

            $acceptedVolunteer = $volunteers[18 + $index];

            \App\Models\Participation::updateOrCreate(
                ['opportunity_id' => $opportunity->id, 'volunteer_id' => $acceptedVolunteer->user_id],
                [
                    'status' => 'accepted',
                    'committed_hours' => 3,
                    'hours_logged' => null,
                    'participated_at' => null,
                ]
            );

            $rejectedVolunteer = $volunteers[28 + $index];

            \App\Models\Participation::updateOrCreate(
                ['opportunity_id' => $opportunity->id, 'volunteer_id' => $rejectedVolunteer->user_id],
                [
                    'status' => 'rejected',
                    'committed_hours' => 3,
                    'hours_logged' => null,
                    'rejection_reason' => 'The volunteer limit was reached before the request was reviewed.',
                    'participated_at' => null,
                ]
            );
        }
    }
}