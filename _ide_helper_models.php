<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Achievement newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Achievement newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Achievement query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Achievement whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Achievement whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Achievement whereUpdatedAt($value)
 */
	class Achievement extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Opportunity> $opportunities
 * @property-read int|null $opportunities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Skill> $skills
 * @property-read int|null $skills_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereUpdatedAt($value)
 */
	class Category extends \Eloquent {}
}

namespace App\Models{
/**
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NaiveBayes newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NaiveBayes newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NaiveBayes query()
 */
	class NaiveBayes extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opportunity newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opportunity newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opportunity query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opportunity whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opportunity whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opportunity whereUpdatedAt($value)
 */
	class Opportunity extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property int $user_id
 * @property string|null $city
 * @property string|null $description
 * @property string|null $website
 * @property string $contact_person
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection<int, \Spatie\MediaLibrary\MediaCollections\Models\Media> $media
 * @property-read int|null $media_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Opportunity> $opportunity
 * @property-read int|null $opportunity_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Organization newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Organization newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Organization query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Organization whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Organization whereContactPerson($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Organization whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Organization whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Organization whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Organization whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Organization whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Organization whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Organization whereWebsite($value)
 */
	class Organization extends \Eloquent implements \Spatie\MediaLibrary\HasMedia {}
}

namespace App\Models{
/**
 * @property int $id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Category|null $category
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Volunteer> $volunteers
 * @property-read int|null $volunteers_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Skill newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Skill newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Skill query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Skill whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Skill whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Skill whereUpdatedAt($value)
 */
	class Skill extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $first_name
 * @property string|null $last_name
 * @property string|null $organization_name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string $phone_number
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \App\Models\Organization|null $organization
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @property-read \App\Models\Volunteer|null $volunteer
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User role($roles, $guard = null, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereFirstName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLastName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereOrganizationName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePhoneNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutRole($roles, $guard = null)
 */
	class User extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $gendre
 * @property string|null $city
 * @property string|null $education_level
 * @property string|null $birth_date
 * @property string|null $about
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Achievement> $achievements
 * @property-read int|null $achievements_count
 * @property-read \Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection<int, \Spatie\MediaLibrary\MediaCollections\Models\Media> $media
 * @property-read int|null $media_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Skill> $skills
 * @property-read int|null $skills_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Volunteer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Volunteer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Volunteer query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Volunteer whereAbout($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Volunteer whereBirthDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Volunteer whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Volunteer whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Volunteer whereEducationLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Volunteer whereGendre($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Volunteer whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Volunteer whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Volunteer whereUserId($value)
 */
	class Volunteer extends \Eloquent implements \Spatie\MediaLibrary\HasMedia {}
}

