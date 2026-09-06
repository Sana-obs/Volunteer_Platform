<?php

namespace Database\Seeders;

use App\Enum\OrganizationStatus;
use App\Models\Category;
use App\Models\Governorate;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\Participation;
use App\Models\Skill;
use App\Models\User;
use App\Models\Volunteer;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    private const ORG_COUNT = 40;
    private const VOLUNTEER_COUNT = 50;

    private int $opportunitiesPerGovernorate;

    private string $hashedPassword;

    private const SEED_IMAGES = true;

    private const AVATAR_IMAGES_COUNT = 18;
    private const LOGO_IMAGES_COUNT = 10;
    private const COVER_IMAGES_COUNT = 12;

    private const DEMO_PASSWORD = 'password123';

    public function __construct()
    {
        $this->opportunitiesPerGovernorate = (int) env('DEMO_SEED_SIZE', 14);
        $this->hashedPassword = Hash::make(self::DEMO_PASSWORD);
    }

    public function run(): void
    {
        $faker = Faker::create();

        $governorates = Governorate::pluck('name_en', 'id');
        $governorateIds = $governorates->keys()->all();
        $categoryIds = Category::pluck('id')->all();
        $skillIds = Skill::pluck('id')->all();

        if (
            empty($governorateIds) ||
            empty($categoryIds) ||
            empty($skillIds)
        ) {
            $this->command->warn(
                'يجب تشغيل السيدرز الأساسية أولاً باستخدام php artisan db:seed.'
            );

            return;
        }

        $organizations = $this->seedOrganizations(
            $governorateIds,
            $faker
        );

        $volunteers = $this->seedVolunteers(
            $governorateIds,
            $skillIds,
            $faker
        );

        $opportunities = $this->seedOpportunities(
            $organizations,
            $governorates,
            $categoryIds,
            $skillIds
        );

        $this->seedParticipations(
            $volunteers,
            $opportunities
        );

        $this->command->info(
            'تمت تعبئة بيانات العرض: '
            . $organizations->count() . ' منظمات، '
            . $volunteers->count() . ' متطوعين، '
            . $opportunities->count() . ' فرص، '
            . Participation::count() . ' مشاركة.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Organizations
    |--------------------------------------------------------------------------
    */

    private function seedOrganizations(
        array $governorateIds,
        $faker
    ): Collection {
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

        $additionalOrgNames = [
            'Amal Volunteers Network',
            'Bridge for Community Development',
            'Hope and Harmony Foundation',
            'United Hands Relief',
            'Sanad Humanitarian Organization',
            'Karama Association for Social Care',
            'Green Roots Environmental Initiative',
            'Baraem Child Development Society',
            'Watan Foundation for Development',
            'Salam Community Support Center',
            'Rafah Relief and Development Association',
            'Bayt al-Khair Charity Organization',
            'Nahda Youth Empowerment Society',
            'Masar for Education and Training',
            'Yasmin Women Support Network',
            'Ata Foundation for Humanitarian Aid',
            'Rahma Medical Relief Society',
            'Tanmiya Local Development Association',
            'Ru\'ya Association for the Visually Impaired',
            'Ihtiwa Inclusion and Disability Support',
            'Manabaa Clean Water Initiative',
            'Ghars Reforestation Collective',
            'Diyar Community Solidarity Fund',
            'Noor al-Ilm Educational Support Society',
            'Jusoor Refugee Assistance Network',
            'Wafaa Elderly Care Association',
            'Takaful Family Welfare Organization',
            'Bina\'a Reconstruction and Livelihoods Initiative',
            'Sadaqa Food Security Program',
            'Iradah Vocational Skills Foundation',
            'Mawaddah Social Cohesion Center',
            'Anwar Community Health Society',
            'Durub Rural Development Association',
            'Kanaf Orphan Sponsorship Foundation',
            'Fajr Emergency Response Team',
            'Nama\'a Agricultural Cooperative Support',
            'Wisal Community Volunteering Hub',
            'Ihsan Neighborhood Aid Society',
            'Ufuq Civic Participation Initiative',
            'Shorouk Relief and Recovery Foundation',
        ];

        $additionalOrgDescriptions = [
            'Volunteer-led organization delivering relief, awareness, and community support programs at the local level.',
            'Development organization working on education, livelihoods, and youth empowerment in under-served areas.',
            'Humanitarian association supporting vulnerable families through emergency aid and long-term recovery projects.',
            'Community organization focused on social care, inclusion, and volunteer mobilization.',
            'Environmental initiative promoting reforestation, clean water, and sustainable local practices.',
            'Charity association providing food security, seasonal aid, and support to orphaned children.',
            'Organization dedicated to health awareness, first aid training, and access to medical services.',
            'Association supporting women and youth with vocational training and small-income opportunities.',
            'Local development group improving public spaces, schools, and essential community services.',
            'Humanitarian network coordinating volunteers for rapid response and neighborhood assistance.',
            'Organization supporting people with disabilities and the elderly through inclusive community programs.',
            'Civic organization strengthening community participation, solidarity, and volunteer engagement.',
        ];

        return collect(range(0, self::ORG_COUNT - 1))->map(
            function ($i) use (
                $governorateIds,
                $orgNames,
                $orgDescriptions,
                $contactPersons,
                $additionalOrgNames,
                $additionalOrgDescriptions,
                $faker
            ) {
                if ($i < count($orgNames)) {
                    $name = $orgNames[$i];
                    $description = $orgDescriptions[$i];
                    $contactPerson = $contactPersons[$i];
                } elseif ($i - count($orgNames) < count($additionalOrgNames)) {
                    $extraIndex = $i - count($orgNames);

                    $name = $additionalOrgNames[$extraIndex];

                    $description = $additionalOrgDescriptions[
                        $extraIndex % count($additionalOrgDescriptions)
                    ];

                    $contactPerson = $faker->name();
                } else {
                    $name = $faker->company() . ' for ' . $faker->randomElement([
                        'Relief and Development',
                        'Community Support',
                        'Education',
                        'Humanitarian Aid',
                        'Social Development',
                    ]);

                    $description = $faker->sentence(15);
                    $contactPerson = $faker->name();
                }

                $user = User::firstOrCreate(
                    [
                        'email' => "org{$i}@demo.test",
                    ],
                    [
                        'organization_name' => $name,
                        'phone_number' => '09' . str_pad(
                            $i + 1,
                            8,
                            '0',
                            STR_PAD_LEFT
                        ),
                        'password' => $this->hashedPassword,
                        'email_verified_at' => now(),
                    ]
                );

                $user->forceFill([
                    'organization_name' => $name,
                    'password' => $this->hashedPassword,
                ])->save();

                if (! $user->hasRole('organization')) {
                    $user->assignRole('organization');
                }

                $status = match ($i % 10) {
                    8 => OrganizationStatus::Pending,
                    9 => OrganizationStatus::Rejected,
                    default => OrganizationStatus::Verified,
                };

                $organization = Organization::updateOrCreate(
                    [
                        'user_id' => $user->id,
                    ],
                    [
                        'name' => $name,
                        'governorate_id' => $governorateIds[
                            $i % count($governorateIds)
                        ],
                        'description' => $description,
                        'contact_person' => $contactPerson,
                        'website' => 'https://example.org',
                        'status' => $status,
                        'reviewed_at' =>
                            $status === OrganizationStatus::Pending
                                ? null
                                : now(),
                    ]
                );

                if (self::SEED_IMAGES && $i < 10) {
                    $this->attachImage(
                        $organization,
                        'profile_image',
                        $this->localImagePath(
                            'logos',
                            'logo',
                            $i,
                            self::LOGO_IMAGES_COUNT
                        )
                    );
                }

                return $organization;
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Volunteers
    |--------------------------------------------------------------------------
    */

    private function seedVolunteers(
        array $governorateIds,
        array $skillIds,
        $faker
    ): Collection {
        $volunteerNames = [
            ['Ahmad', 'Halabi'],
            ['Sara', 'Abdullah'],
            ['Youssef', 'Masri'],
            ['Lina', 'Shami'],
            ['Karim', 'Najjar'],
            ['Rahaf', 'Khatib'],
            ['Mohammad', 'Diab'],
            ['Nour', 'Hassan'],
            ['Omar', 'Qassem'],
            ['Yasmin', 'Ahmad'],
            ['Khaled', 'Saleh'],
            ['Reem', 'Sheikh'],
            ['Tarek', 'Ali'],
            ['Heba', 'Zaidan'],
            ['Samer', 'Youssef'],
            ['Dima', 'Jundi'],
            ['Wael', 'Hamdan'],
            ['Maya', 'Shehade'],
            ['Basel', 'Rifai'],
            ['Joud', 'Issa'],
            ['Rami', 'Kassem'],
            ['Layla', 'Homsi'],
            ['Fadi', 'Nasser'],
            ['Salma', 'Barakat'],
            ['Ziad', 'Mansour'],
            ['Hanan', 'Idlibi'],
            ['Nabil', 'Sarraf'],
            ['Rana', 'Akkad'],
            ['Hussam', 'Faris'],
            ['Ola', 'Turkmani'],
            ['Firas', 'Btaish'],
            ['Nadia', 'Homsi'],
        ];

        $educationLevels = [
            'High School',
            'Diploma',
            "Bachelor's Degree",
        ];

        $aboutTexts = [
            'Interested in community service and humanitarian activities.',
            'Active volunteer interested in education and youth initiatives.',
            'Interested in environmental and community development projects.',
            'Enjoys supporting local awareness and social initiatives.',
            'Interested in humanitarian work and supporting vulnerable communities.',
        ];

        return collect(range(0, self::VOLUNTEER_COUNT - 1))->map(
            function ($i) use (
                $governorateIds,
                $skillIds,
                $educationLevels,
                $aboutTexts,
                $volunteerNames,
                $faker
            ) {
                if ($i < count($volunteerNames)) {
                    [$first, $last] = $volunteerNames[$i];
                } else {
                    $first = $faker->firstName();
                    $last = $faker->lastName();
                }

                $user = User::firstOrCreate(
                    [
                        'email' => "volunteer{$i}@demo.test",
                    ],
                    [
                        'first_name' => $first,
                        'last_name' => $last,
                        'phone_number' => '09' . str_pad(
                            $i + 101,
                            8,
                            '0',
                            STR_PAD_LEFT
                        ),
                        'password' => $this->hashedPassword,
                        'email_verified_at' => now(),
                    ]
                );

                $user->forceFill([
                    'first_name' => $first,
                    'last_name' => $last,
                    'password' => $this->hashedPassword,
                ])->save();

                if (! $user->hasRole('volunteer')) {
                    $user->assignRole('volunteer');
                }

                $volunteer = Volunteer::updateOrCreate(
                    [
                        'user_id' => $user->id,
                    ],
                    [
                        'gender' => $i % 2 === 0
                            ? 'male'
                            : 'female',
                        'governorate_id' => $governorateIds[
                            $i % count($governorateIds)
                        ],
                        'education_level' =>
                            $educationLevels[
                                $i % count($educationLevels)
                            ],
                        'birth_date' => Carbon::now()
                            ->subYears(20 + ($i % 15))
                            ->format('Y-m-d'),
                        'about' => $aboutTexts[
                            $i % count($aboutTexts)
                        ],
                    ]
                );

                if ($i === 0) {
                    $teachingSkillId = Skill::where(
                        'name',
                        'Teaching'
                    )->value('id');

                    $firstAidSkillId = Skill::where(
                        'name',
                        'First Aid'
                    )->value('id');

                    $volunteer->skills()->sync(
                        array_values(
                            array_filter([
                                $teachingSkillId,
                                $firstAidSkillId,
                            ])
                        )
                    );
                } else {
                    $skillCount = min(3, count($skillIds));
                    $start = $i % count($skillIds);

                    $randomSkills = collect(
                        range(0, $skillCount - 1)
                    )
                        ->map(
                            fn ($offset) =>
                                $skillIds[
                                    ($start + $offset) % count($skillIds)
                                ]
                        )
                        ->all();

                    $volunteer->skills()->sync($randomSkills);
                }

                if (self::SEED_IMAGES && $i < 36) {
                    $this->attachImage(
                        $volunteer,
                        'profile_photo',
                        $this->localImagePath(
                            'avatars',
                            'avatar',
                            $i,
                            self::AVATAR_IMAGES_COUNT
                        )
                    );
                }

                return $volunteer;
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Opportunities
    |--------------------------------------------------------------------------
    */

    private function seedOpportunities(
        Collection $organizations,
        Collection $governorates,
        array $categoryIds,
        array $skillIds
    ): Collection {
        $verifiedOrganizations = $organizations
            ->filter(
                fn ($organization) =>
                    $organization->status === OrganizationStatus::Verified
            )
            ->values();

        $activityTemplates = [
            'Community Awareness Campaign',
            'Emergency Relief Support',
            'Youth Empowerment Workshop',
            'Winter Clothes Distribution',
            'Food Aid Distribution',
            'Health Awareness Event',
            'Tree Planting Campaign',
            'Digital Literacy Workshop',
            'First Aid Training Workshop',
            'Blood Donation Campaign',
            'Ramadan Food Baskets Program',
            'Orphan Support Initiative',
            'Public Park Cleanup Campaign',
            'Women Empowerment Session',
            'Clean Water Initiative',
            'Disability Support Program',
            'School Supplies Distribution',
            'Community Garden Project',
            'Elderly Assistance Program',
            'Educational Support for Children',
        ];

        $allOpportunities = collect();

        $governorateIds = $governorates->keys()->all();
        $govCount = count($governorateIds);
        $skillCount = count($skillIds);
        $globalIndex = 0;

        $teachingSkillId = Skill::where(
            'name',
            'Teaching'
        )->value('id');

        $firstAidSkillId = Skill::where(
            'name',
            'First Aid'
        )->value('id');

        $volunteerSkillWindow = [];

        for ($vi = 0; $vi < self::VOLUNTEER_COUNT; $vi++) {
            if ($vi === 0) {
                $volunteerSkillWindow[$vi] =
                    array_values(
                        array_filter([
                            $teachingSkillId,
                            $firstAidSkillId,
                        ])
                    );

                continue;
            }

            $s = $vi % $skillCount;

            $volunteerSkillWindow[$vi] = [
                $skillIds[$s],
                $skillIds[($s + 1) % $skillCount],
                $skillIds[($s + 2) % $skillCount],
            ];
        }

        foreach ($governorateIds as $govPosition => $governorateId) {
            $residentVolunteerIndices = [];

            for (
                $vi = $govPosition;
                $vi < self::VOLUNTEER_COUNT;
                $vi += $govCount
            ) {
                $residentVolunteerIndices[] = $vi;
            }

            $cityVolunteerSkillPool = [];
            $maxWindow = 0;

            foreach ($residentVolunteerIndices as $ri) {
                $maxWindow = max(
                    $maxWindow,
                    count($volunteerSkillWindow[$ri] ?? [])
                );
            }

            for ($slot = 0; $slot < $maxWindow; $slot++) {
                foreach ($residentVolunteerIndices as $ri) {
                    if (
                        isset(
                            $volunteerSkillWindow[$ri][$slot]
                        )
                    ) {
                        $cityVolunteerSkillPool[] =
                            $volunteerSkillWindow[$ri][$slot];
                    }
                }
            }

            $governorateName =
                $governorates[$governorateId];

            if ($govPosition === 0) {
                $allOpportunities =
                    $allOpportunities->merge(
                        $this->seedMatchingTestOpportunities(
                            $verifiedOrganizations,
                            $categoryIds,
                            $skillIds,
                            $governorateId
                        )
                    );

                $bulkCount =
                    $this->opportunitiesPerGovernorate - 13 >= 10
                        ? $this->opportunitiesPerGovernorate - 13
                        : $this->opportunitiesPerGovernorate;
            } else {
                $bulkCount =
                    $this->opportunitiesPerGovernorate;
            }

            $completedCount =
                (int) round($bulkCount * 0.34);

            $ongoingCount =
                (int) round($bulkCount * 0.24);

            for ($j = 0; $j < $bulkCount; $j++) {
                $timing = match (true) {
                    $j < $completedCount => 'completed',

                    $j < $completedCount + $ongoingCount =>
                        'ongoing',

                    default => 'open',
                };

                $cycle =
                    intdiv(
                        $j,
                        count($activityTemplates)
                    ) + 1;

                $template =
                    $activityTemplates[
                        $j % count($activityTemplates)
                    ];

                $title =
                    "{$governorateName} - {$template}"
                    . ($cycle > 1
                        ? " #{$cycle}"
                        : '');

                [
                    $start,
                    $end,
                    $registerStart,
                    $registerEnd
                ] = $this->timingDates(
                    $timing,
                    $j
                );

                $organization =
                    $verifiedOrganizations[
                        $globalIndex %
                        $verifiedOrganizations->count()
                    ];

                if (
                    $timing === 'open'
                    && ! empty($cityVolunteerSkillPool)
                ) {
                    $openRank =
                        $j -
                        $completedCount -
                        $ongoingCount;

                    $poolSize =
                        count($cityVolunteerSkillPool);

                    $opportunitySkills =
                        array_values(
                            array_unique([
                                $cityVolunteerSkillPool[
                                    $openRank % $poolSize
                                ],
                                $cityVolunteerSkillPool[
                                    ($openRank + 1) % $poolSize
                                ],
                            ])
                        );
                } else {
                    $skillStart =
                        $globalIndex % $skillCount;

                    $opportunitySkills =
                        collect(
                            range(
                                0,
                                min(1, $skillCount - 1)
                            )
                        )
                            ->map(
                                fn ($offset) =>
                                    $skillIds[
                                        ($skillStart + $offset)
                                        % $skillCount
                                    ]
                            )
                            ->all();
                }

                $maxHours = 6 + ($j % 4);

                $opportunity =
                    Opportunity::updateOrCreate(
                        [
                            'title' => $title,
                        ],
                        [
                            'organization_id' =>
                                $organization->id,

                            'category_id' =>
                                $categoryIds[
                                    $globalIndex %
                                    count($categoryIds)
                                ],

                            'governorate_id' =>
                                $governorateId,

                            'description' =>
                                $this->descriptionFor(
                                    $template,
                                    $globalIndex
                                ),

                            'start_date' => $start,
                            'end_date' => $end,

                            'register_start_at' =>
                                $registerStart,

                            'register_end_at' =>
                                $registerEnd,

                            'min_hours' => 2,
                            'max_hours' => $maxHours,

                            'total_hours' =>
                                $maxHours +
                                20 +
                                ($j % 10),

                            'min_volunteers' =>
                                3 + ($j % 3),

                            'max_volunteers' =>
                                15 + ($j % 10),

                            'registration_closed_manually' =>
                                false,

                            'is_group' => true,
                        ]
                    );

                $opportunity->skills()->sync(
                    $opportunitySkills
                );

                $opportunity->setAttribute(
                    '_timing',
                    $timing
                );

                if (
                    self::SEED_IMAGES
                    && $globalIndex % 3 === 0
                ) {
                    $this->attachImage(
                        $opportunity,
                        'opportunity_image',
                        $this->localImagePath(
                            'covers',
                            'cover',
                            $globalIndex,
                            self::COVER_IMAGES_COUNT
                        )
                    );
                }

                $allOpportunities->push(
                    $opportunity
                );

                $globalIndex++;
            }
        }

        return $allOpportunities;
    }

    /*
    |--------------------------------------------------------------------------
    | Matching Test Opportunities
    |--------------------------------------------------------------------------
    */

    private function seedMatchingTestOpportunities(
        Collection $verifiedOrganizations,
        array $categoryIds,
        array $skillIds,
        int $firstGovernorateId
    ): Collection {
        $opportunityData = [
            [
                'title' => 'Food Aid Distribution',
                'timing' => 'completed',
                'match_test' => 'city_and_skills',
            ],
            [
                'title' => 'Community Awareness Campaign',
                'timing' => 'completed',
                'match_test' => 'city_only',
            ],
            [
                'title' => 'Educational Support for Children',
                'timing' => 'completed',
                'match_test' => 'skills_only',
            ],
            [
                'title' => 'Public Park Cleanup Campaign',
                'timing' => 'completed',
                'match_test' => 'no_match',
            ],
            [
                'title' => 'Winter Clothes Distribution',
                'timing' => 'completed',
                'match_test' => null,
            ],
            [
                'title' => 'Orphan Support Initiative',
                'timing' => 'completed',
                'match_test' => null,
            ],
            [
                'title' => 'Tree Planting Campaign',
                'timing' => 'completed',
                'match_test' => null,
            ],
            [
                'title' => 'Health Awareness Event',
                'timing' => 'ongoing',
                'match_test' => null,
            ],
            [
                'title' => 'Digital Literacy Workshop',
                'timing' => 'ongoing',
                'match_test' => null,
            ],
            [
                'title' => 'First Aid Training Workshop',
                'timing' => 'ongoing',
                'match_test' => null,
            ],
            [
                'title' => 'Elderly Assistance Program',
                'timing' => 'open',
                'match_test' => null,
            ],
            [
                'title' => 'Blood Donation Campaign',
                'timing' => 'open',
                'match_test' => null,
            ],
            [
                'title' => 'Ramadan Food Baskets Program',
                'timing' => 'open',
                'match_test' => null,
            ],
        ];

        $allGovernorateIds =
            Governorate::pluck('id')->all();

        return collect($opportunityData)->map(
            function ($data, $i) use (
                $verifiedOrganizations,
                $categoryIds,
                $skillIds,
                $firstGovernorateId,
                $allGovernorateIds
            ) {
                $timing = $data['timing'];
                $matchTest = $data['match_test'];

                [$start, $end, $registerStart, $registerEnd] =
                    match ($timing) {
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

                $organization =
                    $verifiedOrganizations[
                        $i %
                        $verifiedOrganizations->count()
                    ];

                if ($i === 10) {
                    $governorateId =
                        $firstGovernorateId;

                    $teachingSkillId =
                        Skill::where(
                            'name',
                            'Teaching'
                        )->value('id');

                    $firstAidSkillId =
                        Skill::where(
                            'name',
                            'First Aid'
                        )->value('id');

                    $opportunitySkills =
                        array_values(
                            array_filter([
                                $teachingSkillId,
                                $firstAidSkillId,
                            ])
                        );
                } else {
                    $governorateId =
                        match ($matchTest) {
                            'city_and_skills',
                            'city_only' =>
                                $firstGovernorateId,

                            'skills_only',
                            'no_match' =>
                                $allGovernorateIds[
                                    1 %
                                    count($allGovernorateIds)
                                ],

                            default =>
                                $allGovernorateIds[
                                    $i %
                                    count($allGovernorateIds)
                                ],
                        };

                    $opportunitySkills =
                        match ($matchTest) {
                            'city_and_skills',
                            'skills_only' =>
                                [
                                    $skillIds[0],
                                    $skillIds[1],
                                ],

                            'city_only',
                            'no_match' => [
                                $skillIds[
                                    3 %
                                    count($skillIds)
                                ],
                                $skillIds[
                                    4 %
                                    count($skillIds)
                                ],
                            ],

                            default =>
                                collect(
                                    range(
                                        0,
                                        min(
                                            1,
                                            count($skillIds) - 1
                                        )
                                    )
                                )
                                    ->map(
                                        fn ($offset) =>
                                            $skillIds[
                                                ($i + $offset)
                                                % count($skillIds)
                                            ]
                                    )
                                    ->all(),
                        };
                }

                $opportunity =
                    Opportunity::updateOrCreate(
                        [
                            'title' => $data['title'],
                        ],
                        [
                            'organization_id' =>
                                $organization->id,

                            'category_id' =>
                                $categoryIds[
                                    $i %
                                    count($categoryIds)
                                ],

                            'governorate_id' =>
                                $governorateId,

                            'description' =>
                                $this->descriptionFor(
                                    $data['title'],
                                    $i
                                ),

                            'start_date' => $start,
                            'end_date' => $end,

                            'register_start_at' =>
                                $registerStart,

                            'register_end_at' =>
                                $registerEnd,

                            'min_hours' => 2,
                            'max_hours' => 6,
                            'total_hours' => 40,

                            'min_volunteers' => 3,
                            'max_volunteers' => 15,

                            'registration_closed_manually' =>
                                false,

                            'is_group' => true,
                        ]
                    );

                $opportunity->skills()->sync(
                    $opportunitySkills
                );

                $opportunity->setAttribute(
                    '_timing',
                    $timing
                );

                if (
                    self::SEED_IMAGES
                    && $i % 3 === 0
                ) {
                    $this->attachImage(
                        $opportunity,
                        'opportunity_image',
                        $this->localImagePath(
                            'covers',
                            'cover',
                            $i,
                            self::COVER_IMAGES_COUNT
                        )
                    );
                }

                return $opportunity;
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Descriptions
    |--------------------------------------------------------------------------
    */

    private function activityDescriptions(): array
    {
        return [
            'Community Awareness Campaign' => [
                'Volunteers run awareness sessions and hand out informational materials so residents understand the local services and support available to them.',
                'Volunteers organise neighbourhood talks and door-to-door outreach on health, safety, and social rights.',
            ],

            'Emergency Relief Support' => [
                'Volunteers sort, pack, and hand out emergency supplies to families affected by recent crises.',
                'Volunteers assist rapid-response teams with registration, logistics, and distribution of relief items to displaced households.',
            ],

            'Youth Empowerment Workshop' => [
                'Volunteers facilitate interactive workshops that build leadership, teamwork, and communication skills among local youth.',
                'Volunteers mentor young participants through practical sessions on goal-setting, employability, and civic engagement.',
            ],

            'Winter Clothes Distribution' => [
                'Volunteers sort donated winter clothing by size and distribute coats, blankets, and boots to families before the cold season.',
                'Volunteers assemble and hand out warm clothing packages to children and elderly residents in under-served neighbourhoods.',
            ],

            'Food Aid Distribution' => [
                'Volunteers help pack and distribute food parcels to families in need across the local community.',
                'Volunteers assemble monthly food baskets and deliver them to households facing food insecurity.',
            ],

            'Health Awareness Event' => [
                'Volunteers support free health-screening stations and share guidance on nutrition, hygiene, and preventive care.',
                'Volunteers assist medical staff at a community health fair with registration, crowd flow, and awareness materials.',
            ],

            'Tree Planting Campaign' => [
                'Volunteers plant trees and maintain green spaces to support local environmental restoration efforts.',
                'Volunteers prepare soil, plant seedlings, and set up irrigation to expand green cover in public areas.',
            ],

            'Digital Literacy Workshop' => [
                'Volunteers teach basic computer and internet skills to community members with limited digital access.',
                'Volunteers guide participants through email, online public services, and safe browsing in hands-on lab sessions.',
            ],

            'First Aid Training Workshop' => [
                'Volunteers assist certified trainers in teaching CPR, wound care, and emergency response to community members.',
                'Volunteers run practical first-aid stations where participants practise bandaging, the recovery position, and emergency calls.',
            ],

            'Blood Donation Campaign' => [
                'Volunteers support blood drive logistics, registration, and donor care alongside medical staff.',
                'Volunteers manage donor scheduling, refreshments, and post-donation monitoring throughout the campaign.',
            ],

            'Ramadan Food Baskets Program' => [
                'Volunteers assemble and deliver Ramadan food baskets of staples and fresh items to families before iftar.',
                'Volunteers coordinate donations, pack iftar boxes, and distribute them across neighbourhoods during Ramadan.',
            ],

            'Orphan Support Initiative' => [
                'Volunteers organise tutoring, recreational activities, and mentoring sessions for orphaned children.',
                'Volunteers plan educational outings and one-to-one support to help orphaned children build confidence and skills.',
            ],

            'Public Park Cleanup Campaign' => [
                'Volunteers collect litter, clear pathways, and restore seating areas to make the local park safe and welcoming.',
                'Volunteers remove waste, sort recyclables, and repaint fixtures during a full-day park restoration drive.',
            ],

            'Women Empowerment Session' => [
                'Volunteers facilitate sessions on financial literacy, small-business basics, and personal development for women.',
                'Volunteers lead peer-support workshops that help women build professional networks and practical income skills.',
            ],

            'Clean Water Initiative' => [
                'Volunteers help install and maintain household water filters and teach families safe storage and hygiene.',
                'Volunteers support the setup of community water points and run awareness sessions on preventing waterborne disease.',
            ],

            'Disability Support Program' => [
                'Volunteers assist participants with mobility, communication, and daily activities during inclusive community sessions.',
                'Volunteers help run adapted recreational and learning activities for children and adults with disabilities.',
            ],

            'School Supplies Distribution' => [
                'Volunteers pack and hand out backpacks, stationery, and books to students ahead of the new school year.',
                'Volunteers sort donated supplies and prepare individual kits for pupils in under-resourced schools.',
            ],

            'Community Garden Project' => [
                'Volunteers build raised beds, plant vegetables, and set up composting for a shared neighbourhood garden.',
                'Volunteers tend seasonal crops and run gardening sessions that supply fresh produce to local families.',
            ],

            'Elderly Assistance Program' => [
                'Volunteers provide companionship, help with errands, and support home visits for elderly residents living alone.',
                'Volunteers organise social gatherings and assist older adults with shopping, paperwork, and light household tasks.',
            ],

            'Educational Support for Children' => [
                'Volunteers run after-school tutoring in core subjects and help children catch up on missed learning.',
                'Volunteers lead small-group reading and maths sessions to strengthen foundational skills for primary students.',
            ],
        ];
    }

    private function descriptionFor(
        string $activity,
        int $variant
    ): string {
        $options =
            $this->activityDescriptions()[$activity]
            ?? null;

        if (empty($options)) {
            return 'A structured volunteering opportunity designed to support the local community through practical and supervised activities.';
        }

        return $options[
            abs($variant) % count($options)
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Timing
    |--------------------------------------------------------------------------
    */

    private function timingDates(
        string $timing,
        int $j
    ): array {
        return match ($timing) {
            'completed' => [
                now()->subDays(30 + ($j % 60)),
                now()->subDays(28 + ($j % 60)),
                now()->subDays(45 + ($j % 60)),
                now()->subDays(32 + ($j % 60)),
            ],

            'ongoing' => [
                now()->subHours(2 + ($j % 10)),
                now()->addHours(4 + ($j % 10)),
                now()->subDays(12),
                now()->subDay(),
            ],

            'open' => [
                now()->addDays(8 + ($j % 20)),
                now()->addDays(10 + ($j % 20)),
                now()->subDays(2),
                now()->addDays(6 + ($j % 20)),
            ],
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Participations
    |--------------------------------------------------------------------------
    */

    private function seedParticipations(
        Collection $volunteers,
        Collection $opportunities
    ): void {
        $completed =
            $opportunities
                ->filter(
                    fn ($o) =>
                        $o->_timing === 'completed'
                )
                ->values();

        $ongoing =
            $opportunities
                ->filter(
                    fn ($o) =>
                        $o->_timing === 'ongoing'
                )
                ->values();

        $open =
            $opportunities
                ->filter(
                    fn ($o) =>
                        $o->_timing === 'open'
                )
                ->values();

        foreach ($completed as $opportunity) {
            $participants =
                $volunteers->random(
                    min(4, $volunteers->count())
                );

            foreach (
                $participants as
                $participantIndex => $volunteer
            ) {
                $committed =
                    $this->participationHours(
                        $volunteer->user_id,
                        $opportunity->id,
                        $participantIndex
                    );

                Participation::updateOrCreate(
                    [
                        'opportunity_id' =>
                            $opportunity->id,

                        'volunteer_id' =>
                            $volunteer->user_id,
                    ],
                    [
                        'status' => 'accepted',
                        'committed_hours' => $committed,
                        'hours_logged' => $committed,
                        'participated_at' =>
                            $opportunity->start_date,
                    ]
                );
            }
        }

        $this->attachFixedScenario(
            $completed->firstWhere(
                'title',
                'Community Awareness Campaign'
            ),
            $volunteers->get(10),
            'withdrawn'
        );

        $this->attachFixedScenario(
            $completed->firstWhere(
                'title',
                'Educational Support for Children'
            ),
            $volunteers->get(20),
            'rejected'
        );

        foreach ($ongoing as $opportunity) {
            $accepted =
                $volunteers->random(
                    min(3, $volunteers->count())
                );

            foreach (
                $accepted as $slot => $volunteer
            ) {
                Participation::updateOrCreate(
                    [
                        'opportunity_id' =>
                            $opportunity->id,

                        'volunteer_id' =>
                            $volunteer->user_id,
                    ],
                    [
                        'status' => 'accepted',

                        'committed_hours' =>
                            $this->participationHours(
                                $volunteer->user_id,
                                $opportunity->id,
                                $slot
                            ),

                        'hours_logged' => null,
                        'participated_at' =>
                            now()->subHours(1),
                    ]
                );
            }

            $pending =
                $volunteers
                    ->diff($accepted)
                    ->random(1)
                    ->first();

            Participation::updateOrCreate(
                [
                    'opportunity_id' =>
                        $opportunity->id,

                    'volunteer_id' =>
                        $pending->user_id,
                ],
                [
                    'status' => 'pending',

                    'committed_hours' =>
                        $this->participationHours(
                            $pending->user_id,
                            $opportunity->id,
                            5
                        ),

                    'hours_logged' => null,
                    'participated_at' => null,
                ]
            );
        }

        if ($ongoing->isNotEmpty()) {
            $this->attachFixedScenario(
                $ongoing->first(),
                $volunteers->get(25),
                'withdrawn',
                now()
            );
        }

        foreach ($open as $opportunity) {
            $picked =
                $volunteers->random(
                    min(4, $volunteers->count())
                );

            [
                $pendingOne,
                $pendingTwo,
                $accepted,
                $rejected
            ] = [
                $picked->get(0),
                $picked->get(1),
                $picked->get(2),
                $picked->get(3),
            ];

            foreach (
                [$pendingOne, $pendingTwo]
                as $slot => $volunteer
            ) {
                if (! $volunteer) {
                    continue;
                }

                Participation::updateOrCreate(
                    [
                        'opportunity_id' =>
                            $opportunity->id,

                        'volunteer_id' =>
                            $volunteer->user_id,
                    ],
                    [
                        'status' => 'pending',

                        'committed_hours' =>
                            $this->participationHours(
                                $volunteer->user_id,
                                $opportunity->id,
                                $slot
                            ),

                        'hours_logged' => null,
                        'participated_at' => null,
                    ]
                );
            }

            if ($accepted) {
                Participation::updateOrCreate(
                    [
                        'opportunity_id' =>
                            $opportunity->id,

                        'volunteer_id' =>
                            $accepted->user_id,
                    ],
                    [
                        'status' => 'accepted',

                        'committed_hours' =>
                            $this->participationHours(
                                $accepted->user_id,
                                $opportunity->id,
                                2
                            ),

                        'hours_logged' => null,
                        'participated_at' => null,
                    ]
                );
            }

            if ($rejected) {
                Participation::updateOrCreate(
                    [
                        'opportunity_id' =>
                            $opportunity->id,

                        'volunteer_id' =>
                            $rejected->user_id,
                    ],
                    [
                        'status' => 'rejected',

                        'committed_hours' =>
                            $this->participationHours(
                                $rejected->user_id,
                                $opportunity->id,
                                3
                            ),

                        'hours_logged' => null,

                        'rejection_reason' =>
                            'The volunteer limit was reached before the request was reviewed.',

                        'participated_at' => null,
                    ]
                );
            }
        }
    }

    private function participationHours(
        int $volunteerId,
        int $opportunityId,
        int $slot = 0
    ): int {
        $seed =
            ($volunteerId * 31)
            + ($opportunityId * 17)
            + ($slot * 7);

        return 2 + ($seed % 7);
    }

    private function attachFixedScenario(
        $opportunity,
        $volunteer,
        string $status,
        ?Carbon $reference = null
    ): void {
        if (! $opportunity || ! $volunteer) {
            return;
        }

        $data = [
            'status' => $status,

            'committed_hours' =>
                $this->participationHours(
                    $volunteer->user_id,
                    $opportunity->id,
                    0
                ),

            'hours_logged' => null,
            'participated_at' => null,
        ];

        if ($status === 'withdrawn') {
            $base =
                $reference ??
                $opportunity->start_date;

            $data['withdrawn_date'] =
                $base
                    ->copy()
                    ->subDays(2)
                    ->toDateString();
        }

        if ($status === 'rejected') {
            $data['rejection_reason'] =
                'The volunteer limit was reached before the request was reviewed.';
        }

        Participation::updateOrCreate(
            [
                'opportunity_id' =>
                    $opportunity->id,

                'volunteer_id' =>
                    $volunteer->user_id,
            ],
            $data
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Media Library
    |--------------------------------------------------------------------------
    */

    private function localImagePath(
        string $folder,
        string $prefix,
        int $index,
        int $imageCount
    ): string {
        $number =
            ($index % $imageCount) + 1;

        $base =
            "seeders/images/{$folder}/{$prefix}{$number}";

        foreach (
            ['png', 'jpg', 'jpeg', 'svg']
            as $extension
        ) {
            $path =
                database_path(
                    "{$base}.{$extension}"
                );

            if (file_exists($path)) {
                return $path;
            }
        }

        return database_path(
            "{$base}.png"
        );
    }

    private function attachImage(
        $model,
        string $collection,
        string $path
    ): void {
        if (
            $model
                ->getMedia($collection)
                ->isNotEmpty()
        ) {
            return;
        }

        if (! file_exists($path)) {
            $this->command->warn(
                "الصورة غير موجودة: {$path}"
            );

            return;
        }

        try {
            $model
                ->addMedia($path)
                ->preservingOriginal()
                ->toMediaCollection($collection);
        } catch (\Throwable $e) {
            $this->command->warn(
                "تعذّر ربط صورة {$collection} لـ "
                . get_class($model)
                . " #{$model->id}: "
                . $e->getMessage()
            );
        }
    }
}
